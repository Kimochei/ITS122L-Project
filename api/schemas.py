from pydantic import BaseModel, EmailStr, Field, computed_field # <-- FIX IS HERE
from datetime import datetime
from typing import List, Optional
from enum import Enum

# =================================
#  Enumerations
# =================================

class RequestStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    COMPLETED = "Completed"

class MediaType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"

# =================================
#  User & Authentication Schemas
# =================================

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class User(UserBase):
    id: int
    is_admin: bool
    is_approved: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# =================================
#  Post, Media, & Comment Schemas
# =================================

class MediaBase(BaseModel):
    url: str
    media_type: MediaType

class MediaCreate(MediaBase):
    pass

class Media(MediaBase):
    id: int
    post_id: int

    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    content: str
    author_name: Optional[str] = "Anonymous"

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    created_at: datetime
    post_id: int
    is_inappropriate: bool = False

    class Config:
        from_attributes = True

class PostBase(BaseModel):
    title: str
    content: Optional[str] = None

class PostCreate(PostBase):
    primary_image_url: Optional[str] = None
    media: List[MediaCreate] = []

class PostUpdate(PostBase):
    pass

class Post(PostBase):
    id: int
    created_at: datetime
    author: User
    primary_image_url: Optional[str] = None
    comments: List[Comment] = []
    media: List[Media] = []

    class Config:
        from_attributes = True

# =================================
#  Document Request Schemas
# =================================

class DocumentRequestBase(BaseModel):
    name: str = Field(..., example="Juan Dela Cruz")
    request_type: str = Field(..., example="Barangay Certificate")
    purpose: str = Field(..., example="For employment application")

class DocumentRequestCreate(DocumentRequestBase):
    pass

class DocumentRequestUpdate(BaseModel):
    status: RequestStatus

class DocumentRequest(DocumentRequestBase):
    id: int
    request_token: str
    status: RequestStatus
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentRequestCreateResponse(BaseModel):
    message: str
    request_token: str
    status: RequestStatus

# =================================
#  Activity Log Schemas
# =================================

class ActivityLog(BaseModel):
    id: int
    timestamp: datetime
    user_id: int
    action: str
    details: Optional[str] = None
    
    user: User 

    @computed_field
    @property
    def username(self) -> str:
        return self.user.username

    class Config:
        from_attributes = True