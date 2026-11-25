import os
import io
import json
import pytest
from PIL import Image
import torch
import numpy as np

# Add backend directory to sys.path
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app, cnn_model
from cnn_model import BreastCancerCNN, HistopathologyCNN, TransferLearningCNN, get_model
from dataset import (
    extract_patient_id,
    extract_label,
    split_by_patient,
    get_transforms,
    compute_file_hash
)
from evaluate_cnn import evaluate_model


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# --- 1. Endpoints & Health Check ---

def test_index_health_check(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"MediPredict AI Backend is running" in response.data


def test_model_status_endpoint(client):
    response = client.get("/model-status")
    assert response.status_code == 200
    data = response.get_json()
    assert "diabetes_model" in data
    assert "breast_cancer_image_cnn" in data
    assert data["breast_cancer_image_cnn"]["modality"] == "Histopathology Patches (IDC)"


# --- 2. Upload Validation Tests ---

def test_upload_missing_image_field(client):
    response = client.post("/predict/breast-cancer-image", data={})
    # Since model is unavailable without real dataset, either 503 or 400 is expected
    assert response.status_code in [400, 503]
    data = response.get_json()
    assert "error" in data


def test_upload_empty_filename(client):
    data = {"image": (io.BytesIO(b""), "")}
    response = client.post("/predict/breast-cancer-image", data=data, content_type="multipart/form-data")
    assert response.status_code in [400, 503]
    res_data = response.get_json()
    assert "error" in res_data


def test_missing_model_honest_error(client):
    """
    When the real CNN model artifact is absent, server must return a clear
    unavailable error (503) and NEVER fabricate a prediction or mock response.
    """
    if cnn_model is None:
        img_byte_arr = io.BytesIO()
        Image.new("RGB", (50, 50), color=(100, 50, 80)).save(img_byte_arr, format="PNG")
        img_byte_arr.seek(0)

        response = client.post(
            "/predict/breast-cancer-image",
            data={"image": (img_byte_arr, "patch.png")},
            content_type="multipart/form-data"
        )
        assert response.status_code == 503
        data = response.get_json()
        assert data.get("code") == "MODEL_UNAVAILABLE"
        assert "unavailable" in data.get("error", "").lower()


def test_cnn_inference_and_upload_validation(client):
    """
    Temporarily attach an in-memory CNN model to test full inference flow,
    upload size limits, dimension checks, and corruption handling.
    """
    import app as app_module
    from torchvision import transforms

    # Setup temporary test model
    orig_model = app_module.cnn_model
    orig_meta = app_module.cnn_metadata
    orig_trans = app_module.cnn_transform

    try:
        test_model = HistopathologyCNN(num_classes=2)
        test_model.eval()
        app_module.cnn_model = test_model
        app_module.cnn_metadata = {
            "model_architecture": "custom",
            "decision_threshold": 0.5,
            "classes": ["IDC Negative", "IDC Positive"]
        }
        app_module.cnn_transform = transforms.Compose([
            transforms.Resize((64, 64)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        # 1. Valid patch inference
        img_byte_arr = io.BytesIO()
        Image.new("RGB", (50, 50), color=(180, 50, 100)).save(img_byte_arr, format="PNG")
        img_byte_arr.seek(0)

        res = client.post(
            "/predict/breast-cancer-image",
            data={"image": (img_byte_arr, "test_patch.png")},
            content_type="multipart/form-data"
        )
        assert res.status_code == 200
        res_data = res.get_json()
        assert res_data["prediction"] in ["IDC Positive", "IDC Negative"]
        assert "confidence" in res_data
        assert 0.0 <= res_data["confidence"] <= 100.0
        assert "disclaimer" in res_data

        # 2. Corrupt file rejection
        corrupt_data = io.BytesIO(b"Not an image at all, just plain garbage data")
        res_corrupt = client.post(
            "/predict/breast-cancer-image",
            data={"image": (corrupt_data, "corrupt.png")},
            content_type="multipart/form-data"
        )
        assert res_corrupt.status_code == 400
        assert "invalid or corrupt" in res_corrupt.get_json()["error"].lower()

        # 3. Too small dimension rejection (< 10x10)
        tiny_byte_arr = io.BytesIO()
        Image.new("RGB", (5, 5), color=(100, 50, 80)).save(tiny_byte_arr, format="PNG")
        tiny_byte_arr.seek(0)
        res_tiny = client.post(
            "/predict/breast-cancer-image",
            data={"image": (tiny_byte_arr, "tiny.png")},
            content_type="multipart/form-data"
        )
        assert res_tiny.status_code == 400
        assert "too small" in res_tiny.get_json()["error"].lower()

        # 4. Large file rejection (> 5MB)
        large_bytes = io.BytesIO(b"0" * (5 * 1024 * 1024 + 1024))
        res_large = client.post(
            "/predict/breast-cancer-image",
            data={"image": (large_bytes, "large.png")},
            content_type="multipart/form-data"
        )
        assert res_large.status_code in [400, 413]
        assert "exceeds" in res_large.get_json()["error"].lower() or "limit" in res_large.get_json()["error"].lower()

    finally:
        # Restore original state
        app_module.cnn_model = orig_model
        app_module.cnn_metadata = orig_meta
        app_module.cnn_transform = orig_trans


# --- 3. Model Architecture Tests ---

def test_breast_cancer_cnn_forward():
    model = BreastCancerCNN(num_classes=2)
    model.eval()
    dummy_input = torch.randn(2, 3, 50, 50)
    with torch.no_grad():
        output = model(dummy_input)
    assert output.shape == (2, 2)


def test_custom_cnn_forward():
    model = HistopathologyCNN(num_classes=2)
    model.eval()
    dummy_input = torch.randn(2, 3, 64, 64)
    with torch.no_grad():
        output = model(dummy_input)
    assert output.shape == (2, 2)


def test_mobilenet_cnn_forward():
    model = TransferLearningCNN(num_classes=2, pretrained=False)
    model.eval()
    dummy_input = torch.randn(2, 3, 64, 64)
    with torch.no_grad():
        output = model(dummy_input)
    assert output.shape == (2, 2)


def test_get_model_factory():
    m0 = get_model("breast_cancer_cnn")
    assert isinstance(m0, BreastCancerCNN)
    m1 = get_model("custom")
    assert isinstance(m1, HistopathologyCNN)
    m2 = get_model("mobilenet_v3_small", pretrained=False)
    assert isinstance(m2, TransferLearningCNN)
    with pytest.raises(ValueError):
        get_model("invalid_model_type")


def test_installed_live_cnn_prediction(client):
    """
    Test live prediction on the actual installed and active BreastCancerCNN model.
    """
    img_byte_arr = io.BytesIO()
    Image.new("RGB", (50, 50), color=(150, 70, 110)).save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)

    res = client.post(
        "/predict/breast-cancer-image",
        data={"image": (img_byte_arr, "live_patch.png")},
        content_type="multipart/form-data"
    )
    assert res.status_code == 200
    data = res.get_json()
    assert data["prediction"] in ["IDC Positive", "IDC Negative"]
    assert "confidence" in data
    assert "model" in data
    assert data["model"] == "BreastCancerCNN"
    assert data["model_type"] == "Convolutional Neural Network (PyTorch)"


# --- 4. Preprocessing & Transform Tests ---

def test_transforms_shape_and_norm():
    transform = get_transforms(img_size=64, is_train=False)
    img = Image.new("RGB", (100, 80), color=(128, 64, 32))
    tensor = transform(img)
    assert tensor.shape == (3, 64, 64)
    assert isinstance(tensor, torch.Tensor)
    assert tensor.dtype == torch.float32


# --- 5. Patient Grouping and Leakage Tests ---

def test_extract_patient_id():
    p1 = extract_patient_id("archive/10253/0/10253_idx5_x1351_y1101_class0.png")
    assert p1 == "10253"
    p2 = extract_patient_id("data/8863_idx5_x50_y100_class1.png")
    assert p2 == "8863"


def test_extract_label():
    l0 = extract_label("archive/10253/0/patch.png")
    assert l0 == 0
    l1 = extract_label("archive/10253/1/patch.png")
    assert l1 == 1
    l_filename = extract_label("samples/10253_idx5_class1.png")
    assert l_filename == 1


def test_patient_level_split_no_leakage():
    # 10 patients, each with 4 patches
    samples = []
    for i in range(10):
        pid = f"patient_{i:03d}"
        for j in range(4):
            samples.append({
                "path": f"dummy/{pid}/{j%2}/patch_{j}.png",
                "patient_id": pid,
                "label": j % 2,
                "hash": f"hash_{i}_{j}"
            })
            
    train, val, test = split_by_patient(samples, 0.7, 0.15, 0.15, random_seed=42)
    
    train_patients = set(s["patient_id"] for s in train)
    val_patients = set(s["patient_id"] for s in val)
    test_patients = set(s["patient_id"] for s in test)
    
    # Assert zero overlap between splits
    assert len(train_patients & val_patients) == 0, "Train and Val share patients!"
    assert len(train_patients & test_patients) == 0, "Train and Test share patients!"
    assert len(val_patients & test_patients) == 0, "Val and Test share patients!"
    assert len(train) + len(val) + len(test) == len(samples)


# --- 6. Diabetes Clinical Prediction Regression Test ---

def test_diabetes_prediction(client):
    valid_payload = {
        "age": "45",
        "glucose": "140",
        "bloodPressure": "85",
        "skinThickness": "25",
        "insulin": "100",
        "bmi": "29.4",
        "diabetesPedigreeFunction": "0.627"
    }
    response = client.post("/predict/diabetes", json=valid_payload)
    if response.status_code == 200:
        data = response.get_json()
        assert "prediction" in data
        assert data["prediction"] in ["Diabetic", "Not Diabetic"]
        assert "confidence" in data
        assert isinstance(data["confidence"], (int, float))
    else:
        # If model artifact was not loaded
        assert response.status_code == 503
