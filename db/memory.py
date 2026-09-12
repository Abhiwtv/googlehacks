from datetime import datetime, timedelta
from typing import List, Optional
from models.domain import AuditEvent, EventType, Patient, Appointment, Prescription

# Pre-populated seed events for PHC-042 corroborating the 140 depleted Paracetamol units
_audit_events: List[AuditEvent] = [
    AuditEvent(
        event_type=EventType.MEDICINE_RECEIVED,
        facility_id="PHC-042",
        timestamp=datetime.utcnow() - timedelta(hours=28),
        actor_id="OCR_INGEST_AI",
        source_document_id="DOC-OCR-PCM-500",
        data={
            "medicine": "Paracetamol 500mg Tablets",
            "batch": "PCM-2026-B1",
            "quantity": 500,
            "verification_status": "VERIFIED_OCR"
        }
    ),
    AuditEvent(
        event_type=EventType.MEDICINE_RECEIVED,
        facility_id="PHC-042",
        timestamp=datetime.utcnow() - timedelta(hours=27),
        actor_id="OCR_INGEST_AI",
        source_document_id="DOC-OCR-AMX-300",
        data={
            "medicine": "Amoxicillin 250mg Capsules",
            "batch": "AMX-774B",
            "quantity": 300,
            "verification_status": "VERIFIED_OCR"
        }
    ),
    AuditEvent(
        event_type=EventType.MEDICINE_RECEIVED,
        facility_id="PHC-042",
        timestamp=datetime.utcnow() - timedelta(hours=26),
        actor_id="OCR_INGEST_AI",
        source_document_id="DOC-OCR-ORS-200",
        data={
            "medicine": "ORS Oral Rehydration Salts 21.8g",
            "batch": "ORS-991A",
            "quantity": 200,
            "verification_status": "VERIFIED_OCR"
        }
    ),
    AuditEvent(
        event_type=EventType.MEDICINE_DISPENSED,
        facility_id="PHC-042",
        timestamp=datetime.utcnow() - timedelta(hours=14),
        actor_id="Pharmacist A. Verma",
        source_document_id="RX-99201",
        data={
            "medicine": "Paracetamol 500mg Tablets",
            "batch": "PCM-2026-B1",
            "quantity": 45,
            "dispensed_by": "Pharmacist A. Verma",
            "verification_status": "RX_LINKED"
        }
    ),
    AuditEvent(
        event_type=EventType.MEDICINE_DISPENSED,
        facility_id="PHC-042",
        timestamp=datetime.utcnow() - timedelta(hours=8),
        actor_id="Pharmacist A. Verma",
        source_document_id="RX-99208",
        data={
            "medicine": "Paracetamol 500mg Tablets",
            "batch": "PCM-2026-B1",
            "quantity": 45,
            "dispensed_by": "Pharmacist A. Verma",
            "verification_status": "RX_LINKED"
        }
    ),
    AuditEvent(
        event_type=EventType.MEDICINE_DISPENSED,
        facility_id="PHC-042",
        timestamp=datetime.utcnow() - timedelta(hours=2),
        actor_id="NIGHT_SHIFT_DISPENSE",
        source_document_id="RX-OFF-994",
        data={
            "medicine": "Paracetamol 500mg Tablets",
            "batch": "PCM-2026-B1",
            "quantity": 50,
            "note": "Night Shift / Off-hours deduction",
            "dispensed_by": "NIGHT_SHIFT_DISPENSE",
            "verification_status": "OFF_HOURS_LOGGED"
        }
    )
]

def save_audit_event(event: AuditEvent):
    _audit_events.append(event)


def get_events_by_facility(facility_id: str) -> List[AuditEvent]:
    return [e for e in _audit_events if e.facility_id == facility_id]

def get_events_by_medicine(facility_id: str, medicine: str) -> List[AuditEvent]:
    return [
        e for e in _audit_events 
        if e.facility_id == facility_id 
        and e.data.get("medicine") == medicine
    ]

# --- NEW: Operational Storage ---
_patients: List[Patient] = []
_appointments: List[Appointment] = []
_prescriptions: List[Prescription] = []

def save_patient(patient: Patient):
    _patients.append(patient)

def get_patient(patient_id: str) -> Optional[Patient]:
    return next((p for p in _patients if p.patient_id == patient_id), None)

def save_appointment(apt: Appointment):
    _appointments.append(apt)

def get_appointment(appointment_id: str) -> Optional[Appointment]:
    return next((a for a in _appointments if a.appointment_id == appointment_id), None)

def save_prescription(rx: Prescription):
    _prescriptions.append(rx)