"""add country and city to posts

Revision ID: 7ab8c990a7d4
Revises: 25374e17a377
Create Date: 2026-08-09 16:09:01.366657

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7ab8c990a7d4'
down_revision: Union[str, Sequence[str], None] = '25374e17a377'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'posts',
        sa.Column('country', sa.String(), nullable=True)
    )

    op.add_column(
        'posts',
        sa.Column('city', sa.String(), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('posts', 'city')
    op.drop_column('posts', 'country')