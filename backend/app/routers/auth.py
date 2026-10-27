from fastapi import APIRouter, Depends, status
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.errors import AppException, ConflictError, NotFoundError, UnauthorizedError
from app.core.security import create_access_token, get_password_hash, verify_password
from app.crud.crud_student import build_student_out, get_student
from app.database.database import get_db
from app.models.user import User
from datetime import datetime
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    OtpValidateRequest,
    ResetPasswordRequest,
    SignupRequestOtp,
    SignupVerify,
    TokenResponse,
    UserOut,
)
from app.services.email import send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates a user via email and password, returning a JWT access token."""
    email = login_data.email.lower().strip()
    stmt = select(User).where(User.email == email)
    user = db.execute(stmt).scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise UnauthorizedError("Incorrect email or password")

    if not user.is_active:
        raise AppException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Please contact CDC staff.",
            code="ACCOUNT_DISABLED",
        )

    access_token = create_access_token(subject=user.id, role=user.role)

    student_out = None
    if user.student_id:
        student_obj = get_student(db, user.student_id)
        if student_obj:
            student_out = build_student_out(student_obj)

    user_out = UserOut(
        id=user.id,
        email=user.email,
        role=user.role,
        student_id=user.student_id,
        is_active=user.is_active,
        created_at=user.created_at,
        student=student_out,
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_out)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns the profile of the currently authenticated user."""
    student_out = None
    if current_user.student_id:
        student_obj = get_student(db, current_user.student_id)
        if student_obj:
            student_out = build_student_out(student_obj)

    return UserOut(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        student_id=current_user.student_id,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        student=student_out,
    )


@router.post("/signup/request-otp")
def request_signup_otp(req: SignupRequestOtp, db: Session = Depends(get_db)):
    """Requests a 6-digit signup OTP for a student present on the CDC roster."""
    roll = req.roll_number.upper().strip()
    email = req.email.lower().strip()

    # Call fn_find_student_for_signup(:roll, :email)
    student_id = db.execute(
        text("SELECT fn_find_student_for_signup(:roll, :email)"),
        {"roll": roll, "email": email},
    ).scalar()

    if not student_id:
        # Check if already registered
        user_exists = db.execute(
            text(
                "SELECT 1 FROM users u "
                "JOIN students s ON s.id = u.student_id "
                "WHERE s.roll_number = :roll OR u.email = :email"
            ),
            {"roll": roll, "email": email},
        ).scalar()
        if user_exists:
            raise ConflictError("An account for this student or email already exists")
        raise NotFoundError("Student not found on the roster or details do not match")

    # Generate OTP via SQL function
    otp = db.execute(
        text("SELECT fn_generate_otp(:email, 'SIGNUP')"),
        {"email": email},
    ).scalar()
    db.commit()

    # Send email via mailpit
    send_otp_email(email, "SIGNUP", otp)

    return {
        "status": "ok",
        "message": f"Verification code sent to {email}",
    }


@router.post("/signup/validate-otp")
def validate_signup_otp(req: OtpValidateRequest, db: Session = Depends(get_db)):
    """Validates the OTP code without consuming it, allowing pre-flight UI check."""
    email = req.email.lower().strip()
    purpose = req.purpose.upper().strip()

    row = db.execute(
        text(
            "SELECT otp_hash, expires_at, attempts, consumed "
            "FROM email_otps "
            "WHERE email = :email AND purpose = :purpose AND NOT consumed "
            "ORDER BY id DESC LIMIT 1"
        ),
        {"email": email, "purpose": purpose},
    ).mappings().first()

    if not row:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code",
            code="INVALID_OTP",
        )

    if row["expires_at"] < datetime.now() or row["attempts"] >= 5:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired or maximum attempts reached",
            code="OTP_EXPIRED",
        )

    is_match = db.execute(
        text("SELECT (crypt(:otp, :hash) = :hash) AS match"),
        {"otp": req.otp.strip(), "hash": row["otp_hash"]},
    ).scalar()

    if not is_match:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code",
            code="INVALID_OTP",
        )

    return {"status": "ok", "valid": True}


@router.post("/signup/verify", response_model=TokenResponse)
def verify_signup(req: SignupVerify, db: Session = Depends(get_db)):
    """Verifies the signup OTP and creates the STUDENT login account."""
    email = req.email.lower().strip()

    # Verify OTP
    is_valid = db.execute(
        text("SELECT fn_verify_otp(:email, 'SIGNUP', :otp)"),
        {"email": email, "otp": req.otp.strip()},
    ).scalar()
    db.commit()

    if not is_valid:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code",
            code="INVALID_OTP",
        )

    # Find student row
    student_row = db.execute(
        text("SELECT id FROM students WHERE email = :email"),
        {"email": email},
    ).mappings().first()

    if not student_row:
        raise NotFoundError("Student record not found for this email")

    student_id = student_row["id"]

    # Check if user already exists
    existing_user = db.execute(
        select(User).where((User.email == email) | (User.student_id == student_id))
    ).scalar_one_or_none()
    if existing_user:
        raise ConflictError("An account already exists for this student")

    # Create user
    password_hash = get_password_hash(req.password)
    user = User(
        email=email,
        password_hash=password_hash,
        role="STUDENT",
        student_id=student_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.id, role=user.role)
    student_obj = get_student(db, student_id)
    student_out = build_student_out(student_obj) if student_obj else None

    user_out = UserOut(
        id=user.id,
        email=user.email,
        role=user.role,
        student_id=user.student_id,
        is_active=user.is_active,
        created_at=user.created_at,
        student=student_out,
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_out)


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Sends a password reset OTP if the email exists."""
    email = req.email.lower().strip()
    stmt = select(User).where(User.email == email)
    user = db.execute(stmt).scalar_one_or_none()

    if not user:
        # Don't leak account existence, but return ok
        return {"status": "ok", "message": "If an account exists, a reset code was sent."}

    otp = db.execute(
        text("SELECT fn_generate_otp(:email, 'PASSWORD_RESET')"),
        {"email": email},
    ).scalar()
    db.commit()

    send_otp_email(email, "PASSWORD_RESET", otp)
    return {"status": "ok", "message": "If an account exists, a reset code was sent."}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Verifies the password reset OTP and updates the password."""
    email = req.email.lower().strip()

    is_valid = db.execute(
        text("SELECT fn_verify_otp(:email, 'PASSWORD_RESET', :otp)"),
        {"email": email, "otp": req.otp.strip()},
    ).scalar()
    db.commit()

    if not is_valid:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code",
            code="INVALID_OTP",
        )

    stmt = select(User).where(User.email == email)
    user = db.execute(stmt).scalar_one_or_none()
    if not user:
        raise NotFoundError("User not found")

    user.password_hash = get_password_hash(req.new_password)
    db.commit()

    return {"status": "ok", "message": "Password has been successfully updated"}
