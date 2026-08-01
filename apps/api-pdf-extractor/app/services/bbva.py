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


def get_table_settings(page: Page) -> dict:
    """Table geometry for a BBVA statement.

    BBVA draws the column separators as vector graphics but leaves the rows
    implied by the text baselines, hence explicit vertical lines taken from the
    page's own curves/edges and a text-based horizontal strategy.
    """
    return {
        "vertical_strategy": "explicit",
        "horizontal_strategy": "text",
        "explicit_vertical_lines": page.curves + page.edges,
        "intersection_tolerance": 15,
        "snap_y_tolerance": 5,
    }


def extract(pdf_path: str) -> dict:
    pago_no_intereses = None
    expenses = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            for line in text.split("\n"):
                if "pago para no generar" in line.lower():
                    match = MONEY_RE.search(line)
                    if match:
                        pago_no_intereses = parse_money(match.group())
                    break

        all_rows = []
        for page in pdf.pages:
            tables = page.find_tables(get_table_settings(page))
            for table in tables:
                rows = clean_rows(table.extract())
                if not rows:
                    continue
                first_cell = (rows[0][0] or "") if rows[0] else ""
                if "CARGOS" in first_cell.upper() and len(rows[0]) == 4:
                    all_rows.extend(rows)
                elif all_rows and len(rows[0]) == 4:
                    all_rows.extend(rows)

        for row in all_rows:
            if len(row) != 4:
                continue
            fecha_op, fecha_cargo, descripcion, monto = row

            if fecha_op and DATE_RE.match(fecha_op.strip()):
                amount = parse_money(monto)
                expenses.append({
                    "fecha_operacion": fecha_op.strip(),
                    "fecha_operacion_iso": parse_date_to_iso(fecha_op),
                    "fecha_cargo": (fecha_cargo or "").strip(),
                    "fecha_cargo_iso": parse_date_to_iso(fecha_cargo or ""),
                    "descripcion": (descripcion or "").strip(),
                    "monto": amount,
                    "monto_cents": parse_money_cents(monto),
                    "monto_raw": (monto or "").strip(),
                })
            elif expenses and descripcion and descripcion.strip():
                expenses[-1]["descripcion"] += "\n" + descripcion.strip()

    cargos = [e for e in expenses if e["monto"] is not None and e["monto"] > 0]
    abonos = [e for e in expenses if e["monto"] is not None and e["monto"] < 0]
    total_cargos = round(sum(e["monto"] for e in cargos), 2)

    return {
        "pago_para_no_generar_intereses": pago_no_intereses,
        "total_cargos_calculado": total_cargos,
        "match": pago_no_intereses == total_cargos if pago_no_intereses else None,
        "num_cargos": len(cargos),
        "num_abonos": len(abonos),
        "cargos": cargos,
        "abonos": abonos,
    }
