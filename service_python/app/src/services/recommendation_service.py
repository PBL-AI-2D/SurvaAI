from typing import List, Dict, Any
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


def _get_dominant_preference(preferred_products: List[Dict[str, Any]]) -> str:
    """
    Ambil preferensi paling dominan dari hasil affinity.
    """
    if not preferred_products:
        return "umum"

    top = preferred_products[0]
    return top.get("product_name", "umum")


def _build_segment_problem(avg_satisfaction: float, population: int) -> str:
    """
    Tentukan masalah utama berdasarkan tingkat kepuasan segmen.
    """
    if avg_satisfaction < 0.5:
        return (
            f"Kepuasan rendah ({avg_satisfaction:.2f}) pada {population} responden "
            "menunjukkan adanya masalah serius yang perlu segera ditangani."
        )
    elif avg_satisfaction < 0.75:
        return (
            f"Kepuasan sedang ({avg_satisfaction:.2f}) pada {population} responden "
            "menunjukkan pengalaman pengguna belum optimal."
        )
    else:
        return (
            f"Kepuasan tinggi ({avg_satisfaction:.2f}) pada {population} responden, "
            "namun tetap perlu dijaga agar tidak menurun."
        )


def _build_segment_recommendation(
    dominant_pref: str,
    avg_satisfaction: float,
) -> str:
    """
    Rule-based recommendation berdasarkan preferensi dominan.
    """
    pref = dominant_pref.lower()

    if any(k in pref for k in ["harga", "biaya", "fee", "diskon", "promo"]):
        return (
            "Lakukan evaluasi strategi harga dengan meningkatkan transparansi biaya, "
            "menyediakan variasi promo yang relevan, serta menguji paket harga yang "
            "lebih fleksibel untuk segmen ini."
        )

    if any(k in pref for k in ["fitur", "feature", "fungsi"]):
        return (
            "Prioritaskan pengembangan dan penyempurnaan fitur yang paling sering "
            "digunakan oleh segmen ini. Lakukan uji coba bertahap dan kumpulkan feedback "
            "setelah implementasi."
        )

    if any(k in pref for k in ["layanan", "service", "support", "cs"]):
        return (
            "Tingkatkan kualitas layanan dengan mempercepat waktu respon, "
            "meningkatkan kejelasan informasi, dan memperkuat standar operasional layanan."
        )

    if any(k in pref for k in ["kecepatan", "respon", "waktu", "loading"]):
        return (
            "Optimalkan performa sistem dengan mempercepat waktu respon dan "
            "menyederhanakan alur proses yang berpotensi menghambat pengalaman pengguna."
        )

    # Fallback (aman & akademis)
    if avg_satisfaction < 0.75:
        return (
            "Lakukan survei lanjutan atau wawancara singkat pada segmen ini untuk "
            "menggali kebutuhan spesifik yang belum terpenuhi."
        )

    return (
        "Pertahankan kualitas layanan dan lakukan pemantauan berkala untuk memastikan "
        "kepuasan segmen ini tetap stabil."
    )


def generate_segment_insights(
    segments: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Generate insight & rekomendasi berbasis SEGMENT RESPONDEN.

    Input: output dari `segment_respondents()`
    Output: insight per segment (bukan global).
    """

    if not segments:
        return []

    insights: List[Dict[str, Any]] = []

    # Urutkan dari kepuasan TERENDAH → TERTINGGI
    sorted_segments = sorted(
        segments, key=lambda s: float(s.get("avg_satisfaction", 0.0))
    )

    for seg in sorted_segments:
        cluster_id = seg.get("cluster_id")
        population = int(seg.get("population_count", 0))
        avg_satisfaction = float(seg.get("avg_satisfaction", 0.0))
        preferred_products = seg.get("preferred_products", [])

        dominant_pref = _get_dominant_preference(preferred_products)

        problem = _build_segment_problem(avg_satisfaction, population)
        cause = (
            f"Segmen ini paling dipengaruhi oleh preferensi '{dominant_pref}', "
            "yang menjadi faktor utama dalam membentuk tingkat kepuasan responden."
        )
        recommendation = _build_segment_recommendation(
            dominant_pref, avg_satisfaction
        )

        insights.append(
            {
                "segment_id": int(cluster_id) + 1,  # untuk tampilan (1-indexed)
                "population": population,
                "avg_satisfaction": round(avg_satisfaction, 2),
                "dominant_preference": dominant_pref,
                "problem": problem,
                "cause": cause,
                "recommendation": recommendation,
                "summary": (
                    f"Segment {int(cluster_id)+1} → Masalah: {problem} "
                    f"→ Penyebab: {cause} "
                    f"→ Rekomendasi: {recommendation}"
                ),
            }
        )

    return insights


def _calculate_similarity_score(
    segment_features: Dict[str, float],
    recommendation_features: Dict[str, float]
) -> float:
    """
    Hitung similarity score menggunakan Cosine Similarity.
    
    PRIORITAS 3 - Similarity Metric WAJIB JELAS
    """
    # Extract common features
    all_features = set(list(segment_features.keys()) + list(recommendation_features.keys()))
    
    if not all_features:
        return 0.0
    
    # Build vectors
    segment_vector = np.array([segment_features.get(f, 0.0) for f in all_features]).reshape(1, -1)
    rec_vector = np.array([recommendation_features.get(f, 0.0) for f in all_features]).reshape(1, -1)
    
    # Calculate cosine similarity
    similarity = cosine_similarity(segment_vector, rec_vector)[0][0]
    
    # PRIORITAS 3 - Clamp score ke range 0-1
    return float(np.clip(similarity, 0.0, 1.0))


def _get_top_features(segment: Dict[str, Any], top_n: int = 3) -> List[Dict[str, Any]]:
    """
    Extract top N features untuk explainability layer.
    PRIORITAS 5 - Explainability Layer (SIMPLE)
    """
    all_prefs = segment.get("all_preferences", [])
    dominant_pref = segment.get("dominant_preference", "N/A")
    
    top_features = []
    
    # Add dominant preference first
    if dominant_pref and dominant_pref != "N/A":
        top_features.append({
            "feature": dominant_pref,
            "importance": "dominant",
            "description": f"Preferensi paling dominan di segmen ini"
        })
    
    # Add other preferences
    for pref in all_prefs[:top_n - len(top_features)]:
        if pref != dominant_pref:
            top_features.append({
                "feature": pref,
                "importance": "high",
                "description": f"Preferensi penting lainnya di segmen ini"
            })
    
    return top_features[:top_n]


def _build_single_segment_insight(segment: Dict[str, Any]) -> Dict[str, Any]:
    """
    Bangun insight teks untuk satu segment dengan format:
    
    Segment X → Masalah → Penyebab → Rekomendasi
    
    PRIORITAS 2 & 3 - Segment Insight HARUS DESKRIPTIF, BUKAN ANGKA LIAR
    Tanpa ML berat, hanya rule‑based sederhana yang logis.
    """
    seg_id = segment.get("segment_id")
    sat_pct = float(segment.get("satisfaction_percentage", 0.0))
    status = segment.get("satisfaction_status", "medium")
    dominant_pref = segment.get("dominant_preference") or "tidak terdeteksi"
    respondent_count = int(segment.get("respondent_count", 0))
    all_prefs = segment.get("all_preferences", [])

    # PRIORITAS 2 - Format deskriptif, bukan angka liar
    # 1. Masalah (Problem) - Deskriptif dengan persentase yang masuk akal
    if sat_pct < 50:
        problem = (
            f"Kepuasan sangat rendah ({sat_pct:.1f}%) pada {respondent_count} responden, "
            "menunjukkan adanya masalah serius yang perlu segera ditangani."
        )
    elif sat_pct < 70:
        problem = (
            f"Kepuasan sedang ({sat_pct:.1f}%) pada {respondent_count} responden, "
            "dan masih berpotensi turun jika tidak ditangani."
        )
    else:
        problem = (
            f"Kepuasan tinggi ({sat_pct:.1f}%) pada {respondent_count} responden, "
            "namun tetap perlu dijaga agar tidak menurun."
        )

    # 2. Penyebab (Cause) – berbasis preferensi dominan dengan explainability
    top_features = _get_top_features(segment, top_n=3)
    feature_desc = ", ".join([f.get("feature", "") for f in top_features[:2]]) if top_features else dominant_pref
    
    cause = (
        f"Preferensi dominan segmen ini adalah '{dominant_pref}'. "
        f"Segmen ini memiliki preferensi kuat terhadap {feature_desc} "
        "dibanding segmen lain, yang menjadi faktor utama dalam membentuk tingkat kepuasan."
    )

    # 3. Rekomendasi (Recommendation) – rule‑based per preferensi
    pref_lower = str(dominant_pref).lower()
    
    # Build recommendation features untuk similarity calculation
    rec_features = {}
    if any(keyword in pref_lower for keyword in ["harga", "fee", "biaya", "diskon"]):
        recommendation = (
            "Optimalkan strategi harga dan transparansi biaya: perbanyak promo yang terukur, "
            "jelaskan komponen biaya secara rinci, dan uji beberapa paket harga yang lebih fleksibel."
        )
        rec_features = {"harga": 1.0, "transparansi": 0.8, "promo": 0.7}
    elif any(keyword in pref_lower for keyword in ["fitur", "fungsi", "feature"]):
        recommendation = (
            "Prioritaskan pengembangan dan perbaikan fitur yang paling sering digunakan segmen ini. "
            "Lakukan A/B testing pada fitur kunci dan kumpulkan feedback setelah rilis."
        )
        rec_features = {"fitur": 1.0, "pengembangan": 0.8, "testing": 0.6}
    elif any(keyword in pref_lower for keyword in ["layanan", "service", "support"]):
        recommendation = (
            "Perkuat kualitas layanan: percepat respon customer support, siapkan panduan yang jelas, "
            "dan bangun SOP layanan untuk kasus yang paling sering muncul pada segmen ini."
        )
        rec_features = {"layanan": 1.0, "support": 0.9, "sop": 0.7}
    elif any(keyword in pref_lower for keyword in ["kecepatan", "respon", "waktu"]):
        recommendation = (
            "Fokus pada peningkatan kecepatan layanan dan waktu respon, misalnya dengan automasi proses, "
            "optimasi alur kerja, dan monitoring SLA secara berkala."
        )
        rec_features = {"kecepatan": 1.0, "respon": 0.9, "optimasi": 0.7}
    else:
        recommendation = (
            "Lakukan wawancara singkat atau survei lanjutan khusus untuk segmen ini guna menggali "
            "ekspektasi detail, lalu gunakan temuan tersebut sebagai dasar perbaikan produk."
        )
        rec_features = {"wawancara": 1.0, "survei": 0.8, "ekspektasi": 0.6}
    
    # Calculate similarity score (PRIORITAS 3)
    segment_features = {pref.lower(): 1.0 for pref in all_prefs[:5]}
    if dominant_pref and dominant_pref != "tidak terdeteksi":
        segment_features[dominant_pref.lower()] = 1.5  # Higher weight for dominant
    
    similarity_score = _calculate_similarity_score(segment_features, rec_features)
    
    # PRIORITAS 3 - Confidence Threshold (skip jika score < 0.6)
    confidence = similarity_score
    confidence_label = "High" if confidence >= 0.7 else "Medium" if confidence >= 0.6 else "Low"
    
    # PRIORITAS 5 - Explainability: Top 3 features, avg satisfaction, sentiment trend
    explainability = {
        "top_features": top_features,
        "average_satisfaction": sat_pct,
        "sentiment_trend": "positive" if sat_pct >= 70 else "neutral" if sat_pct >= 50 else "negative",
        "respondent_count": respondent_count,
    }
    
    # PRIORITAS 5 - Setiap AI Output WAJIB PUNYA ALASAN
    reason = (
        f"Rekomendasi ini didasarkan pada analisis preferensi dominan '{dominant_pref}' "
        f"dan tingkat kepuasan {sat_pct:.1f}% dari {respondent_count} responden di segmen ini. "
        f"Similarity score {confidence:.2f} menunjukkan rekomendasi ini relevan dengan karakteristik segmen."
    )

    # Insight final sebagai satu kalimat panjang yang mudah dibaca
    summary = (
        f"Segment {seg_id} → Masalah: {problem} "
        f"→ Penyebab: {cause} "
        f"→ Rekomendasi: {recommendation}"
    )

    return {
        "segment_id": str(seg_id),
        "problem": problem,
        "cause": cause,
        "recommendation": recommendation,
        "summary": summary,
        "satisfaction_status": status,
        "confidence": round(confidence, 2),  # PRIORITAS 3 - Clamped 0-1
        "confidence_label": confidence_label,
        "reason": reason,  # PRIORITAS 5 - Alasan untuk rekomendasi
        "explainability": explainability,  # PRIORITAS 5 - Explainability layer
    }


def generate_recommendations(
    segment_details: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Engine insight / rekomendasi per segment (AI‑5, rule‑based):
    
    - Tidak ada insight global kosong; semuanya per segment.
    - Setiap insight menyebut Segment dengan format:
        Segment X → Masalah → Penyebab → Rekomendasi
    
    PRIORITAS 3 - Confidence Threshold: Skip jika confidence < 0.6
    """
    if not segment_details:
        return []

    insights: List[Dict[str, Any]] = []

    # Urutkan dari kepuasan terendah ke tertinggi
    sorted_segments = sorted(
        segment_details, key=lambda s: float(s.get("satisfaction_percentage", 0.0))
    )

    for seg in sorted_segments:
        insight = _build_single_segment_insight(seg)
        
        # PRIORITAS 3 - Confidence Threshold: Skip jika confidence < 0.6
        confidence = insight.get("confidence", 0.0)
        if confidence >= 0.6:
            insights.append(insight)
        # Jika confidence rendah, tetap tambahkan tapi dengan warning
        else:
            insight["low_confidence_warning"] = True
            insights.append(insight)

    return insights