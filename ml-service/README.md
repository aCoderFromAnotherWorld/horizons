# Horizons ML Service

Python sidecar for post-session ASD screening support.

This service receives the 44-feature vector produced by `lib/ml/featureExtractor.js` and returns a probabilistic screening output. It is additive to the rule-based score and must not be treated as a diagnosis.

## Setup

```powershell
cd ml-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Train

The training CSV must contain the feature columns in the same order as `FEATURE_NAMES` plus a supervised clinical label column:

```text
label = 0  non-ASD / typical development
label = 1  ASD confirmed by clinician or validated assessment
```

Do not use the rule-based risk score as the ML label.

```powershell
python train.py --data ..\data\training_sessions.csv --label-column label
```

## Serve

```powershell
uvicorn main:app --reload --port 8000
```

The Next.js app should set:

```env
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_SECRET=shared-development-secret
```

