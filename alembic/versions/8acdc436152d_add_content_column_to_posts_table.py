"""add content column to posts table

Revision ID: 8acdc436152d
Revises: 409f55d3a056
Create Date: 2026-07-16 10:19:35.917440

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8acdc436152d'
down_revision: Union[str, Sequence[str], None] = '409f55d3a056'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('posts', sa.Column('content', sa.String(), nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('posts', 'content')
