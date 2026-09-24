from sqlalchemy.ext.asyncio import AsyncSession
from models.schema import PatientORM, AppointmentORM, AuditEventORM
from models.domain import Patient, Appointment, Prescription, EventType
import uuid
import json
from models.domain import PatientCreate

async def register_patient_db(patient_data: PatientCreate, db: AsyncSession) -> dict:
    """Registers a new patient into the database."""
    # Generate the ID here in the backend
    new_id = f"PAT-{uuid.uuid4().hex[:6].upper()}"
    
    new_patient = PatientORM(
        patient_id=new_id,
        age=patient_data.age,
        gender=patient_data.gender,
        locality=patient_data.locality
    )
    db.add(new_patient)
    await db.commit()
    return {"status": "success", "patient_id": new_patient.patient_id}

async def create_appointment_db(apt_data: Appointment, db: AsyncSession, actor_id: str = "FRONT_DESK_1") -> dict:
    """Creates an appointment AND logs the audit event to the database."""
    # 1. Save the operational record
    new_apt = AppointmentORM(
        appointment_id=apt_data.appointment_id or str(uuid.uuid4()),
        facility_id=apt_data.facility_id,
        patient_id=apt_data.patient_id,
        doctor_id=apt_data.doctor_id,
        symptoms=apt_data.symptoms,
        diagnosis=apt_data.diagnosis
    )
    db.add(new_apt)
    
    # 2. Log the immutable event
    event = AuditEventORM(
        event_id=str(uuid.uuid4()),
        event_type=EventType.APPOINTMENT_CREATED,
        facility_id=apt_data.facility_id,
        actor_id=actor_id,
        data={
            "appointment_id": new_apt.appointment_id,
            "patient_id": new_apt.patient_id,
            "symptoms": new_apt.symptoms
        }
    )
    db.add(event)
    await db.commit()
    return {"status": "success", "appointment_id": new_apt.appointment_id}

async def write_prescription_and_dispense_db(prescription: Prescription, facility_id: str, db: AsyncSession, actor_id: str = "DOC_01") -> dict:
    """
    Enterprise Traceability: A doctor writes a prescription, triggering automated database dispensing events.
    """
    events_created = 0
    
    # 1. Log that the prescription was created
    rx_event = AuditEventORM(
        event_id=str(uuid.uuid4()),
        event_type=EventType.PRESCRIPTION_CREATED,
        facility_id=facility_id,
        actor_id=actor_id,
        data={
            "prescription_id": prescription.prescription_id,
            "appointment_id": prescription.appointment_id,
            "items": [{"medicine": i.medicine, "quantity": i.quantity} for i in prescription.items]
        }
    )
    db.add(rx_event)
    events_created += 1
    
    # 2. CRITICAL: Automatically dispense the medicine and link it back to the prescription
    for item in prescription.items:
        dispense_event = AuditEventORM(
            event_id=str(uuid.uuid4()),
            event_type=EventType.MEDICINE_DISPENSED,
            facility_id=facility_id,
            actor_id=actor_id,
            data={
                "medicine": item.medicine,
                "quantity": item.quantity,
                "prescription_id": prescription.prescription_id, # The Link!
                "appointment_id": prescription.appointment_id    # The Link!
            }
        )
        db.add(dispense_event)
        events_created += 1
        
    await db.commit()
    return {"status": "success", "prescription_id": prescription.prescription_id, "events_created": events_created}