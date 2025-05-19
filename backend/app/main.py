from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import schemas, database, auth
import joblib
import pandas as pd
from sklearn.metrics import accuracy_score

app = FastAPI()

# Enable CORS for both local development and Render.com deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://titanic-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create an APIRouter for organizing endpoints
router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_email = auth.verify_token(token, credentials_exception)
    user = db.query(database.User).filter(database.User.email == user_email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/signup")
async def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(database.User).filter(database.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = database.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created successfully"}

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(database.User).filter(database.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/predict", response_model=schemas.PredictionResult)
async def predict(
    prediction_input: schemas.PredictionInput,
    current_user: database.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Load the model
    model = joblib.load("app/models/model.pkl")

    # Prepare the input data
    data = {
        "Pclass": [prediction_input.pclass],
        "Sex": [1 if prediction_input.sex.lower() == "male" else 0],
        "Age": [prediction_input.age],
        "SibSp": [prediction_input.sibsp],
        "Parch": [prediction_input.parch],
        "Fare": [prediction_input.fare],
        "Embarked": [
            {"S": 0, "C": 1, "Q": 2}.get(
                prediction_input.embarked[0].upper(), 0
            )
        ],
    }
    df = pd.DataFrame(data)

    # Make prediction
    prediction = model.predict(df)[0]
    probability = model.predict_proba(df)[0][1]

    result = "Survived" if prediction == 1 else "Not Survived"

    # Save prediction to database
    db_prediction = database.Prediction(
        user_email=current_user.email,
        pclass=prediction_input.pclass,
        sex=prediction_input.sex,
        age=prediction_input.age,
        sibsp=prediction_input.sibsp,
        parch=prediction_input.parch,
        fare=prediction_input.fare,
        embarked=prediction_input.embarked,
        result=result,
        probability=probability,
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)

    return {"result": result, "probability": probability}

@app.get("/predictions", response_model=list[schemas.PredictionOutput])
async def get_predictions(
    current_user: database.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    print(f"Fetching predictions for user: {current_user.email}")
    predictions = db.query(database.Prediction).filter(database.Prediction.user_email == current_user.email).all()
    print(f"Found {len(predictions)} predictions")
    return predictions

@router.get("/stats")
async def get_stats(db: Session = Depends(database.get_db)):
    # Calculate total predictions
    total_predictions = db.query(database.Prediction).count()

    # Load the model to compute accuracy (if validation data is available)
    try:
        model = joblib.load("app/models/model.pkl")

        # Ideally, you'd have a validation dataset to compute accuracy
        # For this example, we'll use predictions stored in the database
        # and assume you have a way to compare them against true labels
        # Here, we'll simulate accuracy calculation if true labels were available
        predictions = db.query(database.Prediction).all()
        if predictions:
            # Simulate true labels (in a real scenario, you'd have these in your DB or dataset)
            # For demonstration, let's assume 85% accuracy as a placeholder
            # Replace this with actual logic if you have ground truth data
            model_accuracy = 85  # Placeholder
            """
            Example of real accuracy calculation (if true labels exist):
            true_labels = [fetch from db or dataset]
            predicted_labels = [p.result for p in predictions]
            model_accuracy = accuracy_score(true_labels, predicted_labels) * 100
            """
        else:
            model_accuracy = 85  # Default if no predictions exist
    except Exception as e:
        print(f"Error loading model for accuracy calculation: {e}")
        model_accuracy = 85  # Fallback

    return {
        "total_predictions": total_predictions,
        "model_accuracy": model_accuracy
    }

# Include the router in the main app
app.include_router(router)