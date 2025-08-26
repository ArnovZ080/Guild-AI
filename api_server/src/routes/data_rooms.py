from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid

from guild.core.models.schemas import DataRoom as PydanticDataRoom, DataRoomCreate
from .. import models
from ..database import get_db


router = APIRouter(
    prefix="/datarooms",
    tags=["Data Rooms"],
)

@router.post("/", response_model=PydanticDataRoom, status_code=201)
def create_data_room(data_room: DataRoomCreate, db: Session = Depends(get_db)):
    """
    Create a new Data Room.
    """
    db_data_room = models.DataRoom(
        id=str(uuid.uuid4()),
        **data_room.dict()
    )
    db.add(db_data_room)
    db.commit()
    db.refresh(db_data_room)
    return db_data_room

@router.get("/", response_model=List[PydanticDataRoom])
def get_all_data_rooms(db: Session = Depends(get_db)):
    """
    Retrieve all Data Rooms.
    """
    return db.query(models.DataRoom).all()

@router.get("/{data_room_id}", response_model=PydanticDataRoom)
def get_data_room(data_room_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a specific Data Room by its ID.
    """
    db_data_room = db.query(models.DataRoom).filter(models.DataRoom.id == data_room_id).first()
    if db_data_room is None:
        raise HTTPException(status_code=404, detail="Data Room not found")
    return db_data_room

@router.delete("/{data_room_id}", status_code=204)
def delete_data_room(data_room_id: str, db: Session = Depends(get_db)):
    """
    Delete a Data Room by its ID.
    """
    db_data_room = db.query(models.DataRoom).filter(models.DataRoom.id == data_room_id).first()
    if db_data_room is None:
        raise HTTPException(status_code=404, detail="Data Room not found")

    db.delete(db_data_room)
    db.commit()
    return

