from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine, get_db
from .routers import post, user, auth, vote, comment, bookmark, tag, notification, message
from .config import settings




#models.Base.metadata.create_all(bind=engine)



app = FastAPI()

origins = [
    "https://emberlylife.net",
    "https://www.emberlylife.net",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vote.router)
app.include_router(post.router)
app.include_router(user.router)
app.include_router(comment.router)
app.include_router(bookmark.router)
app.include_router(tag.router)
app.include_router(notification.router)
app.include_router(message.router)


@app.get("/", status_code=status.HTTP_200_OK) 
def get_user(): 
    return {
        "name": "Emberly Life API",
        "status": "online",
        "version": "1.0.0"
    }



