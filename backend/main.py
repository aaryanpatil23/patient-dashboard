from fastapi import FastAPI, HTTPException, APIRouter, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import uuid
from typing import List

from models import *
import db_actions as db
from auth import create_access_token, get_current_user_from_db, verify_password, get_password_hash

app = FastAPI(title="OPD Nexus Patient API")
origins = ["Access-Control-Allow-Origin: https://patient-dashboard-navy-five.vercel.app"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

patient_router = APIRouter(prefix="/patient")
auth_router = APIRouter(prefix="/auth")
public_router = APIRouter()

# --- Authentication Endpoints ---
@auth_router.post("/register")
def register_user(user_data: UserRegister):
    hashed_password = get_password_hash(user_data.password)
    user = db.create_new_user(user_data.fullName, user_data.email, hashed_password, "patient")
    if not user: raise HTTPException(status_code=400, detail="Email already registered.")
    token_data = {"sub": user['email'], "user_id": str(user['id']), "full_name": user['full_name']}
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.post("/login")
def login_user(form_data: UserLogin):
    user = db.get_user_by_email(form_data.email)
    if not user or not user.get('hashed_password') or not verify_password(form_data.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token_data = {"sub": user['email'], "user_id": str(user['id']), "full_name": user['full_name']}
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.post("/google")
def google_auth(token_data: GoogleToken):
    try:
        idinfo = id_token.verify_oauth2_token(token_data.idToken, requests.Request(), os.getenv("GOOGLE_CLIENT_ID"))
        email = idinfo['email']; full_name = idinfo.get('name', 'New User')
        user = db.get_user_by_email(email)
        if not user:
            hashed_password = get_password_hash(str(uuid.uuid4())) 
            user = db.create_new_user(full_name, email, hashed_password, "patient")
        if not user:
            raise HTTPException(status_code=500, detail="Could not create user account.")
        if user['role'] != 'patient':
            raise HTTPException(status_code=403, detail="This account is not a patient account.")
        token_data = {"sub": user['email'], "user_id": str(user['id']), "full_name": user['full_name']}
        access_token = create_access_token(data=token_data)
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

# --- Patient Endpoints (Protected) ---
@patient_router.get("/profile", response_model=PatientProfile)
def get_profile(current_user: User = Depends(get_current_user_from_db)):
    profile = db.get_patient_profile(current_user.id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found.")
    return profile

@patient_router.put("/profile", response_model=PatientProfile)
def update_profile(profile_data: PatientProfileUpdate, current_user: User = Depends(get_current_user_from_db)):
    updated = db.update_patient_profile(current_user.id, profile_data.model_dump())
    if not updated: raise HTTPException(status_code=400, detail="Update failed.")
    return updated

@patient_router.post("/book-appointment", response_model=AppointmentOut)
def book_appointment_route(appt_data: AppointmentIn, current_user: User = Depends(get_current_user_from_db)):
    new_appt = db.book_new_appointment(current_user.model_dump(), appt_data.doctor_id, appt_data.slot)
    if not new_appt: raise HTTPException(status_code=500, detail="Could not book appointment.")
    return new_appt

# --- NEW: "My Appointments" Endpoints ---
@patient_router.get("/my-appointments", response_model=List[AppointmentOut])
def get_my_appointments(current_user: User = Depends(get_current_user_from_db)):
    """Gets all of the logged-in patient's appointments (past and future)."""
    return db.get_patient_appointments(current_user.id)

@patient_router.put("/appointments/{appointment_id}/cancel", response_model=AppointmentOut)
def cancel_appointment_route(appointment_id: uuid.UUID, current_user: User = Depends(get_current_user_from_db)):
    """Cancels one of the patient's own appointments."""
    cancelled_appt = db.cancel_appointment(appointment_id, current_user.id)
    if not cancelled_appt:
        raise HTTPException(status_code=404, detail="Appointment not found or you do not have permission to cancel it.")
    return cancelled_appt

# --- NEW: "My Medical Records" Endpoint ---
@patient_router.get("/my-records", response_model=List[PrescriptionRecord])
def get_my_medical_records(current_user: User = Depends(get_current_user_from_db)):
    """Gets all of the logged-in patient's past prescriptions."""
    return db.get_patient_medical_records(current_user.id)

# --- NEW: "Doctor Reviews" Endpoint ---
@patient_router.post("/reviews", response_model=ReviewOut, status_code=201)
def post_doctor_review(review_data: ReviewIn, current_user: User = Depends(get_current_user_from_db)):
    """Submits a new review for a doctor from the logged-in patient."""
    new_review = db.add_doctor_review(current_user.id, review_data.model_dump())
    if not new_review:
        raise HTTPException(status_code=400, detail="Could not submit review. You may have already reviewed this appointment.")
    return new_review

# --- Public Endpoints (No Auth Required) ---
@public_router.get("/doctors/search", response_model=List[DoctorPublic])
def search_doctors_route(q: str):
    if len(q) < 2: return []
    return db.search_doctors(q)

@public_router.get("/articles", response_model=List[Article])
def get_articles_route():
    return db.get_all_articles()

@public_router.get("/pharmacies/search", response_model=List[Pharmacy])
def search_pharmacies_route(q: str):
    if len(q) < 2: return []
    return db.search_pharmacies(q)

@public_router.get("/labs/search", response_model=List[Lab])
def search_labs_route(q: str):
    if len(q) < 2: return []
    return db.search_labs(q)

app.include_router(patient_router)
app.include_router(auth_router)
app.include_router(public_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the OPD Nexus PATIENT API"}
