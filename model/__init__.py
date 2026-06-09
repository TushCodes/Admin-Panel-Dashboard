"""Shared model exports for the Admin Panel Dashboard."""

from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
	"""Base class for all SQLAlchemy ORM models."""

# Import model classes so `from model import Consignment` works for consumers.
# Use direct imports here to keep package imports simple; modules use
# string-based relationship targets to avoid import cycles.
from .consignment import Consignment  # noqa: F401
from .document import Document  # noqa: F401
from .lead import Lead  # noqa: F401

__all__ = ["Base", "Consignment", "Document", "Lead"]
