from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import schemas, database, auth
import joblib
import pandas as pd

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://titanic-fullstack.appspot.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    try:
        # Load the model inside the endpoint
        model = joblib.load("app/models/model.pkl")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Model file not found")

    # Prepare the input data
    data = {
        "Pclass": [prediction_input.pclass],
        "Sex": [1 if prediction_input.sex.lower() == "male" else 0],
        "Age": [prediction_input.age],
        "SibSp": [prediction_input.sibsp],
        "Parch": [prediction_input.parch],
        "Fare": [prediction_input.fare],
        "Embarked": [
            {"S": 0, "C": 1, "Q": 2}.get(prediction_input.embarked[0].upper(), 0)
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
    total_predictions = db.query(database.Prediction).count()
    return {
        "total_predictions": total_predictions,
        "model_accuracy": 85  # Placeholder since model loading might fail
    }

app.include_router(router)