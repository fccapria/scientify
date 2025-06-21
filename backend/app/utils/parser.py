import bibtexparser
import io
import logging
from typing import Tuple, Optional
from pdfminer.high_level import extract_text as pdf_extract_text
from pdfminer.high_level import extract_text_to_fp
import tempfile
import os

logger = logging.getLogger(__name__)


def bibtex(bibtex_content: str) -> Tuple[Optional[str], Optional[str], Optional[int], Optional[str], Optional[str]]:
    """
    Estrae title, authors, year, journal, doi dal primo record di un file bibtex.
    Ritorna una tupla (title, authors, year, journal, doi).
    """
    bib_database = bibtexparser.load(io.StringIO(bibtex_content))
    if not bib_database.entries:
        return (None, None, None, None, None)

    entry = bib_database.entries[0]
    title = entry.get('title')
    authors = entry.get('authors')  # o 'author' se il campo è diverso
    year = int(entry['year']) if 'year' in entry else None
    journal = entry.get('journal')
    doi = entry.get('doi')

    return (title, authors, year, journal, doi)


def extract_text(filename: str, content: bytes) -> str:
    """
    🎯 FUNZIONE FONDAMENTALE: Estrae testo da file PDF per l'analisi delle keywords

    Args:
        filename: Nome del file (per determinare il tipo)
        content: Contenuto del file in bytes

    Returns:
        str: Testo estratto dal documento
    """
    try:
        # Determina l'estensione del file
        file_extension = os.path.splitext(filename.lower())[1]

        if file_extension == '.pdf':
            return extract_text_from_pdf(content)
        elif file_extension == '.docx':
            return extract_text_from_docx(content)
        elif file_extension in ['.tex', '.latex']:
            return extract_text_from_latex(content)
        else:
            logger.warning(f"Tipo di file non supportato per estrazione testo: {file_extension}")
            return ""

    except Exception as e:
        logger.error(f"Errore nell'estrazione del testo da {filename}: {e}")
        return ""


def extract_text_from_pdf(pdf_content: bytes) -> str:
    """
    Estrae testo da contenuto PDF usando pdfminer
    """
    try:
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_file.write(pdf_content)
            temp_file.flush()

            # Estrae il testo usando pdfminer
            text = pdf_extract_text(temp_file.name)

            # Pulisce il file temporaneo
            os.unlink(temp_file.name)

            logger.info(f"Estratto testo PDF: {len(text)} caratteri")
            return text or ""

    except Exception as e:
        logger.error(f"Errore nell'estrazione testo da PDF: {e}")
        return ""


def extract_text_from_docx(docx_content: bytes) -> str:
    """
    Estrae testo da contenuto DOCX usando python-docx
    """
    try:
        from docx import Document

        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as temp_file:
            temp_file.write(docx_content)
            temp_file.flush()

            # Estrae il testo usando python-docx
            doc = Document(temp_file.name)
            text_parts = []

            for paragraph in doc.paragraphs:
                text_parts.append(paragraph.text)

            text = '\n'.join(text_parts)

            # Pulisce il file temporaneo
            os.unlink(temp_file.name)

            logger.info(f"Estratto testo DOCX: {len(text)} caratteri")
            return text

    except Exception as e:
        logger.error(f"Errore nell'estrazione testo da DOCX: {e}")
        return ""


def extract_text_from_latex(latex_content: bytes) -> str:
    """
    Estrae testo da contenuto LaTeX rimuovendo i comandi LaTeX
    """
    try:
        from pylatexenc.latex2text import LatexNodes2Text

        # Decodifica il contenuto
        latex_text = latex_content.decode('utf-8', errors='ignore')

        # Converte LaTeX in testo semplice
        converter = LatexNodes2Text()
        text = converter.latex_to_text(latex_text)

        logger.info(f"Estratto testo LaTeX: {len(text)} caratteri")
        return text

    except Exception as e:
        logger.error(f"Errore nell'estrazione testo da LaTeX: {e}")
        # Fallback: rimuovi manualmente i comandi LaTeX più comuni
        try:
            latex_text = latex_content.decode('utf-8', errors='ignore')
            # Rimuove comandi LaTeX di base
            import re
            text = re.sub(r'\\[a-zA-Z]+\{[^}]*\}', '', latex_text)
            text = re.sub(r'\\[a-zA-Z]+', '', text)
            text = re.sub(r'\{[^}]*\}', '', text)
            text = re.sub(r'%.*', '', text)  # Rimuove commenti
            return text.strip()
        except:
            return ""


def clean_extracted_text(text: str) -> str:
    """
    Pulisce il testo estratto per migliorare l'estrazione delle keywords
    """
    import re

    # Rimuove caratteri di controllo e spazi multipli
    text = re.sub(r'\s+', ' ', text)

    # Rimuove caratteri speciali eccessivi
    text = re.sub(r'[^\w\s\-.,;:()[\]{}]', ' ', text)

    # Rimuove linee molto corte (probabilmente header/footer)
    lines = text.split('\n')
    clean_lines = [line.strip() for line in lines if len(line.strip()) > 10]

    return '\n'.join(clean_lines).strip()