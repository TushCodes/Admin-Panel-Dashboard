"""Document ORM model."""
from __future__ import annotations
from typing import Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import Base


class Document(Base):
    __tablename__ = "documents"

    document_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("consignments.consignment_num", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    pod: Mapped[Optional[str]] = mapped_column(Text)
    invoice: Mapped[Optional[str]] = mapped_column(Text)

    consignment: Mapped["Consignment"] = relationship(
        "Consignment",
        back_populates="document",
        passive_deletes=True,
    )
