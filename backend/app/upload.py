from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from app.db import Publication, Author, Keyword, User, get_db
from app.utils import parser, nlp
from app.users import current_active_user
from app.file_converter import FileConverter, AdvancedDocxConverter

from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/upload/")
async def upload_publication(
        file: UploadFile = File(...),
        bibtex: Optional[UploadFile] = File(None),
        title: Optional[str] = Form(None),
        authors: Optional[str] = Form(None),
        year: Optional[int] = Form(None),
        journal: Optional[str] = Form(None),
        doi: Optional[str] = Form(None),
        db: AsyncSession = Depends(get_db),
        user: User = Depends(current_active_user)
):
    try:
        bibtex_metadata = None

        if bibtex is not None:
            try:
                bibtex_content = (await bibtex.read()).decode("utf-8")
                b_title, b_authors, b_year, b_journal, b_doi = parser.bibtex(bibtex_content)
                bibtex_metadata = {
                    "title": b_title,
                    "authors": b_authors,
                    "year": b_year,
                    "journal": b_journal,
                    "doi": b_doi
                }

                title = title or b_title
                authors = authors or b_authors
                year = year or b_year
                journal = journal or b_journal
                doi = doi or b_doi

                logger.info(f"BibTeX processed. Metadatas extracted: {bibtex_metadata}")

            except Exception as e:
                logger.error(f"Parsing BibTeX error: {e}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Parsing BibTeX error: {str(e)}"
                )

        if doi and not is_valid_doi(doi):
            raise HTTPException(
                status_code=400,
                detail="DOI invalid. Use this format: 10.xxxx/xxxxx"
            )

        if doi:
            existing_doi = await db.execute(
                select(Publication).where(Publication.doi == doi)
            )
            if existing_doi.scalar_one_or_none():
                raise HTTPException(
                    status_code=400,
                    detail="DOI existing"
                )
        if bibtex is None:
            missing_fields = []
            if not title: missing_fields.append("title")
            if not authors: missing_fields.append("authors")
            if not year: missing_fields.append("year")
            if not journal: missing_fields.append("journal")

            if missing_fields:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing fields: {', '.join(missing_fields)}. "
                           f"Insert fields or upload a BibTeX."
                )
            logger.info("Manual mode")
        else:
            if not all([title, authors, year, journal]):
                missing_from_bibtex = []
                if not title: missing_from_bibtex.append("title")
                if not authors: missing_from_bibtex.append("authors")
                if not year: missing_from_bibtex.append("year")
                if not journal: missing_from_bibtex.append("journal")

                logger.error(f"Missing from BibTeX: {missing_from_bibtex}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing fields: {', '.join(missing_from_bibtex)}. "
                )
            logger.info("BibTeX mode")

        if not file:
            raise HTTPException(status_code=400, detail="File needed")

        allowed_extensions = ['.pdf', '.docx', '.tex', '.latex']
        file_extension = '.' + file.filename.split('.')[-1].lower() if '.' in file.filename else ''
        if file_extension not in allowed_extensions:
            logger.error(f"Extension not allowed: {file_extension}")
            raise HTTPException(
                status_code=400,
                detail=f"Extension not allowed, please upload these: {', '.join(allowed_extensions)}"
            )

        content = await file.read()
        logger.info(f"File uploaded: {file.filename} ({len(content)} bytes)")

        try:
            file_ext = FileConverter.get_file_extension(file.filename)
            conversion_method = "none"

            if file_ext == '.docx':
                try:
                    converted_content, final_filename = AdvancedDocxConverter.convert_docx_with_pandoc(
                        content, file.filename
                    )
                    conversion_method = "pandoc"
                    logger.info(f"DOCX converted pandoc: {file.filename} -> {final_filename}")
                except Exception as pandoc_error:
                    logger.warning(f"Pandoc failed with DOCX: {pandoc_error}, use mammoth")
                    converted_content, final_filename = FileConverter.convert_to_pdf_if_needed(
                        content, file.filename
                    )
                    conversion_method = "mammoth"
                    logger.info(f"DOCX converted with mammoth: {file.filename} -> {final_filename}")
            else:
                converted_content, final_filename = FileConverter.convert_to_pdf_if_needed(
                    content, file.filename
                )
                conversion_method = "standard" if file_ext in ['.tex', '.latex'] else "none"
                logger.info(f"File processed: {file.filename} -> {final_filename}")

        except Exception as e:
            logger.error(f"Error while converting the file: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Error while converting the file: {str(e)}"
            )

        try:
            text = parser.extract_text(file.filename, content)
            keywords = nlp.extract_keywords(text)
            logger.info(f"{len(keywords)} keywords extracted")
        except Exception as e:
            logger.warning(f"Error while extracting keywords: {e}")
            keywords = []

        author_names = [a.strip() for a in authors.split(",") if a.strip()]
        keyword_names = [k.strip().lower() for k in keywords if k.strip()]

        logger.info(f"Authors to process: {author_names}")
        logger.info(f"Keywords to process: {keyword_names}")

        author_objs = []
        for name in author_names:
            result = await db.execute(select(Author).where(Author.name == name))
            author = result.scalar_one_or_none()
            if not author:
                author = Author(name=name)
                db.add(author)
                await db.flush()
                logger.info(f"New author created: {name}")
            else:
                logger.info(f"Existing author found: {name}")
            author_objs.append(author)

        keyword_objs = []
        for kw in keyword_names:
            result = await db.execute(select(Keyword).where(Keyword.name == kw))
            keyword = result.scalar_one_or_none()
            if not keyword:
                keyword = Keyword(name=kw)
                db.add(keyword)
                await db.flush()
                logger.info(f"Keyword created: {kw}")
            else:
                logger.info(f"Existing keyword found: {kw}")
            keyword_objs.append(keyword)

        publication = Publication(
            title=title,
            file=converted_content,
            filename=final_filename,
            journal=journal,
            year=year,
            doi=doi,
            user_id=user.id,
            authors=author_objs,
            keywords=keyword_objs
        )
        db.add(publication)
        await db.commit()
        await db.refresh(publication)

        result = await db.execute(
            select(Publication)
            .options(joinedload(Publication.authors), joinedload(Publication.keywords))
            .where(Publication.id == publication.id)
        )
        publication_with_rel = result.unique().scalar_one()

        author_names_response = [author.name for author in publication_with_rel.authors]
        keyword_names_response = [kw.name for kw in publication_with_rel.keywords]

        response_data = {
            "id": publication_with_rel.id,
            "title": publication_with_rel.title,
            "authors": author_names_response,
            "keywords": keyword_names_response,
            "journal": publication_with_rel.journal,
            "year": publication_with_rel.year,
            "doi": publication_with_rel.doi,
            "original_filename": file.filename,
            "converted_filename": final_filename,
            "conversion_method": conversion_method
        }

        if bibtex is not None:
            response_data["metadata_source"] = "bibtex"
            response_data["bibtex_data"] = bibtex_metadata
            logger.info("Saved with BibTeX metadata")
        else:
            response_data["metadata_source"] = "manual"
            logger.info("Saved with classical metadata")

        return response_data

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Upload error: {str(e)}"
        )


def is_valid_doi(doi: str) -> bool:
    import re
    doi_pattern = r'^10\.\d{4,}/[-._;()/:\w\[\]]+$'
    return bool(re.match(doi_pattern, doi, re.IGNORECASE))