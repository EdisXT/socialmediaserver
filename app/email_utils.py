import smtplib
from email.message import EmailMessage

from .config import settings


def send_verification_email(email: str, token: str):
    verification_url = (
        f"{settings.api_url}/users/verify-email?token={token}"
    )

    message = EmailMessage()

    message["Subject"] = "Verify your email"
    message["From"] = settings.email_username
    message["To"] = email

    message.set_content(
        f"""
Welcome!

Please verify your email by clicking the link below:

{verification_url}

This link expires in 30 minutes.
"""
    )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(
            settings.email_username,
            settings.email_password
        )

        smtp.send_message(message)

def send_password_reset_email(email: str, token: str):
    reset_url = (
        f"{settings.frontend_url}/reset-password?token={token}"
    )

    message = EmailMessage()

    message["Subject"] = "Reset your password"
    message["From"] = settings.email_username
    message["To"] = email

    message.set_content(
        f"""
You requested a password reset.

Click the link below to reset your password:

{reset_url}

This link expires in 15 minutes.

If you did not request a password reset, you can ignore this email.
"""
    )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(
            settings.email_username,
            settings.email_password
        )

        smtp.send_message(message)