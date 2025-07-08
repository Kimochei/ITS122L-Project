from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas

INAPPROPRIATE_WORDS = {"badword"}

# USER SECTION
# password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Verifies a plain password against a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)

def get_hashed_password(password):
    """Hashes a plain password."""
    return pwd_context.hash(password)

def get_user(db: Session, user_id: int):
    """Reads a single user from the database by their ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    """Reads a single user from the database by their username."""
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Reads a list of all users."""
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    """Creates a new user (admin) in the database with a hashed password."""
    hashed_password = get_hashed_password(user.password)
    db_user = models.User(
        username=user.username, email=user.email, hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def count_users(db: Session) -> int:
    """Counts the total number of users in the database."""
    return db.query(models.User).count()

# END OF USER SECTION

# POSTS SECTION

def get_posts(db: Session, skip: int = 0, limit: int = 10):
    """Reads a list of posts, newest first."""
    return db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()

def get_post(db: Session, post_id: int):
    """Reads a single post by its ID."""
    return db.query(models.Post).filter(models.Post.id == post_id).first()

def create_post(db: Session, post: schemas.PostCreate, user_id: int):
    """Creates a new post and its associated images."""
    # Create the post object first, but don't include image_urls
    db_post = models.Post(title=post.title, content=post.content, author_id=user_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    # Now, loop through the image URLs and create PostImage records
    if post.image_urls:
        for image_url in post.image_urls:
            db_image = models.PostImage(url=image_url, post_id=db_post.id)
            db.add(db_image)
        db.commit()
        db.refresh(db_post) # Refresh again to load the new images into the post object

    return db_post

def update_post(db: Session, post_id: int, post_update: schemas.PostUpdate):
    """Updates an existing post."""
    db_post = get_post(db, post_id=post_id) # type: ignore
    if db_post:
        # Get the update data as a dictionary
        update_data = post_update.dict(exclude_unset=True)
        # Update the fields
        for key, value in update_data.items():
            setattr(db_post, key, value)
        db.commit()
        db.refresh(db_post)
    return db_post

def delete_post(db: Session, post_id: int):
    """Deletes a post from the database by its ID."""
    db_post = get_post(db, post_id=post_id) # type: ignore
    if db_post:
        db.delete(db_post)
        db.commit()
    return db_post
# END OF POSTS SECTION

# DOCUMENT REQUESTS

def create_document_request(db: Session, request: schemas.DocumentRequestCreate):
    """Creates a new document request (public, no user link)."""
    db_request = models.DocumentRequest(**request.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def get_document_requests(db: Session, skip: int = 0, limit: int = 100):
    """Reads a list of all document requests for admins."""
    return db.query(models.DocumentRequest).order_by(models.DocumentRequest.submitted_at.desc()).offset(skip).limit(limit).all()

# END OF DOCUMENT REQUESTS

# COMMENTS
def get_comment(db: Session, comment_id: int):
    """Reads a single comment by its ID."""
    return db.query(models.Comment).filter(models.Comment.id == comment_id).first()

def get_flagged_comments(db: Session):
    """Returns all comments that are flagged."""
    return db.query(models.Comment).filter(models.Comment.is_flagged == True).all()

def create_comment(db: Session, comment: schemas.CommentCreate, post_id: int):
    """Creates a new comment and checks for inappropriate content."""
    
    db_comment = models.Comment(**comment.dict(), post_id=post_id)

    # Check for inappropriate words
    comment_words = set(comment.content.lower().split())
    if not INAPPROPRIATE_WORDS.isdisjoint(comment_words):
        db_comment.is_flagged = True
        db_comment.flagged_reason = "Contains inappropriate language"

    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, comment_id: int):
    """Deletes a comment from the database by its ID."""
    db_comment = get_comment(db, comment_id=comment_id)
    if db_comment:
        db.delete(db_comment)
        db.commit()
    return db_comment

# END OF COMMENTS

# ACTIVITY LOGS

def create_activity_log(db: Session, user: models.User, action: str, details: str = None):
    """Creates a new activity log entry for a user action."""
    db_log = models.ActivityLog(
        user_id=user.id,
        username=user.username,
        action=action,
        details=details
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_activity_logs(db: Session, skip: int = 0, limit: int = 100):
    """Reads a list of activity logs, newest first."""
    return db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).offset(skip).limit(limit).all()

# END OF ACTIVITY LOGS