from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from .schemas import MediaType, RequestStatus

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    author_id = Column(Integer, ForeignKey("users.id"))
    primary_image_url = Column(String, nullable=True)
    author = relationship("User", back_populates="posts")
    media = relationship("Media", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

class Media(Base):
    __tablename__ = "media"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    media_type = Column(SAEnum(MediaType), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"))
    post = relationship("Post", back_populates="media")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    author_name = Column(String, default="Anonymous", nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    post_id = Column(Integer, ForeignKey("posts.id"))
    is_inappropriate = Column(Boolean, default=False)
    post = relationship("Post", back_populates="comments")

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
    admin_message = Column(Text, nullable=False, default='')
    status = Column(String, default="pending", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    details = Column(String, nullable=True)
    user = relationship("User", back_populates="activity_logs")

class Official(Base):
    __tablename__ = "officials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    position = Column(String, nullable=False)
    photo_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True) 
    contributions = Column(Text, nullable=True) 