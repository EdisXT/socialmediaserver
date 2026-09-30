from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List

from .. import models, schemas, oauth2
from ..database import get_db


router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)

# SEND A MESSAGE
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.MessageOut
)
def send_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    receiver = db.query(models.User).filter(
        models.User.id == message.receiver_id
    ).first()

    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver does not exist"
        )

    if message.receiver_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot message yourself"
        )

    # Create the message
    new_message = models.Message(
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        content=message.content
    )

    # Create a notification for the receiver
    new_notification = models.Notification(
        user_id=message.receiver_id,
        actor_id=current_user.id,
        type="message"
    )

    # Save both together
    db.add(new_message)
    db.add(new_notification)

    db.commit()

    db.refresh(new_message)

    return new_message


# GET INBOX / CONVERSATION LIST
@router.get(
    "/conversations",
    response_model=List[schemas.ConversationOut]
)
def get_conversations(
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    messages = db.query(models.Message).filter(
        or_(
            models.Message.sender_id == current_user.id,
            models.Message.receiver_id == current_user.id
        )
    ).order_by(
        models.Message.created_at.desc()
    ).all()

    conversations = []
    seen_users = set()

    for message in messages:

        # Figure out who the other person is
        if message.sender_id == current_user.id:
            other_user_id = message.receiver_id
        else:
            other_user_id = message.sender_id

        # Don't add the same user twice
        if other_user_id in seen_users:
            continue

        seen_users.add(other_user_id)

        # Get information about the other user
        other_user = db.query(models.User).filter(
            models.User.id == other_user_id
        ).first()

        # Count unread messages FROM that user TO current user
        unread_count = db.query(models.Message).filter(
            models.Message.sender_id == other_user_id,
            models.Message.receiver_id == current_user.id,
            models.Message.is_read == False
        ).count()

        conversations.append({
            "user": other_user,
            "last_message": message.content,
            "last_message_at": message.created_at,
            "unread_count": unread_count
        })

    return conversations

# GET MESSAGE HISTORY WITH ONE USER
@router.get(
    "/{user_id}",
    response_model=schemas.ConversationHistory
)
def get_conversation(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user)
):
    # Find unread messages BEFORE marking them as read.
    unread_messages = (
        db.query(models.Message)
        .filter(
            models.Message.sender_id == user_id,
            models.Message.receiver_id == current_user.id,
            models.Message.is_read == False
        )
        .order_by(models.Message.created_at.asc())
        .all()
    )

    first_unread_message_id = None

    if unread_messages:
        first_unread_message_id = unread_messages[0].id

    # Mark those messages as read.
    db.query(models.Message).filter(
        models.Message.sender_id == user_id,
        models.Message.receiver_id == current_user.id,
        models.Message.is_read == False
    ).update(
        {"is_read": True},
        synchronize_session=False
    )

    db.commit()

    # Get full conversation in chronological order.
    messages = (
        db.query(models.Message)
        .filter(
            or_(
                and_(
                    models.Message.sender_id == current_user.id,
                    models.Message.receiver_id == user_id
                ),
                and_(
                    models.Message.sender_id == user_id,
                    models.Message.receiver_id == current_user.id
                )
            )
        )
        .order_by(models.Message.created_at.asc())
        .all()
    )

    return {
        "messages": messages,
        "first_unread_message_id": first_unread_message_id
    }