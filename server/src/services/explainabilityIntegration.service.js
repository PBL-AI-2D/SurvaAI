import * as segmentasiRespondenService from './segmentasiResponden.service.js';
import * as analisisAiService from './analisisAi.service.js';
import db from '../models/index.js';

const { SegmentasiResponden, AnalisisAi } = db;

/**
 * Update explainability data from Python service response
 * This is called after the Python service returns dashboard data
 */
export const updateExplainabilityFromPythonResponse = async (
  id_survei,
  pythonResponse
) => {
  try {
    const { segment_insights = [], segments = [] } = pythonResponse;
    
    // Get or create analysis record
    let analysis = await AnalisisAi.findOne({
      where: {
        id_survei,
        jenis_analisis: 'full_dashboard',
      },
      order: [['tanggal_analisis', 'DESC']],
    });
    
    if (!analysis) {
      // Create new analysis record
      analysis = await analisisAiService.createOrUpdateAnalysis({
        id_survei,
        model_name: 'dashboard_analysis',
        jenis_analisis: 'full_dashboard',
        processing_status: 'done',
      });
    }
    
    // Update segments with explainability data
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const insight = segment_insights[i] || {};
      
      // Extract top_features from segment data
      const top_features = insight.top_features || 
                          segment.top_features || 
                          segment.product_features?.slice(0, 5) || [];
      
      // Calculate importance from frequencies
      const importance = {};
      if (segment.product_features) {
        const total = segment.product_features.reduce((sum, val) => sum + val, 0);
        segment.product_features.forEach((freq, idx) => {
          if (freq > 0) {
            const featureName = `feature_${idx}`;
            importance[featureName] = freq / total;
          }
        });
      }
      
      // Get dominant preference
      const dominant_preference = insight.dominant_preference || 
                                  segment.dominant_preference ||
                                  top_features[0]?.feature || 
                                  'N/A';
      
      // Get recommendation
      const recommendation = insight.recommendation || 
                            segment.recommendation ||
                            null;
      
      // Create or update segment with explainability
      await segmentasiRespondenService.createOrUpdateSegment({
        id_analisis: analysis.id,
        id_survei,
        model_versi: '1.0',
        cluster_label: segment.segment_id || `Segment ${i + 1}`,
        karakteristik: segment.karakteristik || insight.problem || '',
        avg_sentiment: segment.avg_sentiment || insight.avg_sentiment || 0.5,
        avg_satisfaction: segment.satisfaction_percentage / 100 || 
                         insight.satisfaction_percentage / 100 || 0.5,
        segment_size: segment.respondent_count || segment.segment_size || 0,
        top_features: top_features.map(f => ({
          feature: typeof f === 'string' ? f : (f.feature || f.name || f),
          frequency: typeof f === 'object' ? (f.frequency || f.value || 0) : 0,
          importance: typeof f === 'object' ? (f.importance || 0) : 0,
        })),
        importance,
        respondent_ids: segment.respondent_ids || [],
        dominant_preference,
        recommendation,
      });
    }
    
    // Update analysis status to done
    await analisisAiService.updateAnalysisStatus(analysis.id, 'done');
    
    return {
      message: 'Explainability data updated successfully',
      segments_updated: segments.length,
    };
  } catch (error) {
    throw new Error(`Failed to update explainability: ${error.message}`);
  }
};

