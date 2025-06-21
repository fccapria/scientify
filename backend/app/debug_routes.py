from fastapi import Depends, APIRouter
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import Publication, get_db, Keyword, Author

router = APIRouter(prefix="/debug", tags=["debug"])

# Debug endpoint to view all publications with complete data
@router.get("/publications")
async def debug_publications(db: AsyncSession = Depends(get_db)):
    """Debug endpoint to view all publications with their complete data"""
    stmt = select(Publication).options(
        selectinload(Publication.authors),
        selectinload(Publication.keywords),
        selectinload(Publication.user)
    ).order_by(Publication.upload_date.desc())

    result = await db.execute(stmt)
    publications = result.scalars().all()

    debug_data = []
    for pub in publications:
        debug_data.append({
            "id": pub.id,
            "title": pub.title,
            "authors": [{"id": a.id, "name": a.name} for a in pub.authors],
            "keywords": [{"id": k.id, "name": k.name} for k in pub.keywords],  # 🎯 KEYWORDS!
            "upload_date": pub.upload_date,
            "journal": pub.journal,
            "year": pub.year,
            "doi": pub.doi,
            "user_email": pub.user.email if pub.user else None,
            "user_id": str(pub.user_id) if pub.user_id else None
        })

    return {
        "total_publications": len(publications),
        "publications": debug_data
    }


# Debug endpoint to view all authors
@router.get("/authors")
async def debug_authors(db: AsyncSession = Depends(get_db)):
    """Debug endpoint to view all authors"""
    result = await db.execute(select(Author))
    authors = result.scalars().all()
    return [{"id": a.id, "name": a.name} for a in authors]


# Debug endpoint to view all keywords
@router.get("/keywords")
async def debug_keywords(db: AsyncSession = Depends(get_db)):
    """🎯 Debug endpoint to view all keywords - THE HEART OF THE SYSTEM!"""
    result = await db.execute(select(Keyword))
    keywords = result.scalars().all()
    return [{"id": k.id, "name": k.name} for k in keywords]