# AuraHealth AI App Design

AuraHealth AI is a full-stack health risk prediction dashboard. The frontend is a Vite + React application, and the backend is a Flask API that serves trained machine learning models for disease prediction.

The app includes a landing page, sign-in flow, clinician dashboard, prediction form, image upload prediction, and results/analytics screens.

## Features

- React dashboard UI for clinical risk prediction workflows
- Diabetes prediction from patient metrics
- Breast cancer prediction from histopathological image uploads
- Flask REST API with CORS enabled for frontend integration
- Pre-trained model files loaded from the backend folder
- Confidence score display with loading and error states
- Responsive chart-based dashboard using Recharts

## Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide React icons
- Recharts

### Backend

- Python
- Flask
- Flask-CORS
- NumPy
- scikit-learn
- Joblib
- Pillow

## Project Structure

```text
.
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── diabetes_model.pkl
│   ├── breast_cancer_model.pkl
│   ├── breast_cancer_image_model.pkl
│   ├── train_model.py
│   └── train_image_model.py
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── imports/
│   └── styles/
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## Getting Started

Run the backend and frontend in separate terminals.

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

If Pillow is missing in your environment, install it as well:

```bash
pip install pillow
```

### 3. Start the Flask backend

From the `backend` folder:

```bash
python app.py
```

The backend runs at:

```text
http://localhost:5000
```

### 4. Start the React frontend

From the project root:

```bash
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

If port `5173` is already in use, Vite may choose another port.

## Frontend and Backend Connection

The frontend API client is located at:

```text
src/app/lib/api.ts
```

By default, it sends requests to:

```text
http://localhost:5000
```

To use a different backend URL, create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Restart the Vite development server after changing environment variables.

## API Endpoints

### Health Check

```http
GET /
```

Returns a simple message confirming that the Flask backend is running.

### Diabetes Prediction

```http
POST /predict/diabetes
Content-Type: application/json
```

Expected JSON body:

```json
{
  "glucose": "120",
  "bloodPressure": "80",
  "skinThickness": "20",
  "insulin": "80",
  "bmi": "25.5",
  "diabetesPedigreeFunction": "0.627",
  "age": "35"
}
```

Example response:

```json
{
  "prediction": "Not Diabetic",
  "confidence": 88.42
}
```

### Breast Cancer Clinical Prediction

```http
POST /predict/breast-cancer
Content-Type: application/json
```

Expected JSON body:

```json
{
  "meanRadius": "14.2",
  "meanTexture": "20.5",
  "meanPerimeter": "92.3",
  "meanArea": "654.1",
  "meanSmoothness": "0.1"
}
```

Example response:

```json
{
  "prediction": "Benign",
  "confidence": 91.73
}
```

### Breast Cancer Image Prediction

```http
POST /predict/breast-cancer-image
Content-Type: multipart/form-data
```

Expected form field:

```text
image
```

Example response:

```json
{
  "prediction": "Malignant",
  "confidence": 94.18
}
```

## Available Scripts

### Frontend

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the React app for production.

### Backend

```bash
python app.py
```

Starts the Flask API on port `5000`.

## Model Files

The backend expects these model files inside the `backend` directory:

- `diabetes_model.pkl`
- `breast_cancer_model.pkl`
- `breast_cancer_image_model.pkl`

The app loads models using absolute paths based on `backend/app.py`, so the backend can be started from the backend folder or imported from the project root.

## Important Note

This project is for educational and demonstration purposes. AI predictions shown by this app should not be used as a final medical diagnosis. Always consult qualified medical professionals for clinical decisions.
