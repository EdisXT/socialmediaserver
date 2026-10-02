import resend

from .config import settings


resend.api_key = settings.resend_api_key


def send_verification_email(email: str, token: str):
    verification_url = (
        f"{settings.api_url}/users/verify-email?token={token}"
    )

    params = {
        "from": "Emberly <hello@emberlylife.net>",
        "to": [email],
        "subject": "Verify your email",
        "text": f"""
Welcome to Emberly!

Please verify your email by clicking the link below:

{verification_url}

This link expires in 30 minutes.
""",
    }

    return resend.Emails.send(params)


def send_password_reset_email(email: str, token: str):
    reset_url = (
        f"{settings.frontend_url}/reset-password?token={token}"
    )

    params = {
        "from": "Emberly <hello@emberlylife.net>",
        "to": [email],
        "subject": "Reset your password",
        "text": f"""
You requested a password reset.

Click the link below to reset your password:

{reset_url}

This link expires in 15 minutes.

If you did not request a password reset, you can ignore this email.
""",
    }

    return resend.Emails.send(params)
