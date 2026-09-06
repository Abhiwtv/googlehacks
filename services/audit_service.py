from models.domain import ExtractedDocument, AuditEvent, EventType
from db.memory import save_audit_event

def process_verified_document(doc: ExtractedDocument, actor_id: str = "SYSTEM"):
    """
    Takes a confirmed document and generates the appropriate audit events.
    """
    
    # 1. Log that the document itself was verified
    doc_event = AuditEvent(
        event_type=EventType.DOCUMENT_VERIFIED,
        facility_id=doc.facility_id,
        actor_id=actor_id,
        source_document_id=doc.document_id,
        data={
            "document_type": doc.document_type,
            "date": doc.date
        }
    )
    save_audit_event(doc_event)
    
    # 2. For a Stock Register, break out individual medicine events
    for record in doc.records:
        if record.quantity_received > 0:
            recv_event = AuditEvent(
                event_type=EventType.MEDICINE_RECEIVED,
                facility_id=doc.facility_id,
                actor_id=actor_id,
                source_document_id=doc.document_id,
                data={
                    "medicine": record.medicine,
                    "batch": record.batch,
                    "quantity": record.quantity_received
                }
            )
            save_audit_event(recv_event)
            
        if record.quantity_dispensed > 0:
            disp_event = AuditEvent(
                event_type=EventType.MEDICINE_DISPENSED,
                facility_id=doc.facility_id,
                actor_id=actor_id,
                source_document_id=doc.document_id,
                data={
                    "medicine": record.medicine,
                    "batch": record.batch,
                    "quantity": record.quantity_dispensed
                }
            )
            save_audit_event(disp_event)
            
    return {"status": "success", "events_created": len(doc.records) * 2 + 1}