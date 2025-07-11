import os
import secrets
from datetime import timedelta
from typing import List
from urllib.parse import urlparse
import socket

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session
from supabase import create_client, Client

from . import crud, models, schemas, security
from .database import SessionLocal, engine
from .settings import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    SECRET_KEY,
    SUPABASE_URL,
    SUPABASE_KEY,
)

# Create all database tables (if they don't exist yet)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="sKonnect API")

# --- CORS Middleware Setup ---
origins = [
    "http://localhost:5173",  # Your frontend's local development address
    # add deployed frontend's URL here later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# --- Supabase Client and Settings ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
BUCKET_NAME = "post-media"  # Consolidated bucket name for images and videos

# --- Database Connection Debugging ---
print("--- Starting Connection Debug ---")
load_dotenv()
database_url = os.getenv("DATABASE_URL")
if database_url:
    print(f"Successfully loaded DATABASE_URL: {database_url}")
    try:
        hostname = urlparse(database_url).hostname
        print(f"Extracted hostname to test: {hostname}")
        ip_address = socket.gethostbyname(hostname)
        print(f"SUCCESS: Hostname resolved to IP Address: {ip_address}")
    except Exception as e:
        print(f"\nCRITICAL ERROR: Could not resolve hostname '{hostname}'. Error: {e}")
        exit()
else:
    print("ERROR: DATABASE_URL not found in environment. Check your .env file.")
    exit()

# --- Dependencies ---

def get_db():
    """Dependency to get a DB session for each request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Dependency to get the current user from a JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_admin(current_user: schemas.User = Depends(get_current_user)):
    """Dependency to ensure the current user is an active and approved admin."""
    if not current_user.is_admin or not current_user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not an approved administrator.",
        )
    return current_user

# --- Authentication Endpoints ---

@app.post("/token", response_model=schemas.Token, tags=["Authentication"])
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Provides a JWT access token for a valid user."""
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is not yet approved"
        )

    # ▼▼▼ ADD THIS LINE TO LOG THE LOGIN ACTIVITY ▼▼▼
    crud.create_activity_log(db, user=user, action="USER_LOGIN")

    access_token_expires = timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- User and Admin Management Endpoints ---

@app.post("/register/", response_model=schemas.User, status_code=status.HTTP_201_CREATED, tags=["Admin Management"])
def register_admin(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Registers a new admin. The first admin is auto-approved."""
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    is_first_user = crud.count_users(db) == 0
    new_user = crud.create_user(db=db, user=user)

    if is_first_user:
        new_user.is_approved = True
        db.commit()
        db.refresh(new_user)
        crud.create_activity_log(
            db, user=new_user, action="AUTO_APPROVED_FIRST_ADMIN"
        )
    return new_user

@app.get("/admin/pending", response_model=List[schemas.User], tags=["Admin Management"])
def get_pending_admins(
    db: Session = Depends(get_db),
    current_admin: schemas.User = Depends(get_current_active_admin),
):
    """Retrieves all admin accounts awaiting approval."""
    return crud.get_pending_approval_users(db)

@app.put("/admin/approve/{user_id}", response_model=schemas.User, tags=["Admin Management"])
def approve_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: schemas.User = Depends(get_current_active_admin),
):
    """Approves a pending admin account."""
    user_to_approve = crud.get_user(db, user_id=user_id)
    if not user_to_approve:
        raise HTTPException(status_code=404, detail="User not found")
    if user_to_approve.is_approved:
        raise HTTPException(status_code=400, detail="User is already approved")
        
    user_to_approve.is_approved = True
    db.commit()
    db.refresh(user_to_approve)
    crud.create_activity_log(
        db, user=current_admin, action="APPROVED_ADMIN", details=f"Approved user ID: {user_id}"
    )
    return user_to_approve

# --- Post and Media Endpoints ---

@app.post("/admin/generate-upload-url", tags=["Admin Posts"])
def create_upload_url(
    file_name: str, current_admin: schemas.User = Depends(get_current_active_admin)
):
    """Generates a pre-signed URL for uploading media to Supabase."""
    try:
        path = f"{current_admin.id}/{file_name}"
        signed_url_response = supabase.storage.from_(BUCKET_NAME).create_signed_upload_url(path)
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{path}"
        return {
            "signed_url": signed_url_response['signed_url'],
            "public_url": public_url,
        }
    except Exception as e:
        # Check if the bucket exists and create if it doesn't
        try:
            supabase.storage.get_bucket(BUCKET_NAME)
        except Exception:
            supabase.storage.create_bucket(BUCKET_NAME, options={"public": True})
        raise HTTPException(status_code=500, detail=f"Could not generate URL: {e}")

@app.post("/admin/posts/", response_model=schemas.Post, status_code=status.HTTP_201_CREATED, tags=["Admin Posts"])
def create_new_post(
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_admin: schemas.User = Depends(get_current_active_admin),
):
    """Creates a new post with title, content, and media."""
    new_post = crud.create_post(db=db, post=post, user_id=current_admin.id)
    crud.create_activity_log(
        db, user=current_admin, action="CREATED_POST", details=f"Post ID: {new_post.id}"
    )
    return new_post

@app.put("/admin/posts/{post_id}", response_model=schemas.Post, tags=["Admin Posts"])
def edit_post(
    post_id: int,
    post: schemas.PostUpdate,
    db: Session = Depends(get_db),
    current_admin: schemas.User = Depends(get_current_active_admin),
):
    """Updates a post's content."""
    db_post = crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return crud.update_post(db=db, post_id=post_id, post_update=post)

@app.delete("/admin/posts/{post_id}", response_model=schemas.Post, tags=["Admin Posts"])
def delete_a_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_admin: schemas.User = Depends(get_current_active_admin),
):
    """Deletes a post by its ID."""
    post_to_delete = crud.get_post(db, post_id=post_id)
    if not post_to_delete:
        raise HTTPException(status_code=404, detail="Post not found")
    
    crud.delete_post(db, post_id=post_id)
    crud.create_activity_log(
        db,
        user=current_admin,
        action="DELETED_POST",
        details=f"Post ID: {post_id}, Title: {post_to_delete.title}",
    )
    return post_to_delete

@app.delete("/admin/comments/{comment_id}", response_model=schemas.Comment, tags=["Admin Posts"])
def delete_a_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_admin: schemas.User = Depends(get_current_active_admin),
):
    """Deletes a comment by its ID."""
    comment_to_delete = crud.get_comment(db, comment_id=comment_id)
    if not comment_to_delete:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    crud.delete_comment(db, comment_id=comment_id)
    return comment_to_delete

# --- Public Endpoints ---

@app.get("/posts/", response_model=List[schemas.Post], tags=["Public"])
def read_posts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Reads all posts with pagination."""
    return crud.get_posts(db, skip=skip, limit=limit)

@app.get("/posts/{post_id}", response_model=schemas.Post, tags=["Public"])
def read_post(post_id: int, db: Session = Depends(get_db)):
    """Reads a single post and its comments."""
    db_post = crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@app.post("/posts/{post_id}/comments/", response_model=schemas.Comment, status_code=status.HTTP_201_CREATED, tags=["Public"])
def create_comment_for_post(
    post_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db)
):
    """Creates a comment on a specific post."""
    db_post = crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return crud.create_comment(db=db, comment=comment, post_id=post_id)

# --- Document Request Endpoints ---

class StatusUpdateRequest(BaseModel):
    status: schemas.RequestStatus

@app.post("/document-requests/", response_model=schemas.DocumentRequestCreateResponse, tags=["Public Document Requests"])
def create_document_request(
    request: schemas.DocumentRequestCreate, db: Session = Depends(get_db)
):
    """Submits a new document request and returns a tracking token."""
    request_token = secrets.token_hex(16).upper()
    db_request = models.DocumentRequest(
        **request.model_dump(),
        request_token=request_token,
        status=schemas.RequestStatus.PENDING
    )
    db.add(db_request)
    db.commit()
    return {
        "message": "Request submitted successfully.",
        "request_token": request_token,
        "status": schemas.RequestStatus.PENDING,
    }

@app.get("/document-requests/status/{request_token}", response_model=schemas.DocumentRequest, tags=["Public Document Requests"])
def get_document_request_status(request_token: str, db: Session = Depends(get_db)):
    """Fetches the status of a document request using its token."""
    db_request = db.query(models.DocumentRequest).filter(
        models.DocumentRequest.request_token == request_token
    ).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request token not found.")
    return db_request

@app.patch("/admin/document-requests/{request_id}/status", response_model=schemas.DocumentRequest, tags=["Admin Document Requests"])
def update_request_status(
    request_id: int,
    status_update: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: schemas.User = Depends(get_current_active_admin),
):
    """Updates the status of a specific document request (Admin Only)."""
    db_request = db.query(models.DocumentRequest).filter(
        models.DocumentRequest.id == request_id
    ).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Document request not found.")
    
    db_request.status = status_update.status
    db.commit()
    db.refresh(db_request)
    return db_request

@app.get("/admin/requests/", response_model=List[schemas.DocumentRequest], tags=["Admin Document Requests"])
def view_document_requests(db: Session = Depends(get_db)): # REMOVED the admin dependency
    """
    Views all submitted document requests.
    (Admin Only - Auth Bypassed for Testing)
    """
    return crud.get_document_requests(db)

# --- Audit Log Endpoint ---

@app.get("/admin/logs/", response_model=List[schemas.ActivityLog], tags=["Admin"])
def read_activity_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: schemas.User = Depends(get_current_active_admin),
):
    """Retrieves a list of all admin activity logs."""
    return crud.get_activity_logs(db, skip=skip, limit=limit)