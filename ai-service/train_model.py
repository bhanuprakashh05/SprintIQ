import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib


# Load training data
data = pd.read_csv("training_data.csv")


# Features used by the model
features = [
    "totalTasks",
    "completedTasks",
    "inProgressTasks",
    "todoTasks",
    "daysRemaining",
    "highPriorityTasks",
    "mediumPriorityTasks",
    "lowPriorityTasks"
]

X = data[features]
y = data["risk"]


# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# Create Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)


# Train the model
model.fit(X_train, y_train)


# Test the model
predictions = model.predict(X_test)


# Calculate accuracy
accuracy = accuracy_score(
    y_test,
    predictions
)

print("Model training completed!")
print()
print(f"Accuracy: {accuracy * 100:.2f}%")
print()
print("Classification Report:")
print(
    classification_report(
        y_test,
        predictions
    )
)


# Show feature importance
print("Feature Importance:")

for feature, importance in zip(
    features,
    model.feature_importances_
):
    print(
        f"{feature}: {importance:.3f}"
    )


# Save model
joblib.dump(
    model,
    "sprint_risk_model.pkl"
)

print()
print("Model saved as sprint_risk_model.pkl")