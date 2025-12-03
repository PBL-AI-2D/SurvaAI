import json
from pathlib import Path
from typing import List, Dict

import torch
import torch.nn.functional as F
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# Get base directory - go up from app/src/services/ to service_python/
_current_file = Path(__file__).resolve()
BASE_DIR = _current_file.parent.parent.parent.parent  # app/src/services -> service_python
CONFIG_PATH = BASE_DIR / "ai_models" / "sentiment_analysis_config.json"

# Fallback: try current working directory if path doesn't exist
if not CONFIG_PATH.exists():
    cwd = Path.cwd()
    if (cwd / "ai_models" / "sentiment_analysis_config.json").exists():
        CONFIG_PATH = cwd / "ai_models" / "sentiment_analysis_config.json"
    elif (cwd.parent / "ai_models" / "sentiment_analysis_config.json").exists():
        CONFIG_PATH = cwd.parent / "ai_models" / "sentiment_analysis_config.json"

with CONFIG_PATH.open() as f:
    config = json.load(f)

MODEL_PATH = config["model_name_or_path"]

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

def predict_single(text: str) -> Dict:
    tokens = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        output = model(**tokens)
        probs = F.softmax(output.logits, dim=1)
        confidence, predicted_class = torch.max(probs, dim=1)

    label = model.config.id2label[predicted_class.item()]

    return {"text": text, "label": label, "confidence": round(confidence.item(), 2)}

def predict_all(texts: List[str]) -> List[Dict]:
    return [predict_single(text) for text in texts]

def summarize_predictions(predictions: List[Dict]) -> Dict:
    summary = {"positive": 0, "negative": 0, "neutral": 0}
    for pred in predictions:
        label = pred['label']
        if label in summary:
            summary[label] += 1
    return summary