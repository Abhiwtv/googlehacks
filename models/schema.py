from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class PatientORM(Base):
    __tablename__ = "patients"

    patient_id = Column(String, primary_key=True, default=generate_uuid)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)
    locality = Column(String, index=True) # Indexed because our Spatial Engine queries this heavily
    
    appointments = relationship("AppointmentORM", back_populates="patient")

class AppointmentORM(Base):
    __tablename__ = "appointments"

    appointment_id = Column(String, primary_key=True, default=generate_uuid)
    facility_id = Column(String, index=True, nullable=False)
    patient_id = Column(String, ForeignKey("patients.patient_id"))
    doctor_id = Column(String, nullable=False)
    
    # We store arrays as JSON in Postgres
    symptoms = Column(JSON, default=list)
    diagnosis = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    patient = relationship("PatientORM", back_populates="appointments")

class AuditEventORM(Base):
    """The Immutable Ledger Table"""
    __tablename__ = "audit_events"

    event_id = Column(String, primary_key=True, default=generate_uuid)
    event_type = Column(String, index=True, nullable=False) # MEDICINE_RECEIVED, MEDICINE_DISPENSED
    facility_id = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    actor_id = Column(String, nullable=False)
    source_document_id = Column(String)
    
    # Payload contains exactly what was dispensed/received
    data = Column(JSON, nullable=False)