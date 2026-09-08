from typing import List, Optional
from models.domain import AuditEvent, EventType, Patient, Appointment, Prescription

_audit_events: List[AuditEvent] = []

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