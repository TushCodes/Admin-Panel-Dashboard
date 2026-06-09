"""Application logging configuration helpers.

The project uses Python's standard ``logging`` package behind a small helper so
modules can consistently request namespaced loggers without duplicating handler
configuration.
"""

from __future__ import annotations

import logging
import os
from typing import Final

_DEFAULT_LOGGER_NAME: Final[str] = "admin_panel_dashboard"
_DEFAULT_LOG_FORMAT: Final[str] = (
    "%(asctime)s %(levelname)s [%(name)s] %(message)s"
)
_CONFIGURED_LOGGERS: set[str] = set()


def _get_log_level() -> int:
    """Resolve the configured log level from ``LOG_LEVEL``.

    Invalid values fall back to ``INFO`` so a typo in the environment does not
    break application startup.
    """
    configured_level = os.getenv("LOG_LEVEL", "INFO").upper()
    return getattr(logging, configured_level, logging.INFO)


def get_logger(name: str | None = None) -> logging.Logger:
    """Return a configured project logger.

    Args:
        name: Optional child logger name. When omitted, the root project logger
            named ``admin_panel_dashboard`` is returned.

    Returns:
        A logger configured with one stream handler and a consistent formatter.
    """
    logger_name = _DEFAULT_LOGGER_NAME if not name else f"{_DEFAULT_LOGGER_NAME}.{name}"
    logger = logging.getLogger(logger_name)
    logger.setLevel(_get_log_level())

    if logger_name not in _CONFIGURED_LOGGERS:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(_DEFAULT_LOG_FORMAT))
        logger.addHandler(handler)
        logger.propagate = False
        _CONFIGURED_LOGGERS.add(logger_name)

    return logger
