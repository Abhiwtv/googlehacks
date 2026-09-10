from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from models.domain import ExtractedDocument, EventType 
from services.audit_service import process_verified_document
from db.memory import get_events_by_facility, get_events_by_medicine
from services.ocr_service import process_document_gemini
from models.domain import Patient, Appointment, Prescription
from services.clinical_service import (
    register_patient, 
    create_appointment, 
    write_prescription_and_dispense
)
from services.forecasting_service import generate_7_day_forecast
from typing import Optional


app = FastAPI(title="Health & Supply Chain API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/v1/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    # 1. Read the actual file bytes from the upload
    contents = await file.read()
    
    # 2. Pass bytes to Gemini
    extracted_data = process_document_gemini(contents, file.filename)
    
    return {
        "message": "Document processed. Awaiting human verification.",
        "filename": file.filename,
        "extracted_data": extracted_data
    }

@app.post("/api/v1/documents/verify")
async def verify_document(document: ExtractedDocument):
    """
    HITL Endpoint: The frontend sends the user-confirmed JSON here.
    We convert it into immutable events.
    """
    # In a real app, actor_id comes from the JWT token of the logged-in user
    result = process_verified_document(document, actor_id="USER_DOC_17")
    return {"message": "Document verified and ledger updated.", "details": result}

@app.get("/api/v1/audit/facility/{facility_id}")
async def get_facility_audit(facility_id: str):
    """
    Returns the complete operational history for a facility.
    """
    events = get_events_by_facility(facility_id)
    return {"facility_id": facility_id, "total_events": len(events), "events": events}

@app.get("/api/v1/audit/facility/{facility_id}/medicine/{medicine}")
async def get_medicine_audit(facility_id: str, medicine: str):
    """
    Traceability: Ask "What happened to ORS at PHC-042?"
    """
    events = get_events_by_medicine(facility_id, medicine)
    return {"facility_id": facility_id, "medicine": medicine, "events": events}

@app.post("/api/v1/patients")
async def api_register_patient(patient: Patient):
    """Registers a new patient."""
    return register_patient(patient)

@app.post("/api/v1/appointments")
async def api_create_appointment(appointment: Appointment):
    """Creates an appointment (e.g., patient checks in at front desk)."""
    return create_appointment(appointment)

@app.post("/api/v1/prescriptions")
async def api_write_prescription(prescription: Prescription, facility_id: str = "PHC-042"):
    """
    Doctor writes a prescription. 
    This automatically deducts inventory and creates the audit link!
    """
    return write_prescription_and_dispense(
        prescription=prescription, 
        facility_id=facility_id, 
        actor_id="DOC_01"
    )

@app.get("/api/v1/analytics/forecast/{facility_id}")
async def get_facility_forecast(facility_id: str):
    """
    Real ML Analytics Endpoint: Returns a 7-day forecast using Prophet.
    """
    return generate_7_day_forecast(facility_id)