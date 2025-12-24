"""
Service untuk analisis preferensi dari categorical features.
Mengidentifikasi dan mengekstrak preferensi produk/features yang disukai responden.
"""
from typing import List, Dict, Any
from collections import Counter


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

