from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_approved: bool
    is_admin: bool

    class Config:
        orm_mode = True

# enf of USER SCHEMAS

# Commect Schemas
class CommentBase(BaseModel):
    content: str
    author_name: Optional[str] = "Anonymous Resident" 

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    created_at: datetime
    post_id: int
    is_flagged: bool

    class Config:
        from_attributes = True 

# end of COMMENT SCHEMAS

# Post Schemas

class PostImage(BaseModel):
    id: int
    url: str

    class Config:
        from_attributes = True

class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    image_urls: Optional[List[str]] = []

class PostUpdate(PostBase):
    pass

# This schema is used when returning a post from the API.
class Post(PostBase):
    id: int
    created_at: datetime
    author: User
    comments: List[Comment] = []
    images: List[PostImage] = []

    class Config:
        orm_mode = True

# end of POST SCHEMAS

# Document Request Schemas
class DocumentRequestBase(BaseModel):
    full_name: str
    request_type: str
    purpose: str

class DocumentRequestCreate(DocumentRequestBase):
    pass

class DocumentRequestUpdate(BaseModel):
    status: str

class DocumentRequest(DocumentRequestBase):
    id: int
    status: str
    submitted_at: datetime

    class Config:
        orm_mode = True

# end of DOC. REQUEST SCHEMA

# token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# end of TOKEN SCHEMAS

# ACTIVITY LOGS

class ActivityLog(BaseModel):
    id: int
    timestamp: datetime
    user_id: int
    username: str
    action: str
    details: Optional[str] = None

    class Config:
        from_attributes = True

# end of ACTIVITY LOGS