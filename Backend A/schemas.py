<<<<<<< HEAD
# schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class HospitalCreate(BaseModel):
    name: str
    lat: float
    lng: float
    phone: Optional[str] = None
    type: Optional[str] = None

class HospitalOut(HospitalCreate):
    id: int
    class Config:
        from_attributes = True

class InventoryCreate(BaseModel):
    hospital_id: int
    resource_type: str
    quantity: int

class InventoryUpdate(BaseModel):
    quantity: int

class InventoryOut(BaseModel):
    id: int
    hospital_id: int
    resource_type: str
    quantity: int
    last_updated: datetime
    class Config:
        from_attributes = True

class RequestCreate(BaseModel):
    patient_name: str
    resource_type: str
    quantity: int = 1
    blood_group: Optional[str] = None
    urgency: str = "medium"
    lat: float
    lng: float
class RequestOut(BaseModel):
    id: int
    status: str
    class Config:
        from_attributes = True

class MatchCandidate(BaseModel):
    hospital_id: int
    hospital_name: str
    distance_km: float
    score: float
    quantity_available: int

class MatchResponse(BaseModel):
    request_id: int
    matches: List[MatchCandidate]

class DispatchRequest(BaseModel):
=======
# schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class HospitalCreate(BaseModel):
    name: str
    lat: float
    lng: float
    phone: Optional[str] = None
    type: Optional[str] = None

class HospitalOut(HospitalCreate):
    id: int
    class Config:
        from_attributes = True

class InventoryCreate(BaseModel):
    hospital_id: int
    resource_type: str
    quantity: int

class InventoryUpdate(BaseModel):
    quantity: int

class InventoryOut(BaseModel):
    id: int
    hospital_id: int
    resource_type: str
    quantity: int
    last_updated: datetime
    class Config:
        from_attributes = True

class RequestCreate(BaseModel):
    patient_name: str
    resource_type: str
    urgency: str = "medium"
    lat: float
    lng: float

class RequestOut(BaseModel):
    id: int
    status: str
    class Config:
        from_attributes = True

class MatchCandidate(BaseModel):
    hospital_id: int
    hospital_name: str
    distance_km: float
    score: float
    quantity_available: int

class MatchResponse(BaseModel):
    request_id: int
    matches: List[MatchCandidate]

class DispatchRequest(BaseModel):
>>>>>>> 111136429ffdb9359ee95c5059fbdec7f087a4e7
    hospital_id: int