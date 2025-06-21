from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db import Publication, get_db

import io

router = APIRouter()

@router.get("/download/{publication_id}")
async def download_publication(publication_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Publication).where(Publication.id == publication_id))
    publication = result.scalar_one_or_none()
    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    file_bytes = publication.file
    filename = publication.filename or "document.pdf"

    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )