"""
Evaluation module for honest, rigorous model assessment on held-out test data.
Computes Accuracy, Precision, Recall/Sensitivity, Specificity, F1, ROC-AUC,
and confusion matrix breakdown.
"""

from typing import Dict, Any, Optional
import numpy as np
import torch
import torch.nn.functional as F
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score
)


def evaluate_model(
    model: torch.nn.Module,
    data_loader: torch.utils.data.DataLoader,
    device: torch.device,
    threshold: float = 0.5
) -> Dict[str, Any]:
    """
    Evaluates a trained PyTorch model on a held-out dataset.
    
    Positive class is explicitly defined as 1 (IDC Positive).
    Returns a dictionary of all standard clinical machine learning metrics.
    """
    model.eval()
    all_targets = []
    all_probs = []
    
    with torch.no_grad():
        for inputs, targets, _ in data_loader:
            inputs = inputs.to(device)
            logits = model(inputs)
            probs = F.softmax(logits, dim=1)
            
            # Probability of class 1 (IDC Positive)
            pos_probs = probs[:, 1].cpu().numpy()
            
            all_probs.extend(pos_probs.tolist())
            all_targets.extend(targets.numpy().tolist())
            
    y_true = np.array(all_targets)
    y_prob = np.array(all_probs)
    y_pred = (y_prob >= threshold).astype(int)
    
    n_samples = len(y_true)
    if n_samples == 0:
        return {"error": "Empty evaluation set"}
        
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0)) # Sensitivity
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    
    # Confusion matrix
    # Format: [[TN, FP], [FN, TP]]
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = int(cm[0, 0]), int(cm[0, 1]), int(cm[1, 0]), int(cm[1, 1])
    
    # Specificity: True Negative Rate = TN / (TN + FP)
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
    
    # ROC-AUC calculation
    try:
        if len(np.unique(y_true)) > 1:
            roc_auc = float(roc_auc_score(y_true, y_prob))
        else:
            roc_auc = None
    except Exception:
        roc_auc = None
        
    metrics = {
        "sample_count": n_samples,
        "class_distribution": {
            "IDC Negative (0)": int(np.sum(y_true == 0)),
            "IDC Positive (1)": int(np.sum(y_true == 1))
        },
        "positive_class": "IDC Positive (1)",
        "negative_class": "IDC Negative (0)",
        "decision_threshold": threshold,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall_sensitivity": round(rec, 4),
        "specificity": round(specificity, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
        "confusion_matrix": {
            "TN": tn,
            "FP": fp,
            "FN": fn,
            "TP": tp
        }
    }
    
    return metrics
