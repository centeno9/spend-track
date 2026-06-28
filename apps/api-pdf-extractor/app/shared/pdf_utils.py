import re
from typing import Optional

DATE_RE = re.compile(r"\d{2}-\w{3}-\d{4}")
MONEY_RE = re.compile(r"[+-]?\s*\$[\d,]+\.?\d*")


def get_table_settings(page):
    return {
        "vertical_strategy": "explicit",
        "horizontal_strategy": "text",
        "explicit_vertical_lines": page.curves + page.edges,
        "intersection_tolerance": 15,
        "snap_y_tolerance": 5,
    }


def clean_rows(rows):
    return [r for r in rows if any(cell and cell.strip() for cell in r)]


def parse_money(text: str) -> Optional[float]:
    if not text:
        return None
    text = text.strip().replace("$", "").replace(",", "").replace(" ", "")
    try:
        return float(text)
    except ValueError:
        return None
