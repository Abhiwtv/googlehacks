from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any
import uuid

class DocumentType(str, Enum):
    STOCK_REGISTER = "stock_register"

class EventType(str, Enum):
    DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED"
    DOCUMENT_PROCESSED = "DOCUMENT_PROCESSED"
    DOCUMENT_VERIFIED = "DOCUMENT_VERIFIED"
    MEDICINE_RECEIVED = "MEDICINE_RECEIVED"
    MEDICINE_DISPENSED = "MEDICINE_DISPENSED"
    STOCK_ADJUSTED = "STOCK_ADJUSTED"

class MedicineRecord(BaseModel):
    medicine: str
    batch: str
    quantity_received: int = Field(default=0, ge=0) # ge=0 means >= 0
    quantity_dispensed: int = Field(default=0, ge=0)

class ExtractedDocument(BaseModel):
    document_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_type: DocumentType
    facility_id: str
    date: str
    records: List[MedicineRecord]
    confidence_score: float = Field(default=0.99, ge=0.0, le=1.0)
    requires_human_review: bool = False

class AuditEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: EventType
    facility_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    actor_id: str
    source_document_id: Optional[str] = None
    data: Dict[str, Any]