import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
import joblib

# Load the Titanic dataset
data = pd.read_csv("app/data/train.csv")

# Basic preprocessing
data = data[['Survived', 'Pclass', 'Sex', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked']].dropna()

# Encode categorical variables
label_encoder_sex = LabelEncoder()
data['Sex'] = label_encoder_sex.fit_transform(data['Sex'])  # Male: 1, Female: 0

label_encoder_embarked = LabelEncoder()
data['Embarked'] = label_encoder_embarked.fit_transform(data['Embarked'])  # S: 0, C: 1, Q: 2

# Features and target
X = data[['Pclass', 'Sex', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked']]
y = data['Survived']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Save the model
joblib.dump(model, "app/models/model.pkl")

print("Model trained and saved as app/models/model.pkl")
