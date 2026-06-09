"""Consignment ORM model."""
from __future__ import annotations

import re
from datetime import date
from typing import Optional

from sqlalchemy import CheckConstraint, Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from . import Base


_CONSIGNMENT_NUM_PATTERN = re.compile(r"^[A-Za-z0-9]{1,16}$")


class Consignment(Base):
    __tablename__ = "consignments"
    __table_args__ = (
        CheckConstraint(
            "length(consignment_num) <= 16",
            name="ck_consignments_consignment_num_length",
        ),
    )

    consignment_num: Mapped[str] = mapped_column(
        String(16), primary_key=True, unique=True, nullable=False
    )
    status: Mapped[Optional[str]] = mapped_column(String(50))
    pickup_address: Mapped[Optional[str]] = mapped_column(Text)
    pickup_pincode: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    pickup_tag: Mapped[Optional[str]] = mapped_column(String(100))
    pickup_date: Mapped[Optional[date]] = mapped_column(Date)
    drop_address: Mapped[Optional[str]] = mapped_column(Text)
    drop_pincode: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    drop_tag: Mapped[Optional[str]] = mapped_column(String(100))
    drop_date: Mapped[Optional[date]] = mapped_column(Date)

    document: Mapped[Optional["Document"]] = relationship(
        "Document",
        back_populates="consignment",
        cascade="all, delete-orphan",
        uselist=False,
        single_parent=True,
    )

    @validates("consignment_num")
    def validate_consignment_num(self, key: str, value: str) -> str:
        if not _CONSIGNMENT_NUM_PATTERN.fullmatch(value):
            raise ValueError("consignment_num must be 1 to 16 alphanumeric characters")
        return value
