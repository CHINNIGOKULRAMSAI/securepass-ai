import joblib
import pandas as pd

# LOAD MODEL
model = joblib.load("../ml/password_model.pkl")

# CORRECT FEATURE ORDER
FEATURE_COLUMNS = [
    "length",
    "uppercase",
    "lowercase",
    "digits",
    "symbols",
    "entropy",
    "lrs",
    "sequential"
]


def predict_strength(features):

    # CREATE DATAFRAME
    df = pd.DataFrame([features])

    # REORDER COLUMNS
    df = df[FEATURE_COLUMNS]

    # PREDICTION
    prediction = model.predict(df)[0]

    # PROBABILITIES
    probabilities = model.predict_proba(df)[0]

    confidence = max(probabilities)

    # CONVERT TO PYTHON TYPES
    prediction = int(prediction)

    confidence = float(confidence)

    confidence = round(confidence * 100, 2)

    # LABEL MAPPING
    labels = {
        0: "weak",
        1: "medium",
        2: "strong"
    }

    prediction_label = labels.get(
        prediction,
        "unknown"
    )

    return prediction_label, confidence