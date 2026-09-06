import shap
import joblib
import pandas as pd

model = joblib.load("password_model.pkl")

explainer = shap.TreeExplainer(model)

sample = pd.DataFrame([
    {
        "length": 12,
        "uppercase": 2,
        "digits": 3,
        "symbols": 1,
        "entropy": 75,
        "lrs": 1,
        "sequential": 0
    }
])

shap_values = explainer.shap_values(sample)

print(shap_values)