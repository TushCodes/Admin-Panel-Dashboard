"""Bare minimum Alembic migration placeholder.

This module gives the project a starting Alembic revision that future schema
changes can build on. It intentionally performs no database operations yet.
"""

# Alembic revision identifiers.
revision = "0001_initial_placeholder"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Apply the migration.

    No schema changes are required for this placeholder revision.
    """
    pass


def downgrade() -> None:
    """Revert the migration.

    No schema changes are required for this placeholder revision.
    """
    pass
