import os
import time
from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

MODEL_PATH = Path(os.getenv("ML_MODEL_PATH", "models/behavioral_rf.joblib"))
METADATA_PATH = Path(os.getenv("ML_METADATA_PATH", "models/metadata.joblib"))
SERVICE_SECRET = os.getenv("ML_SERVICE_SECRET", "")

app = FastAPI(title="Horizons ML Service")


class PredictRequest(BaseModel):
    features: list[float] = Field(..., min_length=44, max_length=44)


def load_artifacts():
    if not MODEL_PATH.exists():
        return None, None
    model = joblib.load(MODEL_PATH)
    metadata = joblib.load(METADATA_PATH) if METADATA_PATH.exists() else {}
    return model, metadata


def probability_to_risk(probability):
    if probability < 0.25:
        return "low"
    if probability < 0.5:
        return "medium"
    if probability < 0.75:
        return "high"
    return "very_high"


@app.get("/health")
async def health():
    model_available = MODEL_PATH.exists()
    return {
        "status": "ok" if model_available else "missing_model",
        "model_path": str(MODEL_PATH),
    }


@app.post("/predict")
async def predict(req: PredictRequest, x_service_secret: str = Header("")):
    if SERVICE_SECRET and x_service_secret != SERVICE_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")

    model, metadata = load_artifacts()
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not trained")

    started = time.perf_counter()
    x = np.array(req.features, dtype=float).reshape(1, -1)
    probability = float(model.predict_proba(x)[0][1])
    confidence = float(max(model.predict_proba(x)[0]))
    inference_ms = int((time.perf_counter() - started) * 1000)

    return {
        "asd_probability": probability,
        "confidence": confidence,
        "consensus_risk": probability_to_risk(probability),
        "model_version": metadata.get("model_version", "rf_v1.0"),
        "model_type": metadata.get("model_type", "random_forest"),
        "feature_names": metadata.get("feature_names", []),
        "shap_values": None,
        "inference_ms": inference_ms,
    }

