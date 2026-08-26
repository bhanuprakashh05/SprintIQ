import random
import pandas as pd

random.seed(42)

records = []

for risk in ["LOW", "MEDIUM", "HIGH"]:

    for _ in range(200):

        total_tasks = random.randint(5, 30)

        if risk == "LOW":
            completion_rate = random.uniform(0.65, 0.98)
            days_remaining = random.randint(4, 14)

        elif risk == "MEDIUM":
            completion_rate = random.uniform(0.35, 0.75)
            days_remaining = random.randint(2, 8)

        else:
            completion_rate = random.uniform(0.05, 0.50)
            days_remaining = random.randint(1, 5)

        completed_tasks = round(total_tasks * completion_rate)

        remaining_tasks = total_tasks - completed_tasks

        in_progress_tasks = random.randint(
            0,
            remaining_tasks
        )

        todo_tasks = remaining_tasks - in_progress_tasks

        # Generate priority distribution
        high_priority_tasks = random.randint(
            0,
            max(1, remaining_tasks)
        )

        remaining_after_high = max(
            0,
            remaining_tasks - high_priority_tasks
        )

        medium_priority_tasks = random.randint(
            0,
            remaining_after_high
        )

        low_priority_tasks = max(
            0,
            remaining_after_high - medium_priority_tasks
        )

        records.append({
            "totalTasks": total_tasks,
            "completedTasks": completed_tasks,
            "inProgressTasks": in_progress_tasks,
            "todoTasks": todo_tasks,
            "daysRemaining": days_remaining,
            "highPriorityTasks": high_priority_tasks,
            "mediumPriorityTasks": medium_priority_tasks,
            "lowPriorityTasks": low_priority_tasks,
            "risk": risk
        })


df = pd.DataFrame(records)

df = df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)

df.to_csv(
    "training_data.csv",
    index=False
)

print("Dataset created successfully!")
print(f"Total records: {len(df)}")
print()
print("Risk distribution:")
print(df["risk"].value_counts())
print()
print("Columns:")
print(list(df.columns))
print()
print("First 10 records:")
print(df.head(10))