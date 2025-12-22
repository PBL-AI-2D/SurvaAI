from typing import List, Dict, Any


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
