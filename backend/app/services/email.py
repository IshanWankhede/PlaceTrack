import smtplib
from email.mime.text import MIMEText
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, body: str) -> bool:
    """Sends a plain text email via the configured SMTP server (Mailpit in development)."""
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = settings.mail_from
    msg["To"] = to_email

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=5) as server:
            server.send_message(msg)
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def send_otp_email(to_email: str, purpose: str, otp_code: str) -> bool:
    """Formats and sends an OTP email."""
    subject = f"PlaceTrack - Your {purpose.replace('_', ' ').title()} OTP Code"
    body = (
        f"Hello,\n\n"
        f"Your verification code for PlaceTrack ({purpose}) is:\n\n"
        f"    {otp_code}\n\n"
        f"This code will expire in 10 minutes. Do not share it with anyone.\n\n"
        f"Regards,\n"
        f"PlaceTrack Team"
    )
    return send_email(to_email, subject, body)
