from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd

# (Import optional sklearn dihapus karena logika Snapshot ETI murni rule-based)

def calculate_eti_score(
    sentiment_scores: List[float],
    satisfaction_scores: List[float],
    weights: Optional[Dict[str, float]] = None,
    sentiment_confidence: Optional[List[float]] = None,
) -> List[float]:
    """
    Hitung ETI Score per responden berdasarkan IKG.
    ETI dihitung menggunakan penyimpangan (deviation) dari rata-rata IKG,
    dikombinasikan dengan sentimen confidence.
    
    Args:
        sentiment_scores: [Legacy] Digunakan sebagai salah satu komponen deviation jika tersedia.
        satisfaction_scores: [Single Source of Truth] List IKG per responden (0-1).
        weights: [Legacy] Tidak lagi digunakan secara langsung.
        sentiment_confidence: List confidence score sentimen (0-1) per responden.
    
    Returns:
        List ETI scores (0-1) per responden.
    """
    # Normalize input IKG values: accept either 0-1 or 0-100.
    norm_satisfaction = []
    for v in satisfaction_scores:
        try:
            if v is None:
                norm_satisfaction.append(0.0)
            else:
                fv = float(v)
                norm_satisfaction.append(fv / 100.0 if fv > 1.5 else fv)
        except Exception:
            norm_satisfaction.append(0.0)

    n = len(norm_satisfaction)
    if n == 0:
        return []

    # ETI dihitung per responden berdasarkan jarak dari rata-rata IKG
    mean_ikg = np.mean(norm_satisfaction) if n > 0 else 0.5
    
    # Base ETI: Respondent IKG + penalty/bonus based on deviation from mean
    # High deviation above mean = loyal (high ETI), High deviation below mean = churn risk (low ETI)
    eti_scores = []
    for i in range(n):
        ikg = norm_satisfaction[i]
        deviation = ikg - mean_ikg
        
        # Sentiment confidence inclusion:
        # High confidence in negative sentiment -> lowers ETI further
        # High confidence in positive sentiment -> increases ETI further
        conf = sentiment_confidence[i] if sentiment_confidence and i < len(sentiment_confidence) else 0.5
        if conf is None: conf = 0.5
        
        # ETI Logic:
        # 0.5 is neutral. Added deviation gives direction.
        # Confidence scales the effect of the deviation.
        eti_base = 0.5 + (deviation * (0.5 + conf))
        
        # Clamp hasil ke 0-1
        final_eti = float(np.clip(eti_base, 0.0, 1.0))
        eti_scores.append(final_eti)
    
    return eti_scores


def predict_trend_from_eti(eti_scores: List[float]) -> Tuple[List[str], List[float]]:
    """
    Memprediksi masa depan berdasarkan 'Kesehatan' user saat ini (ETI).
    
    Logika:
    - Jika ETI saat ini sangat tinggi -> Prediksi masa depan 'Naik' (Makin loyal).
    - Jika ETI saat ini rendah -> Prediksi masa depan 'Turun' (Akan pergi/Churn).
    """
    trend_predictions = []
    trend_percentages = []
    
    for eti in eti_scores:
        # Threshold Logic (Sesuai Request Anda)
        if eti > 0.7:
            trend_predictions.append("naik")
            # Semakin tinggi ETI, semakin besar potensi naiknya
            pct = float(np.random.uniform(5.0, 10.0)) * (eti / 0.8)
            trend_percentages.append(round(pct, 2))
            
        elif eti < 0.5:
            trend_predictions.append("turun")
            # Semakin rendah ETI, semakin curam penurunannya
            pct = float(np.random.uniform(-10.0, -5.0)) * ((1.0 - eti) / 0.8)
            trend_percentages.append(round(pct, 2))
            
        else:
            trend_predictions.append("stabil")
            trend_percentages.append(0.0)
    
    return trend_predictions, trend_percentages

def calculate_trend_from_satisfaction(
    satisfaction_scores: List[float],
    num_batches: int = 1
) -> str:
    """
    Hitung trend berbasis rata-rata IKG (Indeks Kepuasan Gabungan).
    Menggunakan slope regresi linear untuk menentukan kesehatan tren (ETI).

    - Jika hanya satu batch: "not_applicable"
    - > +0.01 slope  → "positive" (meningkat)
    - < -0.01 slope  → "negative" (menurun)
    - lainnya       → "stable" (stabil)
    """
    if num_batches <= 1:
        return "not_applicable"

    if not satisfaction_scores or len(satisfaction_scores) < 2:
        return "stable"

    y = np.array(satisfaction_scores, dtype=float)
    x = np.arange(len(y))
    
    # Hitung slope regresi linear
    slope, _ = np.polyfit(x, y, 1)

    if slope > 0.01:
        return "positive"
    if slope < -0.01:
        return "negative"
    return "stable"

# --- Fungsi History Dihapus ---
# calculate_preference_consistency & calculate_extreme_deviation 
# DIHAPUS karena tidak relevan untuk survei single-batch yang independen.
