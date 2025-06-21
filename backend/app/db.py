import os
from collections.abc import AsyncGenerator

from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase

from sqlalchemy import Column, Integer, String, Table, ForeignKey, LargeBinary, DateTime
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, relationship, sessionmaker
from sqlalchemy.dialects.postgresql import UUID
import uuid
import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://scientify_user:scientify_pass@db:5432/scientify_db")

if not "+asyncpg" in DATABASE_URL:
    raise ValueError("DATABASE_URL must use asyncpg driver for async operations. Use postgresql+asyncpg://...")

class Base(DeclarativeBase):
    pass


class User(SQLAlchemyBaseUserTableUUID, Base):
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)

    publications = relationship("Publication", back_populates="user")


try:
    engine = create_async_engine(DATABASE_URL, echo=True)
    print("Database engine created successfully")
except Exception as e:
    print(f"Error creating database engine: {e}")
    raise

async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_db():
    async with async_session_maker() as session:
        yield session


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session():
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)


publication_authors = Table(
    'publication_authors', Base.metadata,
    Column('publication_id', Integer, ForeignKey('publications.id', ondelete='CASCADE')),
    Column('author_id', Integer, ForeignKey('authors.id', ondelete='CASCADE'))
)

publication_keywords = Table(
    'publication_keywords', Base.metadata,
    Column('publication_id', Integer, ForeignKey('publications.id', ondelete='CASCADE')),
    Column('keyword_id', Integer, ForeignKey('keywords.id', ondelete='CASCADE'))
)


class Author(Base):
    __tablename__ = 'authors'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)


class Keyword(Base):
    __tablename__ = 'keywords'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)


class Publication(Base):
    __tablename__ = 'publications'
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    file = Column(LargeBinary, nullable=False)
    filename = Column(String)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    journal = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    doi = Column(String, nullable=True, unique=True)

    user_id = Column(UUID(as_uuid=True), ForeignKey('user.id'), nullable=False)
    user = relationship("User", back_populates="publications")
    authors = relationship('Author', secondary=publication_authors, backref='publications')
    keywords = relationship('Keyword', secondary=publication_keywords, backref='publications')
