Patient Dashboard Backend

This is the dedicated FastAPI backend for the OPD Nexus patient-facing application.
It handles user registration, login, doctor searching, appointment booking, and more.

How to Run

Create a .env file (copy from .env.example) and fill in your DATABASE_URL and GOOGLE_CLIENT_ID.

Create a virtual environment:

python -m venv venv


Activate it:

# Windows
.\venv\Scripts\activate


Install dependencies:

pip install -r requirements.txt


Run the server (on port 8000):

uvicorn main:app --reload --port 8000

