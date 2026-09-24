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
    APPOINTMENT_CREATED = "APPOINTMENT_CREATED"
    APPOINTMENT_COMPLETED = "APPOINTMENT_COMPLETED"
    PRESCRIPTION_CREATED = "PRESCRIPTION_CREATED"

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

# Change from this:
# patient_id: str = Field(default_factory=lambda: f"PAT-{uuid.uuid4().hex[:6].upper()}")

# To this:
class Patient(BaseModel):
    patient_id: str = Field(default_factory=lambda: f"PAT-{uuid.uuid4().hex[:6].upper()}")
    age: int
    gender: str
    locality: str

class Appointment(BaseModel):
    appointment_id: Optional[str] = None
    facility_id: str
    patient_id: str
    doctor_id: str
    symptoms: List[str]
    diagnosis: Optional[str] = None
    status: str = "OPEN"

class PrescriptionItem(BaseModel):
    medicine: str
    quantity: int
    dosage_instructions: str

class Prescription(BaseModel):
    prescription_id: Optional[str] = None
    appointment_id: str
    doctor_id: str
    items: List[PrescriptionItem]
    notes: Optional[str] = None

class PatientCreate(BaseModel):
    age: int
    gender: str
    locality: str