from typing import List, Dict, Any, Optional, Tuple
import os
from pathlib import Path
import numpy as np
import pandas as pd
from scipy.stats import pearsonr, spearmanr
import re

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
    from .sentiment_analysis_service import predict_single
except Exception:
    pass # Handle import manual jika perlu
finally:
    try:
        os.chdir(_original_cwd)
    except Exception:
        pass 

# --- END IMPORT ---

def _extract_numeric_from_likert(value: Any) -> Optional[float]:
    """
    Extract numeric value dari Likert response.
    Handle berbagai format: "Label 5", "Option 1", "5", 5, dll.
    
    Args:
        value: Nilai Likert yang bisa berupa string, int, atau float
    
    Returns:
        Float value atau None jika tidak bisa diextract
    """
    if value is None:
        return None
    
    # Jika sudah numerik
    if isinstance(value, (int, float)):
        return float(value)
    
    value_str = str(value).strip()
    
    # Coba langsung convert ke float
    try:
        return float(value_str)
    except (ValueError, TypeError):
        pass
    
    # Extract angka dari string (e.g., "Label 5" → 5, "Option 3" → 3)
    numbers = re.findall(r'\d+', value_str)
    if numbers:
        return float(numbers[0])
    
    # Mapping text-based Likert untuk fallback
    value_lower = value_str.lower()
    if any(kw in value_lower for kw in ["sangat", "very", "excellent", "terbaik", "paling"]):
        return 5.0
    if any(kw in value_lower for kw in ["puas", "baik", "good", "satisfied", "setuju"]):
        return 4.0
    if any(kw in value_lower for kw in ["biasa", "netral", "neutral", "average", "cukup"]):
        return 3.0
    if any(kw in value_lower for kw in ["kurang", "tidak", "poor", "bad", "tidak setuju"]):
        return 2.0
    if any(kw in value_lower for kw in ["sangat tidak", "very poor", "worst", "sangat kurang"]):
        return 1.0
    
    return None


def _normalize_likert(
    likert_list: List[Dict[str, Any]],
    likert_min: float,
    likert_max: float,
) -> List[Dict[str, float]]:
    """Mengubah skala 1-5 menjadi 0.0-1.0"""
    scale = likert_max - likert_min
    if scale <= 0:
        raise ValueError("likert_max must be greater than likert_min")

    normalized_all: List[Dict[str, float]] = []
    for ans in likert_list:
        normalized = {}
        for k, v in ans.items():
            # Extract numeric value dari berbagai format
            numeric_val = _extract_numeric_from_likert(v)
            if numeric_val is not None:
                normalized[k] = (numeric_val - likert_min) / scale
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
) -> Tuple[List[Optional[str]], List[Optional[float]], List[Optional[float]]]:
    """
    Mendapatkan label sentimen, skor ternormalisasi (0-1), dan confidence score dari IndoBERT.
    
    Returns:
        Tuple of (labels, scores, confidence_scores)
    """
    labels: List[Optional[str]] = []
    scores: List[Optional[float]] = []
    confidence_scores: List[Optional[float]] = []

    for text in texts:
        if not text:
            labels.append(None)
            scores.append(None) # Nanti dianggap netral atau di-skip
            confidence_scores.append(None)
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
            confidence_scores.append(confidence)  # Simpan confidence score untuk explainability
        except:
            labels.append("neutral")
            scores.append(0.5)
            confidence_scores.append(0.5)  # Default confidence jika error

    return labels, scores, confidence_scores


def normalize_sentiment_distribution(
    sentiment_dist_raw: Any,
    satisfaction_scores: List[float],
) -> Dict[str, int]:
    """
    Normalize sentiment distribution dari hasil AI service.
    Jika sentiment distribution kosong, gunakan satisfaction scores sebagai fallback.
    
    Args:
        sentiment_dist_raw: Raw sentiment distribution dari AI service
        satisfaction_scores: List satisfaction scores (0-1)
    
    Returns:
        Dictionary dengan keys "positive", "negative", "neutral"
    """
    if not isinstance(sentiment_dist_raw, dict):
        sentiment_dist = {"positive": 0, "negative": 0, "neutral": 0}
    else:
        sentiment_dist = {
            "positive": int(sentiment_dist_raw.get("positive", 0)),
            "negative": int(sentiment_dist_raw.get("negative", 0)),
            "neutral": int(sentiment_dist_raw.get("neutral", 0)),
        }
    
    # Jika sentiment_distribution kosong (semua 0), gunakan satisfaction_scores sebagai fallback
    total_sentiment = sentiment_dist["positive"] + sentiment_dist["negative"] + sentiment_dist["neutral"]
    if total_sentiment == 0 and satisfaction_scores:
        # Hitung distribusi sentimen berdasarkan satisfaction scores
        # Score > 0.7 = positive, < 0.3 = negative, else = neutral
        for score in satisfaction_scores:
            if score > 0.7:
                sentiment_dist["positive"] += 1
            elif score < 0.3:
                sentiment_dist["negative"] += 1
            else:
                sentiment_dist["neutral"] += 1
    
    return sentiment_dist

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
    Fungsi Utama AI-1: Menganalisa kepuasan responden.
    Sekarang IKG (Indeks Kepuasan Gabungan) dari ikg_service digunakan sebagai output akhir
    untuk konsistensi single source of truth di seluruh backend.
    """
    if not responses:
        return {}

    # 1. Extract Data
    likert_list = [r.get("likert", {}) for r in responses]
    texts = [r.get("text", "") for r in responses]
    categorical_list = [r.get("categorical", {}) for r in responses]

    # 2. Process Likert (0-1)
    likert_norm = _normalize_likert(likert_list, likert_min, likert_max)
    
    # 3. Process Sentiment (0-1)
    sentiment_labels, sentiment_scores, sentiment_confidence_scores = _run_sentiment(texts)
    
    # 4. Process Categorical Scoring (0-1)
    cat_scores = _score_categorical_answers(categorical_list, categorical_mapping or {})
    
    # 5. Hitung IKG melalui ikg_service untuk konsistensi single source of truth
    # Kita import di sini untuk menghindari circular import jika ada
    from .ikg_service import compute_combined_satisfaction_index
    
    ikg_result = compute_combined_satisfaction_index(
        raw_responses=responses,
        categorical_features=categorical_list,
        sentiment_labels=sentiment_labels,
        sentiment_confidence_scores=sentiment_confidence_scores,
        likert_min_val=likert_min,
        likert_max_val=likert_max
    )

    # 5.1 Calculate ETI per respondent based on deviation from mean IKG
    # Use ETI service to compute deviation-based ETI
    from .eti_service import calculate_eti_score
    ikg_per_respondent_100 = ikg_result.get("per_respondent", [])
    eti_scores = calculate_eti_score(
        sentiment_scores=sentiment_scores,
        satisfaction_scores=ikg_per_respondent_100,
        sentiment_confidence=sentiment_confidence_scores
    )
    
    # Konversi IKG 0-100 ke 0-1 untuk pipeline internal yang lama
    # NOTE: We keep the original IKG (0-100) available as well so
    # downstream services can use the single source of truth without
    # recomputing the index. This avoids duplicated calculations.
    ikg_per_respondent_100 = ikg_result.get("per_respondent", [])
    final_scores = [s / 100.0 for s in ikg_per_respondent_100]

    # Expose IKG metadata (0-100) to callers for backward compatibility
    ikg_survey_index_100 = ikg_result.get("survey_index")
    ikg_distribution = ikg_result.get("distribution", {})
    ikg_explainability = ikg_result.get("explainability", [])
    ikg_confidence_scores = ikg_result.get("confidence_scores", [])
    ikg_weight_metadata = ikg_result.get("weight_metadata", {})
    ikg_validation_metrics = ikg_result.get("validation_metrics", {})

    # 6. Analisis Korelasi (Semua fitur vs IKG)
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
        "sentiment_confidence_scores": sentiment_confidence_scores,  # Tambahan: confidence scores untuk explainability
        "sentiment_distribution": dist,
        "correlations": correlations,
        "details": {
            "likert_normalized": likert_norm,
            "categorical_scores": cat_scores
        },
        # Expose IKG (single source of truth) metadata so callers don't recompute IKG
        "eti_scores": eti_scores,
        "ikg_per_respondent_100": ikg_per_respondent_100,
        "ikg_survey_index_100": ikg_survey_index_100,
        "ikg_distribution": ikg_distribution,
        "ikg_explainability": ikg_explainability,
        "ikg_confidence_scores": ikg_confidence_scores,
        "ikg_weight_metadata": ikg_weight_metadata,
        "ikg_validation_metrics": ikg_validation_metrics,
    }
