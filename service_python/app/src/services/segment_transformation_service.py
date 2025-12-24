"""
Service untuk transformasi hasil segmentasi menjadi format yang dibutuhkan dashboard.
Mengkonversi output dari segmentation_service ke segment_details format.
"""
from typing import List, Dict, Any


def transform_segments_to_details(
    segments_from_service: List[Dict[str, Any]],
    satisfaction_scores: List[float],
    assignments: List[int],
) -> List[Dict[str, Any]]:
    """
    Transform segments dari segmentation_service ke format segment_details untuk dashboard.
    
    Args:
        segments_from_service: List segments dari segmentation_service
        satisfaction_scores: List satisfaction scores (0-1) per responden
        assignments: List cluster assignments (1-indexed) per responden
    
    Returns:
        List segment_details dengan format yang dibutuhkan dashboard
    """
    segment_details = []
    
    for seg in segments_from_service:
        cluster_id = seg.get("cluster_id", 0)
        population_count = seg.get("population_count", 0)
        avg_satisfaction = seg.get("avg_satisfaction", 0.0)
        preferred_products = seg.get("preferred_products", [])
        demographics_mode = seg.get("demographics_mode", {})
        label_name = seg.get("label_name", f"Segment {cluster_id + 1}")  # Use logical name from segmentation_service
        
        # Convert avg_satisfaction (0-1) to percentage (0-100)
        avg_satisfaction_pct = round(avg_satisfaction * 100, 1)
        
        # Determine satisfaction status
        if avg_satisfaction_pct >= 70:
            satisfaction_status = "high"
        elif avg_satisfaction_pct >= 50:
            satisfaction_status = "medium"
        else:
            satisfaction_status = "low"
        
        # Extract dominant preference from preferred_products
        dominant_preference = "N/A"
        all_preferences_list = []
        if preferred_products:
            # Get top preferred product as dominant
            top_product = preferred_products[0]
            dominant_preference = top_product.get("product_name", "N/A")
            # Get all preferred products (top 3)
            for prod in preferred_products[:3]:
                prod_name = prod.get("product_name", "")
                if prod_name:
                    all_preferences_list.append(prod_name)
        
        # Extract avg_age from demographics_mode if available
        avg_age = None
        if demographics_mode and "age" in demographics_mode:
            try:
                age_val = demographics_mode["age"]
                if age_val is not None:
                    avg_age = int(round(float(age_val), 0))
            except (ValueError, TypeError):
                avg_age = None
        
        # Calculate satisfaction range from actual scores in this cluster
        cluster_satisfaction_scores = [
            satisfaction_scores[i] * 100 
            for i, assign in enumerate(assignments) 
            if assign == (cluster_id + 1)  # assignments are 1-indexed
        ]
        
        min_satisfaction = round(min(cluster_satisfaction_scores), 1) if cluster_satisfaction_scores else avg_satisfaction_pct
        max_satisfaction = round(max(cluster_satisfaction_scores), 1) if cluster_satisfaction_scores else avg_satisfaction_pct
        
        # Ensure all percentages are clamped to 0-100 to prevent wild numbers
        avg_satisfaction_pct = max(0.0, min(100.0, avg_satisfaction_pct))
        min_satisfaction = max(0.0, min(100.0, min_satisfaction))
        max_satisfaction = max(0.0, min(100.0, max_satisfaction))
        
        segment_details.append({
            "segment_id": cluster_id + 1,  # Convert to 1-indexed for display
            "segment_name": label_name,  # Logical segment name (e.g., "Segment Puas - Pecinta Segmentation")
            "avg_age": avg_age if avg_age is not None else None,  # Explicit None for schema
            "dominant_preference": dominant_preference,
            "all_preferences": all_preferences_list,
            "satisfaction_percentage": avg_satisfaction_pct,
            "satisfaction_range": f"{min_satisfaction}% - {max_satisfaction}%" if min_satisfaction != max_satisfaction else f"{avg_satisfaction_pct}%",
            "satisfaction_status": satisfaction_status,
            "respondent_count": population_count,
        })
    
    return segment_details

