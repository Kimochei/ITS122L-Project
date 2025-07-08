from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

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
    image_url = Column(String, nullable=True) # URL for an image or video
    created_at = Column(DateTime, default=datetime.utcnow)
    author_id = Column(Integer, ForeignKey("users.id"))

    # creates a link back to the User who wrote the post
    author = relationship("User", back_populates="posts")

class DocumentRequest(Base):
    __tablename__ = "document_requests"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    request_type = Column(String)
    purpose = Column(Text)
    status = Column(String, default="Pending") # e.g., "Pending", "Processing", "Ready for Pickup"
    submitted_at = Column(DateTime, default=datetime.utcnow)