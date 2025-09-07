import { Train, KPI, Prediction, ImpactAnalysis, Recommendation } from "../types/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL environment variable");
}

async function fetcher(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An API error occurred');
    }
    
    return response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
}

async function postData(endpoint: string, data: object) {
  return fetcher(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// --- API Functions ---

// GET /kpis
export const getKpis = async (): Promise<{ kpis: KPI[] }> => {
  return fetcher(`${API_URL}/kpis`);
};

// GET /simulation_state
export const getSimulationState = async (): Promise<{ currentTime: string; trains: Train[] }> => {
  return fetcher(`${API_URL}/simulation_state`);
};

// POST /inject_scenario
export const injectScenario = async (scenario: string): Promise<{ message: string }> => {
  return postData('/inject_scenario', { scenario });
};

// POST /reset_simulation
export const resetSimulation = async (): Promise<{ message: string }> => {
  return postData('/reset_simulation', {});
};

// POST /predict_delay
export const predictDelay = async (trainId: string, scenario: string): Promise<Prediction> => {
  return postData('/predict_delay', { train_id: trainId, scenario });
};

// POST /analyze_impact
export const analyzeImpact = async (trainId: string, predictedDelay: number): Promise<ImpactAnalysis> => {
  return postData('/analyze_impact', { train_id: trainId, predicted_delay: predictedDelay });
};

// POST /get_recommendations
export const getRecommendations = async (cascadeAnalysis: any, riskLevel: string): Promise<{ recommendations: Recommendation[] }> => {
  return postData('/get_recommendations', { cascade_analysis: cascadeAnalysis, risk_level: riskLevel });
};