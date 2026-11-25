"""
Training and evaluation pipeline for Breast Cancer (IDC) Histopathology CNN.
Supports:
  - Patient-level leak-free data splitting
  - Class imbalance weighting
  - Training augmentations (flips, rotations)
  - Validation checkpointing and early stopping
  - Evaluation on held-out test set
  - Full model and metadata serialization
  - Isolated smoke-test mode with synthetic patches
"""

import os
import sys
import json
import argparse
import tempfile
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

from cnn_model import get_model
from dataset import (
    scan_dataset,
    split_by_patient,
    BreastCancerPatchDataset,
    get_transforms,
    CLASS_NAMES,
    CLASS_TO_IDX,
    IMAGENET_MEAN,
    IMAGENET_STD
)
from evaluate_cnn import evaluate_model


def set_seed(seed: int = 42):
    """Sets random seeds for reproducibility."""
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def create_synthetic_smoke_dataset(temp_dir: str) -> str:
    """
    Creates a small synthetic patient-grouped dataset for smoke testing.
    6 patients, each with class 0 and class 1 patches with unique pixel content.
    """
    smoke_dir = os.path.join(temp_dir, "synthetic_idc_smoke")
    os.makedirs(smoke_dir, exist_ok=True)
    
    patients = [f"patient_{100 + i}" for i in range(6)]
    for p_idx, pid in enumerate(patients):
        for label in [0, 1]:
            label_dir = os.path.join(smoke_dir, pid, str(label))
            os.makedirs(label_dir, exist_ok=True)
            for i in range(4):
                # Ensure unique colors and pixel noise per patient and patch
                r = int(np.clip(30 + label * 140 + p_idx * 12 + i * 5, 0, 255))
                g = int(np.clip(50 + label * 30 + p_idx * 8 + i * 3, 0, 255))
                b = int(np.clip(100 + label * 20 + p_idx * 15 + i * 7, 0, 255))
                
                arr = np.zeros((50, 50, 3), dtype=np.uint8)
                arr[:, :] = [r, g, b]
                # Add distinctive pattern
                arr[p_idx * 3:(p_idx + 1) * 3, i * 3:(i + 1) * 3] = [255 - r, 255 - g, 255 - b]
                
                img = Image.fromarray(arr)
                filename = f"{pid}_idx5_x{100 + p_idx * 20}_y{100 + i * 10}_class{label}.png"
                img.save(os.path.join(label_dir, filename))
                
    return smoke_dir


def train_pipeline(
    data_dir: str,
    output_dir: str = ".",
    model_arch: str = "custom",
    img_size: int = 64,
    epochs: int = 15,
    batch_size: int = 32,
    lr: float = 0.001,
    patience: int = 5,
    seed: int = 42,
    is_smoke_test: bool = False
):
    set_seed(seed)
    os.makedirs(output_dir, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    print(f"Scanning dataset in: {data_dir}")
    samples, stats = scan_dataset(data_dir)
    print("Dataset Scan Statistics:", json.dumps(stats, indent=2))
    
    if len(samples) == 0:
        print("\n" + "=" * 70)
        print("ERROR: No valid breast histopathology image patches found.")
        print("Expected structure: <data_dir>/<patient_id>/<0 or 1>/*.png")
        print("Where 0 = IDC Negative and 1 = IDC Positive.")
        print("To download the dataset, see documentation instructions.")
        print("REAL MODEL TRAINING CANNOT PROCEED WITHOUT DATASET.")
        print("=" * 70 + "\n")
        return None

    # Patient-level splitting
    print("Performing leak-free patient-level split (70% Train, 15% Val, 15% Test)...")
    train_samples, val_samples, test_samples = split_by_patient(samples, 0.70, 0.15, 0.15, seed)
    
    train_patients = len(set(s["patient_id"] for s in train_samples))
    val_patients = len(set(s["patient_id"] for s in val_samples))
    test_patients = len(set(s["patient_id"] for s in test_samples))
    
    print(f"Train: {len(train_samples)} patches across {train_patients} patients")
    print(f"Val:   {len(val_samples)} patches across {val_patients} patients")
    print(f"Test:  {len(test_samples)} patches across {test_patients} patients")
    
    # Preprocessing and datasets
    train_transform = get_transforms(img_size=img_size, is_train=True)
    eval_transform = get_transforms(img_size=img_size, is_train=False)
    
    train_dataset = BreastCancerPatchDataset(train_samples, transform=train_transform)
    val_dataset = BreastCancerPatchDataset(val_samples, transform=eval_transform)
    test_dataset = BreastCancerPatchDataset(test_samples, transform=eval_transform)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    # Handling class imbalance
    train_labels = [s["label"] for s in train_samples]
    count_0 = sum(1 for l in train_labels if l == 0)
    count_1 = sum(1 for l in train_labels if l == 1)
    total_train = len(train_labels)
    
    weight_0 = total_train / (2.0 * max(1, count_0))
    weight_1 = total_train / (2.0 * max(1, count_1))
    class_weights = torch.tensor([weight_0, weight_1], dtype=torch.float).to(device)
    print(f"Class Weights (imbalance adjustment): Negative(0)={weight_0:.3f}, Positive(1)={weight_1:.3f}")
    
    # Model instantiate
    model = get_model(model_arch, num_classes=2, pretrained=(model_arch != "custom")).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    
    # Checkpointing and Early Stopping state
    best_val_loss = float("inf")
    patience_counter = 0
    best_weights_path = os.path.join(output_dir, "best_checkpoint.pt")
    
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}
    
    print("\nStarting Training...")
    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for inputs, targets, _ in train_loader:
            inputs, targets = inputs.to(device), targets.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * inputs.size(0)
            preds = outputs.argmax(dim=1)
            correct += (preds == targets).sum().item()
            total += targets.size(0)
            
        epoch_train_loss = running_loss / max(1, total)
        epoch_train_acc = correct / max(1, total)
        
        # Validation
        model.eval()
        val_running_loss = 0.0
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for inputs, targets, _ in val_loader:
                inputs, targets = inputs.to(device), targets.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, targets)
                val_running_loss += loss.item() * inputs.size(0)
                preds = outputs.argmax(dim=1)
                val_correct += (preds == targets).sum().item()
                val_total += targets.size(0)
                
        epoch_val_loss = val_running_loss / max(1, val_total)
        epoch_val_acc = val_correct / max(1, val_total)
        
        history["train_loss"].append(round(epoch_train_loss, 4))
        history["train_acc"].append(round(epoch_train_acc, 4))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["val_acc"].append(round(epoch_val_acc, 4))
        
        print(f"Epoch [{epoch:02d}/{epochs:02d}] "
              f"Train Loss: {epoch_train_loss:.4f} Acc: {epoch_train_acc*100:.2f}% | "
              f"Val Loss: {epoch_val_loss:.4f} Acc: {epoch_val_acc*100:.2f}%")
        
        # Validation-based checkpointing
        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            patience_counter = 0
            torch.save(model.state_dict(), best_weights_path)
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"Early stopping triggered at epoch {epoch}")
                break
                
    # Load best checkpoint for final evaluation
    if os.path.exists(best_weights_path):
        model.load_state_dict(torch.load(best_weights_path, map_location=device))
        
    # Evaluate on held-out test set
    print("\nEvaluating on held-out test set...")
    test_metrics = evaluate_model(model, test_loader, device=device, threshold=0.5)
    print("Test Set Evaluation Metrics:", json.dumps(test_metrics, indent=2))
    
    # Save final artifact and metadata
    model_filename = "breast_cancer_cnn.pt" if not is_smoke_test else "smoke_test_model.pt"
    metadata_filename = "breast_cancer_cnn_metadata.json" if not is_smoke_test else "smoke_test_metadata.json"
    
    final_model_path = os.path.join(output_dir, model_filename)
    torch.save(model.state_dict(), final_model_path)
    if os.path.exists(best_weights_path):
        os.remove(best_weights_path)
        
    metadata = {
        "framework": f"PyTorch {torch.__version__}",
        "model_architecture": model_arch,
        "input_shape": [3, img_size, img_size],
        "normalization": {
            "mean": IMAGENET_MEAN,
            "std": IMAGENET_STD
        },
        "classes": CLASS_NAMES,
        "class_to_idx": CLASS_TO_IDX,
        "positive_class": "IDC Positive",
        "negative_class": "IDC Negative",
        "task": "Invasive Ductal Carcinoma (IDC) Histopathology Patch Detection",
        "decision_threshold": 0.5,
        "is_smoke_test": is_smoke_test,
        "training_mode": "smoke_test_synthetic" if is_smoke_test else "real_dataset",
        "split_summary": {
            "train_patients": train_patients,
            "train_samples": len(train_samples),
            "val_patients": val_patients,
            "val_samples": len(val_samples),
            "test_patients": test_patients,
            "test_samples": len(test_samples)
        },
        "evaluation_metrics": test_metrics,
        "training_history": history
    }
    
    final_meta_path = os.path.join(output_dir, metadata_filename)
    with open(final_meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"\nModel saved to: {final_model_path}")
    print(f"Metadata saved to: {final_meta_path}")
    return metadata


def main():
    parser = argparse.ArgumentParser(description="Train Breast Cancer (IDC) CNN")
    parser.add_argument("--data-dir", type=str, default=os.getenv("BREAST_CANCER_DATA_DIR", "./data/breast_histopathology"),
                        help="Path to histopathology image dataset")
    parser.add_argument("--output-dir", type=str, default=".", help="Directory to save model artifacts")
    parser.add_argument("--model-arch", type=str, default="custom", choices=["custom", "mobilenet_v3_small"])
    parser.add_argument("--img-size", type=int, default=64)
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=0.001)
    parser.add_argument("--patience", type=int, default=5)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--smoke-test", action="store_true", help="Run a quick smoke test on synthetic data")
    
    args = parser.parse_args()
    
    if args.smoke_test:
        print("\n" + "=" * 60)
        print("RUNNING SMOKE TEST MODE (SYNTHETIC HISTOPATHOLOGY DATA)")
        print("Note: Smoke test metrics are separate and NOT clinical evaluation.")
        print("=" * 60)
        with tempfile.TemporaryDirectory() as temp_dir:
            synthetic_dir = create_synthetic_smoke_dataset(temp_dir)
            smoke_output_dir = os.path.join(args.output_dir, "smoke_test_artifacts")
            train_pipeline(
                data_dir=synthetic_dir,
                output_dir=smoke_output_dir,
                model_arch=args.model_arch,
                img_size=args.img_size,
                epochs=2,
                batch_size=4,
                lr=0.005,
                patience=2,
                seed=args.seed,
                is_smoke_test=True
            )
    else:
        train_pipeline(
            data_dir=args.data_dir,
            output_dir=args.output_dir,
            model_arch=args.model_arch,
            img_size=args.img_size,
            epochs=args.epochs,
            batch_size=args.batch_size,
            lr=args.lr,
            patience=args.patience,
            seed=args.seed,
            is_smoke_test=False
        )


if __name__ == "__main__":
    main()
