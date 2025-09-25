import json
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch.nn.functional as F
import torch
from typing import List, Dict

with open("ai_models/sentiment_analysis_config.json") as f:
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
