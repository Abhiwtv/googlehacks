from datetime import datetime

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from models.domain import ExtractedDocument, EventType 
from db.memory import (
    get_events_by_facility,
    get_events_by_medicine,
    get_medicine_inventory_summary
)
from services.ocr_service import process_document_gemini
from models.domain import Patient, Appointment, Prescription
from services.forecasting_service import generate_7_day_forecast
from services.rca_service import analyze_root_cause
from pydantic import BaseModel
from services.spatial_service import detect_spatial_anomalies
from typing import Optional
from services.notification_service import process_and_dispatch_alerts, get_all_alerts
from services.spatial_service import detect_spatial_anomalies
from services.rca_service import analyze_root_cause
from contextlib import asynccontextmanager
from db.database import engine, Base
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db

from services.clinical_service import register_patient_db, create_appointment_db, write_prescription_and_dispense_db
from services.audit_service import process_verified_document_db
from models.domain import PatientCreate

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On Startup: Create all tables in the database (if they don't exist)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # On Shutdown: Close connection pool
    await engine.dispose()

app = FastAPI(title="Enterprise Health API", lifespan=lifespan)

class RCARequest(BaseModel):
    facility_id: str = "PHC-042"
    medicine: str = "Paracetamol 500mg Tablets"
    weather_context: Optional[str] = None
    physical_stock_count: Optional[int] = None # NEW FIELD

# (All existing routes remain intact below)

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
async def verify_document(document: ExtractedDocument, db: AsyncSession = Depends(get_db)):
    """HITL Endpoint: Frontend sends the user-confirmed JSON here."""
    result = await process_verified_document_db(document, db, actor_id="USER_DOC_17")
    return {"message": "Document verified and ledger updated.", "details": result}

@app.post("/api/v1/patients")
async def api_register_patient(patient: PatientCreate, db: AsyncSession = Depends(get_db)):
    """Registers a new patient into Cloud SQL."""
    return await register_patient_db(patient, db)

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

@app.post("/api/v1/appointments")
async def api_create_appointment(appointment: Appointment, db: AsyncSession = Depends(get_db)):
    """Creates an appointment in Cloud SQL."""
    return await create_appointment_db(appointment, db)

@app.post("/api/v1/prescriptions")
async def api_write_prescription(prescription: Prescription, facility_id: str = "PHC-042", db: AsyncSession = Depends(get_db)):
    """Doctor writes a prescription, deducting DB inventory."""
    return await write_prescription_and_dispense_db(
        prescription=prescription, 
        facility_id=facility_id, 
        db=db,
        actor_id="DOC_01"
    )

@app.get("/api/v1/analytics/forecast/{facility_id}")
async def get_facility_forecast(facility_id: str):
    """
    Real ML Analytics Endpoint: Returns a 7-day forecast using Prophet.
    """
    return generate_7_day_forecast(facility_id)

@app.post("/api/v1/analytics/rca")
async def get_root_cause_analysis(req: RCARequest):
    """
    Grounded AI Root Cause Analysis using the actual audit ledger.
    """

    # 1. Fetch actual audit events
    inventory_summary = get_medicine_inventory_summary(
    facility_id=req.facility_id,
    medicine=req.medicine
)

    

    # 2. Don't run RCA if there is no audit evidence
    if not inventory_summary["events"]:
        return {
            "status": "error",
            "message": (
                f"No audit records found for "
                f"{req.medicine} at {req.facility_id}"
            )
        }

    total_received = inventory_summary["received"]
    total_dispensed = inventory_summary["dispensed"]
    
    # NEW: Use the physical count if provided, otherwise assume perfect math
    if req.physical_stock_count is not None:
        expected_remaining = req.physical_stock_count
    else:
        expected_remaining = inventory_summary["unaccounted"]
    # 4. Run the fine-tuned Vertex AI RCA
    result = analyze_root_cause(
    facility_id=req.facility_id,
    medicine=req.medicine,
    weather_context=req.weather_context or "Not provided",
    total_received=total_received,
    total_dispensed=total_dispensed,
    expected_remaining=expected_remaining
)

    # 5. Return AI result + evidence used
    return {
        "status": "success",
        "rca": result,
        "audit_evidence": {
            "total_received": total_received,
            "total_dispensed": total_dispensed,
            "expected_remaining": expected_remaining,
            "linked_audit_events": [
                {
                    "event_type": e.event_type.value,
                    "timestamp": e.timestamp.isoformat(),
                    "actor_id": e.actor_id,
                    "data": e.data
                }
                for e in inventory_summary["events"]
            ]
        }
    }

@app.get("/api/v1/analytics/spatial-anomalies")
async def api_get_spatial_anomalies(threshold: int = 3):
    """
    Feature 4: Scans the entire region for symptom clusters crossing the threshold.
    Flags geographic disease clusters (Spatial Anomalies).
    """
    return detect_spatial_anomalies(anomaly_threshold=threshold)

@app.post("/api/v1/dev/seed-spatial-data")
async def seed_spatial_data():
    """
    DEV ONLY: Seeds the database with a mock outbreak in 'Andheri East' 
    so you can instantly test the spatial anomaly detector.
    """
    from db.memory import save_patient, save_appointment
    from models.domain import Patient, Appointment
    import uuid
    
    # 1. Create 5 patients in "Andheri East" (The Outbreak Zone)
    for i in range(5):
        p = Patient(patient_id=f"PAT-ANDHERI-{i}", age=25, gender="M", locality="Andheri East")
        save_patient(p)
        save_appointment(Appointment(
            appointment_id=f"APT-ANDHERI-{i}",
            facility_id="PHC-001", 
            patient_id=p.patient_id, 
            doctor_id="DOC_01", 
            symptoms=["fever", "diarrhea"]
        ))
        
    # 2. Create 1 patient in "Bandra West" (The Normal Zone)
    p2 = Patient(patient_id="PAT-BANDRA-1", age=30, gender="F", locality="Bandra West")
    save_patient(p2)
    save_appointment(Appointment(
        appointment_id="APT-BANDRA-1",
        facility_id="PHC-002", 
        patient_id=p2.patient_id, 
        doctor_id="DOC_01", 
        symptoms=["headache"]
    ))
    
    return {"message": "Mock spatial outbreak injected for Andheri East. Run the anomaly scan!"}

@app.post("/api/v1/alerts/evaluate-and-trigger")
async def trigger_alerts(facility_id: str = "PHC-042", medicine: str = "Paracetamol"):
    """
    Day 6 Workflow Engine: 
    1. Runs the Day 4 Spatial Scan.
    2. Runs the Day 5 RCA Forensic Scan.
    3. Triggers simulated SMS/Email alerts if thresholds are breached.
    """
    # Run the dependent services
    spatial_result = detect_spatial_anomalies(anomaly_threshold=3)
    
    # We pass a default weather context just for the automated run
    rca_result = analyze_root_cause(
        facility_id=facility_id, 
        medicine=medicine,
        weather_context="Monsoon Season: High Humidity (84%), Temp 34°C"
    )
    
    # Push the results into the rules engine
    notification_result = process_and_dispatch_alerts(spatial_result, rca_result)
    
    return {
        "status": "Workflow Executed",
        "notifications": notification_result
    }

@app.get("/api/v1/alerts/history")
async def get_alert_history():
    """Returns the log of all dispatched SMS/Email alerts for the frontend UI."""
    return {"total_alerts": len(get_all_alerts()), "alerts": get_all_alerts()}

@app.get("/api/v1/logistics/emergency-route")
async def get_emergency_route(depleted_facility_id: str, depleted_locality: str, medicine: str):
    """
    Finds the fastest live route to an alternative clinic that has stock.
    """
    from services.spatial_service import find_emergency_clinic_route
    return find_emergency_clinic_route(depleted_facility_id, depleted_locality, medicine)