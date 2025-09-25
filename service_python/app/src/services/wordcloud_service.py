import json
import io
import re
from typing import List
from wordcloud import WordCloud

with open("app/data/stopwords-id.json", "r", encoding="utf-8") as f:
    stopwords = set(json.load(f))

def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    return text

def generate_wordcloud_image(texts: List[str]) -> bytes:
    processed_texts = [preprocess(t) for t in texts]
    combined_text = " ".join(processed_texts)
    wc = WordCloud(
        width=800,
        height=400,
        background_color='white',
        stopwords=stopwords,
        colormap="viridis"
    ).generate(combined_text)

    img_buffer = io.BytesIO()
    wc.to_image().save(img_buffer, format='PNG')
    img_buffer.seek(0)
    return img_buffer.read()
