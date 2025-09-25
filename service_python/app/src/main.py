from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.src.config import settings
from app.src.routers import sentiment_analysis_router
from app.src.routers import wordcloud_routers

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.client_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"status": "success", "message": "Welcome to the Sentiment Analysis API!"}

app.include_router(sentiment_analysis_router.router, prefix="/api")
app.include_router(wordcloud_routers.router, prefix="/api")
