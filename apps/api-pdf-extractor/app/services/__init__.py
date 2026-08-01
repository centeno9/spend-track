from dataclasses import dataclass
from typing import Callable

from pdfplumber.page import Page

from app.services import bbva, banorte


@dataclass(frozen=True)
class BankExtractor:
    """The per-bank hooks the routers dispatch on.

    Every statement layout needs its own table geometry, so `get_table_settings`
    is exposed alongside the parser: `/debug-tables` renders exactly the tables
    `extract` will see.
    """

    extract: Callable[[str], dict]
    get_table_settings: Callable[[Page], dict]


EXTRACTORS: dict[str, BankExtractor] = {
    "bbva": BankExtractor(
        extract=bbva.extract,
        get_table_settings=bbva.get_table_settings,
    ),
    "banorte": BankExtractor(
        extract=banorte.extract,
        get_table_settings=banorte.get_table_settings,
    ),
}

SUPPORTED_BANKS = sorted(EXTRACTORS)
