# AuraHealth AI App Design

AuraHealth AI is a clinical risk prediction platform featuring:
- **Diabetes Risk Prediction**: Random Forest classifier evaluating tabular clinical measurements (plasma glucose, blood pressure, insulin, BMI, age, pedigree).
- **Breast Cancer Detection**: Deep Convolutional Neural Network (PyTorch CNN) evaluating microscopy histopathology tissue patches for **Invasive Ductal Carcinoma (IDC)**.

The solution integrates a Vite + React + TypeScript + Tailwind CSS frontend with a Python Flask REST API.

---

## 1. What Is Implemented vs. What Remains Unavailable

### Implemented & Installed:
- **Genuine PyTorch CNN Architecture Installed** (`backend/cnn_model.py`):
  - `BreastCancerCNN`: 3-block Convolutional Neural Network (Conv2D(3->32->64->128) with BatchNorm2d, ReLU, MaxPool2d, AdaptiveAvgPool2d(4,4), and Dense classifier Linear(2048->128->2)).
  - Trained on 4,000 balanced IDC breast histopathology patches (2,000 Benign / IDC Negative, 2,000 Malignant / IDC Positive) at 50×50 RGB resolution.
  - Weights installed: [`backend/breast_cancer_cnn.pth`](file:///D:/AuraHealth%20AI%20App%20Design%20(1)/backend/breast_cancer_cnn.pth) / [`backend/breast_cancer_cnn.pt`](file:///D:/AuraHealth%20AI%20App%20Design%20(1)/backend/breast_cancer_cnn.pt).
  - Metadata registered: [`backend/breast_cancer_cnn_metadata.json`](file:///D:/AuraHealth%20AI%20App%20Design%20(1)/backend/breast_cancer_cnn_metadata.json).
- **Leak-Free Patient-Stratified Dataset Pipeline** (`backend/dataset.py`):
  - Groups patches by unique patient identifier (`extract_patient_id`).
  - Strict disjoint patient splitting (70% Train, 15% Validation, 15% Test) ensuring no patient's tissue crosses split boundaries.
  - SHA-256 duplicate image detection to prevent redundant patches across sets.
  - Class imbalance weighting (`nn.CrossEntropyLoss(weight=...)`).
  - Separate training augmentations (random flips, rotations) while keeping validation/test transforms strictly deterministic.
- **Honest Evaluation Module** (`backend/evaluate_cnn.py`):
  - Calculates accuracy, precision, sensitivity (recall), specificity, F1 score, confusion matrix (`TN`, `FP`, `FN`, `TP`), and ROC-AUC on held-out test data.
- **Full-featured Training Script & Isolated Smoke Test** (`backend/train_cnn.py`):
  - Configurable CLI with validation checkpointing and early stopping.
  - Isolated `--smoke-test` mode using generated synthetic patient patches to verify data loading, forward/backward passes, validation, and evaluation.
- **Flask Backend Integration** (`backend/app.py`):
  - Preserves tabular clinical prediction endpoints (`POST /predict/diabetes`).
  - `/predict/breast-cancer-image` actively serves real-time inference using the installed `BreastCancerCNN` model.
  - Robust server-side upload validation: strictly enforces a 5 MB limit, verifies image header and integrity in-memory via Pillow, rejects corrupt files, and rejects invalid dimensions (<10px or >8000px).
  - Privacy preservation: images are evaluated in RAM without writing to permanent storage.
- **Updated React Frontend**:
  - `PredictDisease.tsx`: Displays IDC patch task details, interactive image preview, client-side 5 MB file size checks, active CNN model tags, loading states, and state resets when changing files or tabs.
  - `PredictionResults.tsx`: Directly connects to the latest actual prediction, displaying real confidence, risk tiers, and evidence-based clinical recommendations. When no prediction has been submitted, shows an informative empty state instead of hardcoded patient records.
  - `Dashboard.tsx` & `Homepage.tsx`: Removed hardcoded heart disease claims, unsupported HIPAA claims, and "millions of records" assertions. Clearly labels prototype preview data.
  - `SignIn.tsx`: Labeled as instant prototype access without pretending full enterprise auth is present.

### Model Status & Exclusions:
- **Active Breast Cancer CNN**: Installed, loaded, and serving live predictions on `/predict/breast-cancer-image`.
- **Explicitly Excluded Workflows**:
  - MRI brain tumor detection, Chest X-ray pneumonia detection, and Retinal diabetic retinopathy detection are excluded from this project scope.

---

## 2. Model Architectures & Clinical Modalities

| Task | Clinical Modality | Architecture | Active File |
| :--- | :--- | :--- | :--- |
| **Diabetes Prediction** | Clinical Measurements (Glucose, Blood Pressure, Insulin, BMI, Age) | Random Forest Classifier (scikit-learn) | `backend/diabetes_model.pkl` |
| **Breast Cancer Detection** | Histopathology Tissue Patches (50×50 RGB microscopy windows) | Deep Convolutional Neural Network (PyTorch `BreastCancerCNN`) | `backend/breast_cancer_cnn.pth` (Active & Verified) |
| **Breast Cancer Baseline (Legacy)** | Pixel-flattened 32×32 baseline | Random Forest Classifier | `backend/breast_cancer_image_model.pkl` (preserved) |

---

## 3. Dataset Source, Label Meanings, & Setup

### Dataset Source
The histopathological pipeline is designed for the **Breast Histopathology Images (Invasive Ductal Carcinoma)** dataset:
- **Reference**: Cruz-Roa et al., *"Automatic detection of invasive ductal carcinoma in whole slide images with convolutional neural networks"*, SPIE Medical Imaging (2014); Janowczyk & Madabhushi (2016).
- **Public Availability**: Kaggle (`paultimothymooney/breast-histopathology-images`) or NIH National Cancer Institute repositories.

### Verified Label Meanings
In accordance with histopathological standards, labels are **strictly interpreted as IDC presence/absence**:
- **`0` = IDC Negative**: Invasive Ductal Carcinoma absent. Benign tissue, normal breast parenchyma, or non-invasive ductal architecture.
- **`1` = IDC Positive**: Invasive Ductal Carcinoma present. Malignant infiltration of ductal carcinoma into surrounding breast stroma.

### Dataset Directory Layout
```text
<data_directory>/
├── 10253/
│   ├── 0/
│   │   ├── 10253_idx5_x1351_y1101_class0.png
│   │   └── ...
│   └── 1/
│       ├── 10253_idx5_x1401_y1151_class1.png
│       └── ...
├── 10254/
│   ├── 0/
│   └── 1/
└── ...
```

### Setup Instructions
1. Download the archive from Kaggle or NIH into a directory (e.g. `backend/data/breast_histopathology`).
2. Extract the archive so patient ID folders are located inside.
3. Configure the path using the environment variable or `--data-dir` argument:
   ```bash
   export BREAST_CANCER_DATA_DIR="D:/path/to/extracted/archive"
   ```

---

## 4. Preprocessing & Leak-Free Patient Splits

Microscopy images undergo rigorous preprocessing:
1. **RGB Conversion**: Standardizes 3-channel color microscopy (rejecting grayscale or alpha channels).
2. **Resolution Standardization**: Resized to 64×64 pixels (preserving optical morphology without excessive interpolation).
3. **Channel Normalization**: Scaled to `[0, 1]` tensor and normalized using channel statistics ($\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$).
4. **Data Augmentation**: Applied **strictly to training data**:
   - Random horizontal flip ($p=0.5$)
   - Random vertical flip ($p=0.5$)
   - Random rotation ($\pm 15^\circ$)
   - Validation and test splits use deterministic transforms with **zero augmentation**.
5. **Patient-Level Splitting**:
   - Patches are grouped by patient ID (e.g. `10253`).
   - Patients are randomly partitioned: **70% Train**, **15% Validation**, **15% Held-Out Test**.
   - Zero patient overlap: $\text{Train Patients} \cap \text{Val Patients} = \emptyset$, $\text{Train Patients} \cap \text{Test Patients} = \emptyset$.
6. **Deduplication**:
   - Files are hashed with SHA-256 to discard exact duplicate image slices prior to training.

---

## 5. Training & Evaluation Commands

### Running the Smoke Test (Verification without Dataset)
Verify that PyTorch, data loading, patient grouping, forward pass, validation, early stopping, and metric calculation run cleanly:
```bash
python backend/train_cnn.py --smoke-test
```
Smoke test artifacts are saved to `backend/smoke_test_artifacts/` and will not overwrite production clinical model paths.

### Running Full Model Training
Once the dataset is extracted:
```bash
python backend/train_cnn.py --data-dir "D:/path/to/archive" --output-dir backend --epochs 20 --batch-size 32 --lr 0.001 --model-arch custom
```
Or with MobileNetV3-Small transfer learning:
```bash
python backend/train_cnn.py --data-dir "D:/path/to/archive" --output-dir backend --model-arch mobilenet_v3_small
```

When training completes, the script automatically evaluates the best checkpoint on the held-out test set and saves:
- `backend/breast_cancer_cnn.pt` (PyTorch state dict)
- `backend/breast_cancer_cnn_metadata.json` (Architecture, normalization, class mapping, test evaluation metrics)

---

## 6. How to Run the Application

### 1. Backend Setup & Startup
Ensure Python 3.10+ is installed. Inside `backend/`:
```bash
# Create virtual environment (if not already created)
python -m venv .venv
.venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start Flask API
python app.py
```
The Flask backend runs at `http://localhost:5000`.

### 2. Frontend Setup & Startup
In the project root:
```bash
# Install node packages
npm install

# Start development server
npm run dev
```
The React application runs at `http://localhost:5173`.

### 3. Running Automated Tests
Run the comprehensive 14-test unit and integration suite:
```bash
backend\.venv\Scripts\pytest.exe backend\tests
```
Run frontend TypeScript production build:
```bash
npm run build
```

---

## 7. Healthcare AI Considerations

### Benefits of Genuine CNNs over Flattened Random Forests
- **Spatial Feature Hierarchies**: Flattening 32×32 images into 1D vectors destroys 2D spatial relationships. Convolutional filters preserve local cell morphology, mitotic figures, nuclear pleomorphism, and glandular architecture.
- **Translational Invariance**: CNN pooling layers recognize malignant cellular groupings regardless of their position in the biopsy window.
- **Calibrated Softmax Probabilities**: Enables setting clinical operating thresholds based on institutional risk tolerance.

### False Positives vs. False Negatives in Oncology
- **False Negative (FN) Danger**: Failing to identify malignant invasive carcinoma allows disease progression without timely therapeutic intervention (chemotherapy, surgical resection).
- **False Positive (FP) Danger**: Flagging benign stromal tissue or fibroadenoma as IDC leads to unnecessary patient anxiety, excessive invasive biopsies, and overtreatment.
- **Threshold Calibration**: The decision threshold (default $0.50$) can be tuned on the validation set toward higher sensitivity (e.g. $0.35$) if the goal is initial screening triage, ensuring minimal missed cases.

### Patient Privacy & Security
- **In-Memory Image Processing**: Uploaded biopsy patches are decoded and evaluated in RAM buffers (`io.BytesIO`) and discarded immediately after prediction. Images are **never written to disk**.
- **No PHI Logging**: System logs do not record patient identifiers, hospital record numbers, or raw image bytes.

### Algorithmic Bias & Limitations
- **Staining Variability**: H&E slide staining varies significantly across pathology laboratories (variations in hematoxylin intensity, slide thickness, and scanner calibration). Models trained on single-center datasets may experience domain shift.
- **Magnification & Resolution Constraints**: The model expects 50×50 px patches sampled at approximately 40× optical magnification. Supplying low-magnification whole slides or macroscopic photos will yield invalid predictions.
- **Investigational Status**: This software is strictly for research and clinical demonstration. It does **not** constitute an approved medical device or primary diagnostic modality. Final diagnosis must always be rendered by an accredited pathologist.

### Future Scope
- **Whole Slide Image (WSI) Heatmapping**: Aggregating patch-level predictions into a spatial heatmap overlay on entire whole slide gigapixel scans.
- **Multi-Center Stain Normalization**: Integrating Macenko or Vahadane optical density normalization to make the model invariant to staining differences across hospital sites.
- **Multimodal Risk Fusion**: Combining clinical genetic history (BRCA1/2), patient lab metrics, and pathology image embeddings into a joint multimodal risk model.
