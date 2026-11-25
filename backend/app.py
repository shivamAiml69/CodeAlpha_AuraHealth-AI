import os
import io
import json
import logging
import warnings
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

# Suppress sklearn feature names warnings
warnings.filterwarnings("ignore", message="X does not have valid feature names")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("AuraHealthBackend")

app = Flask(__name__)
CORS(app)

# Limit request payload size to 6MB to enforce max 5MB image upload
app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024
MAX_IMAGE_BYTES = 5 * 1024 * 1024

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Model Paths
diabetes_model_path = os.path.join(BASE_DIR, "diabetes_model.pkl")
bc_tabular_model_path = os.path.join(BASE_DIR, "breast_cancer_model.pkl")
bc_rf_image_model_path = os.path.join(BASE_DIR, "breast_cancer_image_model.pkl")

# CNN Artifact Paths
cnn_model_path = os.path.join(BASE_DIR, "breast_cancer_cnn.pt")
if not os.path.exists(cnn_model_path):
    cnn_model_path = os.path.join(BASE_DIR, "breast_cancer_cnn.pth")
cnn_meta_path = os.path.join(BASE_DIR, "breast_cancer_cnn_metadata.json")

# Model objects in memory
diabetes_model = None
bc_tabular_model = None
bc_rf_image_model = None
cnn_model = None
cnn_metadata = None
cnn_transform = None

# 1. Load Clinical Tabular Models
if os.path.exists(diabetes_model_path):
    try:
        diabetes_model = joblib.load(diabetes_model_path)
        logger.info("Diabetes Random Forest model loaded successfully.")
    except Exception as e:
        logger.warning(f"Could not load diabetes model: {e}")

if os.path.exists(bc_tabular_model_path):
    try:
        bc_tabular_model = joblib.load(bc_tabular_model_path)
        logger.info("Breast Cancer tabular model loaded successfully.")
    except Exception as e:
        logger.warning(f"Could not load breast cancer tabular model: {e}")

if os.path.exists(bc_rf_image_model_path):
    try:
        bc_rf_image_model = joblib.load(bc_rf_image_model_path)
        logger.info("Baseline Random Forest image model artifact preserved in memory.")
    except Exception as e:
        logger.warning(f"Could not load baseline RF image model: {e}")

# 2. Load PyTorch CNN Model if valid trained weights & metadata exist
def load_cnn_model():
    global cnn_model, cnn_metadata, cnn_transform, cnn_model_path
    
    if not os.path.exists(cnn_model_path):
        for candidate in ["breast_cancer_cnn.pth", "breast_cancer_cnn.pt"]:
            p = os.path.join(BASE_DIR, candidate)
            if os.path.exists(p):
                cnn_model_path = p
                break

    if os.path.exists(cnn_model_path) and os.path.exists(cnn_meta_path):
        try:
            import torch
            from torchvision import transforms
            from cnn_model import get_model

            with open(cnn_meta_path, "r") as f:
                metadata = json.load(f)

            # Never activate smoke-test or unverified synthetic models as clinical models
            if metadata.get("is_smoke_test", False):
                logger.warning("CNN model file present but flagged as smoke-test synthetic artifact. Not active for clinical predictions.")
                cnn_model = None
                cnn_metadata = metadata
                return

            arch = metadata.get("model_architecture", "breast_cancer_cnn")
            input_shape = metadata.get("input_shape", [3, 50, 50])
            img_size = input_shape[-1]
            norm = metadata.get("normalization", {
                "mean": [0.485, 0.456, 0.406],
                "std": [0.229, 0.224, 0.225]
            })

            model = get_model(arch, num_classes=2, pretrained=False)
            state_dict = torch.load(cnn_model_path, map_location=torch.device("cpu"))
            model.load_state_dict(state_dict)
            model.eval()

            cnn_model = model
            cnn_metadata = metadata
            cnn_transform = transforms.Compose([
                transforms.Resize((img_size, img_size)),
                transforms.ToTensor(),
                transforms.Normalize(mean=norm["mean"], std=norm["std"])
            ])
            logger.info(f"Breast Cancer CNN ({arch}) loaded and active for inference from {os.path.basename(cnn_model_path)}.")
        except Exception as e:
            logger.error(f"Failed to load CNN model: {e}")
            cnn_model = None
            cnn_metadata = None
    else:
        logger.info("Breast Cancer CNN artifacts not found. Clinical image prediction will return unavailable status.")

load_cnn_model()


@app.route("/", methods=["GET"])
def index():
    return "MediPredict AI Backend is running! The React frontend should be opened on port 5173."


@app.route("/model-status", methods=["GET"])
def model_status():
    """Returns the operational status of backend prediction models."""
    return jsonify({
        "diabetes_model": {
            "type": "Random Forest",
            "modality": "Clinical Measurements",
            "available": diabetes_model is not None
        },
        "breast_cancer_tabular_model": {
            "type": "Random Forest",
            "modality": "Cell Nuclei Metrics (WBCD)",
            "available": bc_tabular_model is not None
        },
        "breast_cancer_image_cnn": {
            "type": "Convolutional Neural Network (PyTorch)",
            "modality": "Histopathology Patches (IDC)",
            "available": cnn_model is not None,
            "architecture": cnn_metadata.get("model_architecture") if cnn_metadata else None,
            "task": cnn_metadata.get("task", "Invasive Ductal Carcinoma Detection") if cnn_metadata else None,
            "evaluation_metrics": cnn_metadata.get("evaluation_metrics") if cnn_metadata else None
        }
    })


@app.route("/predict/diabetes", methods=["POST"])
def predict_diabetes():
    if diabetes_model is None:
        return jsonify({"error": "Diabetes prediction model is not loaded on server."}), 503

    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Missing or invalid JSON payload."}), 400

        required_fields = ["glucose", "bloodPressure", "skinThickness", "insulin", "bmi", "diabetesPedigreeFunction", "age"]
        features = []
        for field in required_fields:
            val = data.get(field)
            if val is None or str(val).strip() == "":
                return jsonify({"error": f"Missing required clinical field: '{field}'"}), 400
            try:
                features.append(float(val))
            except ValueError:
                return jsonify({"error": f"Invalid numerical value for '{field}': '{val}'"}), 400

        features_array = np.array([features])
        prediction = diabetes_model.predict(features_array)
        probabilities = diabetes_model.predict_proba(features_array)
        confidence = float(np.max(probabilities[0])) * 100

        result = "Diabetic" if prediction[0] == 1 else "Not Diabetic"

        return jsonify({
            "prediction": result,
            "confidence": round(confidence, 2),
            "model_type": "Random Forest",
            "modality": "Clinical Measurements"
        })
    except Exception as e:
        logger.error(f"Error in /predict/diabetes: {e}")
        return jsonify({"error": "Failed to process diabetes prediction."}), 500


@app.route("/predict/breast-cancer", methods=["POST"])
def predict_breast_cancer():
    if bc_tabular_model is None:
        return jsonify({"error": "Breast Cancer clinical model is not loaded on server."}), 503

    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Missing or invalid JSON payload."}), 400

        required_features = ["meanRadius", "meanTexture", "meanPerimeter", "meanArea", "meanSmoothness"]
        features = []
        for field in required_features:
            val = data.get(field)
            if val is None or str(val).strip() == "":
                return jsonify({"error": f"Missing required clinical metric: '{field}'"}), 400
            try:
                features.append(float(val))
            except ValueError:
                return jsonify({"error": f"Invalid numerical value for '{field}': '{val}'"}), 400

        features_array = np.array([features])
        prediction = bc_tabular_model.predict(features_array)
        probabilities = bc_tabular_model.predict_proba(features_array)
        confidence = float(np.max(probabilities[0])) * 100

        # UCI standard: 0 = Malignant, 1 = Benign
        result = "Malignant" if prediction[0] == 0 else "Benign"

        return jsonify({
            "prediction": result,
            "confidence": round(confidence, 2),
            "model_type": "Random Forest",
            "modality": "Fine Needle Aspirate (FNA) Features"
        })
    except Exception as e:
        logger.error(f"Error in /predict/breast-cancer: {e}")
        return jsonify({"error": "Failed to process clinical breast cancer prediction."}), 500


@app.route("/predict/breast-cancer-image", methods=["POST"])
def predict_breast_cancer_image():
    # 1. Check if CNN is available
    if cnn_model is None:
        return jsonify({
            "error": "The breast cancer histopathology CNN model is currently unavailable because trained model weights from the verified dataset are not installed on the server. Please consult the documentation for dataset training instructions.",
            "code": "MODEL_UNAVAILABLE",
            "model_type": "CNN",
            "task": "Invasive Ductal Carcinoma (IDC) Histopathology Detection"
        }), 503

    # 2. Server-side upload validation
    if "image" not in request.files:
        return jsonify({"error": "No image file provided in upload form under field 'image'."}), 400

    file = request.files["image"]
    if not file or file.filename == "":
        return jsonify({"error": "No image selected for upload."}), 400

    try:
        # Enforce 5 MB limit
        file_bytes = file.read()
        if len(file_bytes) == 0:
            return jsonify({"error": "Uploaded image file is empty."}), 400
        if len(file_bytes) > MAX_IMAGE_BYTES:
            return jsonify({"error": f"Uploaded file exceeds maximum allowed size of 5 MB ({len(file_bytes) / (1024*1024):.1f} MB)."}), 400

        # Decode image using PIL in memory
        try:
            img = Image.open(io.BytesIO(file_bytes))
            img.verify() # Verify file header and integrity
            # Reopen after verify() as recommended by Pillow documentation
            img = Image.open(io.BytesIO(file_bytes))
        except Exception:
            return jsonify({"error": "Invalid or corrupt image file. Supported formats: PNG, JPG, JPEG, TIFF."}), 400

        # Format validation
        allowed_formats = {"PNG", "JPEG", "JPG", "TIFF", "WEBP"}
        if img.format and img.format.upper() not in allowed_formats:
            return jsonify({"error": f"Unsupported image format '{img.format}'. Please upload PNG, JPG, or TIFF."}), 400

        # Dimension validation
        width, height = img.size
        if width < 10 or height < 10:
            return jsonify({"error": f"Image dimensions too small ({width}x{height}). Minimum required: 10x10."}), 400
        if width > 8000 or height > 8000:
            return jsonify({"error": f"Image dimensions too large ({width}x{height}). Maximum allowed: 8000x8000."}), 400

        # Convert to RGB
        img_rgb = img.convert("RGB")

        # 3. Model inference using saved preprocessing
        import torch
        import torch.nn.functional as F

        tensor = cnn_transform(img_rgb).unsqueeze(0) # [1, C, H, W]

        with torch.no_grad():
            logits = cnn_model(tensor)
            probs = F.softmax(logits, dim=1).squeeze(0)
            
            p_neg = float(probs[0].item())
            p_pos = float(probs[1].item())

        threshold = cnn_metadata.get("decision_threshold", 0.5) if cnn_metadata else 0.5
        is_positive = p_pos >= threshold

        result = "IDC Positive" if is_positive else "IDC Negative"
        # Confidence reflects probability of the predicted class
        confidence = (p_pos if is_positive else p_neg) * 100.0

        return jsonify({
            "prediction": result,
            "confidence": round(confidence, 2),
            "probability": round(p_pos, 4),
            "decision_threshold": threshold,
            "model_type": "Convolutional Neural Network (PyTorch)",
            "model": cnn_metadata.get("model_architecture", "custom_cnn") if cnn_metadata else "CNN",
            "task": "Invasive Ductal Carcinoma (IDC) Histopathology Detection",
            "classes": ["IDC Negative", "IDC Positive"],
            "disclaimer": "Investigational and educational tool only. Not a medical diagnosis. Requires histological evaluation by a qualified pathologist."
        })

    except Exception as e:
        logger.error(f"Error during CNN image inference: {e}")
        return jsonify({"error": "Internal error processing image prediction."}), 500


@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "File size exceeds the 5 MB upload limit."}), 413


if __name__ == "__main__":
    app.run(debug=True, port=5000)
