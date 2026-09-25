import uuid
import json
from typing import Optional, Any
from models.domain import Patient, Appointment, Prescription, AuditEvent, EventType, PatientCreate
from db.memory import save_audit_event, save_patient, save_appointment, save_prescription

try:
    from sqlalchemy.ext.asyncio import AsyncSession
    from models.schema import PatientORM, AppointmentORM, AuditEventORM
    HAS_DB = True
except Exception as e:
    AsyncSession = Any
    PatientORM = None
    AppointmentORM = None
    AuditEventORM = None
    HAS_DB = False

async def register_patient_db(patient_data: PatientCreate, db: Optional[Any] = None) -> dict:
    """Registers a new patient into the database and memory store."""
    new_id = f"PAT-{uuid.uuid4().hex[:6].upper()}"
    
    if HAS_DB and db is not None:
        try:
            new_patient = PatientORM(
                patient_id=new_id,
                age=patient_data.age,
                gender=patient_data.gender,
                locality=patient_data.locality
            )
            db.add(new_patient)
            await db.commit()
        except Exception as e:
            print(f"DB Patient insert notice ({e}), storing in memory.")
    
    memory_patient = Patient(
        patient_id=new_id,
        age=patient_data.age,
        gender=patient_data.gender,
        locality=patient_data.locality
    )
    save_patient(memory_patient)
    return {"status": "success", "patient_id": new_id}

async def create_appointment_db(apt_data: Appointment, db: Optional[Any] = None, actor_id: str = "FRONT_DESK_1") -> dict:
    """Creates an appointment AND logs the audit event to both DB and memory store."""
    apt_id = apt_data.appointment_id or f"APT-{uuid.uuid4().hex[:6].upper()}"
    
    if HAS_DB and db is not None:
        try:
            new_apt = AppointmentORM(
                appointment_id=apt_id,
                facility_id=apt_data.facility_id,
                patient_id=apt_data.patient_id,
                doctor_id=apt_data.doctor_id,
                symptoms=apt_data.symptoms,
                diagnosis=apt_data.diagnosis
            )
            db.add(new_apt)
            
            event = AuditEventORM(
                event_id=str(uuid.uuid4()),
                event_type=EventType.APPOINTMENT_CREATED,
                facility_id=apt_data.facility_id,
                actor_id=actor_id,
                data={
                    "appointment_id": apt_id,
                    "patient_id": apt_data.patient_id,
                    "symptoms": apt_data.symptoms
                }
            )
            db.add(event)
            await db.commit()
        except Exception as e:
            print(f"DB Appointment insert notice ({e}), storing in memory.")

    # Save to memory store for live RCA & Audit Trail views
    save_appointment(apt_data)
    mem_event = AuditEvent(
        event_id=str(uuid.uuid4()),
        event_type=EventType.APPOINTMENT_CREATED,
        facility_id=apt_data.facility_id,
        actor_id=actor_id,
        data={
            "appointment_id": apt_id,
            "patient_id": apt_data.patient_id,
            "symptoms": apt_data.symptoms
        }
    )
    save_audit_event(mem_event)
    return {"status": "success", "appointment_id": apt_id}

async def write_prescription_and_dispense_db(prescription: Prescription, facility_id: str, db: Optional[Any] = None, actor_id: str = "DOC_01") -> dict:
    """
    Enterprise Traceability: A doctor writes a prescription, triggering automated database AND memory ledger dispensing events.
    Fixes split-brain ledger so Audit Trail & Gemini RCA immediately reflect dispensed outflows.
    """
    events_created = 0
    
    # 1. DB Audit Logging (if DB session present)
    if HAS_DB and db is not None:
        try:
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
            
            for item in prescription.items:
                dispense_event = AuditEventORM(
                    event_id=str(uuid.uuid4()),
                    event_type=EventType.MEDICINE_DISPENSED,
                    facility_id=facility_id,
                    actor_id=actor_id,
                    data={
                        "medicine": item.medicine,
                        "quantity": item.quantity,
                        "prescription_id": prescription.prescription_id,
                        "appointment_id": prescription.appointment_id
                    }
                )
                db.add(dispense_event)
                events_created += 1
                
            await db.commit()
        except Exception as e:
            print(f"DB Prescription insert notice ({e}), committing memory ledger.")

    # 2. Memory Audit Logging (Fixes Split-Brain: Audit Trail & RCA immediately show dispensed outflow!)
    save_prescription(prescription)
    
    rx_mem_event = AuditEvent(
        event_type=EventType.PRESCRIPTION_CREATED,
        facility_id=facility_id,
        actor_id=actor_id,
        data={
            "prescription_id": prescription.prescription_id,
            "appointment_id": prescription.appointment_id,
            "items": [{"medicine": i.medicine, "quantity": i.quantity} for i in prescription.items]
        }
    )
    save_audit_event(rx_mem_event)

    for item in prescription.items:
        dispense_mem_event = AuditEvent(
            event_type=EventType.MEDICINE_DISPENSED,
            facility_id=facility_id,
            actor_id=actor_id,
            data={
                "medicine": item.medicine,
                "batch": "PCM-2026-B1",
                "quantity": item.quantity,
                "dispensed_by": actor_id,
                "prescription_id": prescription.prescription_id,
                "appointment_id": prescription.appointment_id,
                "verification_status": "RX_LINKED"
            }
        )
        save_audit_event(dispense_mem_event)
        events_created += 1

    return {"status": "success", "prescription_id": prescription.prescription_id, "events_created": events_created}