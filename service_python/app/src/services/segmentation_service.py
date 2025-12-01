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
    categorical_features: Optional[List[Dict[str, Any]]] = None,
) -> Tuple[pd.DataFrame, np.ndarray]:

    if len(satisfaction_scores) != len(sentiment_scores):
        raise ValueError("satisfaction_scores and sentiment_scores must have same length")

    n = len(satisfaction_scores)
    if categorical_features is not None and len(categorical_features) != n:
        raise ValueError("categorical_features length must match number of respondents")

    base_df = pd.DataFrame(
        {
            "satisfaction": satisfaction_scores,
            "sentiment": sentiment_scores,
        }
    )

    if categorical_features:
        cat_df = pd.DataFrame(categorical_features)
        cat_df = cat_df.reset_index(drop=True)
        base_df = pd.concat([base_df.reset_index(drop=True), cat_df], axis=1)

    feature_columns = base_df.columns.tolist()

    X = base_df.values.astype(float)
    return base_df[feature_columns], X


def _find_optimal_k(
    X_scaled: np.ndarray,
    k_min: int = 2,
    k_max: int = 10,
    random_state: int = 42,
) -> Dict[str, Any]:
    inertia_values: Dict[int, float] = {}
    silhouette_values: Dict[int, float] = {}

    for k in range(k_min, k_max + 1):
        kmeans = KMeans(n_clusters=k, random_state=random_state, n_init="auto")
        labels = kmeans.fit_predict(X_scaled)
        inertia_values[k] = float(kmeans.inertia_)

        if len(X_scaled) > k:
            try:
                silhouette_values[k] = float(silhouette_score(X_scaled, labels))
            except ValueError:
                silhouette_values[k] = float("nan")
        else:
            silhouette_values[k] = float("nan")

    best_k = None
    best_sil = -1.0
    for k, sil in silhouette_values.items():
        if np.isnan(sil):
            continue
        if sil > best_sil:
            best_sil = sil
            best_k = k

    return {
        "k_min": k_min,
        "k_max": k_max,
        "inertia": inertia_values,
        "silhouette": silhouette_values,
        "recommended_k": best_k,
    }


def segment_respondents(
    satisfaction_scores: List[float],
    sentiment_scores: List[float],
    categorical_features: Optional[List[Dict[str, Any]]] = None,
    k: Optional[int] = None,
    k_min: int = 2,
    k_max: int = 10,
    random_state: int = 42,
) -> Dict[str, Any]:
    """
    Segmentasi responden menggunakan K-Means clustering.
    
    Args:
        satisfaction_scores: Skor kepuasan per responden
        sentiment_scores: Skor sentimen per responden
        categorical_features: Fitur kategorikal per responden (optional)
        k: Jumlah cluster (optional, akan dicari optimal jika None)
        k_min: Minimum K untuk pencarian optimal
        k_max: Maximum K untuk pencarian optimal
        random_state: Random state untuk reproducibility
    
    Returns:
        Dict dengan hasil segmentasi
    """
    df_features, X = _build_feature_matrix(
        satisfaction_scores=satisfaction_scores,
        sentiment_scores=sentiment_scores,
        categorical_features=categorical_features,
    )

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    k_analysis: Optional[Dict[str, Any]] = None
    if k is None:
        k_analysis = _find_optimal_k(X_scaled, k_min=k_min, k_max=k_max, random_state=random_state)
        if k_analysis["recommended_k"] is None:
            k = max(k_min, 2)
        else:
            k = int(k_analysis["recommended_k"])

    kmeans_final = KMeans(n_clusters=k, random_state=random_state, n_init="auto")
    cluster_labels = kmeans_final.fit_predict(X_scaled)

    df_clustered = df_features.copy()
    df_clustered["cluster"] = cluster_labels

    cluster_summary = (
        df_clustered.groupby("cluster")
        .agg(["mean", "count"])
        .to_dict()
    )

    preference_summary: Dict[str, Any] = {}
    if categorical_features:
        cat_columns = list(pd.DataFrame(categorical_features).columns)
        for cluster_id in sorted(df_clustered["cluster"].unique()):
            subset = df_clustered[df_clustered["cluster"] == cluster_id]
            freq = subset[cat_columns].mean().sort_values(ascending=False)
            top_features = [
                {"feature": feat, "score": float(score)}
                for feat, score in freq.head(5).items()
            ]
            preference_summary[str(cluster_id)] = top_features

    pca = PCA(n_components=2, random_state=random_state)
    X_pca = pca.fit_transform(X_scaled)
    pca_2d = [
        {"x": float(x), "y": float(y), "cluster": int(c)}
        for (x, y), c in zip(X_pca, cluster_labels)
    ]

    return {
        "k_used": int(k),
        "clusters": [int(c) for c in cluster_labels],
        "k_analysis": k_analysis,
        "cluster_summary": cluster_summary,
        "preference_summary": preference_summary,
        "pca_2d": pca_2d,
    }

