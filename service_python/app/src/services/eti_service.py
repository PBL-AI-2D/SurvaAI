from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd

# (Import optional sklearn dihapus karena logika Snapshot ETI murni rule-based)

def calculate_eti_score(
    sentiment_scores: List[float],
    satisfaction_scores: List[float],
    weights: Optional[Dict[str, float]] = None,
) -> List[float]:
    """
    Hitung ETI Score per responden HANYA berdasarkan data survei saat ini.
    
    Karena survei bersifat independen (tidak ada history), ETI dihitung dari:
    1. Sentimen (Opini Teks) -> Bobot Besar (Indikator Emosi)
    2. Kepuasan (Skor Angka) -> Bobot Sedang (Indikator Rasional)
    
    Args:
        sentiment_scores: Skor sentimen 0-1 per responden
        satisfaction_scores: Skor kepuasan 0-1 per responden
        weights: Bobot komponen (default: sentiment=0.6, satisfaction=0.4)
    
    Returns:
        List ETI scores (0-1) per responden
    """
    if len(sentiment_scores) != len(satisfaction_scores):
        raise ValueError("sentiment_scores and satisfaction_scores must have same length")
    
    n = len(sentiment_scores)
    
    # Default weights untuk Snapshot Analysis
    # Sentimen diberi bobot lebih besar karena merefleksikan emosi jujur
    if weights is None:
        weights = {
            "sentiment": 0.6, 
            "satisfaction": 0.4
        }
    
    # Normalisasi (Safety check)
    sentiment_scores = np.clip(sentiment_scores, 0.0, 1.0)
    satisfaction_scores = np.clip(satisfaction_scores, 0.0, 1.0)
    
    eti_scores = []
    for i in range(n):
        # Rumus ETI Sederhana (Snapshot)
        eti = (
            weights["sentiment"] * sentiment_scores[i] +
            weights["satisfaction"] * satisfaction_scores[i]
        )
        eti_scores.append(float(np.clip(eti, 0.0, 1.0)))
    
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
            
        elif eti < 0.4:
            trend_predictions.append("turun")
            # Semakin rendah ETI, semakin curam penurunannya
            pct = float(np.random.uniform(-10.0, -5.0)) * ((1.0 - eti) / 0.8)
            trend_percentages.append(round(pct, 2))
            
        else:
            trend_predictions.append("stabil")
            trend_percentages.append(0.0)
    
    return trend_predictions, trend_percentages

# --- Fungsi History Dihapus ---
# calculate_preference_consistency & calculate_extreme_deviation 
# DIHAPUS karena tidak relevan untuk survei single-batch yang independen.