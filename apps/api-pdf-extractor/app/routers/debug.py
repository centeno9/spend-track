from fastapi import APIRouter, Form, HTTPException, UploadFile, File
from pathlib import Path
import pdfplumber
import tempfile

from app.services import EXTRACTORS, SUPPORTED_BANKS
from app.shared.pdf_utils import clean_rows

router = APIRouter()

DEBUG_IMAGES_DIR = Path("debug-images")
DEBUG_IMAGES_DIR.mkdir(exist_ok=True)


@router.post("/debug-tables")
async def debug_tables(
    file: UploadFile = File(...),
    bank: str = Form(...),
):
    """Render every table the given bank's own settings detect on a statement.

    This is the tuning loop for a new layout: the tables drawn here are exactly
    the ones that bank's `extract` will iterate over.
    """
    extractor = EXTRACTORS.get(bank.lower())
    if not extractor:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported bank: {bank}. Supported: {SUPPORTED_BANKS}",
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        pdf_path = tmp.name

    for old in DEBUG_IMAGES_DIR.glob("*.png"):
        old.unlink()

    debug_info = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            tables = page.find_tables(extractor.get_table_settings(page))

            for table_idx, table in enumerate(tables):
                rows = clean_rows(table.extract())

                img = page.to_image(resolution=150)
                img.draw_rect(table.bbox, stroke="red", stroke_width=2)

                for cell in table.cells:
                    img.draw_rect(cell, stroke="blue", stroke_width=1)

                filename = f"page{page_number}_table{table_idx}.png"
                img.save(DEBUG_IMAGES_DIR / filename)

                debug_info.append({
                    "page": page_number,
                    "table_index": table_idx,
                    "bbox": table.bbox,
                    "num_columns": len(rows[0]) if rows else 0,
                    "num_rows": len(rows),
                    "image": filename,
                    "rows": rows,
                })

    return {
        "bank": bank.lower(),
        "filename": file.filename,
        "images_dir": str(DEBUG_IMAGES_DIR),
        "tables": debug_info,
    }
