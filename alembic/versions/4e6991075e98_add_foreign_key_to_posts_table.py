"""add foreign-key to posts table

Revision ID: 4e6991075e98
Revises: d5e7bedf6000
Create Date: 2026-07-16 10:56:54.217901

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4e6991075e98'
down_revision: Union[str, Sequence[str], None] = 'd5e7bedf6000'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('posts', sa.Column('owner_id', sa.Integer(), nullable=False))
    op.create_foreign_key('posts_users_fk', source_table="posts", referent_table="users",
                          local_cols=['owner_id'], remote_cols=['id'], ondelete="CASCADE")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('posts_users_fk', table_name="posts")
    op.drop_column('posts', "owner_id")
