from fastapi import APIRouter, Form, UploadFile, File
import tempfile

from app.services import EXTRACTORS

router = APIRouter()


@router.post("/extract")
async def extract_statement(
    file: UploadFile = File(...),
    bank: str = Form(...),
):
    extractor = EXTRACTORS.get(bank.lower())
    if not extractor:
        return {"error": f"Unsupported bank: {bank}. Supported: {list(EXTRACTORS.keys())}"}

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        pdf_path = tmp.name

    result = extractor(pdf_path)
    result["bank"] = bank.lower()
    result["filename"] = file.filename
    return result
