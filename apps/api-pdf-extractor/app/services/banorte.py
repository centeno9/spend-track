"""Banorte statement parser.

Banorte prints transactions in fully ruled tables headed "CARGOS, ABONOS Y
COMPRAS REGULARES", one block per card (the titular plus every adicional):

    Fecha de     | Fecha de    | Descripcion del movimiento | Monto
    la operacion | cargo       |                            |
    12-JUN-2026  | 15-JUN-2026 | AUTOZONE 7295 HERMOSILLO   | +$2,017.47
    03-JUL-2026  | 03-JUL-2026 | PAGO BANCA DIGITAL         | -$9,711.52

The rest of the statement is full of other ruled tables (summaries, rewards,
legal boxes), so tables are deliberately *not* selected by position or by a
header keyword. A table counts as transactions only when it actually contains
rows shaped like one: NUM_COLUMNS cells with a DD-MMM-YYYY date in column 0.
Extra tables are then harmless no matter how many `find_tables` returns.
"""

import pdfplumber
from pdfplumber.page import Page

from app.shared.pdf_utils import (
    DATE_RE,
    MONEY_RE,
    clean_rows,
    parse_money,
    parse_money_cents,
    parse_date_to_iso,
)

# fecha operacion | fecha cargo | descripcion del movimiento | monto
NUM_COLUMNS = 4
DATE_COLUMN = 0
DESCRIPTION_COLUMN = 2

# The reconciliation figure, printed outside the transaction tables. Wording
# varies between statement versions, so several spellings are accepted.
TOTAL_KEYWORDS = (
    "pago para no generar intereses",
    "pago sin intereses",
    "pago para no generar",
)

# Rounding slack when reconciling the printed total against the parsed one.
CENTS_TOLERANCE = 1


def get_table_settings(page: Page) -> dict:
    """Table geometry for a Banorte statement.

    Banorte draws a complete grid — both the column and the row rules are real
    strokes on the page — so both axes come straight from those lines.
    `intersection_tolerance` carries some slack because the rules in the
    rendered PDF do not always meet exactly at the corners.
    """
    return {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "intersection_tolerance": 5,
        "snap_tolerance": 3,
    }


def _is_date(cell: str | None) -> bool:
    return bool(cell and DATE_RE.match(cell.strip()))


def _is_transaction_row(row: list) -> bool:
    return len(row) == NUM_COLUMNS and _is_date(row[DATE_COLUMN])


def _is_transaction_table(rows: list) -> bool:
    """A table holds transactions if any row looks like one.

    This is what rejects the title row, the column-header row, and every
    unrelated table elsewhere in the statement.
    """
    return any(_is_transaction_row(row) for row in rows)


def _to_expense(row: list) -> dict:
    fecha_op, fecha_cargo, descripcion, monto = row
    return {
        "fecha_operacion": fecha_op.strip(),
        "fecha_operacion_iso": parse_date_to_iso(fecha_op),
        "fecha_cargo": (fecha_cargo or "").strip(),
        "fecha_cargo_iso": parse_date_to_iso(fecha_cargo or ""),
        "descripcion": (descripcion or "").strip(),
        "monto": parse_money(monto),
        "monto_cents": parse_money_cents(monto),
        "monto_raw": (monto or "").strip(),
    }


def _parse_table(rows: list) -> list[dict]:
    """Turn one transaction table into expense records.

    A row with no date in column 0 is a description that wrapped onto a second
    line, so it is folded into the record above it.
    """
    expenses: list[dict] = []

    for row in rows:
        if _is_transaction_row(row):
            expenses.append(_to_expense(row))
            continue

        if not expenses or len(row) != NUM_COLUMNS:
            continue

        continuation = row[DESCRIPTION_COLUMN]
        if continuation and continuation.strip():
            expenses[-1]["descripcion"] += "\n" + continuation.strip()

    return expenses


def _money_in(text: str, amount_only: bool = False) -> float | None:
    """First money value in `text`.

    With `amount_only`, the value is returned solely when nothing else on the
    line carries a label of its own — the guard that stops a neighbouring row
    ("Pago minimo: $1,337.50") from being mistaken for the figure we want.
    """
    match = MONEY_RE.search(text)
    if not match:
        return None

    if amount_only:
        remainder = (text[: match.start()] + text[match.end() :]).strip()
        if any(char.isalpha() for char in remainder):
            return None

    return parse_money(match.group())


def _find_statement_total(pdf) -> float | None:
    """Read the interest-free payment figure out of the summary box.

    The label carries a footnote marker — "Pago para no generar intereses:2" —
    and the amount is right-aligned on the same visual row, so the search
    starts *after* the label rather than at the start of the line. If the
    raised marker splits the row during text extraction, the next line is
    accepted too, but only when it holds nothing but an amount.
    """
    for page in pdf.pages:
        lines = (page.extract_text() or "").split("\n")

        for index, line in enumerate(lines):
            lowered = line.lower()
            keyword = next((word for word in TOTAL_KEYWORDS if word in lowered), None)
            if keyword is None:
                continue

            after_label = line[lowered.index(keyword) + len(keyword) :]
            total = _money_in(after_label)
            if total is None and index + 1 < len(lines):
                total = _money_in(lines[index + 1], amount_only=True)
            if total is not None:
                return total

    return None


def extract(pdf_path: str) -> dict:
    expenses: list[dict] = []

    with pdfplumber.open(pdf_path) as pdf:
        pago_no_intereses = _find_statement_total(pdf)

        for page in pdf.pages:
            for table in page.find_tables(get_table_settings(page)):
                rows = clean_rows(table.extract())
                if _is_transaction_table(rows):
                    expenses.extend(_parse_table(rows))

    cargos = [e for e in expenses if e["monto"] is not None and e["monto"] > 0]
    abonos = [e for e in expenses if e["monto"] is not None and e["monto"] < 0]

    total_cents = sum(e["monto_cents"] or 0 for e in cargos)
    total_cargos = round(total_cents / 100, 2)

    # Reconciled in cents so float noise never decides the answer.
    match = None
    if pago_no_intereses is not None:
        expected_cents = round(pago_no_intereses * 100)
        match = abs(expected_cents - total_cents) <= CENTS_TOLERANCE

    return {
        "pago_para_no_generar_intereses": pago_no_intereses,
        "total_cargos_calculado": total_cargos,
        "match": match,
        "num_cargos": len(cargos),
        "num_abonos": len(abonos),
        "cargos": cargos,
        "abonos": abonos,
    }
