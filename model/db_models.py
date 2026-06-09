"""SQLAlchemy ORM models for the Admin Panel Dashboard.

The models in this module define the database tables for consignments,
consignment documents, and inbound leads.
"""

from datetime import date
from typing import Optional

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""


class Consignment(Base):
    """Shipment consignment record."""

    __tablename__ = "consignments"

    consignment_num: Mapped[str] = mapped_column(
        String(64),
        primary_key=True,
        unique=True,
        nullable=False,
    )
    status: Mapped[Optional[str]] = mapped_column(String(50))
    pickup_address: Mapped[Optional[str]] = mapped_column(Text)
    pickup_pincode: Mapped[Optional[str]] = mapped_column(String(20))
    pickup_tag: Mapped[Optional[str]] = mapped_column(String(100))
    pickup_date: Mapped[Optional[date]] = mapped_column(Date)
    drop_address: Mapped[Optional[str]] = mapped_column(Text)
    drop_pincode: Mapped[Optional[str]] = mapped_column(String(20))
    drop_tag: Mapped[Optional[str]] = mapped_column(String(100))
    drop_date: Mapped[Optional[date]] = mapped_column(Date)

    document: Mapped[Optional["Document"]] = relationship(
        back_populates="consignment",
        cascade="all, delete-orphan",
        uselist=False,
    )


class Document(Base):
    """Documents associated with a consignment."""

    __tablename__ = "documents"

    document_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("consignments.consignment_num"),
        primary_key=True,
        nullable=False,
    )
    pod: Mapped[Optional[str]] = mapped_column(Text)
    invoice: Mapped[Optional[str]] = mapped_column(Text)

    consignment: Mapped["Consignment"] = relationship(back_populates="document")


class Lead(Base):
    """Inbound lead or contact form submission."""

    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    subject: Mapped[Optional[str]] = mapped_column(String(255))
    message: Mapped[Optional[str]] = mapped_column(Text)
