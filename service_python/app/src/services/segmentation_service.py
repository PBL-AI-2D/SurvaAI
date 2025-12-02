import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple

from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA

def _build_feature_matrix(
    satisfaction_scores: List[float],
    sentiment_scores: List[float],
    product_features: List[Dict[str, int]], # Input: One-Hot (Produk A=1, Produk B=0, dst)
) -> Tuple[pd.DataFrame, np.ndarray, List[str]]:
    
    # Base: Kepuasan & Sentimen
    base_df = pd.DataFrame({
        "satisfaction": satisfaction_scores,
        "sentiment": sentiment_scores,
    })
    
    # Fitur Produk/Preferensi (Wajib One-Hot Encoding: 0 atau 1)
    # Contoh key: "suka_gratis_ongkir", "produk_baju", "fitur_darkmode"
    prod_cols = []
    if product_features:
        prod_df = pd.DataFrame(product_features).fillna(0)
        prod_cols = prod_df.columns.tolist()
        base_df = pd.concat([base_df.reset_index(drop=True), prod_df.reset_index(drop=True)], axis=1)
    
    # Ambil nilai array numerik untuk clustering
    X = base_df.select_dtypes(include=[np.number]).values
    return base_df, X, prod_cols

def _analyze_cluster_affinity(
    df_cluster: pd.DataFrame, 
    product_cols: List[str]
) -> List[Dict[str, Any]]:
    """
    Menganalisa produk apa yang paling diminati (Affinity High) di cluster ini.
    """
    if not product_cols or df_cluster.empty:
        return []

    # Hitung persentase user yg memilih fitur ini (Mean dari 0/1)
    # Hasil: "fitur_A": 0.9 (90%), "fitur_B": 0.1 (10%)
    affinity = df_cluster[product_cols].mean().sort_values(ascending=False)
    
    top_products = []
    for feature_name, score in affinity.items():
        # Hanya ambil jika diminati oleh minimal 20% populasi cluster (supaya relevan)
        if score > 0.2: 
            top_products.append({
                "product_name": feature_name,
                "affinity_score": float(score), # 0.0 - 1.0 (Persentase Popularitas)
                "is_dominant": True if score > 0.6 else False # Label Dominan jika > 60%
            })
            
    # Ambil Top 5 saja agar ringkas
    return top_products[:5]

def segment_respondents(
    satisfaction_scores: List[float],
    sentiment_scores: List[float],
    product_features: List[Dict[str, int]], # Wajib: One-Hot Encoding fitur/produk
    demographics: Optional[List[Dict[str, Any]]] = None,
    k: Optional[int] = None,
    k_min: int = 2,
    k_max: int = 8,
    random_state: int = 42,
) -> Dict[str, Any]:
    """
    Segmentasi untuk mengetahui Pemetaan Produk per Segmen.
    """
    
    # 1. Build Data
    df_features, X, product_cols = _build_feature_matrix(satisfaction_scores, sentiment_scores, product_features)
    
    # 2. Scaling (Agar Sentimen & Fitur Produk bobotnya seimbang)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 3. Clustering (K-Means)
    k_analysis = None
    if k is None:
        # Simple Elbow/Silhouette
        silhouettes = {}
        for i in range(k_min, k_max + 1):
            if len(X) <= i: break
            km = KMeans(n_clusters=i, random_state=random_state, n_init="auto")
            lbls = km.fit_predict(X_scaled)
            silhouettes[i] = silhouette_score(X_scaled, lbls)
        
        if silhouettes:
            k = max(silhouettes, key=silhouettes.get)
        else:
            k = 3
        k_analysis = {"best_k": k, "scores": silhouettes}

    kmeans = KMeans(n_clusters=k, random_state=random_state, n_init="auto")
    cluster_labels = kmeans.fit_predict(X_scaled)
    
    df_clustered = df_features.copy()
    df_clustered["cluster"] = cluster_labels
    
    # 4. Analisis Per Segmen (Product Affinity)
    segments_profile = []
    
    for c_id in sorted(df_clustered['cluster'].unique()):
        subset = df_clustered[df_clustered['cluster'] == c_id]
        
        # A. Hitung Rata-rata Kepuasan Segmen Ini
        avg_sat = float(subset['satisfaction'].mean())
        avg_sent = float(subset['sentiment'].mean())
        
        # B. Cari Produk/Fitur Yang Disukai Segmen Ini
        liked_products = _analyze_cluster_affinity(subset, product_cols)
        
        # C. Auto Naming berdasarkan Produk Terfavorit
        # Contoh nama: "Puas (0.8) - Pecinta [Produk A]"
        if liked_products:
            top_prod = liked_products[0]['product_name']
            segment_name = f"Segmen {top_prod}"
        else:
            segment_name = f"Segmen {c_id}"
            
        # D. Profil Demografi (Jika ada)
        demo_summary = {}
        if demographics:
            df_demo = pd.DataFrame(demographics)
            # Gabung index biar pas
            subset_demo = df_demo.iloc[subset.index] 
            for col in df_demo.columns:
                try:
                    demo_summary[col] = subset_demo[col].mode()[0]
                except: pass

        segments_profile.append({
            "cluster_id": int(c_id),
            "label_name": segment_name,
            "population_count": int(len(subset)),
            "avg_satisfaction": round(avg_sat, 2),
            "avg_sentiment": round(avg_sent, 2),
            "preferred_products": liked_products, # <--- INI HASIL UTAMANYA
            "demographics_mode": demo_summary
        })

    # 5. Output Visualisasi Scatter Plot
    pca = PCA(n_components=2)
    coords = pca.fit_transform(X_scaled)
    pca_data = [
        {"x": float(c[0]), "y": float(c[1]), "cluster": int(l)} 
        for c, l in zip(coords, cluster_labels)
    ]

    return {
        "k_used": k,
        "segments": segments_profile,
        "pca_plot": pca_data
    }