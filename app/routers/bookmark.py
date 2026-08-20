from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, oauth2
from ..database import get_db


router = APIRouter(
    prefix="/bookmarks",
    tags=["Bookmarks"]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_bookmark(
    bookmark: schemas.BookmarkCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    post = db.query(models.Post).filter(
        models.Post.id == bookmark.post_id
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post does not exist"
        )

    existing_bookmark = db.query(models.Bookmark).filter(
        models.Bookmark.post_id == bookmark.post_id,
        models.Bookmark.user_id == current_user.id
    ).first()

    if existing_bookmark:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Post already bookmarked"
        )

    new_bookmark = models.Bookmark(
        post_id=bookmark.post_id,
        user_id=current_user.id
    )

    db.add(new_bookmark)
    db.commit()

    return {"message": "Post bookmarked successfully"}

@router.get("/")
def get_my_bookmarks(
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    saved_posts = (
        db.query(models.Post)
        .join(
            models.Bookmark,
            models.Bookmark.post_id == models.Post.id
        )
        .filter(
            models.Bookmark.user_id == current_user.id
        )
        .all()
    )

    return saved_posts

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookmark(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    bookmark_query = db.query(models.Bookmark).filter(
        models.Bookmark.post_id == post_id,
        models.Bookmark.user_id == current_user.id
    )

    bookmark = bookmark_query.first()

    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark does not exist"
        )

    bookmark_query.delete(synchronize_session=False)
    db.commit()