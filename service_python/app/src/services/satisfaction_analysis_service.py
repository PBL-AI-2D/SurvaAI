from typing import List, Dict, Any, Optional, Tuple
import os
from pathlib import Path
import numpy as np
import pandas as pd
from scipy.stats import pearsonr, spearmanr

# --- BAGIAN IMPORT (Sama seperti sebelumnya, menjaga kompatibilitas path) ---
_original_cwd = os.getcwd()
_current_file = Path(__file__).resolve()
_project_root = _current_file.parent.parent.parent 

if not ((_project_root / "ai_models").exists() and (_project_root / "app").exists()):
    cwd = Path(_original_cwd)
    if (cwd / "ai_models").exists() and (cwd / "app").exists():
        _project_root = cwd
    elif (cwd.parent / "ai_models").exists() and (cwd.parent / "app").exists():
        _project_root = cwd.parent

if (_project_root / "ai_models").exists() and (_project_root / "app").exists():
    os.chdir(str(_project_root))

try:
    from service_python.app.src.services.sentiment_analysis_service import predict_single
except Exception:
    try:
        from app.src.services.sentiment_analysis_service import predict_single
    except Exception:
        pass # Handle import manual jika perlu
finally:
    try:
        os.chdir(_original_cwd)
    except Exception:
        pass 

# --- END IMPORT ---

def _normalize_likert(
    likert_list: List[Dict[str, float]],
    likert_min: float,
    likert_max: float,
) -> List[Dict[str, float]]:
    """Mengubah skala 1-5 menjadi 0.0-1.0"""
    scale = likert_max - likert_min
    if scale <= 0:
        raise ValueError("likert_max must be greater than likert_min")

    normalized_all: List[Dict[str, float]] = []
    for ans in likert_list:
        normalized = {
            k: (float(v) - likert_min) / scale
            for k, v in ans.items()
        }
        normalized_all.append(normalized)
    return normalized_all

def _score_categorical_answers(
    categorical_list: List[Dict[str, Any]],
    scoring_map: Dict[str, Dict[str, float]]
) -> List[float]:
    """
    Mengubah jawaban pilihan ganda/dropdown menjadi skor numerik.
    Contoh scoring_map:
    {
        "recommend_friend": {"Yes": 1.0, "No": 0.0, "Maybe": 0.5},
        "frequency": {"Daily": 1.0, "Weekly": 0.7, "Rarely": 0.2}
    }
    """
    scores = []
    for ans in categorical_list:
        if not ans or not scoring_map:
            scores.append(np.nan) # Tidak ada data kategorikal yang dinilai
            continue
            
        item_scores = []
        for key, value in ans.items():
            # Cek apakah pertanyaan ini punya kunci jawaban (scoring map)
            if key in scoring_map:
                # Cek apakah jawaban user ada nilainya
                val_str = str(value)
                if val_str in scoring_map[key]:
                    item_scores.append(scoring_map[key][val_str])
        
        if item_scores:
            scores.append(float(np.mean(item_scores)))
        else:
            scores.append(np.nan)
    return scores

def _run_sentiment(
    texts: List[Optional[str]],
) -> Tuple[List[Optional[str]], List[Optional[float]]]:
    """Mendapatkan label sentimen dan skor ternormalisasi (0-1) dari IndoBERT"""
    labels: List[Optional[str]] = []
    scores: List[Optional[float]] = []

    for text in texts:
        if not text:
            labels.append(None)
            scores.append(None) # Nanti dianggap netral atau di-skip
            continue

        try:
            pred = predict_single(text)
            label = pred["label"]
            confidence = float(pred["confidence"])

            # Logic Mapping Sentimen ke Skor 0-1
            # Positif = mendekati 1, Negatif = mendekati 0, Netral = 0.5
            if label == "positive":
                # Confidence 0.9 -> Score 0.95 (Sangat Puas)
                score = 0.5 + (confidence / 2) 
            elif label == "negative":
                # Confidence 0.9 -> Score 0.05 (Sangat Kecewa)
                score = 0.5 - (confidence / 2)
            else: # neutral
                score = 0.5
            
            labels.append(label)
            scores.append(score)
        except:
            labels.append("neutral")
            scores.append(0.5)

    return labels, scores

def _compute_holistic_satisfaction(
    likert_normalized: List[Dict[str, float]],
    sentiment_scores: List[Optional[float]],
    categorical_scores: List[float],
    weights: Dict[str, float]
) -> List[float]:
    """
    MENGHITUNG SEMUANYA: Likert + Sentimen Teks + Pilihan Ganda
    """
    final_scores: List[float] = []
    n = len(likert_normalized)
    
    w_likert = weights.get("likert", 0.5)
    w_sentiment = weights.get("sentiment", 0.3)
    w_categorical = weights.get("categorical", 0.2)
    
    for i in range(n):
        components = []
        comp_weights = []
        
        # 1. Komponen Likert
        l_vals = list(likert_normalized[i].values())
        if l_vals:
            l_score = float(np.mean(l_vals))
            components.append(l_score)
            comp_weights.append(w_likert)
        
        # 2. Komponen Sentimen Teks
        if sentiment_scores[i] is not None:
            components.append(sentiment_scores[i])
            comp_weights.append(w_sentiment)
            
        # 3. Komponen Kategorikal (Pilihan Ganda yang dinilai)
        if not np.isnan(categorical_scores[i]):
            components.append(categorical_scores[i])
            comp_weights.append(w_categorical)
            
        # Hitung Weighted Average
        if sum(comp_weights) > 0:
            weighted_sum = sum(c * w for c, w in zip(components, comp_weights))
            final_score = weighted_sum / sum(comp_weights)
        else:
            final_score = 0.0
            
        final_scores.append(float(np.clip(final_score, 0.0, 1.0)))
        
    return final_scores

def _compute_correlations(
    df_data: pd.DataFrame,
    target_col: str
) -> Dict[str, Dict[str, float]]:
    """Menghitung korelasi semua fitur terhadap skor kepuasan akhir"""
    result: Dict[str, Dict[str, float]] = {}
    
    for col in df_data.columns:
        if col == target_col:
            continue
        # Hanya hitung korelasi kolom numerik
        if pd.api.types.is_numeric_dtype(df_data[col]):
            try:
                # Handle NaN dengan fill median
                series = df_data[col].fillna(df_data[col].median())
                target = df_data[target_col].fillna(df_data[target_col].median())
                
                if len(series.unique()) <= 1: continue # Skip kolom konstan

                p_val, _ = pearsonr(series, target)
                s_val, _ = spearmanr(series, target)
                
                result[col] = {
                    "pearson": float(p_val) if not np.isnan(p_val) else 0.0,
                    "spearman": float(s_val) if not np.isnan(s_val) else 0.0,
                }
            except Exception:
                continue
    return result

def analyze_satisfaction(
    responses: List[Dict[str, Any]],
    likert_min: float = 1.0,
    likert_max: float = 5.0,
    categorical_mapping: Optional[Dict[str, Dict[str, float]]] = None,
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Fungsi Utama AI-1:
    Menganalisa kepuasan berdasarkan SEMUA input (Likert, Teks, Pilihan).
    
    Args:
        categorical_mapping: Dictionary untuk menilai jawaban pilihan.
        Contoh: {'Apakah akan langganan lagi?': {'Ya': 1.0, 'Tidak': 0.0}}
    """
    if not responses:
        return {}

    # 1. Extract Data
    likert_list = [r.get("likert", {}) for r in responses]
    texts = [r.get("text", "") for r in responses]
    categorical_list = [r.get("categorical", {}) for r in responses] # Asumsi input ada key 'categorical'

    # 2. Process Likert (0-1)
    likert_norm = _normalize_likert(likert_list, likert_min, likert_max)
    
    # 3. Process Sentiment (0-1)
    sentiment_labels, sentiment_scores = _run_sentiment(texts)
    
    # 4. Process Categorical Scoring (0-1)
    # Jika tidak ada mapping, skor kategorikal dianggap NaN (tidak mempengaruhi nilai akhir)
    cat_scores = _score_categorical_answers(categorical_list, categorical_mapping or {})
    
    # 5. Compute HOLISTIC Satisfaction Score
    # Default weights jika user tidak memberi input
    if weights is None:
        weights = {"likert": 0.5, "sentiment": 0.4, "categorical": 0.1}
        
    final_scores = _compute_holistic_satisfaction(
        likert_norm, sentiment_scores, cat_scores, weights
    )

    # 6. Analisis Korelasi (Semua fitur vs Final Score)
    # Kita flatten likert agar bisa dikorelasikan per-pertanyaan
    flat_data = []
    for i in range(len(responses)):
        row = {"final_satisfaction": final_scores[i]}
        # Masukkan detail likert
        row.update(likert_norm[i]) 
        # Masukkan skor sentimen
        if sentiment_scores[i] is not None:
            row["sentiment_score_nlp"] = sentiment_scores[i]
        flat_data.append(row)
    
    df_corr = pd.DataFrame(flat_data)
    correlations = _compute_correlations(df_corr, "final_satisfaction")

    # 7. Distribusi Sentimen
    dist = {"positive": 0, "negative": 0, "neutral": 0}
    for l in sentiment_labels:
        if l and l in dist: dist[l] += 1
        
    return {
        "final_satisfaction_scores": final_scores,
        "average_satisfaction": float(np.mean(final_scores)) if final_scores else 0.0,
        "sentiment_labels": sentiment_labels,
        "sentiment_scores": sentiment_scores,
        "sentiment_distribution": dist,
        "correlations": correlations,
        "details": {
            "likert_normalized": likert_norm,
            "categorical_scores": cat_scores
        }
    }