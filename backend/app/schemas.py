from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PredictionInput(BaseModel):
    pclass: int
    sex: str
    age: float
    sibsp: int
    parch: int
    fare: float
    embarked: str

class PredictionResult(BaseModel):
    result: str
    probability: float

class PredictionOutput(BaseModel):
    id: int
    user_email: str
    pclass: int
    sex: str
    age: float
    sibsp: int
    parch: int
    fare: float
    embarked: str
    result: str
    probability: float
    created_at: datetime

    class Config:
        from_attributes = True