"""remove old owner_id from posts

Revision ID: 6bc871d945c7
Revises: 7ab8c990a7d4
Create Date: 2026-08-09 18:22:36.876781

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6bc871d945c7'
down_revision: Union[str, Sequence[str], None] = '7ab8c990a7d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint('posts_users_fk', 'posts', type_='foreignkey')
    op.drop_column('posts', 'owner_id')


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column(
        'posts',
        sa.Column('owner_id', sa.Integer(), nullable=False)
    )

    op.create_foreign_key(
        'posts_users_fk',
        'posts',
        'users',
        ['owner_id'],
        ['id'],
        ondelete='CASCADE'
    )
