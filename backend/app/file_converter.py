import os
import tempfile
from pathlib import Path
from typing import Tuple, Optional
from io import BytesIO
import logging
import re

from docx import Document as DocxDocument
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch
from weasyprint import HTML, CSS
import mammoth

logger = logging.getLogger(__name__)


class FileConverter:
    @staticmethod
    def get_file_extension(filename: str) -> str:
        return Path(filename).suffix.lower()

    @staticmethod
    def convert_docx_to_pdf_reportlab(docx_content: bytes, original_filename: str) -> Tuple[bytes, str]:
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                # Saves docx
                docx_path = os.path.join(temp_dir, "temp.docx")
                with open(docx_path, "wb") as f:
                    f.write(docx_content)

                # Reads docx
                doc = DocxDocument(docx_path)

                # Creates pdf
                pdf_path = os.path.join(temp_dir, "output.pdf")
                FileConverter._create_pdf_from_docx(doc, pdf_path)

                # Reads pdf
                with open(pdf_path, "rb") as f:
                    pdf_content = f.read()

                # Creates filename
                new_filename = original_filename.replace('.docx', '.pdf')

                return pdf_content, new_filename

        except Exception as e:
            return FileConverter.convert_docx_to_pdf_mammoth(docx_content, original_filename)

    @staticmethod
    def convert_docx_to_pdf_mammoth(docx_content: bytes, original_filename: str) -> Tuple[bytes, str]:
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                # Saves docx
                docx_path = os.path.join(temp_dir, "temp.docx")
                with open(docx_path, "wb") as f:
                    f.write(docx_content)

                # Converts in HTML
                with open(docx_path, "rb") as docx_file:
                    result = mammoth.convert_to_html(docx_file)
                    html_content = result.value

                # Creates HTML
                full_html = FileConverter._wrap_html_with_styles(html_content, "DOCX Document")

                # Converts to PDF
                pdf_bytes = FileConverter._html_to_pdf(full_html)

                new_filename = original_filename.replace('.docx', '.pdf')

                return pdf_bytes, new_filename

        except Exception as e:
            raise Exception(f"Impossible to convert from DOCX to PDF: {str(e)}")

    @staticmethod
    def _create_pdf_from_docx(docx_doc, output_path: str):
        doc = SimpleDocTemplate(output_path, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []

        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=12,
            textColor='black'
        )

        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            textColor='black'
        )

        for paragraph in docx_doc.paragraphs:
            if paragraph.text.strip():
                if len(paragraph.text) < 100 and paragraph.text.isupper():
                    style = title_style
                elif paragraph.runs and paragraph.runs[0].bold:
                    style = title_style
                else:
                    style = normal_style

                p = Paragraph(paragraph.text, style)
                story.append(p)
                story.append(Spacer(1, 6))

        if not story:
            story.append(Paragraph("DOCX converted", normal_style))

        # Costruisci il PDF
        doc.build(story)

    @staticmethod
    def convert_latex_to_pdf(latex_content: bytes, original_filename: str) -> Tuple[bytes, str]:
        try:
            # Decodes LaTeX
            latex_text = latex_content.decode('utf-8', errors='ignore')

            # Converts to HTML
            html_content = FileConverter._latex_to_html_advanced(latex_text)

            # Converts to PDF
            pdf_bytes = FileConverter._html_to_pdf(html_content)

            # Creates filename
            new_filename = original_filename.replace('.tex', '.pdf').replace('.latex', '.pdf')

            return pdf_bytes, new_filename

        except Exception as e:
            raise Exception(f"Impossibile to convert from LaTeX to PDF: {str(e)}")

    @staticmethod
    def _latex_to_html_advanced(latex_text: str) -> str:
        html = latex_text

        html = re.sub(r'\\documentclass(?:\[[^\]]*\])?\{[^}]*\}', '', html)
        html = re.sub(r'\\usepackage(?:\[[^\]]*\])?\{[^}]*\}', '', html)
        html = re.sub(r'\\begin\{document\}', '', html)
        html = re.sub(r'\\end\{document\}', '', html)
        html = re.sub(r'\\maketitle', '', html)

        html = re.sub(r'\\title\{([^}]*)\}', r'<h1 class="title">\1</h1>', html)
        html = re.sub(r'\\author\{([^}]*)\}', r'<p class="author"><strong>Autore:</strong> \1</p>', html)
        html = re.sub(r'\\date\{([^}]*)\}', r'<p class="date"><strong>Data:</strong> \1</p>', html)

 
        html = re.sub(r'\\section\*?\{([^}]*)\}', r'<h2>\1</h2>', html)
        html = re.sub(r'\\subsection\*?\{([^}]*)\}', r'<h3>\1</h3>', html)
        html = re.sub(r'\\subsubsection\*?\{([^}]*)\}', r'<h4>\1</h4>', html)
        html = re.sub(r'\\paragraph\{([^}]*)\}', r'<h5>\1</h5>', html)


        html = re.sub(r'\\textbf\{([^}]*)\}', r'<strong>\1</strong>', html)
        html = re.sub(r'\\textit\{([^}]*)\}', r'<em>\1</em>', html)
        html = re.sub(r'\\emph\{([^}]*)\}', r'<em>\1</em>', html)
        html = re.sub(r'\\underline\{([^}]*)\}', r'<u>\1</u>', html)
        html = re.sub(r'\\texttt\{([^}]*)\}', r'<code>\1</code>', html)

        
        html = re.sub(r'\$\$([^$]+)\$\$', r'<div class="math-block">\1</div>', html)
        html = re.sub(r'\$([^$]+)\$', r'<span class="math-inline">\1</span>', html)

        
        html = re.sub(r'\\begin\{itemize\}', '<ul>', html)
        html = re.sub(r'\\end\{itemize\}', '</ul>', html)
        html = re.sub(r'\\begin\{enumerate\}', '<ol>', html)
        html = re.sub(r'\\end\{enumerate\}', '</ol>', html)
        html = re.sub(r'\\item(?:\[[^\]]*\])?\s*', '<li>', html)

        
        html = re.sub(r'\\begin\{quote\}', '<blockquote>', html)
        html = re.sub(r'\\end\{quote\}', '</blockquote>', html)

        
        html = re.sub(r'\\begin\{figure\}.*?\\end\{figure\}', '<div class="figure">[Figura]</div>', html,
                      flags=re.DOTALL)

        
        html = re.sub(r'\\begin\{table\}.*?\\end\{table\}', '<div class="table">[Tabella]</div>', html, flags=re.DOTALL)

        
        html = re.sub(r'\\[a-zA-Z]+(?:\[[^\]]*\])?\{[^}]*\}', '', html)
        html = re.sub(r'\\[a-zA-Z]+', '', html)

        
        html = re.sub(r'\\\\', '<br>', html)

        
        html = re.sub(r'\n\s*\n', '</p><p>', html)

        
        html = re.sub(r'\s+', ' ', html)
        html = html.strip()

        return FileConverter._wrap_html_with_styles(html, "LaTeX Document")

    @staticmethod
    def _wrap_html_with_styles(content: str, title: str) -> str:
        html_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>{title}</title>
            <style>
                @page {{
                    size: A4;
                    margin: 2cm;
                }}
                body {{
                    font-family: 'Times New Roman', serif;
                    font-size: 12pt;
                    line-height: 1.6;
                    text-align: justify;
                    color: #000;
                }}
                .title {{
                    font-size: 20pt;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 16pt;
                }}
                .author, .date {{
                    text-align: center;
                    margin-bottom: 12pt;
                    font-style: italic;
                }}
                h1, h2 {{ 
                    font-size: 16pt; 
                    font-weight: bold;
                    margin-top: 20pt; 
                    margin-bottom: 12pt;
                }}
                h3 {{ 
                    font-size: 14pt; 
                    font-weight: bold;
                    margin-top: 16pt; 
                    margin-bottom: 10pt;
                }}
                h4, h5 {{ 
                    font-size: 12pt; 
                    font-weight: bold;
                    margin-top: 12pt; 
                    margin-bottom: 8pt;
                }}
                p {{ 
                    margin-bottom: 12pt; 
                    text-indent: 0;
                }}
                ul, ol {{ 
                    margin-bottom: 12pt; 
                    padding-left: 30pt;
                }}
                li {{ 
                    margin-bottom: 6pt; 
                }}
                blockquote {{
                    margin: 12pt 20pt;
                    padding: 8pt;
                    border-left: 3pt solid #ccc;
                    font-style: italic;
                }}
                code {{
                    font-family: 'Courier New', monospace;
                    background-color: #f5f5f5;
                    padding: 2pt;
                }}
                .math-block {{
                    text-align: center;
                    margin: 12pt 0;
                    font-family: 'Times New Roman', serif;
                }}
                .math-inline {{
                    font-family: 'Times New Roman', serif;
                }}
                .figure, .table {{
                    text-align: center;
                    margin: 20pt 0;
                    padding: 10pt;
                    border: 1pt solid #ccc;
                    background-color: #f9f9f9;
                }}
                strong {{ font-weight: bold; }}
                em {{ font-style: italic; }}
                u {{ text-decoration: underline; }}
            </style>
        </head>
        <body>
            <div>{content}</div>
        </body>
        </html>
        """

        return html_template

    @staticmethod
    def _html_to_pdf(html_content: str) -> bytes:
        try:
            # Creates PDF
            html_doc = HTML(string=html_content)
            pdf_bytes = html_doc.write_pdf()

            return pdf_bytes

        except Exception as e:
            raise Exception(f"Impossible to convert from HTML to PDF: {str(e)}")

    @staticmethod
    def convert_to_pdf_if_needed(file_content: bytes, filename: str) -> Tuple[bytes, str]:
        extension = FileConverter.get_file_extension(filename)

        if extension == '.pdf':
            return file_content, filename
        elif extension == '.docx':
            return FileConverter.convert_docx_to_pdf_mammoth(file_content, filename)
        elif extension in ['.tex', '.latex']:
            return FileConverter.convert_latex_to_pdf(file_content, filename)
        else:
            raise Exception(f"Format not supported: {extension}")


class AdvancedDocxConverter:
    @staticmethod
    def convert_docx_with_pandoc(docx_content: bytes, original_filename: str) -> Tuple[bytes, str]:
        try:
            import pypandoc

            with tempfile.TemporaryDirectory() as temp_dir:
                # Saves DOCX
                docx_path = os.path.join(temp_dir, "temp.docx")
                with open(docx_path, "wb") as f:
                    f.write(docx_content)

                # Converts to HTML
                html_content = pypandoc.convert_file(docx_path, 'html')

                full_html = FileConverter._wrap_html_with_styles(html_content, "DOCX Document")

                # Converts HTML to PDF
                pdf_bytes = FileConverter._html_to_pdf(full_html)

                new_filename = original_filename.replace('.docx', '.pdf')

                return pdf_bytes, new_filename

        except ImportError:
            logger.warning("pypandoc not found for DOCX")
            return FileConverter.convert_docx_to_pdf_mammoth(docx_content, original_filename)
        except Exception as e:
            logger.warning(f"pandoc error in DOCX: {e}, fallback to standard converter")
            return FileConverter.convert_docx_to_pdf_mammoth(docx_content, original_filename)