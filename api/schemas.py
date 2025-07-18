from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional
from enum import Enum

class RequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"

class MediaType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"

class UserBase(BaseModel):
    username: str
    email: EmailStr
    display_name: Optional[str] = None

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
    primary_image_url: Optional[str] = None
    media: Optional[List[MediaCreate]] = None

class Post(PostBase):
    id: int
    created_at: datetime
    author: User
    primary_image_url: Optional[str] = None
    comments: List[Comment] = []
    media: List[Media] = []
    class Config:
        from_attributes = True

class DocumentRequestCreate(BaseModel):
    requester_name: str
    requester_age: int
    date_of_birth: str
    address: str
    document_type: str
    purpose: str

class DocumentRequestCreateResponse(BaseModel):
    message: str
    request_token: str
    status: RequestStatus

class DocumentStatusUpdate(BaseModel):
    status: RequestStatus
    admin_message: str

class DocumentRequest(BaseModel):
    id: int
    requester_name: str
    requester_age: int
    date_of_birth: str
    address: str
    document_type: str
    purpose: str
    request_token: str
    status: RequestStatus
    admin_message: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ActivityLog(BaseModel):
    id: int
    timestamp: datetime
    user_id: int
    action: str
    details: Optional[str] = None
    user: User
    class Config:
        from_attributes = True

class OfficialBase(BaseModel):
    name: str
    position: str
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    contributions: Optional[str] = None

class OfficialCreate(OfficialBase):
    pass

class OfficialUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    contributions: Optional[str] = None

class Official(OfficialBase):
    id: int

    class Config:
        from_attributes = True