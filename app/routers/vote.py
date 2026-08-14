from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from .. import schemas, models, database, oauth2

router = APIRouter(
    prefix='/likes',
    tags=['Likes']
)

@router.post('/', status_code=status.HTTP_201_CREATED)
def like(like: schemas.Like, db: Session = Depends(database.get_db),
          current_user: int = Depends(oauth2.get_current_user)):
    post = db.query(models.Post).filter(models.Post.id==like.post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id: {like.post_id} does not exist")
    vote_query =db.query(models.Vote).filter(models.Vote.post_id == like.post_id, models.Vote.user_id ==current_user.id)
    found_vote = vote_query.first()
    if (like.dir == 1):
        if found_vote:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                 detail=f"user {current_user.id} has already liked post {like.post_id}")
        new_vote = models.Vote(post_id = like.post_id, user_id = current_user.id)
        db.add(new_vote)
        db.commit()
        return {'message': 'successfully added like'}
    else:
        if not found_vote:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Like does not exist")
        vote_query.delete(synchronize_session=False)
        db.commit()
        return {'message': 'sucessfully removed like'}


