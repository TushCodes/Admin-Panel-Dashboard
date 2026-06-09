"""Dummy consignment data and loader helpers for dashboard testing.

This module is intentionally self-contained so dashboard tests can import a
single file and use the same deterministic 100 consignment records every time.
"""
from __future__ import annotations

from collections.abc import Iterable, Sequence
from datetime import date, timedelta
from typing import Any

BASE_PICKUP_DATE = date(2026, 1, 1)
STATUSES: tuple[str, ...] = (
    "created",
    "pickup_scheduled",
    "picked_up",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "delayed",
    "cancelled",
)
PICKUP_CITIES: tuple[tuple[str, str], ...] = (
    ("New York", "10001"),
    ("Los Angeles", "90001"),
    ("Chicago", "60601"),
    ("Houston", "77001"),
    ("Phoenix", "85001"),
    ("Philadelphia", "19101"),
    ("San Antonio", "78201"),
    ("San Diego", "92101"),
    ("Dallas", "75201"),
    ("San Jose", "95101"),
)
DROP_CITIES: tuple[tuple[str, str], ...] = (
    ("Austin", "73301"),
    ("Jacksonville", "32099"),
    ("Fort Worth", "76101"),
    ("Columbus", "43004"),
    ("Charlotte", "28201"),
    ("San Francisco", "94102"),
    ("Indianapolis", "46201"),
    ("Seattle", "98101"),
    ("Denver", "80201"),
    ("Boston", "02108"),
)


def _build_dummy_consignment(index: int) -> dict[str, Any]:
    """Build one deterministic dummy consignment payload for the given index."""
    pickup_city, pickup_pincode = PICKUP_CITIES[(index - 1) % len(PICKUP_CITIES)]
    drop_city, drop_pincode = DROP_CITIES[(index + 2) % len(DROP_CITIES)]
    pickup_date = BASE_PICKUP_DATE + timedelta(days=index - 1)

    return {
        "consignment_num": f"CN{index:014d}",
        "status": STATUSES[(index - 1) % len(STATUSES)],
        "pickup_address": f"Warehouse {(index % 25) + 1}, {100 + index} Test Pickup Road, {pickup_city}",
        "pickup_pincode": pickup_pincode,
        "pickup_tag": f"{pickup_city} Pickup Hub",
        "pickup_date": pickup_date,
        "drop_address": f"Customer Dock {(index % 30) + 1}, {500 + index} Test Drop Avenue, {drop_city}",
        "drop_pincode": drop_pincode,
        "drop_tag": f"{drop_city} Delivery Zone",
        "drop_date": pickup_date + timedelta(days=(index % 5) + 1),
    }


DUMMY_CONSIGNMENTS: list[dict[str, Any]] = [
    _build_dummy_consignment(index) for index in range(1, 101)
]
"""The canonical 100-record consignment dataset for dashboard testing."""


def get_dummy_consignments() -> list[dict[str, Any]]:
    """Return a copy of the 100 dummy consignment dictionaries."""
    return [record.copy() for record in DUMMY_CONSIGNMENTS]


def get_dummy_consignment_models() -> list[Any]:
    """Return the dummy dataset as SQLAlchemy ``Consignment`` instances."""
    from model import Consignment

    return [Consignment(**record) for record in get_dummy_consignments()]


def feed_dummy_consignments(
    session: Any,
    records: Sequence[dict[str, Any]] | None = None,
    *,
    replace_existing: bool = True,
    commit: bool = True,
) -> list[Any]:
    """Feed dummy consignments into an existing SQLAlchemy session.

    Args:
        session: Active SQLAlchemy session bound to the project database.
        records: Optional consignment payloads. Defaults to the canonical 100.
        replace_existing: When true, update matching ``consignment_num`` rows;
            when false, add rows and let the database report duplicate keys.
        commit: Commit immediately when true; otherwise leave the transaction open.

    Returns:
        The ``Consignment`` ORM objects added or merged into the session.
    """
    from model import Consignment

    payloads: Iterable[dict[str, Any]] = records or get_dummy_consignments()
    consignments = [Consignment(**record) for record in payloads]

    if replace_existing:
        persisted = [session.merge(consignment) for consignment in consignments]
    else:
        session.add_all(consignments)
        persisted = consignments

    if commit:
        session.commit()

    return persisted


def feed_dummy_consignments_directly(*, initialize_schema: bool = False) -> list[Any]:
    """Open a project DB session and feed the canonical 100 dummy consignments.

    Set ``initialize_schema=True`` for local bootstrap databases that do not have
    tables yet. Production-like environments should keep this false and rely on
    migrations/schema setup already present in the project.
    """
    from db.connection import SessionLocal, init_db

    if initialize_schema:
        init_db()

    with SessionLocal() as session:
        return feed_dummy_consignments(session)


if __name__ == "__main__":
    inserted = feed_dummy_consignments_directly(initialize_schema=True)
    print(f"Fed {len(inserted)} dummy consignments into the project database.")
