from fastapi import Depends, APIRouter, Query, HTTPException
from sqlalchemy import select, or_, and_, asc, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db import Publication, get_db, Keyword, Author, User
from app.schemas import PublicationOut, UserPublicationOut
from app.users import current_active_user

# Create router for publication endpoints
router = APIRouter()

# Endpoint to delete a publication
@router.delete("/publications/{publication_id}")
async def delete_publication(
        publication_id: int,
        user: User = Depends(current_active_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Delete a publication owned by the current user
    """
    # Find the publication with relations
    result = await db.execute(
        select(Publication).options(
            selectinload(Publication.authors),
            selectinload(Publication.keywords)
        ).where(
            and_(
                Publication.id == publication_id,
                Publication.user_id == user.id  # Security: only user's own publications
            )
        )
    )
    publication = result.scalar_one_or_none()

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found or you don't have permission to delete it"
        )

    publication_title = publication.title

    # Delete the publication (many-to-many relations are deleted automatically)
    await db.delete(publication)
    await db.commit()

    print(f"🗑️ Publication deleted: '{publication_title}' (ID: {publication_id}) by user {user.email}")

    return {"message": f"Publication '{publication_title}' successfully deleted"}


# Endpoint for user publications with sorting
@router.get("/users/me/publications", response_model=List[UserPublicationOut])
async def get_user_publications(
        order_by: Optional[str] = Query("date_desc",
                                       description="Sort by: date_asc, date_desc, title_asc, title_desc"),
        user: User = Depends(current_active_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Returns all publications uploaded by the current user with sorting
    """
    stmt = select(Publication).options(
        selectinload(Publication.authors),
        selectinload(Publication.keywords)
    ).where(
        Publication.user_id == user.id
    )

    # Sorting management
    if order_by == "date_asc":
        stmt = stmt.order_by(asc(Publication.upload_date))
    elif order_by == "date_desc":
        stmt = stmt.order_by(desc(Publication.upload_date))
    elif order_by == "title_asc":
        stmt = stmt.order_by(asc(Publication.title))
    elif order_by == "title_desc":
        stmt = stmt.order_by(desc(Publication.title))
    else:
        # Default: descending by date (most recent first)
        stmt = stmt.order_by(desc(Publication.upload_date))

    result = await db.execute(stmt)
    publications = result.scalars().all()

    print(f"🔍 User {user.email} (ID: {user.id}) has {len(publications)} publications (sorted by: {order_by})")

    return publications


# Search publications endpoint
@router.get("/publications", response_model=List[PublicationOut])
async def get_publications(
        search: Optional[str] = Query(None,
                                      description="Search by title, author or keyword. For multiple keywords use spaces: 'keyword1 keyword2'"),
        order_by: Optional[str] = Query("date_desc",
                                       description="Sort by: date_asc, date_desc, title_asc, title_desc"),
        db: AsyncSession = Depends(get_db)
):
    """
    🔍 ADVANCED SEARCH SYSTEM WITH KEYWORDS

    Search function with priority and sorting:
    1. Keywords (highest priority) - supports multiple search with spaces
    2. Authors (medium priority)
    3. Title (lowest priority)

    Keywords are the core of the search system!
    """

    print(f"🔍 Search: '{search}' | Sort by: {order_by}")

    # If no search query, return all sorted
    if search is None or not search.strip():
        stmt = select(Publication).options(
            selectinload(Publication.authors),
            selectinload(Publication.keywords)
        )

        # Sorting management
        if order_by == "date_asc":
            stmt = stmt.order_by(asc(Publication.upload_date))
        elif order_by == "date_desc":
            stmt = stmt.order_by(desc(Publication.upload_date))
        elif order_by == "title_asc":
            stmt = stmt.order_by(asc(Publication.title))
        elif order_by == "title_desc":
            stmt = stmt.order_by(desc(Publication.title))
        else:
            # Default: descending by date
            stmt = stmt.order_by(desc(Publication.upload_date))

        result = await db.execute(stmt)
        return result.scalars().all()

    search_term = search.strip()

    # Split search string into individual keywords
    search_keywords = [kw.strip().lower() for kw in search_term.split() if kw.strip()]
    print(f"🔍 Keywords to search: {search_keywords}")

    # SET to track already found IDs
    found_publication_ids = set()
    final_results = []

    # 🎯 1. SEARCH BY KEYWORDS (highest priority) - MULTIPLE SEARCH
    if search_keywords:
        print("🔍 Step 1: Searching by multiple keywords...")

        # Create conditions for each keyword
        keyword_conditions = []
        for keyword in search_keywords:
            keyword_pattern = f"%{keyword}%"
            keyword_conditions.append(
                Publication.keywords.any(Keyword.name.ilike(keyword_pattern))
            )

        # Publication must have ALL keywords (AND)
        keyword_query = select(Publication).options(
            selectinload(Publication.authors),
            selectinload(Publication.keywords)
        ).where(
            and_(*keyword_conditions)  # All conditions must be true
        )

        keyword_result = await db.execute(keyword_query)
        keyword_publications = keyword_result.scalars().all()

        for pub in keyword_publications:
            if pub.id not in found_publication_ids:
                final_results.append(pub)
                found_publication_ids.add(pub.id)
                pub_keywords = [k.name for k in pub.keywords]
                print(f"   ✅ Found by keywords: {pub.title} (keywords: {pub_keywords})")

    # 📝 2. SEARCH BY AUTHORS (medium priority) - uses complete string
    print("🔍 Step 2: Searching by authors...")
    author_pattern = f"%{search_term}%"
    author_query = select(Publication).options(
        selectinload(Publication.authors),
        selectinload(Publication.keywords)
    ).join(Publication.authors).where(
        Author.name.ilike(author_pattern)
    )

    author_result = await db.execute(author_query)
    author_publications = author_result.scalars().all()

    for pub in author_publications:
        if pub.id not in found_publication_ids:
            final_results.append(pub)
            found_publication_ids.add(pub.id)
            pub_authors = [a.name for a in pub.authors]
            print(f"   ✅ Found by author: {pub.title} (authors: {pub_authors})")

    # 📰 3. SEARCH BY TITLE (lowest priority) - uses complete string
    print("🔍 Step 3: Searching by title...")
    title_pattern = f"%{search_term}%"
    title_query = select(Publication).options(
        selectinload(Publication.authors),
        selectinload(Publication.keywords)
    ).where(
        Publication.title.ilike(title_pattern)
    )

    title_result = await db.execute(title_query)
    title_publications = title_result.scalars().all()

    for pub in title_publications:
        if pub.id not in found_publication_ids:
            final_results.append(pub)
            found_publication_ids.add(pub.id)
            print(f"   ✅ Found by title: {pub.title}")

    # Apply sorting to final results
    print(f"🔍 Applying sorting: {order_by}")
    if order_by == "date_asc":
        final_results.sort(key=lambda x: x.upload_date)
    elif order_by == "date_desc":
        final_results.sort(key=lambda x: x.upload_date, reverse=True)
    elif order_by == "title_asc":
        final_results.sort(key=lambda x: x.title.lower())
    elif order_by == "title_desc":
        final_results.sort(key=lambda x: x.title.lower(), reverse=True)
    else:
        # Default: descending by date
        final_results.sort(key=lambda x: x.upload_date, reverse=True)

    print(f"🔍 Total results found: {len(final_results)}")
    return final_results