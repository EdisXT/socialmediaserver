from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, utils, oauth2
from ..database import get_db

router = APIRouter(
    prefix="/users",
    tags=['Users']
)


@router.post('/', status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db : Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    if existing_user:
        raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Email already registered"
    )

    existing_username = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken"
        )
    #hash the pasword - user.password
    hashed_password = utils.hash(user.password)
    user.password = hashed_password
    new_user = models.User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get('/{id}', response_model=schemas.UserOut)
def get_user(id: int, db : Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id==id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                             detail=f'user with the id of : {id} was not found')
    return user

@router.put('/profile', response_model=schemas.UserOut)
def update_profile(
    updated_user: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    update_data = updated_user.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)

    return current_user

@router.post('/{user_id}/follow', status_code=status.HTTP_201_CREATED)
def follow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    user_to_follow = db.query(models.User).filter(models.User.id == user_id).first()

    if not user_to_follow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="User does not exist")

    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="You cannot follow yourself")

    existing_follow = db.query(models.Follow).filter(models.Follow.follower_id == current_user.id,
                                                     models.Follow.following_id == user_id).first()

    if existing_follow:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="You already follow this user")

    new_follow = models.Follow(
        follower_id=current_user.id,
        following_id=user_id
    ) 

    db.add(new_follow)
    db.commit()

    return {"message": "User followed sucessfully"}

@router.delete('/{user_id}/follow', status_code=status.HTTP_204_NO_CONTENT)
def unfollow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    follow_query = db.query(models.Follow).filter(
    models.Follow.follower_id == current_user.id,
    models.Follow.following_id == user_id
    )

    follow = follow_query.first()

    if not follow:
        raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="You are not following this user"
    )

    follow_query.delete(synchronize_session=False)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get('/{user_id}/followers', response_model=List[schemas.UserPublic])
def get_followers(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    followers = (
    db.query(models.User)
    .join(
        models.Follow,
        models.Follow.follower_id == models.User.id
    )
    .filter(
        models.Follow.following_id == user_id
    )
    .all()
)

    return followers

@router.get('/{user_id}/following', response_model=List[schemas.UserPublic])
def get_following(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    following = (
    db.query(models.User)
    .join(
        models.Follow,
        models.Follow.following_id == models.User.id
    )
    .filter(
        models.Follow.follower_id == user_id
    )
    .all()
)

    return following

@router.get('/{user_id}/profile', response_model=schemas.UserProfile)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not exist"
        )

    followers_count = db.query(models.Follow).filter(
        models.Follow.following_id == user_id
    ).count()

    following_count = db.query(models.Follow).filter(
        models.Follow.follower_id == user_id
    ).count()

    is_following = db.query(models.Follow).filter(
    models.Follow.follower_id == current_user.id,
    models.Follow.following_id == user_id).first() is not None

    return {
        "id": user.id,
        "username": user.username,
        "bio": user.bio,
        "profile_picture": user.profile_picture,
        "home_country": user.home_country,
        "followers_count": followers_count,
        "following_count": following_count,
        "is_following": is_following
    }