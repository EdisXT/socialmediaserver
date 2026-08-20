from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date
from sqlalchemy.sql.expression import text
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import TIMESTAMP
from .database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key = True, nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    published = Column(Boolean, server_default='TRUE', nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)
    trip_type = Column(String, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    owner = relationship("User")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key = True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    username = Column(String, unique=True, nullable=True)
    bio = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    home_country = Column(String, nullable=True)
    password = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, nullable=False)
    content = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(
    TIMESTAMP(timezone=True),
    nullable=False,
    server_default=text('now()')
)

class Vote(Base):
    __tablename__ = "votes"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)

class Bookmark(Base):
    __tablename__ = "bookmarks"
    
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )

    post_id = Column(
        Integer,
        ForeignKey("posts.id", ondelete="CASCADE"),
        primary_key=True
    )