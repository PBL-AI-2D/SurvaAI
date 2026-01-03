"""
Service untuk menghitung Indeks Kepuasan Gabungan (IKG).
IKG menggabungkan Likert, Sentimen, dan Preferensi dengan bobot dinamis.
"""
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import re

try:
    from .sentiment_analysis_service import predict_single as sentiment_predict_single
except ImportError:
    sentiment_predict_single = None

from .preference_analysis_service import (
    map_preference_value_to_score,
    compute_preference_scores_from_categorical,
)


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


def map_sentiment_label_to_score(label: Optional[str]) -> Optional[float]:

    if not label:
        return None

    label_lower = str(label).lower()
    if label_lower == "positive":
        return 85.0
    if label_lower == "neutral":
        return 70.0
    if label_lower == "negative":
        return 50.0
    return None


def detect_language(text: str) -> str:
    """
    Deteksi bahasa sederhana untuk multi-language sentiment support.
    
    Alasan: IndoBERT optimal untuk bahasa Indonesia, namun bisa handle
    bahasa lain dengan akurasi lebih rendah. Deteksi ini membantu
    memberikan konteks explainability.
    
    Returns:
        "id" untuk Indonesia, "en" untuk Inggris, "other" untuk lainnya
    """
    if not text or not isinstance(text, str):
        return "unknown"
    
    text_lower = text.lower()
    # Deteksi sederhana: hitung karakter Indonesia (khusus) vs ASCII
    indo_chars = sum(1 for c in text if ord(c) > 127 and c not in ".,!?;:()[]{}")
    total_chars = len([c for c in text if c.isalpha()])
    
    if total_chars == 0:
        return "unknown"
    
    indo_ratio = indo_chars / total_chars if total_chars > 0 else 0
    
    # Jika >30% karakter non-ASCII, kemungkinan Indonesia
    if indo_ratio > 0.3:
        return "id"
    # Deteksi kata-kata umum Inggris
    en_words = ["the", "is", "are", "was", "were", "this", "that", "with", "from"]
    if any(word in text_lower for word in en_words):
        return "en"
    return "other"


def calculate_dynamic_weights(
    *,
    raw_responses: List[Dict[str, Any]],
    categorical_features: List[Dict[str, Any]],
    sentiment_labels: List[Any],
    sentiment_confidence_scores: List[Optional[float]],
    likert_min_val: float,
    likert_max_val: float,
) -> Tuple[float, float, float, Dict[str, Any]]:
    """
    Hitung bobot dinamis berdasarkan ketersediaan dan kualitas data.
    
    Logika:
    - Jika >60% responden punya Likert → naikkan bobot Likert
    - Jika teks dominan → naikkan bobot sentimen
    - Jika confidence rendah (<0.6) → turunkan bobot sentimen
    - Normalisasi agar total = 1.0
    
    Returns:
        Tuple of (weight_likert, weight_sentiment, weight_preference, metadata)
    """
    n = len(raw_responses)
    if n == 0:
        return (0.40, 0.35, 0.25, {"method": "default", "reason": "no_data"})
    
    # Hitung ketersediaan data
    likert_count = 0
    sentiment_count = 0
    preference_count = 0
    low_confidence_count = 0
    total_confidence = 0.0
    valid_confidence_count = 0
    
    for idx in range(n):
        resp = raw_responses[idx] or {}
        
        # Check Likert
        likert_raw = resp.get("likert") or {}
        if isinstance(likert_raw, dict) and likert_raw:
            numeric_vals = []
            for k, v in likert_raw.items():
                try:
                    val = _extract_numeric_from_likert(v)
                    if val is not None:
                        numeric_vals.append(val)
                except:
                    continue
            if numeric_vals:
                likert_count += 1
        
        # Check Sentiment
        sentiment_label = (
            sentiment_labels[idx] if idx < len(sentiment_labels) else None
        )
        if sentiment_label:
            sentiment_count += 1
            
            # Check confidence
            sentiment_confidence = (
                sentiment_confidence_scores[idx] 
                if idx < len(sentiment_confidence_scores) 
                and sentiment_confidence_scores[idx] is not None
                else None
            )
            if sentiment_confidence is not None:
                total_confidence += sentiment_confidence
                valid_confidence_count += 1
                if sentiment_confidence < 0.6:
                    low_confidence_count += 1
        
        # Check Preference
        if idx < len(categorical_features):
            cat = categorical_features[idx]
            if cat and isinstance(cat, dict):
                # Check if has any preference that can be scored
                has_scoreable = False
                for v in cat.values():
                    if v:
                        v_str = str(v).strip().lower()
                        if any(kw in v_str for kw in ["puas", "senang", "biasa", "netral", "tidak", "kurang"]):
                            has_scoreable = True
                            break
                if has_scoreable:
                    preference_count += 1
    
    # Hitung persentase ketersediaan
    likert_ratio = likert_count / n if n > 0 else 0.0
    sentiment_ratio = sentiment_count / n if n > 0 else 0.0
    preference_ratio = preference_count / n if n > 0 else 0.0
    avg_confidence = total_confidence / valid_confidence_count if valid_confidence_count > 0 else 1.0
    low_confidence_ratio = low_confidence_count / sentiment_count if sentiment_count > 0 else 0.0
    
    # Base weights (default)
    base_likert = 0.40
    base_sentiment = 0.35
    base_preference = 0.25
    
    # Adjust berdasarkan ketersediaan data
    # Jika >60% punya Likert, naikkan bobot Likert
    if likert_ratio > 0.6:
        base_likert = 0.50
        if sentiment_ratio < 0.3:
            base_sentiment = 0.25
            base_preference = 0.25
        else:
            base_sentiment = 0.30
            base_preference = 0.20
    elif likert_ratio < 0.3:
        # Jika sedikit Likert, turunkan bobot Likert
        base_likert = 0.25
        if sentiment_ratio > 0.6:
            # Teks dominan, naikkan sentimen
            base_sentiment = 0.50
            base_preference = 0.25
        elif preference_ratio > 0.6:
            # Preferensi dominan
            base_sentiment = 0.30
            base_preference = 0.45
        else:
            base_sentiment = 0.40
            base_preference = 0.35
    
    # Adjust berdasarkan confidence score (adaptive weighting)
    # Jika rata-rata confidence rendah atau banyak yang rendah, turunkan bobot sentimen
    if avg_confidence < 0.6 or low_confidence_ratio > 0.4:
        # Turunkan bobot sentimen, redistribusi ke komponen lain
        reduction = 0.10
        base_sentiment = max(0.15, base_sentiment - reduction)
        # Redistribusi proporsional
        if likert_ratio > preference_ratio:
            base_likert += reduction * 0.6
            base_preference += reduction * 0.4
        else:
            base_likert += reduction * 0.4
            base_preference += reduction * 0.6
    
    # Normalisasi agar total = 1.0
    total = base_likert + base_sentiment + base_preference
    if total > 0:
        weight_likert = base_likert / total
        weight_sentiment = base_sentiment / total
        weight_preference = base_preference / total
    else:
        weight_likert = 0.40
        weight_sentiment = 0.35
        weight_preference = 0.25
    
    metadata = {
        "method": "dynamic",
        "likert_availability": f"{likert_count}/{n} ({likert_ratio*100:.1f}%)",
        "sentiment_availability": f"{sentiment_count}/{n} ({sentiment_ratio*100:.1f}%)",
        "preference_availability": f"{preference_count}/{n} ({preference_ratio*100:.1f}%)",
        "avg_confidence": round(avg_confidence, 3),
        "low_confidence_ratio": f"{low_confidence_count}/{sentiment_count} ({low_confidence_ratio*100:.1f}%)" if sentiment_count > 0 else "N/A",
    }
    
    return (weight_likert, weight_sentiment, weight_preference, metadata)


def compute_combined_satisfaction_index(
    *,
    raw_responses: List[Dict[str, Any]],
    categorical_features: List[Dict[str, Any]],
    sentiment_labels: List[Any],
    sentiment_confidence_scores: List[Optional[float]],
    likert_min_val: float,
    likert_max_val: float,
) -> Dict[str, Any]:
    """
    Hitung Indeks Kepuasan Gabungan (IKG) per responden dan per survei.
    
    Menggunakan WEIGHTED AVERAGE dengan bobot DINAMIS berdasarkan:
    - Ketersediaan data (Likert, Sentimen, Preferensi)
    - Kualitas data (confidence score sentimen)
    
    Sumber skor:
    - Likert / numerik   -> dinormalisasi ke 0‑100
    - Teks (sentimen)    -> mapping label ke skor tetap (85/70/50)
    - Pilihan (dropdown/checkbox) -> mapping label kepuasan (90/80/65/40)

    Logika fallback (WAJIB):
    - Jika suatu respon tidak punya Likert, hanya teks + pilihan yang dipakai.
    - Jika tidak punya teks, hanya Likert + pilihan yang dipakai.
    - Jika hanya punya pilihan, indeks tetap dihitung dari pilihan saja.
    - Jika ketiganya kosong, fallback terakhir memakai skor kepuasan holistik
      dari sistem (jika tersedia) supaya grafik tidak kosong.
    """
    n = len(raw_responses)
    if n == 0:
        return {
            "per_respondent": [],
            "survey_index": 0.0,
            "distribution": {"puas": 0, "netral": 0, "tidak_puas": 0},
            "labels_per_respondent": [],
            "explainability": [],
            "confidence_scores": [],
            "weight_metadata": {},
            "validation_metrics": {},
        }

    # Hitung bobot dinamis
    WEIGHT_LIKERT, WEIGHT_SENTIMENT, WEIGHT_PREFERENCE, weight_metadata = calculate_dynamic_weights(
        raw_responses=raw_responses,
        categorical_features=categorical_features,
        sentiment_labels=sentiment_labels,
        sentiment_confidence_scores=sentiment_confidence_scores,
        likert_min_val=likert_min_val,
        likert_max_val=likert_max_val,
    )

    # Skor preferensi per responden (berbasis jawaban kategorikal)
    if compute_preference_scores_from_categorical:
        preference_scores = compute_preference_scores_from_categorical(categorical_features)
    else:
        # Fallback: jika service belum tersedia
        preference_scores = [None] * n

    # Indeks per responden (0‑100)
    ikg_per_respondent: List[float] = []
    labels_per_respondent: List[str] = []
    explainability_per_respondent: List[Dict[str, Any]] = []
    confidence_scores_per_respondent: List[Optional[float]] = []

    scale = max(likert_max_val - likert_min_val, 1e-6)

    for idx in range(n):
        resp = raw_responses[idx] or {}
        text_response = resp.get("text", "")

        # 1) Skor Likert: rata‑rata semua nilai kemudian dinormalisasi ke 0‑100
        likert_raw = resp.get("likert") or {}
        likert_score_100: Optional[float] = None
        likert_details: List[str] = []
        if isinstance(likert_raw, dict) and likert_raw:
            numeric_vals = []
            for k, v in likert_raw.items():
                # Extract numeric value dari berbagai format (angka, "Label 5", "Option 1", dll)
                val = _extract_numeric_from_likert(v)
                if val is not None:
                    numeric_vals.append(val)
                    likert_details.append(f"{k}: {val}")
            if numeric_vals:
                mean_val = float(sum(numeric_vals) / len(numeric_vals))
                norm_0_1 = (mean_val - likert_min_val) / scale
                likert_score_100 = float(max(0.0, min(1.0, norm_0_1)) * 100.0)

        # 2) Skor Sentimen dari label model NLP (positive/neutral/negative)
        sentiment_label = (
            sentiment_labels[idx] if idx < len(sentiment_labels) else None
        )
        sentiment_score_100 = map_sentiment_label_to_score(sentiment_label)
        sentiment_confidence = (
            sentiment_confidence_scores[idx] 
            if idx < len(sentiment_confidence_scores) 
            and sentiment_confidence_scores[idx] is not None
            else None
        )
        
        # Deteksi bahasa untuk explainability
        detected_language = detect_language(text_response) if text_response else "unknown"

        # 3) Skor Preferensi dari jawaban kategorikal (jika ada)
        pref_score_100 = (
            preference_scores[idx]
            if idx < len(preference_scores)
            else None
        )
        preference_details: List[str] = []
        if pref_score_100 is not None and categorical_features[idx]:
            for k, v in categorical_features[idx].items():
                if v:
                    preference_details.append(f"{k}: {v}")

        # Hitung IKG dengan WEIGHTED AVERAGE dengan adaptive weighting per responden
        # Adaptive: jika confidence sentimen rendah, turunkan bobot sentimen untuk responden ini
        components: List[float] = []
        weights: List[float] = []
        component_names: List[str] = []
        
        # Bobot adaptif per responden
        adj_weight_likert = WEIGHT_LIKERT
        adj_weight_sentiment = WEIGHT_SENTIMENT
        adj_weight_preference = WEIGHT_PREFERENCE
        
        # Adjust bobot sentimen berdasarkan confidence individual
        if sentiment_score_100 is not None and sentiment_confidence is not None:
            if sentiment_confidence < 0.6:
                # Confidence rendah, turunkan bobot sentimen
                reduction = 0.10
                adj_weight_sentiment = max(0.05, WEIGHT_SENTIMENT - reduction)
                # Redistribusi ke komponen lain yang tersedia
                if likert_score_100 is not None and pref_score_100 is not None:
                    adj_weight_likert += reduction * 0.6
                    adj_weight_preference += reduction * 0.4
                elif likert_score_100 is not None:
                    adj_weight_likert += reduction
                elif pref_score_100 is not None:
                    adj_weight_preference += reduction
        
        # Normalisasi bobot adaptif
        total_adj_weight = adj_weight_likert + adj_weight_sentiment + adj_weight_preference
        if total_adj_weight > 0:
            adj_weight_likert = adj_weight_likert / total_adj_weight
            adj_weight_sentiment = adj_weight_sentiment / total_adj_weight
            adj_weight_preference = adj_weight_preference / total_adj_weight
        
        if likert_score_100 is not None:
            components.append(likert_score_100)
            weights.append(adj_weight_likert)
            component_names.append("Likert")
        
        if sentiment_score_100 is not None:
            components.append(sentiment_score_100)
            weights.append(adj_weight_sentiment)
            component_names.append("Sentimen")
        
        if pref_score_100 is not None:
            components.append(pref_score_100)
            weights.append(adj_weight_preference)
            component_names.append("Preferensi")

        # Weighted average IKG (initial baseline)
        if components and sum(weights) > 0:
            weighted_sum = sum(c * w for c, w in zip(components, weights))
            total_weight = sum(weights)
            ikg_value = float(weighted_sum / total_weight)
        else:
            # Fallback terakhir: jika benar‑benar tidak ada komponen eksplisit,
            # kembalikan 0.0 dan biarkan distribusi dianggap "Tidak Puas".
            ikg_value = 0.0

        # --- Sensitivity adjustments ---
        # Improve spread by applying small non-linear amplification and
        # explicit boosts/penalties based on strong positive/negative signals.
        # This makes IKG more responsive to dominant sentiment instead of
        # clustering near neutral.

        # 1) Determine strong sentiment signals
        sentiment_strength = 0.0
        try:
            if sentiment_label == "positive":
                sentiment_strength = 1.0
            elif sentiment_label == "negative":
                sentiment_strength = -1.0
        except Exception:
            sentiment_strength = 0.0

        # 2) Likert-based strength (normalized -1..1)
        likert_strength = 0.0
        if likert_score_100 is not None:
            # Center around 50: above 75 considered strongly positive, below 25 strongly negative
            ls = (likert_score_100 - 50.0) / 50.0
            likert_strength = max(-1.0, min(1.0, ls))

        # 3) Preference signal (if available) - positive if >70, negative if <40
        pref_strength = 0.0
        if pref_score_100 is not None:
            if pref_score_100 >= 70.0:
                pref_strength = 0.6
            elif pref_score_100 <= 40.0:
                pref_strength = -0.6

        # Combine strengths with simple weighting
        combined_strength = (0.6 * sentiment_strength) + (0.3 * likert_strength) + (0.1 * pref_strength)

        # 4) Non-linear amplification: amplify distance from neutral (50) by factor based on combined_strength
        #    The factor is modest (0.0 - 0.6) to avoid overreaction but enough to create separation.
        baseline_distance = (ikg_value - 50.0) / 50.0  # -1..1
        sensitivity = 0.35  # base sensitivity
        amp = 1.0 + (abs(combined_strength) * sensitivity)
        amplified = 50.0 + (baseline_distance * 50.0 * amp)

        # 5) Explicit boost/penalty for strong signals (helps push extreme consensus)
        explicit_adjust = 0.0
        # Boost when strongly positive consensus (sentiment positive or high likert)
        if combined_strength >= 0.7:
            explicit_adjust += 6.0 * min(1.0, combined_strength)
        # Penalty when strongly negative consensus
        if combined_strength <= -0.7:
            explicit_adjust -= 8.0 * min(1.0, abs(combined_strength))

        # 6) Confidence-aware dampening: if sentiment confidence is low, reduce explicit adjustments
        if sentiment_confidence is not None and sentiment_confidence < 0.6:
            explicit_adjust *= 0.5

        # Compose final IKG value
        ikg_value = float(amplified + explicit_adjust)

        # Clamp ke 0‑100
        ikg_value = float(max(0.0, min(100.0, ikg_value)))
        ikg_per_respondent.append(ikg_value)

        # Label kategori per responden, mengikuti aturan baru:
        # > 70        -> Puas
        # 50–70 inkl. -> Netral
        # < 50        -> Tidak Puas
        if ikg_value > 70.0:
            label = "Puas"
        elif ikg_value >= 50.0:
            label = "Netral"
        else:
            label = "Tidak Puas"
        labels_per_respondent.append(label)

        # Generate explainability untuk responden ini
        explanation_parts: List[str] = []
        
        # Penjelasan berdasarkan komponen yang ada (menggunakan bobot adaptif)
        if likert_score_100 is not None:
            explanation_parts.append(
                f"Skor Likert {likert_score_100:.1f}% (bobot {adj_weight_likert:.0%})"
            )
        if sentiment_score_100 is not None:
            conf_text = f" (confidence {sentiment_confidence:.0%})" if sentiment_confidence else ""
            lang_text = f" [bahasa: {detected_language}]" if detected_language != "unknown" else ""
            adj_text = f" (adjusted from {WEIGHT_SENTIMENT:.0%} due to low confidence)" if sentiment_confidence is not None and sentiment_confidence < 0.6 else ""
            explanation_parts.append(
                f"Sentimen {sentiment_label} → {sentiment_score_100:.1f}%{conf_text}{lang_text} (bobot {adj_weight_sentiment:.0%}{adj_text})"
            )
        if pref_score_100 is not None:
            explanation_parts.append(
                f"Preferensi {pref_score_100:.1f}% (bobot {adj_weight_preference:.0%})"
            )
        
        # Alasan klasifikasi
        if label == "Tidak Puas":
            if ikg_value < 50.0:
                reason = f"IKG {ikg_value:.1f}% berada di bawah 50% (kategori Tidak Puas). "
                if likert_score_100 and likert_score_100 < 50:
                    reason += "Skor Likert rendah menunjukkan ketidakpuasan pada aspek terukur. "
                if sentiment_label == "negative":
                    reason += "Sentimen negatif memperkuat indikasi ketidakpuasan. "
                if pref_score_100 and pref_score_100 < 50:
                    reason += "Preferensi eksplisit menunjukkan ketidakpuasan. "
        elif label == "Puas":
            reason = f"IKG {ikg_value:.1f}% berada di atas 70% (kategori Puas). "
            if likert_score_100 and likert_score_100 > 70:
                reason += "Skor Likert tinggi menunjukkan kepuasan pada aspek terukur. "
            if sentiment_label == "positive":
                reason += "Sentimen positif memperkuat indikasi kepuasan. "
            if pref_score_100 and pref_score_100 > 70:
                reason += "Preferensi eksplisit menunjukkan kepuasan tinggi. "
        else:  # Netral
            reason = f"IKG {ikg_value:.1f}% berada di range 50-70% (kategori Netral). "
            reason += "Kombinasi indikator menunjukkan kepuasan sedang, tidak terlalu tinggi maupun rendah. "

        explainability_per_respondent.append({
            "respondent_index": idx + 1,
            "ikg_value": ikg_value,
            "label": label,
            "components_used": component_names,
            "component_scores": {
                "likert": likert_score_100,
                "sentiment": sentiment_score_100,
                "preference": pref_score_100,
            },
            "weights_applied": {
                "likert": adj_weight_likert if likert_score_100 is not None else 0.0,
                "sentiment": adj_weight_sentiment if sentiment_score_100 is not None else 0.0,
                "preference": adj_weight_preference if pref_score_100 is not None else 0.0,
            },
            "base_weights": {
                "likert": WEIGHT_LIKERT,
                "sentiment": WEIGHT_SENTIMENT,
                "preference": WEIGHT_PREFERENCE,
            },
            "adaptive_adjustment": (
                f"Bobot sentimen diturunkan dari {WEIGHT_SENTIMENT:.2%} ke {adj_weight_sentiment:.2%} "
                if sentiment_confidence is not None and sentiment_confidence < 0.6 and sentiment_score_100 is not None
                else "Tidak ada penyesuaian adaptif"
            ),
            "explanation": " + ".join(explanation_parts) if explanation_parts else "Tidak ada data",
            "reason": reason,
            "sentiment_confidence": sentiment_confidence,
            "detected_language": detected_language,
            "details": {
                "likert_details": likert_details,
                "preference_details": preference_details,
            }
        })
        
        # Simpan confidence score untuk responden ini
        confidence_scores_per_respondent.append(sentiment_confidence)

    # Indeks survei = rata‑rata seluruh IKG responden
    survey_index = float(sum(ikg_per_respondent) / len(ikg_per_respondent))

    # Distribusi kategori berdasarkan IKG responden
    dist = {"puas": 0, "netral": 0, "tidak_puas": 0}
    for label in labels_per_respondent:
        if label == "Puas":
            dist["puas"] += 1
        elif label == "Netral":
            dist["netral"] += 1
        else:
            dist["tidak_puas"] += 1

    # Hitung validitas sistem (error rate jika ada manual calculation untuk perbandingan)
    # Untuk sekarang, kita hitung konsistensi internal (variance antar komponen)
    validation_metrics = {}
    
    # Hitung Mean Absolute Deviation (MAD) sebagai indikator konsistensi
    component_variations = []
    for exp in explainability_per_respondent:
        comp_scores = exp.get("component_scores", {})
        valid_scores = [v for v in [comp_scores.get("likert"), comp_scores.get("sentiment"), comp_scores.get("preference")] if v is not None]
        if len(valid_scores) > 1:
            mean_score = sum(valid_scores) / len(valid_scores)
            mad = sum(abs(s - mean_score) for s in valid_scores) / len(valid_scores)
            component_variations.append(mad)
    
    if component_variations:
        validation_metrics = {
            "mean_absolute_deviation": float(sum(component_variations) / len(component_variations)),
            "max_deviation": float(max(component_variations)),
            "min_deviation": float(min(component_variations)),
            "interpretation": (
                "Konsistensi tinggi antar komponen" if sum(component_variations) / len(component_variations) < 10.0
                else "Ada variasi signifikan antar komponen kepuasan"
            ),
        }
    else:
        validation_metrics = {
            "mean_absolute_deviation": 0.0,
            "interpretation": "Tidak dapat menghitung konsistensi (data tidak cukup)",
        }
    
    return {
        "per_respondent": ikg_per_respondent,
        "survey_index": survey_index,
        "distribution": dist,
        "labels_per_respondent": labels_per_respondent,
        "explainability": explainability_per_respondent,
        "confidence_scores": confidence_scores_per_respondent,
        "weight_metadata": weight_metadata,
        "validation_metrics": validation_metrics,
    }

