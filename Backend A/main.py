# main.py
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models, schemas, database
from database import engine, get_db
from matching import find_matches
from websocket_manager import manager

models.Base.metadata.create_all(bind=engine)   # creates tables on startup

app = FastAPI(title="MedLink API")

# CORS — do this NOW, not at hour 7
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # tighten later if time allows
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- HOSPITALS ----------
@app.post("/hospitals", response_model=schemas.HospitalOut)
def create_hospital(hospital: schemas.HospitalCreate, db: Session = Depends(get_db)):
    db_hospital = models.Hospital(**hospital.model_dump())
    db.add(db_hospital)
    db.commit()
    db.refresh(db_hospital)
    return db_hospital

@app.get("/hospitals", response_model=list[schemas.HospitalOut])
def list_hospitals(db: Session = Depends(get_db)):
    return db.query(models.Hospital).all()

# ---------- INVENTORY ----------
@app.post("/inventory", response_model=schemas.InventoryOut)
async def create_inventory(inv: schemas.InventoryCreate, db: Session = Depends(get_db)):
    db_inv = models.Inventory(**inv.model_dump())
    db.add(db_inv)
    db.commit()
    db.refresh(db_inv)
    await manager.broadcast({"type": "inventory_update", "payload": {"hospital_id": inv.hospital_id}})
    return db_inv

@app.patch("/inventory/{inventory_id}", response_model=schemas.InventoryOut)
async def update_inventory(inventory_id: int, update: schemas.InventoryUpdate, db: Session = Depends(get_db)):
    db_inv = db.query(models.Inventory).filter(models.Inventory.id == inventory_id).first()
    if not db_inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    db_inv.quantity = update.quantity
    db.commit()
    db.refresh(db_inv)
    await manager.broadcast({"type": "inventory_update", "payload": {"hospital_id": db_inv.hospital_id}})
    return db_inv

@app.get("/inventory")
def get_all_inventory(db: Session = Depends(get_db)):
    return db.query(models.Inventory).all()

# ---------- REQUESTS ----------
@app.post("/requests", response_model=schemas.RequestOut)
def create_request(req: schemas.RequestCreate, db: Session = Depends(get_db)):
    db_req = models.PatientRequest(**req.model_dump())
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

# ---------- MATCHES ----------
@app.get("/matches/{request_id}", response_model=schemas.MatchResponse)
def get_matches(request_id: int, db: Session = Depends(get_db)):
    req = db.query(models.PatientRequest).filter(models.PatientRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    candidates = find_matches(db, request_id)   # Person B's function

    # persist proposed matches
    for c in candidates:
        db_match = models.Match(
            request_id=request_id,
            hospital_id=c["hospital_id"],
            score=c["score"],
            distance_km=c["distance_km"],
            status="proposed"
        )
        db.add(db_match)
    db.commit()

    return {"request_id": request_id, "matches": candidates}

@app.post("/matches/{request_id}/dispatch")
async def dispatch_match(request_id: int, dispatch: schemas.DispatchRequest, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(
        models.Match.request_id == request_id,
        models.Match.hospital_id == dispatch.hospital_id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    match.status = "dispatched"
    db.commit()

    await manager.broadcast({"type": "new_match", "payload": {"request_id": request_id, "hospital_id": dispatch.hospital_id}})
    return {"match_id": match.id, "status": "dispatched"}

# ---------- WEBSOCKET ----------
@app.websocket("/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()   # keep-alive; we don't need incoming data
    except WebSocketDisconnect:
        manager.disconnect(websocket)