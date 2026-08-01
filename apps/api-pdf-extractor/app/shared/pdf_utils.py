import re
from typing import Optional

DATE_RE = re.compile(r"\d{2}-\w{3}-\d{4}")
MONEY_RE = re.compile(r"[+-]?\s*\$[\d,]+\.?\d*")

# Spanish month abbreviations used on Mexican statements (DD-MMM-YYYY)
SPANISH_MONTHS = {
    "ENE": 1,
    "FEB": 2,
    "MAR": 3,
    "ABR": 4,
    "MAY": 5,
    "JUN": 6,
    "JUL": 7,
    "AGO": 8,
    "SEP": 9,
    "OCT": 10,
    "NOV": 11,
    "DIC": 12,
}


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


def parse_money_cents(text: str) -> Optional[int]:
    """Parse a money string into integer cents, avoiding float drift."""
    amount = parse_money(text)
    if amount is None:
        return None
    return round(amount * 100)


def parse_date_to_iso(text: str) -> Optional[str]:
    """Parse a 'DD-MMM-YYYY' Spanish-month date into an ISO 'YYYY-MM-DD' string.

    A date-only string carries no timezone, so consumers can read it as a local
    date without UTC shifting.
    """
    if not text:
        return None
    match = DATE_RE.search(text.strip())
    if not match:
        return None
    day_str, month_str, year_str = match.group().split("-")
    month = SPANISH_MONTHS.get(month_str.upper())
    if month is None:
        return None
    return f"{int(year_str):04d}-{month:02d}-{int(day_str):02d}"
