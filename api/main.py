from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware
from . import crud, models, schemas, security
from .database import SessionLocal, engine
from .settings import ACCESS_TOKEN_EXPIRE_MINUTES
from jose import JWTError, jwt
from .settings import SECRET_KEY, ALGORITHM
from supabase import create_client, Client
from .settings import SUPABASE_URL, SUPABASE_KEY
import os
import socket
from urllib.parse import urlparse
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db

# Create all database tables (if they don't exist yet)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="sKonnect API")

origins = [
    "http://localhost:5173", # Your frontend's local development address
    # add deployed frontend's URL here later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
BUCKET_NAME = "post-images"

print("--- Starting Connection Debug ---")

# 1. Load environment variables from .env file
load_dotenv()
database_url = os.getenv("DATABASE_URL")

# 2. Print the URL to check if it's loaded correctly
if database_url:
    print(f"Successfully loaded DATABASE_URL: {database_url}")
else:
    print("ERROR: DATABASE_URL not found in environment. Check your .env file.")
    exit() # Stop the script if the URL isn't even found

# 3. Extract and test the hostname
try:
    # This parses the URL to get just the hostname part
    hostname = urlparse(database_url).hostname
    print(f"Extracted hostname to test: {hostname}")
    
    # 4. Try to resolve the hostname, just like psycopg2 does
    ip_address = socket.gethostbyname(hostname)
    print(f"SUCCESS: Hostname resolved to IP Address: {ip_address}")

except Exception as e:
    print(f"\nCRITICAL ERROR: Could not resolve hostname '{hostname}'.")
    print(f"This confirms the issue is with network/DNS lookup, not SQLAlchemy.")
    print(f"Python's socket library failed with error: {e}")
    exit() # Stop the script

# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency to get the current logged-in user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the token to get the payload
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # The 'sub' (subject) of the token is the username
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        # Create a TokenData object to validate the payload's shape
        token_data = schemas.TokenData(username=username)
    except JWTError:
        # If the token is invalid (bad signature, expired, etc.), raise an error
        raise credentials_exception
    
    # Find the user in the database based on the username from the token
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        # If the user from the token doesn't exist in the DB, raise an error
        raise credentials_exception
    
    # Return the user object if everything is valid
    return user

def get_current_active_admin(current_user: schemas.User = Depends(get_current_user)):
    """
    Dependency to get the current user and verify they are an active, approved admin.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have admin privileges"
        )
    if not current_user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is not approved"
        )
    return current_user

# Authentication Endpoints

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_approved:
        raise HTTPException(status_code=400, detail="Admin account not yet approved")
        
    access_token_expires = timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# User, Admin Routes

@app.post("/register/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register_admin(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Check if this is the first user being created
    is_first_user = crud.count_users(db) == 0
    
    new_user = crud.create_user(db=db, user=user)

    # If it's the first user, approve them automatically
    if is_first_user:
        new_user.is_approved = True
        db.commit()
        db.refresh(new_user)
        # Log this special action
        crud.create_activity_log(db, user=new_user, action="AUTO_APPROVED_FIRST_ADMIN")
    
    return new_user

@app.get("/admin/pending", response_model=List[schemas.User])
def get_pending_admins(db: Session = Depends(get_db), current_admin: schemas.User = Depends(get_current_active_admin)):
    users = crud.get_users(db)
    pending_users = [user for user in users if not user.is_approved]
    return pending_users

# This endpoint is a placeholder for approving an admin
@app.put("/admin/approve/{user_id}", response_model=schemas.User)
def approve_admin(user_id: int, db: Session = Depends(get_db), current_admin: schemas.User = Depends(get_current_active_admin)):
    user_to_approve = crud.get_user(db, user_id=user_id)
    if not user_to_approve:
        raise HTTPException(status_code=404, detail="User not found")
    user_to_approve.is_approved = True
    db.commit()
    db.refresh(user_to_approve)
    return user_to_approve


# PUBLIC POSTS & COMMENTS

@app.post("/admin/generate-upload-url")
def create_upload_url(file_name: str, current_admin: schemas.User = Depends(get_current_active_admin)):
    """
    Generates a pre-signed URL for uploading and returns the final public URL.
    """
    try:
        # Check if the bucket exists, create it if it doesn't
        try:
            supabase.storage.get_bucket(BUCKET_NAME)
        except Exception:
            supabase.storage.create_bucket(BUCKET_NAME, options={"public": True})

        path = f"{current_admin.id}/{file_name}"
        signed_url_response = supabase.storage.from_(BUCKET_NAME).create_signed_upload_url(path)
        
        # --- NEW: Construct the public URL on the backend ---
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{path}"

        return {
            "signed_url": signed_url_response['signed_url'],
            "path": signed_url_response['path'],
            "public_url": public_url  # <-- Send the final URL to the frontend
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/posts/", response_model=List[schemas.Post])
def read_posts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    posts = crud.get_posts(db, skip=skip, limit=limit)
    return posts

@app.get("/posts/{post_id}", response_model=schemas.Post)
def read_post(post_id: int, db: Session = Depends(get_db)):
    db_post = crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@app.post("/posts/{post_id}/comments/", response_model=schemas.Comment, status_code=status.HTTP_201_CREATED)
def create_comment_for_post(post_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    db_post = crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return crud.create_comment(db=db, comment=comment, post_id=post_id)


# ADMIN POSTS

@app.post("/admin/posts/", response_model=schemas.Post, status_code=status.HTTP_201_CREATED)
def create_new_post(post: schemas.PostCreate, db: Session = Depends(get_db), current_admin: schemas.User = Depends(get_current_active_admin)):
    new_post = crud.create_post(db=db, post=post, user_id=current_admin.id)
    crud.create_activity_log(db, user=current_admin, action="CREATED_POST", details=f"Post ID: {new_post.id}")
  
    return new_post

@app.put("/admin/posts/{post_id}", response_model=schemas.Post)
def edit_post(post_id: int, post: schemas.PostUpdate, db: Session = Depends(get_db), current_admin: schemas.User = Depends(get_current_active_admin)):
    db_post = crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return crud.update_post(db=db, post_id=post_id, post_update=post)

@app.delete("/admin/posts/{post_id}", response_model=schemas.Post)
def delete_a_post(post_id: int, db: Session = Depends(get_db), current_admin: schemas.User = Depends(get_current_active_admin)):
    """
    Deletes a post by its ID. Only accessible by approved admins.
    """
    post_to_delete = crud.get_post(db, post_id=post_id)
    if not post_to_delete:
        raise HTTPException(status_code=404, detail="Post not found")
        
    crud.delete_post(db, post_id=post_id)
    crud.create_activity_log(db, user=current_admin, action="DELETED_POST", details=f"Post ID: {post_id}, Title: {post_to_delete.title}")
    
    # The post object is returned before it's deleted from the DB session
    return post_to_delete

@app.delete("/admin/comments/{comment_id}", response_model=schemas.Comment)
def delete_a_comment(comment_id: int, db: Session = Depends(get_db), current_admin: schemas.User = Depends(get_current_active_admin)):
    """
    Deletes a comment by its ID. Useful for removing inappropriate comments.
    Only accessible by approved admins.
    """
    comment_to_delete = crud.get_comment(db, comment_id=comment_id)
    if not comment_to_delete:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    crud.delete_comment(db, comment_id=comment_id)
    
    return comment_to_delete

# DOCUMENT REQUESTS

@app.post("/requests/", response_model=schemas.DocumentRequest, status_code=status.HTTP_201_CREATED)
def submit_document_request(request: schemas.DocumentRequestCreate, db: Session = Depends(get_db)):
    return crud.create_document_request(db=db, request=request)

@app.get("/admin/requests/", response_model=List[schemas.DocumentRequest])
def view_document_requests(db: Session = Depends(get_db), current_admin: schemas.User = Depends(get_current_active_admin)):
    return crud.get_document_requests(db)

@app.post("/requests/", response_model=schemas.Request, status_code=status.HTTP_201_CREATED, tags=["Public Requests"])
def submit_request(
    request: schemas.RequestCreate,
    db: Session = Depends(get_db) # <-- This uses the get_db function defined above
):
    return crud.create_request(db=db, request=request)

@app.get("/requests/{request_id}", response_model=schemas.Request, tags=["Public Requests"])
def track_request_status(
    request_id: int,
    db: Session = Depends(get_db) # <-- This also uses the get_db function
):
    db_request = crud.get_request_by_id(db, request_id=request_id)

    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    return db_request

# Audit Logging

@app.get("/admin/logs/", response_model=List[schemas.ActivityLog])
def read_activity_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_admin: schemas.User = Depends(get_current_active_admin)):
    """
    Retrieves a list of all admin activity logs.
    """
    logs = crud.get_activity_logs(db, skip=skip, limit=limit)
    return logs