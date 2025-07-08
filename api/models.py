from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, func
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
from .schemas import RequestStatus
import enum

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_approved = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=True) # All users are admins-in-waiting or approved admins

    # creates a link between a User and all their Posts
    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    author_id = Column(Integer, ForeignKey("users.id"))
    images = relationship("PostImage", back_populates="post", cascade="all, delete-orphan")

    # creates a link back to the User who wrote the post
    author = relationship("User", back_populates="posts")
    # link between a post and its comments
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

class DocumentRequest(Base):
    __tablename__ = "document_requests"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    request_type = Column(String)
    purpose = Column(Text)
    status = Column(String, default="Pending") # e.g., "Pending", "Processing", "Ready for Pickup"
    submitted_at = Column(DateTime, default=datetime.utcnow)

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author_name = Column(String, nullable=True) # For optional name
    is_flagged = Column(Boolean, default=False)
    flagged_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    post_id = Column(Integer, ForeignKey("posts.id"))

    # This creates a link back to the Post the comment belongs to
    post = relationship("Post", back_populates="comments")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    username = Column(String) # Storing username for easy display
    action = Column(String) # e.g., "CREATED_POST", "DELETED_COMMENT"
    details = Column(String, nullable=True) # e.g., "Post ID: 5", "Comment ID: 12"

class PostImage(Base):
    __tablename__ = "post_images"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"))

    post = relationship("Post", back_populates="images")

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, index=True)
    address = Column(String, nullable=False)
    request_type = Column(String, nullable=False)
    
    status = Column(String, nullable=False, default=RequestStatus.pending)
    description = Column(String, nullable=True)
    
    # This line requires the 'func' import
    created_at = Column(DateTime(timezone=True), server_default=func.now())
