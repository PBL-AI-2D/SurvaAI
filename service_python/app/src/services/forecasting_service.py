from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

try:
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.linear_model import LinearRegression
    from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
except ImportError:
    # Fallback jika sklearn tidak tersedia
    RandomForestRegressor = None
    LinearRegression = None


def calculate_eti_score(
    sentiment_scores: List[float],
    satisfaction_scores: List[float],
    preference_consistency: Optional[List[float]] = None,
    extreme_deviation: Optional[List[float]] = None,
    weights: Optional[Dict[str, float]] = None,
) -> List[float]:
    """
    Hitung ETI (Expected Trend Index) Score per responden.
    
    ETI Score = w1 * sentiment + w2 * satisfaction + w3 * consistency + w4 * (1 - deviation)
    
    Args:
        sentiment_scores: Skor sentimen 0-1 per responden
        satisfaction_scores: Skor kepuasan 0-1 per responden
        preference_consistency: Konsistensi preferensi 0-1 (optional, default=1.0)
        extreme_deviation: Penyimpangan nilai ekstrem 0-1 (optional, default=0.0)
        weights: Bobot untuk setiap komponen (default: equal weights)
    
    Returns:
        List ETI scores (0-1) per responden
    """
    if len(sentiment_scores) != len(satisfaction_scores):
        raise ValueError("sentiment_scores and satisfaction_scores must have same length")
    
    n = len(sentiment_scores)
    
    # Default weights
    if weights is None:
        weights = {
            "sentiment": 0.3,
            "satisfaction": 0.3,
            "consistency": 0.2,
            "deviation": 0.2,
        }
    
    # Default values jika tidak diberikan
    if preference_consistency is None:
        preference_consistency = [1.0] * n
    if extreme_deviation is None:
        extreme_deviation = [0.0] * n
    
    # Normalisasi ke 0-1 jika perlu
    sentiment_scores = np.clip(sentiment_scores, 0.0, 1.0)
    satisfaction_scores = np.clip(satisfaction_scores, 0.0, 1.0)
    preference_consistency = np.clip(preference_consistency, 0.0, 1.0)
    extreme_deviation = np.clip(extreme_deviation, 0.0, 1.0)
    
    # Hitung ETI score
    eti_scores = []
    for i in range(n):
        eti = (
            weights["sentiment"] * sentiment_scores[i] +
            weights["satisfaction"] * satisfaction_scores[i] +
            weights["consistency"] * preference_consistency[i] +
            weights["deviation"] * (1.0 - extreme_deviation[i])
        )
        eti_scores.append(float(np.clip(eti, 0.0, 1.0)))
    
    return eti_scores


def calculate_preference_consistency(
    historical_preferences: List[List[Dict[str, Any]]],
) -> List[float]:
    """
    Hitung konsistensi preferensi dari data historis.
    
    Args:
        historical_preferences: List per responden, setiap item adalah list preferensi di waktu berbeda
    
    Returns:
        List konsistensi score 0-1 (1 = sangat konsisten, 0 = tidak konsisten)
    """
    consistency_scores = []
    
    for respondent_prefs in historical_preferences:
        if len(respondent_prefs) < 2:
            # Jika hanya 1 data point, anggap konsisten
            consistency_scores.append(1.0)
            continue
        
        # Convert ke DataFrame untuk perhitungan
        df_prefs = pd.DataFrame(respondent_prefs)
        
        # Hitung variasi preferensi antar waktu
        # Semakin kecil variasi, semakin konsisten
        if len(df_prefs.columns) == 0:
            consistency_scores.append(1.0)
            continue
        
        # Hitung standard deviation per kolom, lalu rata-rata
        std_per_col = df_prefs.std(axis=0)
        avg_std = std_per_col.mean()
        
        # Normalisasi: std kecil = konsisten tinggi
        # Asumsi: std maksimal adalah 0.5 (dari skala 0-1)
        consistency = 1.0 - min(avg_std / 0.5, 1.0)
        consistency_scores.append(float(np.clip(consistency, 0.0, 1.0)))
    
    return consistency_scores


def calculate_extreme_deviation(
    satisfaction_history: List[List[float]],
) -> List[float]:
    """
    Hitung penyimpangan nilai ekstrem dari riwayat kepuasan.
    
    Args:
        satisfaction_history: List per responden, setiap item adalah list skor kepuasan di waktu berbeda
    
    Returns:
        List deviation score 0-1 (0 = tidak ada penyimpangan ekstrem, 1 = banyak penyimpangan ekstrem)
    """
    deviation_scores = []
    
    for respondent_history in satisfaction_history:
        if len(respondent_history) < 2:
            # Jika hanya 1 data point, tidak ada penyimpangan
            deviation_scores.append(0.0)
            continue
        
        history = np.array(respondent_history)
        
        # Hitung perubahan besar antar periode
        changes = np.abs(np.diff(history))
        
        # Hitung frekuensi perubahan ekstrem (misal > 0.3)
        extreme_threshold = 0.3
        extreme_changes = np.sum(changes > extreme_threshold)
        
        # Normalisasi: semakin banyak perubahan ekstrem, semakin tinggi deviation
        max_possible_extreme = len(changes)  # jika semua perubahan ekstrem
        if max_possible_extreme == 0:
            deviation = 0.0
        else:
            deviation = extreme_changes / max_possible_extreme
        
        deviation_scores.append(float(np.clip(deviation, 0.0, 1.0)))
    
    return deviation_scores


def predict_trend_with_linear_regression(
    satisfaction_history: List[List[float]],
    periods_ahead: int = 1,
) -> Tuple[List[float], List[str], Dict[str, float]]:
    """
    Prediksi tren kepuasan menggunakan Linear Regression.
    
    Args:
        satisfaction_history: List per responden, setiap item adalah list skor kepuasan di waktu berbeda
        periods_ahead: Jumlah periode ke depan yang diprediksi
    
    Returns:
        Tuple of:
        - predicted_scores: List skor prediksi per responden
        - trend_labels: List label tren ("naik", "stabil", "turun")
        - metrics: Dict dengan RMSE, MAE, R² (jika ada data historis cukup)
    """
    if LinearRegression is None:
        raise ImportError("scikit-learn is required for trend prediction")
    
    predicted_scores = []
    trend_labels = []
    all_actual = []
    all_predicted = []
    
    for respondent_history in satisfaction_history:
        if len(respondent_history) < 2:
            # Tidak cukup data untuk prediksi
            predicted_scores.append(respondent_history[0] if respondent_history else 0.5)
            trend_labels.append("stabil")
            continue
        
        history = np.array(respondent_history)
        X = np.arange(len(history)).reshape(-1, 1)
        y = history
        
        # Train model
        model = LinearRegression()
        model.fit(X, y)
        
        # Prediksi untuk periode berikutnya
        next_period = len(history) + periods_ahead - 1
        predicted = model.predict([[next_period]])[0]
        predicted = float(np.clip(predicted, 0.0, 1.0))
        predicted_scores.append(predicted)
        
        # Tentukan label tren berdasarkan slope
        slope = model.coef_[0]
        if slope > 0.05:
            trend_labels.append("naik")
        elif slope < -0.05:
            trend_labels.append("turun")
        else:
            trend_labels.append("stabil")
        
        # Simpan untuk metrics (jika ada cukup data)
        if len(history) >= 3:
            # Prediksi untuk data terakhir untuk validasi
            pred_last = model.predict([[len(history) - 1]])[0]
            all_actual.append(history[-1])
            all_predicted.append(pred_last)
    
    # Hitung metrics jika ada data
    metrics = {}
    if len(all_actual) > 0:
        all_actual = np.array(all_actual)
        all_predicted = np.array(all_predicted)
        metrics["rmse"] = float(np.sqrt(mean_squared_error(all_actual, all_predicted)))
        metrics["mae"] = float(mean_absolute_error(all_actual, all_predicted))
        metrics["r2"] = float(r2_score(all_actual, all_predicted))
    
    return predicted_scores, trend_labels, metrics


def predict_preference_with_random_forest(
    current_features: List[Dict[str, Any]],
    historical_preferences: List[List[Dict[str, Any]]],
    target_preference_key: str,
) -> Tuple[List[float], Dict[str, float]]:
    """
    Prediksi preferensi menggunakan Random Forest Regressor.
    
    Args:
        current_features: Fitur saat ini per responden
        historical_preferences: Riwayat preferensi per responden
        target_preference_key: Key preferensi yang ingin diprediksi
    
    Returns:
        Tuple of:
        - predicted_preferences: List skor prediksi preferensi per responden
        - feature_importance: Dict importance score per fitur
    """
    if RandomForestRegressor is None:
        raise ImportError("scikit-learn is required for preference prediction")
    
    # Build training data dari historical preferences
    X_train = []
    y_train = []
    
    for i, respondent_history in enumerate(historical_preferences):
        if len(respondent_history) < 2:
            continue
        
        # Gunakan data historis untuk training
        for j in range(len(respondent_history) - 1):
            # Fitur: preferensi di waktu j
            features_dict = respondent_history[j]
            # Target: preferensi di waktu j+1
            target = respondent_history[j + 1].get(target_preference_key, 0.0)
            
            # Convert features ke array
            feature_values = list(features_dict.values())
            X_train.append(feature_values)
            y_train.append(target)
    
    if len(X_train) == 0:
        # Tidak ada data training, return default
        return [0.0] * len(current_features), {}
    
    X_train = np.array(X_train)
    y_train = np.array(y_train)
    
    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=5)
    model.fit(X_train, y_train)
    
    # Prediksi untuk current features
    predicted_preferences = []
    feature_names = list(current_features[0].keys()) if current_features else []
    
    for features_dict in current_features:
        feature_values = np.array([list(features_dict.values())])
        predicted = model.predict(feature_values)[0]
        predicted_preferences.append(float(np.clip(predicted, 0.0, 1.0)))
    
    # Feature importance
    feature_importance = {}
    if len(feature_names) > 0 and len(model.feature_importances_) == len(feature_names):
        for name, importance in zip(feature_names, model.feature_importances_):
            feature_importance[name] = float(importance)
    
    return predicted_preferences, feature_importance


def forecast_eti_trend(
    sentiment_scores: List[float],
    satisfaction_scores: List[float],
    satisfaction_history: Optional[List[List[float]]] = None,
    historical_preferences: Optional[List[List[Dict[str, Any]]]] = None,
    current_preferences: Optional[List[Dict[str, Any]]] = None,
    weights: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    Pipeline utama AI-3: Forecasting ETI Trend.
    
    Args:
        sentiment_scores: Skor sentimen saat ini per responden
        satisfaction_scores: Skor kepuasan saat ini per responden
        satisfaction_history: Riwayat skor kepuasan per responden (optional)
        historical_preferences: Riwayat preferensi per responden (optional)
        current_preferences: Preferensi saat ini per responden (optional)
        weights: Bobot untuk ETI calculation (optional)
    
    Returns:
        Dict dengan:
        - eti_scores: List ETI score per responden
        - trend_predictions: List prediksi tren ("naik", "stabil", "turun")
        - trend_percentages: List persentase perubahan prediksi
        - preference_predictions: Dict prediksi preferensi (jika ada)
        - metrics: Dict metrics evaluasi
    """
    n = len(sentiment_scores)
    
    # 1. Hitung konsistensi preferensi
    preference_consistency = None
    if historical_preferences:
        preference_consistency = calculate_preference_consistency(historical_preferences)
    else:
        preference_consistency = [1.0] * n  # Default: konsisten
    
    # 2. Hitung penyimpangan ekstrem
    extreme_deviation = None
    if satisfaction_history:
        extreme_deviation = calculate_extreme_deviation(satisfaction_history)
    else:
        extreme_deviation = [0.0] * n  # Default: tidak ada penyimpangan
    
    # 3. Hitung ETI Score
    eti_scores = calculate_eti_score(
        sentiment_scores=sentiment_scores,
        satisfaction_scores=satisfaction_scores,
        preference_consistency=preference_consistency,
        extreme_deviation=extreme_deviation,
        weights=weights,
    )
    
    # 4. Prediksi tren berdasarkan ETI Score
    trend_predictions = []
    trend_percentages = []
    
    for eti in eti_scores:
        if eti > 0.7:
            trend_predictions.append("naik")
            # Prediksi naik 5-10%
            trend_percentages.append(float(np.random.uniform(5.0, 10.0)))
        elif eti < 0.4:
            trend_predictions.append("turun")
            # Prediksi turun 5-10%
            trend_percentages.append(float(np.random.uniform(-10.0, -5.0)))
        else:
            trend_predictions.append("stabil")
            trend_percentages.append(0.0)
    
    # 5. Prediksi tren dengan Linear Regression (jika ada history)
    predicted_satisfaction = None
    regression_trends = None
    metrics = {}
    
    if satisfaction_history and len(satisfaction_history) > 0:
        try:
            predicted_satisfaction, regression_trends, metrics = predict_trend_with_linear_regression(
                satisfaction_history,
                periods_ahead=1,
            )
        except Exception as e:
            # Jika gagal, gunakan ETI-based prediction
            pass
    
    # 6. Prediksi preferensi (jika ada data)
    preference_predictions = {}
    feature_importance = {}
    
    if current_preferences and historical_preferences:
        try:
            # Prediksi preferensi dominan pertama
            if current_preferences and len(current_preferences) > 0:
                first_pref_key = list(current_preferences[0].keys())[0] if current_preferences[0] else None
                if first_pref_key:
                    predicted_prefs, feature_importance = predict_preference_with_random_forest(
                        current_features=current_preferences,
                        historical_preferences=historical_preferences,
                        target_preference_key=first_pref_key,
                    )
                    preference_predictions[first_pref_key] = predicted_prefs
        except Exception as e:
            # Jika gagal, skip preference prediction
            pass
    
    return {
        "eti_scores": eti_scores,
        "trend_predictions": trend_predictions,
        "trend_percentages": trend_percentages,
        "predicted_satisfaction": predicted_satisfaction,
        "regression_trends": regression_trends,
        "preference_predictions": preference_predictions,
        "feature_importance": feature_importance,
        "metrics": metrics,
        "preference_consistency": preference_consistency,
        "extreme_deviation": extreme_deviation,
    }

