"""
Dataset loading, patient-grouped train/val/test splitting, deduplication,
and preprocessing pipelines for breast histopathology image patches.
"""

import os
import glob
import re
import hashlib
from typing import Dict, List, Tuple, Optional
from collections import defaultdict
import numpy as np
from PIL import Image
import torch
from torch.utils.data import Dataset
from torchvision import transforms

# Default ImageNet normalization statistics
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Label definitions based on IDC (Invasive Ductal Carcinoma) histopathology standard:
CLASS_NAMES = ["IDC Negative", "IDC Positive"]
CLASS_TO_IDX = {"IDC Negative": 0, "IDC Positive": 1}
IDX_TO_CLASS = {0: "IDC Negative", 1: "IDC Positive"}


def get_transforms(img_size: int = 64, is_train: bool = False):
    """
    Constructs PyTorch transforms. Augmentation is applied ONLY when is_train=True.
    Val/Test/Inference use deterministic resize and normalization.
    """
    if is_train:
        return transforms.Compose([
            transforms.Resize((img_size, img_size)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomVerticalFlip(p=0.5),
            transforms.RandomRotation(degrees=15),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
        ])
    else:
        return transforms.Compose([
            transforms.Resize((img_size, img_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
        ])


def extract_patient_id(filepath: str) -> str:
    """
    Extract patient identifier from file path.
    Supports standard IDC dataset layouts:
      1) archive/<patient_id>/<class>/<filename>.png
      2) archive/<patient_id>_idx5_x..._class<0|1>.png
    """
    filename = os.path.basename(filepath)
    # Check filename prefix pattern: e.g., 10253_idx5_...
    match = re.match(r"^(\d+)_idx", filename)
    if match:
        return match.group(1)
    
    # Check directory structure: <base>/<patient_id>/<class_dir>/<file>
    parent_dir = os.path.dirname(filepath)
    grandparent_dir = os.path.dirname(parent_dir)
    parent_name = os.path.basename(parent_dir)
    grandparent_name = os.path.basename(grandparent_dir)
    
    if parent_name in ["0", "1"] and grandparent_name:
        return grandparent_name
    
    # Fallback to parent directory name
    return parent_name or "unknown_patient"


def extract_label(filepath: str) -> Optional[int]:
    """
    Extract label (0 or 1) from file path or containing folder.
    Returns 0 for IDC Negative, 1 for IDC Positive, or None if unparseable.
    """
    # 1. Check parent folder name
    parent_folder = os.path.basename(os.path.dirname(filepath))
    if parent_folder in ["0", "1"]:
        return int(parent_folder)
    
    # 2. Check filename pattern: ...class0.png or ...class1.png
    match = re.search(r"class([01])", os.path.basename(filepath), re.IGNORECASE)
    if match:
        return int(match.group(1))
        
    return None


def compute_file_hash(filepath: str) -> str:
    """Computes SHA-256 hash of a file for duplicate detection."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def scan_dataset(base_folder: str) -> Tuple[List[Dict], Dict[str, int]]:
    """
    Scans base_folder for histopathology PNG/JPG images.
    Returns list of metadata dicts and summary statistics.
    """
    if not os.path.isdir(base_folder):
        return [], {}

    patterns = [
        os.path.join(base_folder, "*", "*", "*.png"),
        os.path.join(base_folder, "*", "*", "*.jpg"),
        os.path.join(base_folder, "*", "*.png"),
        os.path.join(base_folder, "*.png")
    ]
    
    all_files = []
    for pat in patterns:
        all_files.extend(glob.glob(pat))
    # Deduplicate paths
    all_files = sorted(list(set(all_files)))
    
    samples = []
    seen_hashes = {}
    duplicates_count = 0
    
    for filepath in all_files:
        label = extract_label(filepath)
        if label is None:
            continue
        
        patient_id = extract_patient_id(filepath)
        file_hash = compute_file_hash(filepath)
        
        if file_hash in seen_hashes:
            duplicates_count += 1
            continue
        seen_hashes[file_hash] = filepath
        
        samples.append({
            "path": filepath,
            "patient_id": patient_id,
            "label": label,
            "hash": file_hash
        })
        
    stats = {
        "total_valid_samples": len(samples),
        "duplicates_skipped": duplicates_count,
        "class_0_count": sum(1 for s in samples if s["label"] == 0),
        "class_1_count": sum(1 for s in samples if s["label"] == 1),
        "patient_count": len(set(s["patient_id"] for s in samples))
    }
    
    return samples, stats


def split_by_patient(
    samples: List[Dict],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_seed: int = 42
) -> Tuple[List[Dict], List[Dict], List[Dict]]:
    """
    Splits samples at the PATIENT level to prevent data leakage.
    All patches from a given patient belong strictly to one split.
    """
    np.random.seed(random_seed)
    patient_to_samples = defaultdict(list)
    for s in samples:
        patient_to_samples[s["patient_id"]].append(s)
        
    unique_patients = np.array(sorted(list(patient_to_samples.keys())))
    np.random.shuffle(unique_patients)
    
    n_total = len(unique_patients)
    if n_total < 3:
        # Very small sample set: place in train, with copy in val/test for smoke checks
        train_p = unique_patients
        val_p = unique_patients
        test_p = unique_patients
    elif n_total < 6:
        # Guarantee at least 1 patient in val and 1 in test
        n_val = 1
        n_test = 1
        n_train = n_total - n_val - n_test
        train_p = unique_patients[:n_train]
        val_p = unique_patients[n_train:n_train + n_val]
        test_p = unique_patients[n_train + n_val:]
    else:
        n_train = int(n_total * train_ratio)
        n_val = max(1, int(n_total * val_ratio))
        train_p = unique_patients[:n_train]
        val_p = unique_patients[n_train:n_train + n_val]
        test_p = unique_patients[n_train + n_val:]
        if len(test_p) == 0:
            test_p = unique_patients[-1:]
            train_p = unique_patients[:n_train - 1]

    train_set = [s for p in train_p for s in patient_to_samples[p]]
    val_set = [s for p in val_p for s in patient_to_samples[p]]
    test_set = [s for p in test_p for s in patient_to_samples[p]]
    
    # Verify patient sets are disjoint when dataset has >= 3 patients
    if n_total >= 3:
        train_patients_set = set(s["patient_id"] for s in train_set)
        val_patients_set = set(s["patient_id"] for s in val_set)
        test_patients_set = set(s["patient_id"] for s in test_set)
        
        assert len(train_patients_set & val_patients_set) == 0, "Patient leakage between train and val!"
        assert len(train_patients_set & test_patients_set) == 0, "Patient leakage between train and test!"
        assert len(val_patients_set & test_patients_set) == 0, "Patient leakage between val and test!"
    
    return train_set, val_set, test_set


class BreastCancerPatchDataset(Dataset):
    """
    PyTorch Dataset for breast histopathology image patches.
    Loads and converts images to RGB, then applies transforms.
    """
    def __init__(self, samples: List[Dict], transform=None):
        self.samples = samples
        self.transform = transform

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int, str]:
        item = self.samples[idx]
        image_path = item["path"]
        label = item["label"]
        patient_id = item["patient_id"]
        
        try:
            with Image.open(image_path) as img:
                img_rgb = img.convert("RGB")
        except Exception as e:
            raise IOError(f"Failed to read image at {image_path}: {e}")
            
        if self.transform is not None:
            tensor = self.transform(img_rgb)
        else:
            tensor = transforms.ToTensor()(img_rgb)
            
        return tensor, label, patient_id
