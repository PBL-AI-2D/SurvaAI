"""
Service untuk analisis preferensi dari categorical features.
Mengidentifikasi dan mengekstrak preferensi produk/features yang disukai responden.
"""
from typing import List, Dict, Any, Optional
from collections import Counter

try:
    from .sentiment_analysis_service import predict_single as sentiment_predict_single
except ImportError:
    sentiment_predict_single = None


def is_product_feature_question(question_text: str) -> bool:
    """
    Identifikasi apakah pertanyaan menanyakan tentang produk/features yang disukai.
    Hanya pertanyaan yang mengandung kata "produk" atau "feature" yang akan digunakan.
    """
    if not question_text:
        return False
    
    question_lower = str(question_text).lower()
    
    # Kolom yang harus di-exclude (bukan preferensi produk/features)
    exclude_keywords = ['age', 'id', 'nama', 'name', 'email', 'phone', 'tanggal', 'date', 
                        'time', 'timestamp', 'created', 'updated', 'cluster',
                        'kendala', 'masalah', 'problem', 'issue', 'complaint', 'keluhan',
                        'saran', 'suggestion', 'feedback', 'komentar', 'comment']
    
    # Skip jika mengandung kata kunci exclude
    if any(exclude_kw in question_lower for exclude_kw in exclude_keywords):
        return False
    
    # WAJIB: Pertanyaan HARUS mengandung kata "produk" atau "feature"
    # Ini lebih spesifik dari sebelumnya - hanya pertanyaan yang eksplisit tentang produk/feature
    product_feature_required_keywords = ['produk', 'product', 'fitur', 'feature']
    
    # Harus mengandung minimal satu kata kunci produk/features yang WAJIB
    return any(keyword in question_lower for keyword in product_feature_required_keywords)


def _is_quality_rating_value(value: str) -> bool:
    """
    Identifikasi apakah value adalah rating kualitas (cukup, kurang, buruk, baik, dll).
    Value seperti ini harus di-exclude karena bukan produk/preferensi murni.
    """
    if not value:
        return False
    
    value_lower = str(value).lower().strip()
    
    # Kata-kata yang menunjukkan rating kualitas (bukan produk/preferensi)
    quality_rating_keywords = [
        'cukup', 'kurang', 'buruk', 'baik', 'sangat baik', 'sangat buruk',
        'sufficient', 'insufficient', 'bad', 'good', 'very good', 'very bad',
        'excellent', 'poor', 'fair', 'average', 'satisfactory', 'unsatisfactory',
        'bagus', 'jelek', 'lumayan', 'pas', 'standar', 'normal',
        'tinggi', 'rendah', 'sedang', 'menengah'
    ]
    
    # Check jika value adalah salah satu rating kualitas
    return any(keyword == value_lower or value_lower.startswith(keyword + ' ') or value_lower.endswith(' ' + keyword) 
               for keyword in quality_rating_keywords)


def convert_categorical_to_product_features(
    categorical_features: List[Dict[str, Any]]
) -> List[Dict[str, int]]:
    """
    Konversi categorical features menjadi product_features format One-Hot Encoding.
    Format output: List[Dict[str, int]] dimana setiap dict adalah one-hot untuk satu responden.
    Handle array values (checkbox) dan single values (radio/dropdown).
    
    PRIORITAS: 
    1. Hanya menggunakan VALUE/JAWABAN sebagai key, BUKAN "question:answer"
    2. Hanya mengambil produk/features yang disukai, bukan semua jawaban categorical
    Contoh: "Segmentation" bukan "Fitur Apa Saja Yang Menurut Anda Paling Membantu?: Segmentation"
    """
    if not categorical_features:
        return []
    
    # Kolom yang harus di-exclude (bukan preferensi)
    exclude_keywords = ['age', 'id', 'nama', 'name', 'email', 'phone', 'tanggal', 'date', 
                        'time', 'timestamp', 'created', 'updated', 'cluster']
    
    # Collect all unique VALUES (jawaban) saja, HANYA dari pertanyaan produk/features
    all_unique_values = set()
    for cat_dict in categorical_features:
        if not cat_dict or not isinstance(cat_dict, dict):
            continue
        for col_name, col_value in cat_dict.items():
            # Skip kolom yang jelas bukan preferensi
            col_str = str(col_name).lower()
            if any(exclude_kw in col_str for exclude_kw in exclude_keywords):
                continue
            
            # PRIORITAS: Hanya ambil pertanyaan tentang produk/features yang disukai
            if not is_product_feature_question(col_name):
                continue
            
            if col_value is None:
                continue
            
            # Handle array values (checkbox)
            if isinstance(col_value, list):
                for val in col_value:
                    if val is not None and val != "":
                        val_str = str(val).strip()
                        # EXCLUDE: Rating kualitas seperti "cukup", "kurang", "buruk", "baik"
                        if val_str and not _is_quality_rating_value(val_str):
                            all_unique_values.add(val_str)
            elif isinstance(col_value, (dict, set)):
                for val in col_value:
                    if val is not None and val != "":
                        val_str = str(val).strip()
                        # EXCLUDE: Rating kualitas seperti "cukup", "kurang", "buruk", "baik"
                        if val_str and not _is_quality_rating_value(val_str):
                            all_unique_values.add(val_str)
            else:
                # Single value
                val_str = str(col_value).strip()
                # EXCLUDE: Rating kualitas seperti "cukup", "kurang", "buruk", "baik"
                if val_str and not _is_quality_rating_value(val_str):
                    all_unique_values.add(val_str)
    
    # Build one-hot encoding untuk setiap responden
    # Key hanya VALUE saja, bukan "question:value"
    product_features = []
    for cat_dict in categorical_features:
        row_dict = {}
        
        # Initialize semua kolom dengan 0 (hanya value sebagai key)
        for val in all_unique_values:
            row_dict[val] = 0
        
        # Set 1 untuk nilai yang dipilih responden ini
        if cat_dict and isinstance(cat_dict, dict):
            for col_name, col_value in cat_dict.items():
                # Skip kolom yang jelas bukan preferensi
                col_str = str(col_name).lower()
                if any(exclude_kw in col_str for exclude_kw in exclude_keywords):
                    continue
                
                # PRIORITAS: Hanya ambil pertanyaan tentang produk/features yang disukai
                if not is_product_feature_question(col_name):
                    continue
                
                if col_value is None:
                    continue
                
                # Handle array values (checkbox)
                if isinstance(col_value, list):
                    for val in col_value:
                        if val is not None and val != "":
                            val_str = str(val).strip()
                            # EXCLUDE: Rating kualitas seperti "cukup", "kurang", "buruk", "baik"
                            if val_str and not _is_quality_rating_value(val_str) and val_str in row_dict:
                                row_dict[val_str] = 1
                elif isinstance(col_value, (dict, set)):
                    for val in col_value:
                        if val is not None and val != "":
                            val_str = str(val).strip()
                            # EXCLUDE: Rating kualitas seperti "cukup", "kurang", "buruk", "baik"
                            if val_str and not _is_quality_rating_value(val_str) and val_str in row_dict:
                                row_dict[val_str] = 1
                else:
                    # Single value
                    val_str = str(col_value).strip()
                    # EXCLUDE: Rating kualitas seperti "cukup", "kurang", "buruk", "baik"
                    if val_str and not _is_quality_rating_value(val_str) and val_str in row_dict:
                        row_dict[val_str] = 1
        
        product_features.append(row_dict)
    
    return product_features


def extract_preference_from_categorical(
    categorical_features: List[Dict[str, Any]]
) -> Dict[str, float]:
    """
    Extract distribusi preferensi/pilihan dari categorical features.
    HANYA mengambil produk/features yang disukai, bukan semua jawaban categorical.
    Handle array values (untuk checkbox) dan single values (untuk radio/dropdown).
    Filter kolom yang jelas bukan preferensi (seperti age, id, dll).
    
    PRIORITAS: 
    1. Hanya return VALUE/JAWABAN saja, BUKAN "question:answer"
    2. Hanya produk/features yang disukai, bukan semua jawaban
    Contoh: {"Segmentation": 10.7} bukan {"Fitur Apa Saja Yang Menurut Anda Paling Membantu?: Segmentation": 10.7}
    """
    if not categorical_features:
        return {}
    
    # Filter out empty dicts untuk menghitung total responden yang punya data categorical
    non_empty_categorical = [cat for cat in categorical_features if cat and isinstance(cat, dict) and len(cat) > 0]
    
    if not non_empty_categorical:
        return {}
    
    # Kolom yang harus di-exclude (bukan preferensi)
    exclude_keywords = ['age', 'id', 'nama', 'name', 'email', 'phone', 'tanggal', 'date', 
                        'time', 'timestamp', 'created', 'updated', 'cluster']
    
    # Flatten array values dan hitung distribusi
    # Struktur: {value: count} - HANYA VALUE, BUKAN "question:value"
    value_counts = {}
    total_all_selections = 0  # Total semua pilihan yang dipilih (untuk normalisasi ke 100%)
    
    # Iterate through each categorical feature dict
    for cat_dict in non_empty_categorical:
        if not cat_dict or not isinstance(cat_dict, dict):
            continue
            
        for col_name, col_value in cat_dict.items():
            # Skip kolom yang jelas bukan preferensi
            col_str = str(col_name).lower()
            if any(exclude_kw in col_str for exclude_kw in exclude_keywords):
                continue
            
            # PRIORITAS: Hanya ambil pertanyaan tentang produk/features yang disukai
            if not is_product_feature_question(col_name):
                continue
            
            # Skip jika nilai kosong atau None
            if col_value is None:
                continue
            
            # Handle array values (checkbox) dan single values (radio/dropdown)
            values_to_count = []
            
            if isinstance(col_value, list):
                # Array values - flatten semua nilai
                for val in col_value:
                    if val is not None and val != "":
                        val_str = str(val).strip()
                        if val_str:
                            values_to_count.append(val_str)
            elif isinstance(col_value, (dict, set)):
                # Convert dict/set to list
                values_to_count = [str(v).strip() for v in col_value if v is not None and v != "" and str(v).strip()]
            else:
                # Single value
                val_str = str(col_value).strip()
                if val_str:
                    values_to_count.append(val_str)
            
            # Hitung distribusi untuk setiap nilai (HANYA VALUE, BUKAN "question:value")
            # EXCLUDE: Rating kualitas seperti "cukup", "kurang", "buruk", "baik"
            for value in values_to_count:
                # Skip jika value adalah rating kualitas (bukan produk/preferensi murni)
                if _is_quality_rating_value(value):
                    continue
                
                if value not in value_counts:
                    value_counts[value] = 0
                value_counts[value] += 1
                total_all_selections += 1
    
    # Konversi count ke persentase berdasarkan total semua pilihan (agar pie chart total = 100%)
    preferences_dict = {}
    if total_all_selections > 0:
        for value, count in value_counts.items():
            # Key: hanya value, bukan "col_name: value"
            percentage = (count / total_all_selections) * 100
            preferences_dict[value] = percentage
    
    # Sort berdasarkan persentase tertinggi
    sorted_preferences = sorted(preferences_dict.items(), key=lambda x: x[1], reverse=True)
    
    # Return top preferences (max 20 untuk menghindari terlalu banyak)
    return {pref: pct for pref, pct in sorted_preferences[:20]}


def map_preference_value_to_score(value: str) -> Optional[float]:
    """
    Mapping jawaban kategorikal bernuansa kepuasan ke skor 0‑100.
    
    Menggunakan hybrid approach:
    1. Rule-based untuk kata-kata yang jelas (cepat dan akurat)
    2. Sentiment model sebagai fallback untuk variasi bahasa
    
    Aturan semantik utama:
    - "sangat puas"      -> 90
    - "puas"             -> 80
    - "biasa saja/netral"-> 65
    - "tidak puas/kurang puas" -> 40

    Alasan mapping:
    - Skala dibuat konsisten dengan sentimen: sangat puas di atas 85,
      puas sedikit di bawah, netral di area menengah, tidak puas cukup
      rendah namun tidak 0 agar tetap bisa digabung dengan indikator lain.
    """
    if not value:
        return None

    v = str(value).strip().lower()

    # Rule-based mapping untuk kata-kata yang jelas
    # Sangat puas / sangat senang
    if "sangat puas" in v or ("sangat" in v and "puas" in v) or "sangat senang" in v:
        return 90.0

    # Tidak puas / kurang puas
    if "tidak puas" in v or "kurang puas" in v or ("tidak" in v and "puas" in v) or "kecewa" in v:
        return 40.0

    # Netral / biasa saja
    if "biasa saja" in v or "biasa" in v or "netral" in v or "lumayan" in v or "oke" in v:
        return 65.0

    # Puas (tanpa modifier "sangat" / "tidak")
    if "puas" in v or "senang" in v:
        return 80.0
    
    # Fallback: Gunakan sentiment model untuk variasi bahasa yang tidak tertangkap
    # Contoh: "cukup puas", "biasa tapi oke", "kecewa berat", dll
    if sentiment_predict_single is not None:
        try:
            pred = sentiment_predict_single(value)
            label = pred.get("label", "neutral").lower()
            confidence = pred.get("confidence", 0.5)
            
            # Mapping berdasarkan sentiment label
            if label == "positive":
                # Positive dengan confidence tinggi = sangat puas, sedang = puas
                if confidence >= 0.8:
                    return 90.0
                elif confidence >= 0.6:
                    return 85.0
                else:
                    return 80.0
            elif label == "negative":
                # Negative dengan confidence tinggi = tidak puas, sedang = kurang puas
                if confidence >= 0.8:
                    return 35.0
                elif confidence >= 0.6:
                    return 40.0
                else:
                    return 50.0
            else:  # neutral
                # Neutral dengan confidence tinggi = netral, rendah = agak puas
                if confidence >= 0.7:
                    return 65.0
                else:
                    return 70.0
        except Exception:
            # Jika sentiment model error, return None (komponen ini tidak dipakai)
            pass

    return None


def compute_preference_scores_from_categorical(
    categorical: List[Dict[str, Any]]
) -> List[Optional[float]]:
    """
    Hitung skor kepuasan berbasis jawaban dropdown / multiple choice / checkbox.

    Untuk tiap responden:
    - Ambil semua nilai kategorikal (termasuk array / checkbox).
    - Mapping dengan map_preference_value_to_score.
    - Jika ada lebih dari satu jawaban kepuasan, diambil rata‑ratanya.

    Alasan fallback:
    - Jika tidak ada satu pun nilai yang bisa di‑mapping, kembalikan None
      agar komponen ini tidak dipakai dalam IKG responden.
    """
    result: List[Optional[float]] = []

    for ans in categorical:
        if not ans or not isinstance(ans, dict):
            result.append(None)
            continue

        scores: List[float] = []

        for raw_val in ans.values():
            if raw_val is None:
                continue

            # Handle checkbox (list) dan single value
            values_to_check: List[Any]
            if isinstance(raw_val, list):
                values_to_check = raw_val
            elif isinstance(raw_val, (set, tuple)):
                values_to_check = list(raw_val)
            else:
                values_to_check = [raw_val]

            for v in values_to_check:
                score = map_preference_value_to_score(str(v))
                if score is not None:
                    scores.append(score)

        if scores:
            result.append(float(sum(scores) / len(scores)))
        else:
            result.append(None)

    return result

