import argparse
from pathlib import Path

import csv
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


def load_csv(path, label_column):
    with open(path, newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))

    if not rows:
        raise ValueError("Training CSV is empty")
    if label_column not in rows[0]:
        raise ValueError(f"Missing label column: {label_column}")

    ignored = {"session_id", label_column}
    feature_names = [name for name in rows[0].keys() if name not in ignored]
    x = np.array(
        [[float(row[name] or 0) for name in feature_names] for row in rows],
        dtype=float,
    )
    y = np.array([int(row[label_column]) for row in rows], dtype=int)
    return x, y, feature_names


def build_model(model_type):
    if model_type == "logistic_regression":
        return Pipeline(
            [
                ("scaler", StandardScaler()),
                (
                    "clf",
                    LogisticRegression(
                        class_weight="balanced",
                        max_iter=2000,
                        random_state=42,
                    ),
                ),
            ],
        )

    return Pipeline(
        [
            ("scaler", StandardScaler()),
            (
                "clf",
                RandomForestClassifier(
                    n_estimators=250,
                    max_depth=8,
                    class_weight="balanced",
                    random_state=42,
                ),
            ),
        ],
    )


def train(args):
    x, y, feature_names = load_csv(args.data, args.label_column)
    if x.shape[1] != 44:
        raise ValueError(f"Expected 44 features, got {x.shape[1]}")

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=args.test_size,
        random_state=42,
        stratify=y,
    )
    model = build_model(args.model_type)
    model.fit(x_train, y_train)

    probabilities = model.predict_proba(x_test)[:, 1]
    predictions = (probabilities >= args.threshold).astype(int)
    auc = roc_auc_score(y_test, probabilities)

    print(f"ROC-AUC: {auc:.3f}")
    print("Confusion matrix:")
    print(confusion_matrix(y_test, predictions))
    print(classification_report(y_test, predictions, digits=3))

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_dir / "behavioral_rf.joblib")
    joblib.dump(
        {
            "model_version": args.model_version,
            "model_type": args.model_type,
            "feature_names": feature_names,
            "threshold": args.threshold,
            "roc_auc": auc,
        },
        output_dir / "metadata.joblib",
    )


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True)
    parser.add_argument("--label-column", default="label")
    parser.add_argument("--model-type", default="random_forest")
    parser.add_argument("--model-version", default="rf_v1.0")
    parser.add_argument("--output-dir", default="models")
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--threshold", type=float, default=0.5)
    return parser.parse_args()


if __name__ == "__main__":
    train(parse_args())
