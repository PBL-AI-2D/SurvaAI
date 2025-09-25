from fastapi import APIRouter, Response
from fastapi.responses import StreamingResponse
from app.src.schemas.wordcloud import WordCloudInput
from app.src.services.wordcloud_service import generate_wordcloud_image
import io

router = APIRouter(prefix="/wordcloud", tags=["WordCloud"])

@router.post("/", response_class=StreamingResponse)
def get_wordcloud(payload: WordCloudInput):
    image_bytes = generate_wordcloud_image(payload.texts)
    return StreamingResponse(io.BytesIO(image_bytes), media_type="image/png")
