from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, select
from fastapi import status
from PIL import Image, UnidentifiedImageError
from io import BytesIO
import asyncio
from pathlib import Path
import uuid

from ..models.user import User
from ..schemas.user import UserUpdate
from ..services.utils import safe_commit
from ..core.security import hash_password, verify_password
from ..core.exceptions.base import ConflictError, NotFoundError


async def update_user(db: AsyncSession, user_id: int, data: UserUpdate):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise NotFoundError("User not found")

    if data.username or data.email:
        conditions = []

        if data.username:
            conditions.append(User.username == data.username)

        if data.email:
            conditions.append(User.email == data.email)

        result = await db.execute(
            select(User).where(or_(*conditions), User.id != user_id)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            if data.username and existing_user.username == data.username:
                raise ConflictError("Username already exists")
            if data.email and existing_user.email == data.email:
                raise ConflictError("Email already exists")

    if data.new_password and not data.password:
        raise ConflictError("Current password is required to set a new password")

    if data.password:
        if not verify_password(data.password, user.password_hash):
            raise ConflictError("Current password incorrect")

        if data.new_password:
            user.password_hash = hash_password(data.new_password)

    if data.username:
        user.username = data.username
    if data.email:
        user.email = data.email

    await safe_commit(db)
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User not found")

    await db.delete(user)
    await safe_commit(db)

    return user


async def get_user(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
AVATAR_SIZE = 512

UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


async def upload_avatar_service(file: UploadFile, user_id: int, db: AsyncSession):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise NotFoundError("User not found")
    if not file.content_type or file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and WebP images are allowed.",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 5MB.",
        )

    try:
        with Image.open(BytesIO(content)) as img:
            img.verify()  # Strong validation

        img = Image.open(BytesIO(content))

        width, height = img.size
        size = min(width, height)
        left = (width - size) // 2
        top = (height - size) // 2
        img = img.crop((left, top, left + size, top + size))

        img = img.resize((AVATAR_SIZE, AVATAR_SIZE), Image.Resampling.LANCZOS)

        output = BytesIO()
        img.save(output, format="WEBP", quality=85, optimize=True)
        processed_content = output.getvalue()

        file_extension = "webp"

    except (UnidentifiedImageError, IOError, SyntaxError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or corrupted image file.",
        )

    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / filename

    def save_file():
        with open(file_path, "wb") as f:
            f.write(processed_content)

    await asyncio.to_thread(save_file)

    if user.avatar_url:
        try:
            old_path = Path(user.avatar_url.lstrip("/"))
            if old_path.exists() and old_path.is_file():
                old_path.unlink()
        except Exception:
            pass

    user.avatar_url = f"/uploads/avatars/{filename}"
    await safe_commit(db)
    await db.refresh(user)


async def delete_avatar_service(user_id: int, db: AsyncSession):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise NotFoundError("User not found")

    if not user.avatar_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No avatar found to delete."
        )

    try:
        old_path = Path(user.avatar_url.lstrip("/"))

        if old_path.exists() and old_path.is_file():
            old_path.unlink()

        user.avatar_url = None
        await safe_commit(db)
        await db.refresh(user)

        return True
    except Exception:
        user.avatar_url = None
        await safe_commit(db)
        return False
