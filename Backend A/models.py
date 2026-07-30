<<<<<<< HEAD
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    phone = Column(String)
    type = Column(String)

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    resource_type = Column(String, nullable=False)   # 'ICU', 'GENERAL_BED', 'BLOOD_O-', etc
    quantity = Column(Integer, nullable=False)
    last_updated = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class PatientRequest(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String)
    resource_type = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    blood_group = Column(String, nullable=True)
    urgency = Column(String, default="medium")
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    score = Column(Float)
    distance_km = Column(Float)
    status = Column(String, default="proposed")   # 'proposed', 'dispatched'
=======
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    phone = Column(String)
    type = Column(String)

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    resource_type = Column(String, nullable=False)   # 'ICU', 'GENERAL_BED', 'BLOOD_O-', etc
    quantity = Column(Integer, nullable=False)
    last_updated = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class PatientRequest(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String)
    resource_type = Column(String, nullable=False)
    urgency = Column(String, default="medium")   # 'critical', 'high', 'medium'
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    score = Column(Float)
    distance_km = Column(Float)
    status = Column(String, default="proposed")   # 'proposed', 'dispatched'
>>>>>>> 111136429ffdb9359ee95c5059fbdec7f087a4e7
    matched_at = Column(DateTime(timezone=True), server_default=func.now())