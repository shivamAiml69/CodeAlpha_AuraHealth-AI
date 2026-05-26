const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export type PredictionResponse = {
  prediction: string;
  confidence: number;
};

async function parsePredictionResponse(response: Response): Promise<PredictionResponse> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Prediction request failed.");
  }

  return data;
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
  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch(`${API_BASE_URL}/predict/breast-cancer-image`, {
    method: "POST",
    body: formData,
  });

  return parsePredictionResponse(response);
}
