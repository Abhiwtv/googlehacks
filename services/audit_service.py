import uuid
from typing import Optional, Any
from models.domain import ExtractedDocument, EventType, AuditEvent
from db.memory import save_audit_event

try:
    from sqlalchemy.ext.asyncio import AsyncSession
    from models.schema import AuditEventORM
    HAS_DB = True
except Exception as e:
    AsyncSession = Any
    AuditEventORM = None
    HAS_DB = False

async def process_verified_document_db(doc: ExtractedDocument, db: Optional[Any] = None, actor_id: str = "SYSTEM"):
    """
    Takes a confirmed OCR document and generates appropriate database and memory ledger audit events.
    """
    events_created = 0
    
    # 1. DB Logging (if DB session present)
    if HAS_DB and db is not None:
        try:
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
        except Exception as e:
            print(f"DB Audit commit notice ({e}), committing to memory ledger.")

    # 2. Memory Logging (Syncs HITL verification directly with memory ledger)
    doc_mem_event = AuditEvent(
        event_type=EventType.DOCUMENT_VERIFIED,
        facility_id=doc.facility_id,
        actor_id=actor_id,
        source_document_id=doc.document_id,
        data={
            "document_type": doc.document_type,
            "date": doc.date
        }
    )
    save_audit_event(doc_mem_event)

    for record in doc.records:
        if record.quantity_received > 0:
            recv_mem_event = AuditEvent(
                event_type=EventType.MEDICINE_RECEIVED,
                facility_id=doc.facility_id,
                actor_id=actor_id,
                source_document_id=doc.document_id,
                data={
                    "medicine": record.medicine,
                    "batch": record.batch,
                    "quantity": record.quantity_received,
                    "verification_status": "VERIFIED_OCR"
                }
            )
            save_audit_event(recv_mem_event)
            events_created += 1
            
        if record.quantity_dispensed > 0:
            disp_mem_event = AuditEvent(
                event_type=EventType.MEDICINE_DISPENSED,
                facility_id=doc.facility_id,
                actor_id=actor_id,
                source_document_id=doc.document_id,
                data={
                    "medicine": record.medicine,
                    "batch": record.batch,
                    "quantity": record.quantity_dispensed,
                    "verification_status": "VERIFIED_OCR"
                }
            )
            save_audit_event(disp_mem_event)
            events_created += 1

    return {"status": "success", "events_created": events_created}