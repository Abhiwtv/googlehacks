from sqlalchemy.ext.asyncio import AsyncSession
from models.schema import AuditEventORM
from models.domain import ExtractedDocument, EventType
import uuid

async def process_verified_document_db(doc: ExtractedDocument, db: AsyncSession, actor_id: str = "SYSTEM"):
    """
    Takes a confirmed OCR document and generates the appropriate database audit events.
    """
    events_created = 0
    
    # 1. Log that the document itself was verified
    doc_event = AuditEventORM(
        event_id=str(uuid.uuid4()),
        event_type=EventType.DOCUMENT_VERIFIED,
        facility_id=doc.facility_id,
        actor_id=actor_id,
        source_document_id=doc.document_id,
        data={
            "document_type": doc.document_type,
            "date": doc.date
        }
    )
    db.add(doc_event)
    events_created += 1
    
    # 2. For a Stock Register, break out individual medicine events
    for record in doc.records:
        if record.quantity_received > 0:
            recv_event = AuditEventORM(
                event_id=str(uuid.uuid4()),
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
            db.add(recv_event)
            events_created += 1
            
        if record.quantity_dispensed > 0:
            disp_event = AuditEventORM(
                event_id=str(uuid.uuid4()),
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
            db.add(disp_event)
            events_created += 1
            
    await db.commit()
    return {"status": "success", "events_created": events_created}