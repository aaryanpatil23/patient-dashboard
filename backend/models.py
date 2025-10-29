from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, date

# This file defines all the data "shapes" for the Patient API

# --- Auth Models ---
class User(BaseModel):
    id: uuid.UUID
    full_name: str
    email: Optional[str] = None
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    fullName: str
    email: str
    password: str

class GoogleToken(BaseModel):
    idToken: str

# --- Patient Profile Models ---
class PatientProfile(BaseModel):
    id: uuid.UUID
    full_name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PatientProfileUpdate(BaseModel):
    full_name: str
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None

# --- Doctor & Appointment Models ---
class DoctorPublic(BaseModel):
    """ The public-facing doctor profile for search results. """
    id: uuid.UUID
    name: str
    specialty: str
    experience: int
    bio: Optional[str] = None
    available_slots: Optional[List[str]] = []
    clinic_name: Optional[str] = None
    average_rating: Optional[float] = 0.0
    review_count: int = 0
    
    class Config:
        from_attributes = True

class AppointmentIn(BaseModel):
    """ Data needed to book a new appointment. """
    doctor_id: uuid.UUID
    slot: str # The ISO string of the slot

class AppointmentOut(BaseModel):
    """ Model for the 'My Appointments' page list. """
    id: uuid.UUID
    doctor_id: uuid.UUID
    patient_id: str 
    patient_name: str
    slot: datetime
    status: str
    doctor_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# --- NEW: Prescription Model for EMR ---
class PrescribedMedicine(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str

class PrescriptionRecord(BaseModel):
    """ A read-only record of a past prescription. """
    id: uuid.UUID
    appointment_id: uuid.UUID
    created_at: datetime
    complaint: Optional[str] = None
    diagnosis: Optional[str] = None
    medicines: Optional[List[PrescribedMedicine]] = []
    tests: Optional[List[str]] = []
    advice: Optional[str] = None
    follow_up_date: Optional[date] = None
    vitals: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# --- NEW: Review Models ---
class ReviewIn(BaseModel):
    """ Data needed to create a new review. """
    doctor_id: uuid.UUID
    appointment_id: uuid.UUID
    rating: int
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: uuid.UUID
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Other Public Models ---
class Article(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    author: Optional[str] = None
    published_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Pharmacy(BaseModel):
    id: uuid.UUID
    name: str
    address: str
    phone_number: Optional[str] = None
    
    class Config:
        from_attributes = True

class Lab(BaseModel):
    id: uuid.UUID
    name: str
    address: str
    phone_number: Optional[str] = None
    
    class Config:
        from_attributes = True

