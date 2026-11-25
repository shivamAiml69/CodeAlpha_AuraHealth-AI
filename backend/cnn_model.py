"""
CNN architectures for Breast Cancer (Invasive Ductal Carcinoma - IDC)
histopathology patch classification.
"""

import torch
import torch.nn as nn
from torchvision import models


class BreastCancerCNN(nn.Module):
    """
    Convolutional Neural Network (CNN) for Histopathological 
    Breast Cancer (Invasive Ductal Carcinoma) Detection.
    
    Architecture:
    - Conv Block 1: Conv2D(3 -> 32, 3x3) + BatchNorm + ReLU + MaxPool(2x2)
    - Conv Block 2: Conv2D(32 -> 64, 3x3) + BatchNorm + ReLU + MaxPool(2x2)
    - Conv Block 3: Conv2D(64 -> 128, 3x3) + BatchNorm + ReLU + MaxPool(2x2)
    - AdaptiveAvgPool2D(4x4)
    - Fully Connected (Dense): Linear(2048 -> 128) + ReLU + Dropout(0.4)
    - Output: Linear(128 -> 2) [0: Benign / IDC Negative, 1: Malignant / IDC Positive]
    """
    def __init__(self, num_classes: int = 2, dropout_rate: float = 0.4):
        super(BreastCancerCNN, self).__init__()
        
        self.features = nn.Sequential(
            # Block 1
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Block 2
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Block 3
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )
        
        self.adaptive_pool = nn.AdaptiveAvgPool2d((4, 4))
        
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 4 * 4, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(p=dropout_rate),
            nn.Linear(128, num_classes)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.adaptive_pool(x)
        x = self.classifier(x)
        return x


class HistopathologyCNN(nn.Module):
    """
    Custom Convolutional Neural Network specifically designed for 
    microscopy histopathology image patches.
    """
    def __init__(self, num_classes: int = 2, dropout_rate: float = 0.4):
        super().__init__()
        self.features = nn.Sequential(
            # Block 1: 3 -> 32 channels
            nn.Conv2d(3, 32, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 32, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            nn.Dropout2d(p=dropout_rate / 2),

            # Block 2: 32 -> 64 channels
            nn.Conv2d(32, 64, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            nn.Dropout2d(p=dropout_rate / 2),

            # Block 3: 64 -> 128 channels
            nn.Conv2d(64, 128, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            nn.Dropout2d(p=dropout_rate),
        )
        
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(p=dropout_rate),
            nn.Linear(64, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.pool(x)
        logits = self.classifier(x)
        return logits


class TransferLearningCNN(nn.Module):
    """
    Transfer learning model using MobileNetV3-Small backbone.
    Lightweight, fast inference on CPU, and robust feature extraction.
    """
    def __init__(self, num_classes: int = 2, pretrained: bool = True, dropout_rate: float = 0.3):
        super().__init__()
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        base_model = models.mobilenet_v3_small(weights=weights)
        self.features = base_model.features
        self.avgpool = base_model.avgpool
        
        in_features = base_model.classifier[0].in_features
        self.classifier = nn.Sequential(
            nn.Linear(in_features, 64),
            nn.Hardswish(inplace=True),
            nn.Dropout(p=dropout_rate),
            nn.Linear(64, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        logits = self.classifier(x)
        return logits


def get_model(model_name: str = "breast_cancer_cnn", num_classes: int = 2, pretrained: bool = False) -> nn.Module:
    """
    Factory function to instantiate the specified CNN model architecture.
    """
    name_normalized = model_name.lower().replace("-", "_").replace(" ", "")
    if name_normalized in ["breast_cancer_cnn", "breastcancercnn"]:
        return BreastCancerCNN(num_classes=num_classes)
    elif name_normalized in ["custom", "custom_cnn", "histopathology_cnn"]:
        return HistopathologyCNN(num_classes=num_classes)
    elif name_normalized in ["mobilenet", "mobilenet_v3", "mobilenet_v3_small"]:
        return TransferLearningCNN(num_classes=num_classes, pretrained=pretrained)
    else:
        raise ValueError(f"Unsupported model architecture: {model_name}. Supported: 'breast_cancer_cnn', 'custom', 'mobilenet_v3_small'")
