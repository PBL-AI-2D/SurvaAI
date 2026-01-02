from typing import List, Dict, Any, Optional
import numpy as np
from .eti_service import calculate_eti_score, predict_trend_from_eti


def forecast_eti_trend(
    sentiment_scores: List[float],
    satisfaction_scores: List[float],
    satisfaction_history: Optional[List[List[float]]] = None,
    historical_preferences: Optional[List[List[Dict[str, Any]]]] = None,
    current_preferences: Optional[List[Dict[str, Any]]] = None,
    weights: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    Forecast terhadap nilai IKG (Indeks Kepuasan Gabungan).
    Melakukan prediksi trend ke depan berbasis IKG sebagai single source of truth.
    
    Args:
        sentiment_scores: [Legacy] Tidak lagi digunakan secara langsung.
        satisfaction_scores: [Single Source of Truth] List IKG per responden (0-1).
        satisfaction_history: [Legacy/Optional] Riwayat IKG jika tersedia.
        historical_preferences: Riwayat preferensi per responden (optional).
        current_preferences: Preferensi saat ini per responden (optional).
        weights: [Legacy] Tidak lagi digunakan secara langsung.
    """
    # Normalize incoming satisfaction_scores to 0-1 if provided in 0-100 scale.
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

    # 1. Calculate ETI scores berbasis IKG
    # Pass sentiment_confidence if available in some context, for now we pass None 
    # and let calculate_eti_score use default if not provided in args.
    # To improve this, we should ideally get sentiment_confidence from somewhere.
    eti_scores = calculate_eti_score(
        sentiment_scores=sentiment_scores,
        satisfaction_scores=norm_satisfaction,
        weights=weights,
        sentiment_confidence=None # Adjust if confidence is available in args
    )
    
    # 2. Predict trends from ETI
    trend_predictions, trend_percentages = predict_trend_from_eti(eti_scores)
    
    # 3. Calculate preference consistency (simplified)
    preference_consistency = []
    if current_preferences and historical_preferences:
        for i, (current, history) in enumerate(zip(current_preferences, historical_preferences)):
            if history and len(history) > 0:
                # Simple consistency: compare current with last historical
                last_hist = history[-1] if isinstance(history[-1], dict) else {}
                common_keys = set(current.keys()) & set(last_hist.keys())
                if common_keys:
                    matches = sum(1 for k in common_keys if current[k] == last_hist[k])
                    consistency = matches / len(common_keys) if common_keys else 0.5
                else:
                    consistency = 0.5
            else:
                consistency = 0.5
            preference_consistency.append(float(consistency))
    else:
        # Default consistency jika tidak ada history
        preference_consistency = [0.5] * len(eti_scores)
    
    # 4. Calculate extreme deviation (simplified)
    # Deviation dari mean ETI score
    mean_eti = np.mean(eti_scores) if eti_scores else 0.5
    extreme_deviation = [
        float(abs(eti - mean_eti)) for eti in eti_scores
    ]
    
    # 5. Predict future satisfaction (simplified - menggunakan trend)
    predicted_satisfaction = None
    regression_trends = None
    if satisfaction_history and len(satisfaction_history) > 0:
        predicted_satisfaction = []
        regression_trends = []
        for i, (current_sat, trend) in enumerate(zip(satisfaction_scores, trend_predictions)):
            # Use normalized current_sat (we normalized earlier to norm_satisfaction)
            current_val = norm_satisfaction[i] if i < len(norm_satisfaction) else (float(current_sat) if current_sat is not None else 0.0)
            if trend == "naik":
                predicted_sat = min(1.0, current_val + 0.05)
                regression_trends.append("increasing")
            elif trend == "turun":
                predicted_sat = max(0.0, current_val - 0.05)
                regression_trends.append("decreasing")
            else:
                predicted_sat = current_val
                regression_trends.append("stable")
            predicted_satisfaction.append(float(predicted_sat))
    
    # 6. Preference predictions (simplified)
    preference_predictions = {}
    feature_importance = {}
    
    if current_preferences:
        # Extract all preference keys
        all_keys = set()
        for pref in current_preferences:
            all_keys.update(pref.keys())
        
        for key in all_keys:
            values = [pref.get(key, 0) for pref in current_preferences]
            # Simple prediction: use current value or average
            preference_predictions[key] = values
            feature_importance[key] = float(np.std(values)) if values else 0.0
    
    # 7. Metrics (simplified)
    metrics = {
        "mean_eti": float(np.mean(eti_scores)) if eti_scores else 0.0,
        "std_eti": float(np.std(eti_scores)) if eti_scores else 0.0,
        "trend_distribution": {
            "naik": sum(1 for t in trend_predictions if t == "naik"),
            "stabil": sum(1 for t in trend_predictions if t == "stabil"),
            "turun": sum(1 for t in trend_predictions if t == "turun"),
        }
    }
    
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
