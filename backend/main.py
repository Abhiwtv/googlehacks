import os
import pathlib
from contextlib import asynccontextmanager
from typing import Optional

# 🚨 GCP AUTHENTICATION OVERRIDE
# This forces the Python SDKs to use your local service account key, bypassing terminal issues.
current_dir = pathlib.Path(__file__).parent.resolve()
key_path = os.path.join(current_dir, "gcp-key.json")
if os.path.exists(key_path):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(key_path)

from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

# --- DB & Models ---
from db.database import engine, Base, get_db
from db.memory import (
    get_events_by_facility,
    get_events_by_medicine,
    get_medicine_inventory_summary
)
from models.domain import ExtractedDocument, Patient, Appointment, Prescription, PatientCreate

# --- Services ---
from services.ocr_service import process_document_gemini
from services.forecasting_service import generate_7_day_forecast
from services.rca_service import analyze_root_cause
from services.spatial_service import detect_spatial_anomalies, find_emergency_clinic_route
from services.notification_service import process_and_dispatch_alerts, get_all_alerts
from services.clinical_service import register_patient_db, create_appointment_db, write_prescription_and_dispense_db
from services.audit_service import process_verified_document_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On Startup: Create all tables in the database (if they don't exist)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # On Shutdown: Close connection pool
    await engine.dispose()

# Firebase/JWT Auth has been removed. The API is entirely open for the demo.
app = FastAPI(title="Enterprise Health API", lifespan=lifespan)

class RCARequest(BaseModel):
    facility_id: str = "PHC-042"
    medicine: str = "Paracetamol 500mg Tablets"
    weather_context: Optional[str] = None
    physical_stock_count: Optional[int] = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# OCR & DOCUMENT INTAKE
# -------------------------------------------------------------------
@app.post("/api/v1/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    contents = await file.read()
    extracted_data = process_document_gemini(contents, file.filename)
    return {
        "message": "Document processed. Awaiting human verification.",
        "filename": file.filename,
        "extracted_data": extracted_data
    }

@app.post("/api/v1/documents/verify")
async def verify_document(document: ExtractedDocument, db: AsyncSession = Depends(get_db)):
    result = await process_verified_document_db(document, db, actor_id="USER_DOC_17")
    return {"message": "Document verified and ledger updated.", "details": result}

# -------------------------------------------------------------------
# CLINICAL OPERATIONS (Patients, Appointments, Prescriptions)
# -------------------------------------------------------------------
@app.post("/api/v1/patients")
async def api_register_patient(patient: PatientCreate, db: AsyncSession = Depends(get_db)):
    return await register_patient_db(patient, db)

@app.post("/api/v1/appointments")
async def api_create_appointment(appointment: Appointment, db: AsyncSession = Depends(get_db)):
    return await create_appointment_db(appointment, db)

@app.post("/api/v1/prescriptions")
async def api_write_prescription(prescription: Prescription, facility_id: str = "PHC-042", db: AsyncSession = Depends(get_db)):
    return await write_prescription_and_dispense_db(
        prescription=prescription, 
        facility_id=facility_id, 
        db=db,
        actor_id="DOC_01"
    )

# -------------------------------------------------------------------
# AUDIT & LEDGER FORENSICS
# -------------------------------------------------------------------
@app.get("/api/v1/audit/facility/{facility_id}")
async def get_facility_audit(facility_id: str):
    events = get_events_by_facility(facility_id)
    return {"facility_id": facility_id, "total_events": len(events), "events": events}

@app.get("/api/v1/audit/facility/{facility_id}/medicine/{medicine}")
async def get_medicine_audit(facility_id: str, medicine: str):
    events = get_events_by_medicine(facility_id, medicine)
    return {"facility_id": facility_id, "medicine": medicine, "events": events}

# -------------------------------------------------------------------
# ENTERPRISE AI ANALYTICS (Forecasting, RCA, Spatial)
# -------------------------------------------------------------------
@app.get("/api/v1/analytics/forecast/{facility_id}")
async def get_facility_forecast(facility_id: str):
    """Real ML Analytics Endpoint: Returns a 7-day forecast."""
    return generate_7_day_forecast(facility_id)

@app.post("/api/v1/analytics/rca")
async def get_root_cause_analysis(req: RCARequest):
    """Grounded AI Root Cause Analysis using the actual audit ledger."""
    inventory_summary = get_medicine_inventory_summary(
        facility_id=req.facility_id,
        medicine=req.medicine
    )

    if not inventory_summary["events"]:
        return {
            "status": "error",
            "message": f"No audit records found for {req.medicine} at {req.facility_id}"
        }

    total_received = inventory_summary["received"]
    total_dispensed = inventory_summary["dispensed"]
    
    if req.physical_stock_count is not None:
        expected_remaining = req.physical_stock_count
    else:
        expected_remaining = inventory_summary["unaccounted"]

    result = analyze_root_cause(
        facility_id=req.facility_id,
        medicine=req.medicine,
        weather_context=req.weather_context or "Not provided",
        total_received=total_received,
        total_dispensed=total_dispensed,
        expected_remaining=expected_remaining
    )

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
    return detect_spatial_anomalies(anomaly_threshold=threshold)

@app.get("/api/v1/logistics/emergency-route")
async def get_emergency_route(depleted_facility_id: str, depleted_locality: str, medicine: str):
    return find_emergency_clinic_route(depleted_facility_id, depleted_locality, medicine)

# -------------------------------------------------------------------
# ALERTS & NOTIFICATIONS
# -------------------------------------------------------------------
@app.post("/api/v1/alerts/evaluate-and-trigger")
async def trigger_alerts(facility_id: str = "PHC-042", medicine: str = "Paracetamol"):
    spatial_result = detect_spatial_anomalies(anomaly_threshold=3)
    rca_result = analyze_root_cause(
        facility_id=facility_id, 
        medicine=medicine,
        weather_context="Monsoon Season: High Humidity (84%), Temp 34°C"
    )
    notification_result = process_and_dispatch_alerts(spatial_result, rca_result)
    
    return {
        "status": "Workflow Executed",
        "notifications": notification_result
    }

@app.get("/api/v1/alerts/history")
async def get_alert_history():
    return {"total_alerts": len(get_all_alerts()), "alerts": get_all_alerts()}

# -------------------------------------------------------------------
# DEV / MOCK DATA
# -------------------------------------------------------------------
@app.post("/api/v1/dev/seed-spatial-data")
async def seed_spatial_data():
    from db.memory import save_patient, save_appointment
    import uuid
    
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