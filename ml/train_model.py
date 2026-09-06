import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

from xgboost import XGBClassifier

# LOAD DATASET
df = pd.read_csv("dataset.csv")

# FEATURES AND LABEL
X = df.drop("label", axis=1)
y = df["label"]

# ENCODE LABELS
encoder = LabelEncoder()
y = encoder.fit_transform(y)

# SPLIT DATA
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# MODEL
model = XGBClassifier()

# TRAIN
model.fit(X_train, y_train)

# PREDICT
predictions = model.predict(X_test)

# ACCURACY
accuracy = accuracy_score(y_test, predictions)

print("Model Accuracy:", accuracy)

# SAVE MODEL
joblib.dump(model, "password_model.pkl")

print("Model saved successfully!")