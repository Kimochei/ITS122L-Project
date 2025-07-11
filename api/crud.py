from sqlalchemy.orm import Session, joinedload
from . import models, schemas, security

# =================================
#  User & Authentication CRUD
# =================================

def get_user(db: Session, user_id: int):
    """Retrieves a single user by their ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    """Retrieves a single user by their username."""
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Retrieves a list of all users with pagination."""
    return db.query(models.User).offset(skip).limit(limit).all()

def get_pending_approval_users(db: Session):
    """Retrieves all users whose accounts are not yet approved."""
    return db.query(models.User).filter(models.User.is_approved == False).all()

def count_users(db: Session) -> int:
    """Counts the total number of users in the database."""
    return db.query(models.User).count()

def create_user(db: Session, user: schemas.UserCreate):
    """Creates a new user with a hashed password."""
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        username=user.username, email=user.email, hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    """
    Authenticates a user. Returns the user object if successful, otherwise None.
    """
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not security.verify_password(password, user.hashed_password):
        return None
    return user

# =================================
#  Post, Media, & Comment CRUD
# =================================

def get_post(db: Session, post_id: int):
    """Retrieves a single post by its ID."""
    return db.query(models.Post).filter(models.Post.id == post_id).first()

def get_posts(db: Session, skip: int = 0, limit: int = 100):
    """Retrieves a list of all posts with pagination."""
    return db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()

def create_post(db: Session, post: schemas.PostCreate, user_id: int):
    """Creates a new post and its associated media."""
    db_post = models.Post(
        title=post.title,
        content=post.content,
        primary_image_url=post.primary_image_url,
        author_id=user_id,
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    # Create Media objects from the provided URLs
    for media_item in post.media:
        db_media = models.Media(
            url=media_item.url,
            media_type=media_item.media_type,
            post_id=db_post.id
        )
        db.add(db_media)
    
    db.commit()
    db.refresh(db_post)
    return db_post

def update_post(db: Session, post_id: int, post_update: schemas.PostUpdate):
    """Updates a post's title and content."""
    db_post = get_post(db, post_id=post_id)
    if db_post:
        db_post.title = post_update.title
        db_post.content = post_update.content
        db.commit()
        db.refresh(db_post)
    return db_post

def delete_post(db: Session, post_id: int):
    """Deletes a post from the database."""
    db_post = get_post(db, post_id=post_id)
    if db_post:
        db.delete(db_post)
        db.commit()

def get_comment(db: Session, comment_id: int):
    """Retrieves a single comment by its ID."""
    return db.query(models.Comment).filter(models.Comment.id == comment_id).first()

def create_comment(db: Session, comment: schemas.CommentCreate, post_id: int):
    """Creates a new comment for a specific post."""
    db_comment = models.Comment(**comment.model_dump(), post_id=post_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, comment_id: int):
    """Deletes a comment from the database."""
    db_comment = get_comment(db, comment_id)
    if db_comment:
        db.delete(db_comment)
        db.commit()

# =================================
#  Document Request CRUD
# =================================

def create_document_request(db: Session, request: schemas.DocumentRequestCreate):
    """
    Creates a new document request. 
    Note: The token is generated in the main.py endpoint.
    """
    db_request = models.DocumentRequest(**request.model_dump())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def get_document_requests(db: Session):
    """Retrieves all document requests."""
    return db.query(models.DocumentRequest).order_by(models.DocumentRequest.created_at.desc()).all()

# =================================
#  Activity Log CRUD
# =================================

def create_activity_log(db: Session, user: schemas.User, action: str, details: str = None):
    """Creates an activity log entry for an admin action."""
    db_log = models.ActivityLog(
        user_id=user.id,
        username=user.username, # Now we explicitly save the username
        action=action,
        details=details
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_activity_logs(db: Session, skip: int = 0, limit: int = 100):
    """Retrieves a list of all activity logs with pagination."""
    # ▼▼▼ UPDATE THIS QUERY ▼▼▼
    return (
        db.query(models.ActivityLog)
        .options(joinedload(models.ActivityLog.user)) # This line performs the JOIN
        .order_by(models.ActivityLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )