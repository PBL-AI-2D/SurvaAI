from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import sentiment_analysis_router
from .routers import wordcloud_routers
from .routers import preference_analysis_router
from .routers import satisfaction_analysis_router
from .routers import dashboard_router
from .routers import forecasting_router

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
app.include_router(preference_analysis_router.router, prefix="/api")
app.include_router(satisfaction_analysis_router.router, prefix="/api")
app.include_router(dashboard_router.router, prefix="/api")
app.include_router(forecasting_router.router, prefix="/api")
