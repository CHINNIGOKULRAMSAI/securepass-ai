from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.password_engine import analyze_password
from app.ml_model import predict_strength
from app.recommendation_engine import generate_recommendations
from app.monitoring import setup_monitoring

app = FastAPI()

# Allow frontend dev server origins for local development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_monitoring(app)


class PasswordInput(BaseModel):
    password: str


@app.get("/")
def home():

    return {
        "message": "Enterprise AI Password Checker"
    }


@app.post("/analyze")
def analyze(data: PasswordInput):

    password = data.password

    features = analyze_password(password)

    prediction, confidence = predict_strength(features)

    recommendations = generate_recommendations(features)

    return {
        "password": password,
        "features": features,
        "prediction": prediction,
        "confidence": confidence,
        "recommendations": recommendations
    }