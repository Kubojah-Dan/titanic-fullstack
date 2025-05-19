FROM python:3.10-slim
WORKDIR /backend
COPY ./requirements.txt /backend/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY . /backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]