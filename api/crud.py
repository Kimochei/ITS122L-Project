from sqlalchemy.orm import Session
from typing import Optional
from . import models, schemas, security
from supabase import create_client, Client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET_NAME = os.getenv("SUPABASE_BUCKET_NAME", "post-media")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_pending_approval_users(db: Session):
    return db.query(models.User).filter(models.User.is_approved == False).all()

def count_users(db: Session) -> int:
    return db.query(models.User).count()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        display_name=user.display_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not security.verify_password(password, user.hashed_password):
        return False
    return user

def get_posts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()

def get_post(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.id == post_id).first()

def create_post(db: Session, post: schemas.PostCreate, user_id: int):
    db_post = models.Post(
        title=post.title,
        content=post.content,
        author_id=user_id,
        primary_image_url=post.primary_image_url
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    for media_item in post.media:
        db_media = models.Media(**media_item.model_dump(), post_id=db_post.id)
        db.add(db_media)
    db.commit()
    db.refresh(db_post)
    return db_post

def update_post(db: Session, post_id: int, post_update: schemas.PostUpdate):
    db_post = get_post(db, post_id=post_id)
    if not db_post:
        return None
    if post_update.title is not None:
        db_post.title = post_update.title
    if post_update.content is not None:
        db_post.content = post_update.content
    if post_update.primary_image_url is not None:
        db_post.primary_image_url = post_update.primary_image_url
    if post_update.media is not None:
        for media_item in db_post.media:
            db.delete(media_item)
        for new_media_item in post_update.media:
            db_media = models.Media(url=new_media_item.url, media_type=new_media_item.media_type, post_id=db_post.id)
            db.add(db_media)
    db.commit()
    db.refresh(db_post)
    return db_post

def delete_post(db: Session, post_id: int):
    db_post = get_post(db, post_id=post_id)
    if db_post:
        db.delete(db_post)
        db.commit()
    return db_post

def get_comment(db: Session, comment_id: int):
    return db.query(models.Comment).filter(models.Comment.id == comment_id).first()

def create_comment(db: Session, comment: schemas.CommentCreate, post_id: int):
    db_comment = models.Comment(**comment.model_dump(), post_id=post_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, comment_id: int):
    db_comment = get_comment(db, comment_id=comment_id)
    if db_comment:
        db.delete(db_comment)
        db.commit()
    return db_comment

def get_document_requests(db: Session, status: Optional[str] = None, document_type: Optional[str] = None):
    query = db.query(models.DocumentRequest)
    if status:
        query = query.filter(models.DocumentRequest.status == status)
    if document_type:
        query = query.filter(models.DocumentRequest.document_type == document_type)
    return query.order_by(models.DocumentRequest.created_at.desc()).all()

def get_document_request_by_id(db: Session, request_id: int):
    return db.query(models.DocumentRequest).filter(models.DocumentRequest.id == request_id).first()

def create_activity_log(db: Session, user: schemas.User, action: str, details: str = None):
    db_log = models.ActivityLog(user_id=user.id, action=action, details=details)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_activity_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).offset(skip).limit(limit).all()

def get_official(db: Session, official_id: int):
    """Retrieve a single official by their ID."""
    return db.query(models.Official).filter(models.Official.id == official_id).first()

def get_officials(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve a list of all officials."""
    return db.query(models.Official).offset(skip).limit(limit).all()

def create_official(db: Session, official: schemas.OfficialCreate):
    """Create a new official record."""
    db_official = models.Official(**official.dict())
    db.add(db_official)
    db.commit()
    db.refresh(db_official)
    return db_official

def update_official(db: Session, official_id: int, official_update: schemas.OfficialUpdate):
    """Update an existing official's details."""
    db_official = get_official(db, official_id)
    if db_official:
        update_data = official_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_official, key, value)
        db.commit()
        db.refresh(db_official)
    return db_official

def delete_official(db: Session, official_id: int):
    """Delete an official record."""
    db_official = get_official(db, official_id)
    if db_official:
        db.delete(db_official)
        db.commit()
    return db_official