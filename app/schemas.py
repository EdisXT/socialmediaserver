from pydantic import BaseModel, EmailStr, Field, model_validator
from datetime import datetime, date
from typing import Annotated, Optional, List


class PostBase(BaseModel):
    title: str
    content: str
    country: Optional[str] = None
    city: Optional[str] = None
    trip_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    image_url: Optional[str] = None
    published: bool = True

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date cannot be before start_date")

        return self

class PostCreate(PostBase):
    pass

class UserOut(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    home_country: Optional[str] = None
    created_at: datetime

    model_config = {
        "from_attributes": True
}

class UserPublic(BaseModel):
    id: int
    username: Optional[str] = None
    profile_picture: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class UserProfile(BaseModel):
    id: int
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    home_country: Optional[str] = None
    followers_count: int
    following_count: int
    is_following: bool

class PostImageOut(BaseModel):
    id: int
    image_url: str

    model_config = {
        "from_attributes": True
}

class TagOut(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
}

class Post(PostBase):
    id: int
    created_at: datetime
    user_id: int
    owner: UserPublic
    images: List[PostImageOut] = []
    tags: List[TagOut] = []

    model_config = {
        "from_attributes": True
}

class PostOut(BaseModel):
    Post: Post
    votes: int
    is_liked: bool
    is_bookmarked: bool
    comments_count: int
    is_following_owner: bool

    model_config = {
        "from_attributes": True
}

class CommentCreate(BaseModel):
    content: str
    post_id: int

class CommentUpdate(BaseModel):
    content: str


class CommentOut(BaseModel):
    id: int
    content: str
    user_id: int
    post_id: int
    created_at: datetime
    owner: UserPublic

    model_config = {
        "from_attributes": True
}

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    home_country: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: int

class Like(BaseModel):
    post_id: int
    dir: Annotated[int, Field(le=1)]

class BookmarkCreate(BaseModel):
    post_id: int

class PostTagCreate(BaseModel):
    post_id: int
    tag_id: int

class PostImageCreate(BaseModel):
    image_url: str

class NotificationOut(BaseModel):
    id: int
    user_id: int
    actor_id: int
    type: str
    post_id: Optional[int] = None
    is_read: bool
    created_at: datetime
    actor: UserPublic

    model_config = {
        "from_attributes": True
    }

class MessageCreate(BaseModel):
    receiver_id: int
    content: str


class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class ConversationOut(BaseModel):
    user: UserPublic
    last_message: str
    last_message_at: datetime
    unread_count: int