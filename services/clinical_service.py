from models.domain import Patient, Appointment, Prescription, AuditEvent, EventType
from db.memory import save_patient, save_appointment, save_prescription, save_audit_event, get_patient, get_appointment

def register_patient(patient: Patient) -> Patient:
    """Registers a new patient."""
    save_patient(patient)
    return patient

def create_appointment(appointment: Appointment, actor_id: str = "FRONT_DESK_1") -> Appointment:
    """Creates an appointment and logs the event."""
    # 1. Save the operational record
    save_appointment(appointment)
    
    # 2. Log the immutable event
    event = AuditEvent(
        event_type=EventType.APPOINTMENT_CREATED,
        facility_id=appointment.facility_id,
        actor_id=actor_id,
        data={
            "appointment_id": appointment.appointment_id,
            "patient_id": appointment.patient_id,
            "symptoms": appointment.symptoms
        }
    )
    save_audit_event(event)
    
    return appointment

def write_prescription_and_dispense(prescription: Prescription, facility_id: str, actor_id: str = "DOC_01") -> dict:
    """
    The critical linking function. 
    A doctor writes a prescription, which immediately triggers the medicine dispensing events.
    """
    # 1. Save the prescription record
    save_prescription(prescription)
    
    events_created = []
    
    # 2. Log that the prescription was created
    rx_event = AuditEvent(
        event_type=EventType.PRESCRIPTION_CREATED,
        facility_id=facility_id,
        actor_id=actor_id,
        data={
            "prescription_id": prescription.prescription_id,
            "appointment_id": prescription.appointment_id,
            "items": [{"medicine": i.medicine, "quantity": i.quantity} for i in prescription.items]
        }
    )
    save_audit_event(rx_event)
    events_created.append(rx_event)
    
    # 3. CRITICAL: Automatically dispense the medicine and link it back to the prescription
    for item in prescription.items:
        dispense_event = AuditEvent(
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
        save_audit_event(dispense_event)
        events_created.append(dispense_event)
        
    return {
        "prescription": prescription,
        "audit_events": events_created
    }