from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine, get_db
from .routers import post, user, auth, vote
from .config import settings




#models.Base.metadata.create_all(bind=engine)



app = FastAPI()

orgins = ["https://www.google.com", "https://youtube.com"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=orgins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vote.router)
app.include_router(post.router)
app.include_router(user.router)


@app.get("/", status_code=status.HTTP_200_OK) 
def get_user(): 
    return {"message": "oh Yeahhhhhh"} 



