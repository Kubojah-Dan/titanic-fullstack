import psycopg2

try:
    conn = psycopg2.connect(
        dbname="titanic_db",
        user="postgres",
        password="kobby-dan-014",
        host="localhost",
        port="5433"
    )
    print("Successfully connected to the database!")
    conn.close()
except Exception as e:
    print(f"Failed to connect to the database: {e}")