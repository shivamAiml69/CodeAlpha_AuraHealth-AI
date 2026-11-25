const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export type PredictionResponse = {
  prediction: string;
  confidence: number;
  probability?: number;
  decision_threshold?: number;
  model_type?: string;
  model?: string;
  task?: string;
  modality?: string;
  classes?: string[];
  disclaimer?: string;
  error?: string;
  code?: string;
};

export type ModelStatusResponse = {
  diabetes_model: {
    type: string;
    modality: string;
    available: boolean;
  };
  breast_cancer_tabular_model: {
    type: string;
    modality: string;
    available: boolean;
  };
  breast_cancer_image_cnn: {
    type: string;
    modality: string;
    available: boolean;
    architecture?: string | null;
    task?: string | null;
    evaluation_metrics?: any;
  };
};

export type SavedPrediction = {
  id: string;
  disease: "breast-cancer" | "diabetes";
  prediction: string;
  confidence: number;
  probability?: number;
  isPositive: boolean;
  modelType: string;
  modelName?: string;
  task?: string;
  timestamp: string;
  inputs?: Record<string, string>;
  imagePreviewUrl?: string;
  imageFileName?: string;
};

const LATEST_PREDICTION_KEY = "aurahealth_latest_prediction";

export function saveLatestPrediction(prediction: SavedPrediction) {
  try {
    localStorage.setItem(LATEST_PREDICTION_KEY, JSON.stringify(prediction));
  } catch (e) {
    console.warn("Could not save prediction to localStorage:", e);
  }
}

export function getLatestPrediction(): SavedPrediction | null {
  try {
    const raw = localStorage.getItem(LATEST_PREDICTION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not retrieve prediction from localStorage:", e);
    return null;
  }
}

export function clearLatestPrediction() {
  try {
    localStorage.removeItem(LATEST_PREDICTION_KEY);
  } catch (e) {
    console.warn("Could not clear prediction:", e);
  }
}

async function parsePredictionResponse(response: Response): Promise<PredictionResponse> {
  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server returned status ${response.status} with non-JSON response.`);
  }

  if (!response.ok) {
    const errorMsg = data.error ?? (data.code === "MODEL_UNAVAILABLE" 
      ? "The CNN model is currently unavailable on the server." 
      : "Prediction request failed.");
    const err = new Error(errorMsg);
    (err as any).code = data.code;
    (err as any).data = data;
    throw err;
  }

  return data;
}

export async function getModelStatus(): Promise<ModelStatusResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/model-status`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function predictDiabetes(payload: {
  age: string;
  glucose: string;
  bloodPressure: string;
  skinThickness: string;
  insulin: string;
  bmi: string;
  diabetesPedigreeFunction: string;
}) {
  const response = await fetch(`${API_BASE_URL}/predict/diabetes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parsePredictionResponse(response);
}

export async function predictBreastCancerImage(image: File) {
  // Client-side file size validation (5MB max)
  const maxBytes = 5 * 1024 * 1024;
  if (image.size > maxBytes) {
    throw new Error(`Selected file is too large (${(image.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
  }

  // Client-side format check
  const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/tiff", "image/webp"];
  if (image.type && !validTypes.includes(image.type.toLowerCase())) {
    throw new Error("Invalid image type. Please select a PNG or JPG/JPEG microscopy image.");
  }

  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch(`${API_BASE_URL}/predict/breast-cancer-image`, {
    method: "POST",
    body: formData,
  });

  return parsePredictionResponse(response);
}
