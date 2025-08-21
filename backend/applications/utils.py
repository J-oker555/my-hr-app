import io
from PyPDF2 import PdfReader
import docx

def extract_text_from_bytes(data: bytes, filename: str = "") -> str:
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(data))
        parts = []
        for page in reader.pages:
            try:
                txt = page.extract_text() or ""
            except Exception:
                txt = ""
            if txt:
                parts.append(txt)
        return "\n".join(parts)

    if name.endswith(".docx"):
        d = docx.Document(io.BytesIO(data))
        return "\n".join(p.text for p in d.paragraphs if p.text)

    # fallback: texte brut
    try:
        return data.decode("utf-8")
    except Exception:
        return data.decode("latin-1", errors="ignore")
