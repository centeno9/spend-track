from fastapi import APIRouter, Form, UploadFile, File
from typing import Optional
from pathlib import Path
import pdfplumber
import tempfile

from app.shared.pdf_utils import get_table_settings, clean_rows

router = APIRouter()

DEBUG_IMAGES_DIR = Path("debug-images")
DEBUG_IMAGES_DIR.mkdir(exist_ok=True)


@router.post("/debug-tables")
async def debug_tables(
    file: UploadFile = File(...),
    num_columns: Optional[int] = Form(None),
):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        pdf_path = tmp.name

    for old in DEBUG_IMAGES_DIR.glob("*.png"):
        old.unlink()

    debug_info = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            tables = page.find_tables(get_table_settings(page))

            for table_idx, table in enumerate(tables):
                rows = clean_rows(table.extract())
                if num_columns and rows and len(rows[0]) != num_columns:
                    continue

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
                    "image": filename,
                    "rows": rows,
                })

    return {
        "filename": file.filename,
        "images_dir": str(DEBUG_IMAGES_DIR),
        "tables": debug_info,
    }
