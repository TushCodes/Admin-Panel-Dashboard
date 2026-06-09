"""Consignment ORM model."""
from __future__ import annotations

from datetime import date
from typing import Optional

from sqlalchemy import Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import Base


class Consignment(Base):
    __tablename__ = "consignments"

    consignment_num: Mapped[str] = mapped_column(
        String(64), primary_key=True, unique=True, nullable=False
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
