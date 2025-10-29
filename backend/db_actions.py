import uuid
import psycopg2
import psycopg2.extras
from database import get_db_connection
from typing import List, Dict, Any
import json
from auth import get_password_hash # We need this for Google Sign-in user creation

# --- AUTH FUNCTIONS ---
def get_user_by_email(email: str):
    """Fetches a single user by their email address."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE email = %s;", (email,))
            user = cur.fetchone()
            return dict(user) if user else None
    finally:
        if conn: conn.close()

def create_new_user(full_name: str, email: str, hashed_password: str, role: str = 'patient'):
    """Creates a new user in the database with a *pre-hashed* password."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = "INSERT INTO users (full_name, email, role, hashed_password) VALUES (%s, %s, %s, %s) RETURNING *;"
            cur.execute(sql, (full_name, email, role, hashed_password))
            new_user = cur.fetchone()
            conn.commit()
            return dict(new_user) if new_user else None
    except psycopg2.errors.UniqueViolation:
        conn.rollback(); return None
    finally:
        if conn: conn.close()

# --- PATIENT-SPECIFIC (PROTECTED) FUNCTIONS ---

def get_patient_profile(user_id: uuid.UUID):
    """Fetches the profile details for a patient from the users table."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = "SELECT id, full_name, email, phone_number, date_of_birth, sex, created_at, role FROM users WHERE id = %s AND role = 'patient';"
            cur.execute(sql, (str(user_id),))
            profile = cur.fetchone()
            return dict(profile) if profile else None
    finally:
        if conn: conn.close()

def update_patient_profile(user_id: uuid.UUID, profile_data: Dict[str, Any]):
    """Updates a patient's profile details in the users table."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = """
                UPDATE users
                SET full_name = %s, phone_number = %s, date_of_birth = %s, sex = %s
                WHERE id = %s AND role = 'patient'
                RETURNING id, full_name, email, phone_number, date_of_birth, sex, created_at, role;
            """
            cur.execute(sql, (
                profile_data['full_name'],
                profile_data.get('phone_number'),
                profile_data.get('date_of_birth'),
                profile_data.get('sex'),
                str(user_id)
            ))
            updated_profile = cur.fetchone()
            conn.commit()
            return dict(updated_profile) if updated_profile else None
    finally:
        if conn: conn.close()

def book_new_appointment(patient: Dict[str, Any], doctor_id: uuid.UUID, slot: str):
    """Creates a new 'scheduled' appointment for the logged-in patient."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("SELECT user_id FROM doctors WHERE id = %s;", (str(doctor_id),))
            doctor = cur.fetchone()
            if not doctor:
                return None # Doctor not found
            
            sql = """
                INSERT INTO appointments (doctor_id, patient_id, patient_name, slot, status, doctor_user_id)
                VALUES (%s, %s, %s, %s, 'scheduled', %s)
                RETURNING *;
            """
            cur.execute(sql, (
                str(doctor_id),
                str(patient['id']),
                patient['full_name'],
                slot,
                doctor['user_id']
            ))
            new_appt = cur.fetchone()
            conn.commit()
            return dict(new_appt) if new_appt else None
    except Exception as e:
        conn.rollback()
        print(f"Error booking appointment: {e}")
        return None
    finally:
        if conn: conn.close()

def get_patient_appointments(user_id: uuid.UUID):
    """Gets all of the logged-in patient's appointments (past and future)."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            # --- THIS IS THE FIX ---
            # Explicitly select a.user_id (which is the same as a.patient_id)
            # to prevent a crash when the frontend tries to read it.
            sql = """
                SELECT a.*, a.patient_id as user_id, d.name as doctor_name
                FROM appointments a
                LEFT JOIN doctors d ON a.doctor_id = d.id
                WHERE a.patient_id = %s
                ORDER BY a.slot DESC;
            """
            # Note: The database stores the patient's ID in 'patient_id' and 'user_id'
            # in the appointments table. We are ensuring the column is selected.
            cur.execute(sql, (str(user_id),))
            results = cur.fetchall()
            return [dict(row) for row in results]
    finally:
        if conn: conn.close()

def cancel_appointment(appointment_id: uuid.UUID, user_id: uuid.UUID):
    """Cancels one of the patient's own appointments."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = """
                UPDATE appointments
                SET status = 'cancelled'
                WHERE id = %s AND patient_id = %s AND status = 'scheduled'
                RETURNING *;
            """
            cur.execute(sql, (str(appointment_id), str(user_id)))
            result = cur.fetchone()
            conn.commit()
            return dict(result) if result else None
    finally:
        if conn: conn.close()

def get_patient_medical_records(user_id: uuid.UUID):
    """Gets all of the logged-in patient's past prescriptions."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = "SELECT * FROM prescriptions WHERE patient_id = %s ORDER BY created_at DESC;"
            cur.execute(sql, (str(user_id),))
            results = cur.fetchall()
            return [dict(row) for row in results]
    finally:
        if conn: conn.close()

def add_doctor_review(user_id: uuid.UUID, review_data: Dict[str, Any]):
    """Submits a new review for a doctor."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = """
                INSERT INTO doctor_reviews (doctor_id, patient_id, appointment_id, rating, comment)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (patient_id, appointment_id) DO UPDATE 
                SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
                RETURNING *;
            """
            cur.execute(sql, (
                str(review_data['doctor_id']),
                str(user_id),
                str(review_data['appointment_id']),
                review_data['rating'],
                review_data.get('comment')
            ))
            new_review = cur.fetchone()
            conn.commit()
            return dict(new_review) if new_review else None
    except Exception as e:
        conn.rollback(); print(f"Error adding review: {e}"); return None
    finally:
        if conn: conn.close()

# --- PUBLIC FUNCTIONS ---

def search_doctors(query: str):
    """Searches for doctors by name or specialty and includes average rating."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = """
                SELECT 
                    d.id, d.name, d.specialty, d.experience, d.bio, d.available_slots, c.name as clinic_name,
                    COALESCE(AVG(r.rating), 0) as average_rating,
                    COUNT(r.id) as review_count
                FROM doctors d
                LEFT JOIN clinics c ON d.clinic_id = c.id
                LEFT JOIN doctor_reviews r ON d.id = r.doctor_id
            """
            params = []
            
            if query:
                sql += " WHERE d.name ILIKE %s OR d.specialty ILIKE %s"
                search_query = f"%{query}%"
                params.extend([search_query, search_query])
            
            sql += " GROUP BY d.id, c.name ORDER BY d.name LIMIT 20;"
            
            cur.execute(sql, params)
            results = cur.fetchall()
            return [
                {**dict(row), "average_rating": float(row["average_rating"])} 
                for row in results
            ]
    finally:
        if conn: conn.close()

def get_all_articles():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = "SELECT * FROM articles WHERE published_at IS NOT NULL ORDER BY published_at DESC;"
            cur.execute(sql)
            results = cur.fetchall()
            return [dict(row) for row in results]
    finally:
        if conn: conn.close()

def search_pharmacies(query: str):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = "SELECT id, name, address, phone_number FROM pharmacies WHERE name ILIKE %s AND is_active = TRUE LIMIT 10;"
            cur.execute(sql, (f"%{query}%",))
            results = cur.fetchall()
            return [dict(row) for row in results]
    finally:
        if conn: conn.close()

def search_labs(query: str):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = "SELECT id, name, address, phone_number FROM labs WHERE name ILIKE %s AND is_active = TRUE LIMIT 10;"
            cur.execute(sql, (f"%{query}%",))
            results = cur.fetchall()
            return [dict(row) for row in results]
    finally:
        if conn: conn.close()
