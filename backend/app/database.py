from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

print("Loading database.py with SQLite configuration...")

# Define SQLAlchemy Base
Base = declarative_base()

# Define models (unchanged)
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

# Use SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///temp.db"
print(f"Database URL: {SQLALCHEMY_DATABASE_URL}")

# Create engine without retry since SQLite is local
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()