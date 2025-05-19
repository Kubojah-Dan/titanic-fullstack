from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
import os
from sqlalchemy.exc import OperationalError
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

# Define SQLAlchemy Base
Base = declarative_base()

# Define models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    pclass = Column(Integer)
    sex = Column(String)
    age = Column(Float)
    sibsp = Column(Integer)
    parch = Column(Integer)
    fare = Column(Float)
    embarked = Column(String)
    result = Column(String)
    probability = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

# Database connection setup
IN_DOCKER = os.getenv("IN_DOCKER", "false").lower() == "true"

# Get database credentials from environment variables
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "kobby-dan-014")
DB_HOST = os.getenv("DB_HOST", "postgres" if IN_DOCKER else "localhost")  # Use service name in Docker
DB_PORT = os.getenv("DB_PORT", "5432")  # Standard PostgreSQL port
DB_NAME = os.getenv("DB_NAME", "titanic_db")

# Construct the database URL
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"IN_DOCKER value: {os.getenv('IN_DOCKER')}")
print(f"IN_DOCKER boolean: {IN_DOCKER}")
print(f"Database URL: {SQLALCHEMY_DATABASE_URL}")

@retry(
    stop=stop_after_attempt(5),
    wait=wait_fixed(5),
    retry=retry_if_exception_type(OperationalError),
    before_sleep=lambda retry_state: print(f"Retrying database connection... Attempt {retry_state.attempt_number}")
)
def create_engine_with_retry():
    return create_engine(SQLALCHEMY_DATABASE_URL)

engine = create_engine_with_retry()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()