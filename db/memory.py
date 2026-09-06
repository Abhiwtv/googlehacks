from typing import List, Optional
from models.domain import AuditEvent, EventType

# This list is our "database" table
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