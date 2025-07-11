from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SQLAlchemyEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from .schemas import RequestStatus, MediaType # Import the enums

# =================================
#  User & Activity Log Models
# =================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)

    posts = relationship("Post", back_populates="author")
    activity_logs = relationship("ActivityLog", back_populates="user")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    # This ensures the database automatically sets the timestamp on creation
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # We will store the username directly for easier querying and display
    username = Column(String, nullable=False) 
    
    action = Column(String, nullable=False)
    details = Column(String, nullable=True)

    user = relationship("User", back_populates="activity_logs")

# =================================
#  Post, Media, & Comment Models
# =================================

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    content = Column(String)
    primary_image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    author_id = Column(Integer, ForeignKey("users.id"))

    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    media = relationship("Media", back_populates="post", cascade="all, delete-orphan")

class Media(Base):
    __tablename__ = "media"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    media_type = Column(SQLAlchemyEnum(MediaType), nullable=False) # Uses the MediaType enum
    post_id = Column(Integer, ForeignKey("posts.id"))

    post = relationship("Post", back_populates="media")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    author_name = Column(String, default="Anonymous")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_inappropriate = Column(Boolean, default=False)
    post_id = Column(Integer, ForeignKey("posts.id"))

    post = relationship("Post", back_populates="comments")

# =================================
#  Document Request Model
# =================================

class DocumentRequest(Base):
    __tablename__ = "document_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    request_type = Column(String, index=True)
    purpose = Column(String)
    
    request_token = Column(String, unique=True, index=True, nullable=False)
    
    # ▼▼▼ THIS IS THE CORRECTED LINE ▼▼▼
    # Change SQLAlchemyEnum to String to store the status as plain text
    status = Column(String, nullable=False, default=RequestStatus.PENDING.value) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())