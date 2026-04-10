"""add expires_at

Revision ID: 00dd5b4c0502
Revises: 9ec82140536e
Create Date: 2026-04-07 20:57:30.729520

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "00dd5b4c0502"
down_revision: Union[str, Sequence[str], None] = "9ec82140536e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "urls", sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True)
    )
    op.alter_column(
        "urls",
        "expires_at",
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('urls', 'expires_at')
