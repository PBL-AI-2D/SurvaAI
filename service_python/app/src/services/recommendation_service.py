from typing import List, Dict, Any


def _build_single_segment_insight(segment: Dict[str, Any]) -> Dict[str, str]:
    """
    Bangun insight teks untuk satu segment dengan format:

    Segment X → Masalah → Penyebab → Rekomendasi

    Tanpa ML berat, hanya rule‑based sederhana yang logis.
    """
    seg_id = segment.get("segment_id")
    sat_pct = float(segment.get("satisfaction_percentage", 0.0))
    status = segment.get("satisfaction_status", "medium")
    dominant_pref = segment.get("dominant_preference") or "tidak terdeteksi"
    respondent_count = int(segment.get("respondent_count", 0))

    # 1. Masalah (Problem)
    if sat_pct < 50:
        problem = (
            f"Kepuasan sangat rendah ({sat_pct:.1f}%) pada {respondent_count} responden."
        )
    elif sat_pct < 70:
        problem = (
            f"Kepuasan sedang ({sat_pct:.1f}%) dan masih berpotensi turun jika tidak ditangani."
        )
    else:
        problem = (
            f"Kepuasan tinggi ({sat_pct:.1f}%), namun tetap perlu dijaga agar tidak menurun."
        )

    # 2. Penyebab (Cause) – berbasis preferensi dominan
    cause = (
        f"Preferensi dominan segmen ini adalah '{dominant_pref}', "
        "yang menunjukkan fokus utama responden pada aspek tersebut."
    )

    # 3. Rekomendasi (Recommendation) – rule‑based per preferensi
    pref_lower = str(dominant_pref).lower()

    if any(keyword in pref_lower for keyword in ["harga", "fee", "biaya", "diskon"]):
        recommendation = (
            "Optimalkan strategi harga dan transparansi biaya: perbanyak promo yang terukur, "
            "jelaskan komponen biaya secara rinci, dan uji beberapa paket harga yang lebih fleksibel."
        )
    elif any(keyword in pref_lower for keyword in ["fitur", "fungsi", "feature"]):
        recommendation = (
            "Prioritaskan pengembangan dan perbaikan fitur yang paling sering digunakan segmen ini. "
            "Lakukan A/B testing pada fitur kunci dan kumpulkan feedback setelah rilis."
        )
    elif any(keyword in pref_lower for keyword in ["layanan", "service", "support"]):
        recommendation = (
            "Perkuat kualitas layanan: percepat respon customer support, siapkan panduan yang jelas, "
            "dan bangun SOP layanan untuk kasus yang paling sering muncul pada segmen ini."
        )
    elif any(keyword in pref_lower for keyword in ["kecepatan", "respon", "waktu"]):
        recommendation = (
            "Fokus pada peningkatan kecepatan layanan dan waktu respon, misalnya dengan automasi proses, "
            "optimasi alur kerja, dan monitoring SLA secara berkala."
        )
    else:
        recommendation = (
            "Lakukan wawancara singkat atau survei lanjutan khusus untuk segmen ini guna menggali "
            "ekspektasi detail, lalu gunakan temuan tersebut sebagai dasar perbaikan produk."
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
    }


def generate_recommendations(
    segment_details: List[Dict[str, Any]],
) -> List[Dict[str, str]]:
    """
    Engine insight / rekomendasi per segment (AI‑5, rule‑based):

    - Tidak ada insight global kosong; semuanya per segment.
    - Setiap insight menyebut Segment dengan format:
        Segment X → Masalah → Penyebab → Rekomendasi
    """
    if not segment_details:
        return []

    insights: List[Dict[str, str]] = []

    # Urutkan dari kepuasan terendah ke tertinggi
    sorted_segments = sorted(
        segment_details, key=lambda s: float(s.get("satisfaction_percentage", 0.0))
    )

    for seg in sorted_segments:
        insights.append(_build_single_segment_insight(seg))

    return insights
