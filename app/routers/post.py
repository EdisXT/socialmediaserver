from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import date
from .. import models, schemas, oauth2
from ..database import get_db
from sqlalchemy import func, or_
        
router = APIRouter(
    prefix="/posts",
    tags=['Posts']
)


@router.post('/', status_code=status.HTTP_201_CREATED, response_model=schemas.Post)
def create_posts(post : schemas.PostCreate, db : Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)):
    new_post = models.Post(user_id=current_user.id, **post.dict())
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@router.get('/', response_model=List[schemas.PostOut])
def get_posts(
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
    limit: int = 10,
    skip: int = 0,
    search: Optional[str] = "",
    country: Optional[str] = None,
    city: Optional[str] = None,
    trip_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    sort: Optional[str] = "newest"
):

    query = db.query(
        models.Post,
        func.count(models.Vote.post_id).label("votes")
    ).join(
        models.Vote,
        models.Vote.post_id == models.Post.id,
        isouter=True
    ).group_by(
        models.Post.id
    ).filter(
    or_(
        models.Post.title.ilike(f"%{search}%"),
        models.Post.country.ilike(f"%{search}%"),
        models.Post.city.ilike(f"%{search}%")
    )
)
    
    if country:
        query = query.filter(models.Post.country.ilike(country))

    if city:
        query = query.filter(models.Post.city.ilike(city))

    if trip_type:
        query = query.filter(models.Post.trip_type.ilike(trip_type))

    if start_date:
        query = query.filter(models.Post.start_date >= start_date)

    if end_date:
        query = query.filter(models.Post.end_date <= end_date)

    if sort == "oldest":
        query = query.order_by(models.Post.created_at.asc())
    elif sort == "most_liked":
        query = query.order_by(func.count(models.Vote.post_id).desc())
    else:
        query = query.order_by(models.Post.created_at.desc())

    posts = query.limit(limit).offset(skip).all()

    return posts

@router.get('/{id}', response_model=schemas.Post)
def get_post(
    id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    post = db.query(models.Post).filter(
        models.Post.id == id
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with id {id} does not exist"
        )

    return post

@router.delete('/{id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_post(id: int, db : Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)): 
    post_query = db.query(models.Post).filter(models.Post.id == id)

    post = post_query.first()
    if post == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                             detail=f"post with the id {id} does not exist")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                             detail="not authorized to preform requested action")
    post_query.delete(synchronize_session = False)
    db.commit()

    
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.put('/{id}', response_model=schemas.Post)
def update_post(id: int, updated_post: schemas.PostCreate, db : Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)):
    post_query = db.query(models.Post).filter(models.Post.id == id)
    post = post_query.first()
    if post == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                             detail=f"post with the id {id} does not exist")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                             detail="not authorized to preform requested action")
    post_query.update(updated_post.dict(), synchronize_session=False)
    db.commit()

    return post_query.first()

@router.post("/{post_id}/images", status_code=status.HTTP_201_CREATED)
def add_post_image(
    post_id: int,
    image: schemas.PostImageCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    post = db.query(models.Post).filter(
        models.Post.id == post_id
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post does not exist"
        )

    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add images to this post"
    )

    new_image = models.PostImage(
    post_id=post_id,
    image_url=image.image_url
)

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image

@router.get("/{post_id}/images")
def get_post_images(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    images = db.query(models.PostImage).filter(
        models.PostImage.post_id == post_id
    ).all()

    return images

@router.delete("/{post_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post_image(
    post_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    image = db.query(models.PostImage).filter(
        models.PostImage.id == image_id,
        models.PostImage.post_id == post_id
    ).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image does not exist for this post"
        )

    post = db.query(models.Post).filter(
    models.Post.id == post_id
).first()

    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete images from this post"
    )

    db.delete(image)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)