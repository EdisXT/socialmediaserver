from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, oauth2
from ..database import get_db


router = APIRouter(
    prefix="/tags",
    tags=["Tags"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_tag(
    name: str,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    existing_tag = db.query(models.Tag).filter(
        models.Tag.name.ilike(name)
    ).first()

    if existing_tag:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tag already exists"
        )

    new_tag = models.Tag(name=name)

    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)

    return new_tag

@router.post("/attach", status_code=status.HTTP_201_CREATED)
def attach_tag(
    post_tag: schemas.PostTagCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    post = db.query(models.Post).filter(
        models.Post.id == post_tag.post_id
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post does not exist"
        )

    tag = db.query(models.Tag).filter(
        models.Tag.id == post_tag.tag_id
    ).first()

    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag does not exist"
        )

    existing_post_tag = db.query(models.PostTag).filter(models.PostTag.post_id == post_tag.post_id,
                                                         models.PostTag.tag_id == post_tag.tag_id).first()

    if existing_post_tag:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                             detail="Tag is already attached to this post")

    new_post_tag = models.PostTag(post_id=post_tag.post_id,
                                   tag_id=post_tag.tag_id)

    db.add(new_post_tag)
    db.commit()

    return {"message": "Tag attached to post sucessfully"}

@router.get("/post/{post_id}")
def get_tags_for_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    tags = (
        db.query(models.Tag)
        .join(
            models.PostTag,
            models.PostTag.tag_id == models.Tag.id
        )
        .filter(
            models.PostTag.post_id == post_id
        )
        .all()
    )

    return tags

@router.delete("/post/{post_id}/tag/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_tag_from_post(
    post_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    post_tag_query = db.query(models.PostTag).filter(
        models.PostTag.post_id == post_id,
        models.PostTag.tag_id == tag_id
    )

    post_tag = post_tag_query.first()

    if not post_tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag is not attached to this post"
        )

    post_tag_query.delete(synchronize_session=False)
    db.commit()