from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Annotated, Optional
from pydantic import Field
from pydantic import model_validator

class PostBase(BaseModel):
    title: str
    content: str
    country: Optional[str] = None
    city: Optional[str] = None
    trip_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
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

    class Config:
        orm_mode = True

class Post(PostBase):
    id: int
    created_at: datetime
    user_id: int
    owner: UserOut

    class Config:
        orm_mode = True

class PostOut(BaseModel):
    Post: Post
    votes: int

    class Config:
        orm_mode = True

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

    class Config:
        orm_mode = True

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