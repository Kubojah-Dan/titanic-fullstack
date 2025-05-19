import joblib
import pandas as pd
from .schemas import PredictionInput

def predict_survival(data: PredictionInput):
    model = joblib.load("models/model.pkl")
    input_df = pd.DataFrame([data.dict()])
    prediction = model.predict(input_df)[0]
    probability = model.predict_proba(input_df)[0][1]
    return prediction, probability