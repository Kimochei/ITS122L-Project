from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
    Text,
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
    display_name = Column(String, nullable=True)
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
    media_type = Column(SAEnum(MediaType), nullable=False) # Uses the MediaType enum
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
    requester_name = Column(String, index=True, nullable=False)
    requester_age = Column(Integer, nullable=False)
    date_of_birth = Column(String, nullable=False)
    address = Column(String, nullable=False)
    document_type = Column(String, index=True, nullable=False)
    purpose = Column(String, nullable=False)
    request_token = Column(String, unique=True, index=True, nullable=False)
    admin_message = Column(Text, nullable=True) 
    # Use the imported enum for the database column type
    status = Column(String, default="pending", nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())