from fastapi import APIRouter, Depends, status, HTTPException, Response
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from .. import database, schemas, models, utils, oauth2, email_utils
from sqlalchemy.orm import Session

router = APIRouter(tags=['Authentication'])

@router.post('/login', response_model=schemas.Token)
def login(user_credentials : OAuth2PasswordRequestForm = Depends(), db : Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                             detail="Invalid Credentials")
    if not utils.verify(user_credentials.password, user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                             detail=f"Invalid Credentials")

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in"
    )
    #create a token
    #return token
    access_token = oauth2.create_access_token(data= {"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post('/resend-verification')
def resend_verification(
    request: schemas.ForgotPassword,
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(
        models.User.email == request.email
    ).first()

    if not user:
        return {
            "message": "If an unverified account with that email exists, a verification email has been sent"
        }

    if user.is_verified:
        return {
            "message": "This email is already verified. You can log in."
        }

    verification_token = oauth2.create_email_verification_token(
        user.id
    )

    email_utils.send_verification_email(
        user.email,
        verification_token
    )

    return {
        "message": "Verification email sent. Check your inbox."
    }

@router.post('/forgot-password')
def forgot_password(
    request: schemas.ForgotPassword,
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(
        models.User.email == request.email
    ).first()

    if not user:
        return {
            "message": "If an account with that email exists, a password reset link has been sent"
        }

    reset_token = oauth2.create_password_reset_token(
        user.id
    )

    email_utils.send_password_reset_email(
        user.email,
        reset_token
    )

    return {
        "message": "If an account with that email exists, a password reset link has been sent"
    }

@router.post('/reset-password')
def reset_password(
    request: schemas.ResetPassword,
    db: Session = Depends(database.get_db)
):
    user_id = oauth2.verify_password_reset_token(
        request.token
    )

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token"
        )

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    hashed_password = utils.hash(
        request.new_password
    )

    user.password = hashed_password

    db.commit()
    db.refresh(user)

    return {
        "message": "Password reset successfully"
    }