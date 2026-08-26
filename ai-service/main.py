from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI(
    title="SprintIQ AI Service",
    description="AI and ML service for SprintIQ",
    version="1.0.0"
)


# Load the trained ML model
model = joblib.load("sprint_risk_model.pkl")


class SprintData(BaseModel):
    totalTasks: int
    completedTasks: int
    inProgressTasks: int
    todoTasks: int
    daysRemaining: int
    highPriorityTasks: int
    mediumPriorityTasks: int
    lowPriorityTasks: int


@app.get("/")
def home():
    return {
        "message": "SprintIQ AI Service is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/predict/sprint-risk")
def predict_sprint_risk(data: SprintData):

    # Prepare all 8 features in the same order
    # used during model training.
    input_data = [[
        data.totalTasks,
        data.completedTasks,
        data.inProgressTasks,
        data.todoTasks,
        data.daysRemaining,
        data.highPriorityTasks,
        data.mediumPriorityTasks,
        data.lowPriorityTasks
    ]]

    # ML prediction
    prediction = model.predict(input_data)[0]

    # Prediction probabilities
    probabilities = model.predict_proba(input_data)[0]

    class_probabilities = dict(
        zip(model.classes_, probabilities)
    )

    confidence = class_probabilities[prediction]

    # Calculate completion percentage
    completion_rate = (
        data.completedTasks / data.totalTasks
    ) * 100 if data.totalTasks > 0 else 0

    return {
        "risk": prediction,
        "confidence": round(float(confidence), 2),
        "completionRate": round(completion_rate, 2),
        "daysRemaining": data.daysRemaining
    }