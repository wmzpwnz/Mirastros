"""Email service for sending verification and password reset emails"""
import secrets
import asyncio
import logging
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class EmailService:
    """Service for handling email operations"""

    @staticmethod
    def generate_token() -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)

    @staticmethod
    async def send_email(to_email: str, subject: str, body: str, is_html: bool = True) -> bool:
        """
        Send email via SMTP or SendGrid

        Supports:
        - SMTP server
        - SendGrid API
        """
        try:
            if settings.SENDGRID_API_KEY:
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail
                message = Mail(
                    from_email=settings.SMTP_FROM_EMAIL,
                    to_emails=to_email,
                    subject=subject,
                    html_content=body if is_html else None,
                    plain_text_content=None if is_html else body,
                )
                response = await asyncio.to_thread(
                    SendGridAPIClient(settings.SENDGRID_API_KEY).send, message
                )
                return response.status_code == 202
            if not settings.SMTP_HOST:
                logger.warning("Email transport is not configured; delivery skipped")
                return False
            msg = MIMEMultipart('alternative')
            msg['Subject'], msg['From'], msg['To'] = subject, settings.SMTP_FROM_EMAIL, to_email
            msg.attach(MIMEText(body, 'html' if is_html else 'plain', 'utf-8'))
            await aiosmtplib.send(
                msg, hostname=settings.SMTP_HOST, port=settings.SMTP_PORT,
                username=settings.SMTP_USER or None,
                password=settings.SMTP_PASSWORD or None,
                use_tls=settings.SMTP_PORT == 465,
                start_tls=settings.SMTP_USE_TLS if settings.SMTP_PORT != 465 else None,
                timeout=20,
            )
            return True
        except Exception as exc:
            # Do not log recipient, body, tokens, credentials or provider responses.
            logger.error("Email delivery failed (%s)", type(exc).__name__)
            return False

    @staticmethod
    async def create_verification_token(
        db: AsyncSession,
        user: User
    ) -> str:
        """Create email verification token for user"""
        token = EmailService.generate_token()
        user.email_verification_token = token
        user.email_verification_expires = datetime.now(timezone.utc) + timedelta(hours=24)
        await db.commit()
        return token
    
    @staticmethod
    async def send_verification_email(
        db: AsyncSession,
        user: User,
        frontend_url: str = "https://www.mirastros.com"
    ) -> bool:
        """Send email verification email"""
        token = await EmailService.create_verification_token(db, user)
        verification_url = f"{frontend_url}/auth/verify-email?token={token}"
        
        subject = "Verify your Mirastros account"
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #050505 0%, #1a1a1a 100%); padding: 40px; text-align: center;">
                <h1 style="color: #FFD700; margin: 0;">✨ Mirastros ✨</h1>
            </div>
            <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #050505;">Welcome to Mirastros!</h2>
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    Thank you for registering. Please verify your email address to activate your account.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="background: #FFD700; color: #050505; padding: 15px 40px; 
                              text-decoration: none; border-radius: 5px; font-weight: bold;
                              display: inline-block;">
                        Verify Email
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Or copy and paste this link into your browser:<br>
                    <a href="{verification_url}" style="color: #FFD700;">{verification_url}</a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    This link will expire in 24 hours.
                </p>
            </div>
            <div style="background: #f5f5f5; padding: 20px; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2025 Mirastros. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        """
        
        return await EmailService.send_email(user.email, subject, body)
    
    @staticmethod
    async def verify_email_token(
        db: AsyncSession,
        token: str
    ) -> Optional[User]:
        """Verify email token and mark email as verified"""
        result = await db.execute(
            select(User).where(User.email_verification_token == token)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        # Check if token expired
        if user.email_verification_expires < datetime.now(timezone.utc):
            return None
        
        # Mark email as verified
        user.email_verified = True
        user.email_verification_token = None
        user.email_verification_expires = None
        await db.commit()
        
        return user
    
    @staticmethod
    async def create_password_reset_token(
        db: AsyncSession,
        user: User
    ) -> str:
        """Create password reset token for user"""
        token = EmailService.generate_token()
        user.password_reset_token = token
        user.password_reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        await db.commit()
        return token
    
    @staticmethod
    async def send_password_reset_email(
        db: AsyncSession,
        user: User,
        frontend_url: str = "https://www.mirastros.com"
    ) -> bool:
        """Send password reset email"""
        token = await EmailService.create_password_reset_token(db, user)
        reset_url = f"{frontend_url}/auth/reset-password?token={token}"
        
        subject = "Reset your Mirastros password"
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #050505 0%, #1a1a1a 100%); padding: 40px; text-align: center;">
                <h1 style="color: #FFD700; margin: 0;">✨ Mirastros ✨</h1>
            </div>
            <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #050505;">Password Reset Request</h2>
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    We received a request to reset your password. Click the button below to create a new password.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" 
                       style="background: #FFD700; color: #050505; padding: 15px 40px; 
                              text-decoration: none; border-radius: 5px; font-weight: bold;
                              display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Or copy and paste this link into your browser:<br>
                    <a href="{reset_url}" style="color: #FFD700;">{reset_url}</a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    This link will expire in 1 hour.
                </p>
                <p style="color: #999; font-size: 14px;">
                    If you didn't request a password reset, you can safely ignore this email.
                </p>
            </div>
            <div style="background: #f5f5f5; padding: 20px; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2025 Mirastros. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        """
        
        return await EmailService.send_email(user.email, subject, body)
    
    @staticmethod
    async def verify_password_reset_token(
        db: AsyncSession,
        token: str
    ) -> Optional[User]:
        """Verify password reset token"""
        result = await db.execute(
            select(User).where(User.password_reset_token == token)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        # Check if token expired
        if user.password_reset_expires < datetime.now(timezone.utc):
            return None
        
        return user
    
    @staticmethod
    async def reset_password(
        db: AsyncSession,
        user: User,
        new_password_hash: str
    ) -> None:
        """Reset user password and clear reset token"""
        user.password_hash = new_password_hash
        user.password_reset_token = None
        user.password_reset_expires = None
        await db.commit()
