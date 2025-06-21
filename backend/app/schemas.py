import uuid

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from fastapi_users import schemas


class UserRead(schemas.BaseUser[uuid.UUID]):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(schemas.BaseUserCreate):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserUpdate(schemas.BaseUserUpdate):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class AuthorOut(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class KeywordOut(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class PublicationOut(BaseModel):
    id: int
    title: str
    filename: Optional[str]
    upload_date: datetime
    journal: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None
    authors: List[AuthorOut]
    keywords: List[KeywordOut]
    user_id: Optional[uuid.UUID] = None

    class Config:
        orm_mode = True


class UserPublicationOut(BaseModel):
    id: int
    title: str
    filename: Optional[str]
    upload_date: datetime
    journal: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None
    authors: List[AuthorOut]
    keywords: List[KeywordOut]

    class Config:
        orm_mode = True