import db from '../models/index.js';
import { Op } from 'sequelize';

const { SegmentasiResponden, AnalisisAi, Survei, ResponSurvei } = db;

/**
 * Calculate confidence score based on multiple factors
 */
export const calculateConfidenceScore = (segmentData) => {
  const {
    segment_size,
    avg_satisfaction,
    avg_sentiment,
    top_features_count = 0,
    data_quality_score = 1.0,
  } = segmentData;
  
  // Base confidence factors
  let confidence = 0.5; // Start at 50%
  
  // Factor 1: Segment size (more respondents = higher confidence)
  if (segment_size >= 50) {
    confidence += 0.2;
  } else if (segment_size >= 20) {
    confidence += 0.15;
  } else if (segment_size >= 10) {
    confidence += 0.1;
  } else if (segment_size >= 5) {
    confidence += 0.05;
  } else {
    confidence -= 0.1; // Very small segments reduce confidence
  }
  
  // Factor 2: Data consistency (satisfaction and sentiment alignment)
  if (avg_satisfaction !== null && avg_sentiment !== null) {
    const diff = Math.abs(avg_satisfaction - avg_sentiment);
    if (diff < 0.1) {
      confidence += 0.1; // Very aligned
    } else if (diff < 0.2) {
      confidence += 0.05; // Moderately aligned
    } else {
      confidence -= 0.05; // Misaligned reduces confidence
    }
  }
  
  // Factor 3: Feature richness
  if (top_features_count >= 5) {
    confidence += 0.1;
  } else if (top_features_count >= 3) {
    confidence += 0.05;
  }
  
  // Factor 4: Data quality
  confidence *= data_quality_score;
  
  // Clamp between 0 and 1
  confidence = Math.max(0, Math.min(1, confidence));
  
  return Math.round(confidence * 100) / 100; // Round to 2 decimals
};

/**
 * Get confidence label
 */
export const getConfidenceLabel = (confidenceScore) => {
  if (confidenceScore >= 0.8) {
    return 'high';
  } else if (confidenceScore >= 0.6) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Generate segment rationale
 */
export const generateSegmentRationale = (segment) => {
  const {
    cluster_label,
    avg_satisfaction,
    avg_sentiment,
    segment_size,
    top_features = [],
    dominant_preference,
  } = segment;
  
  const satPct = (avg_satisfaction * 100).toFixed(1);
  const sentPct = (avg_sentiment * 100).toFixed(1);
  
  let rationale = `Segment ${cluster_label} terdiri dari ${segment_size} responden dengan `;
  
  if (avg_satisfaction >= 0.7) {
    rationale += `tingkat kepuasan tinggi (${satPct}%)`;
  } else if (avg_satisfaction >= 0.5) {
    rationale += `tingkat kepuasan sedang (${satPct}%)`;
  } else {
    rationale += `tingkat kepuasan rendah (${satPct}%)`;
  }
  
  rationale += ` dan sentimen ${avg_sentiment >= 0.6 ? 'positif' : avg_sentiment >= 0.4 ? 'netral' : 'negatif'} (${sentPct}%). `;
  
  if (dominant_preference) {
    rationale += `Preferensi dominan: ${dominant_preference}. `;
  }
  
  if (top_features && top_features.length > 0) {
    const featureNames = top_features.slice(0, 3).map(f => f.feature || f.name || f).join(', ');
    rationale += `Fitur utama yang mempengaruhi: ${featureNames}.`;
  }
  
  return rationale;
};

/**
 * Generate recommendation rationale
 */
export const generateRecommendationRationale = (segment, recommendation) => {
  const {
    avg_satisfaction,
    segment_size,
    dominant_preference,
    top_features = [],
  } = segment;
  
  let rationale = `Berdasarkan analisis ${segment_size} responden dalam segment ini, `;
  
  if (avg_satisfaction < 0.5) {
    rationale += `tingkat kepuasan yang rendah (${(avg_satisfaction * 100).toFixed(1)}%) menunjukkan kebutuhan mendesak untuk perbaikan. `;
  } else if (avg_satisfaction < 0.7) {
    rationale += `tingkat kepuasan yang sedang (${(avg_satisfaction * 100).toFixed(1)}%) menunjukkan potensi peningkatan. `;
  } else {
    rationale += `tingkat kepuasan yang tinggi (${(avg_satisfaction * 100).toFixed(1)}%) perlu dipertahankan. `;
  }
  
  if (dominant_preference) {
    rationale += `Preferensi dominan "${dominant_preference}" menjadi fokus utama. `;
  }
  
  if (top_features && top_features.length > 0) {
    const topFeature = top_features[0];
    rationale += `Fitur "${topFeature.feature || topFeature.name || topFeature}" memiliki pengaruh terbesar. `;
  }
  
  rationale += `Rekomendasi: ${recommendation}`;
  
  return rationale;
};

/**
 * Create or update segment
 */
export const createOrUpdateSegment = async (segmentData) => {
  try {
    const {
      id_analisis,
      id_survei,
      model_versi,
      cluster_label,
      karakteristik,
      avg_sentiment,
      avg_satisfaction,
      segment_size,
      top_features = [],
      importance = {},
      respondent_ids = [],
      dominant_preference,
      recommendation,
    } = segmentData;
    
    // Calculate confidence
    const confidence_score = calculateConfidenceScore({
      segment_size,
      avg_satisfaction,
      avg_sentiment,
      top_features_count: top_features.length,
    });
    
    const confidence_label = getConfidenceLabel(confidence_score);
    const low_confidence_warning = confidence_score < 0.6;
    
    // Generate rationales
    const segment_rationale = generateSegmentRationale({
      cluster_label,
      avg_satisfaction,
      avg_sentiment,
      segment_size,
      top_features,
      dominant_preference,
    });
    
    const recommendation_rationale = recommendation
      ? generateRecommendationRationale(
          {
            avg_satisfaction,
            segment_size,
            dominant_preference,
            top_features,
          },
          recommendation
        )
      : null;
    
    // Check if segment exists
    let segment = await SegmentasiResponden.findOne({
      where: {
        id_analisis: id_analisis || null,
        id_survei: id_survei || null,
        cluster_label,
      },
    });
    
    const segmentDataToSave = {
      id_analisis: id_analisis || null,
      id_survei: id_survei || null,
      model_versi,
      cluster_label,
      karakteristik,
      avg_sentiment,
      avg_satisfaction,
      segment_size,
      top_features,
      importance,
      respondent_ids,
      confidence_score,
      confidence_label,
      low_confidence_warning,
      segment_rationale,
      recommendation_rationale,
      tanggal_analisis: new Date(),
    };
    
    if (segment) {
      await segment.update(segmentDataToSave);
      return segment.reload();
    } else {
      return await SegmentasiResponden.create(segmentDataToSave);
    }
  } catch (error) {
    throw new Error(`Failed to create/update segment: ${error.message}`);
  }
};

/**
 * Get segment by ID
 */
export const getSegmentById = async (id, userId) => {
  try {
    const segment = await SegmentasiResponden.findByPk(id, {
      include: [
        { model: AnalisisAi, attributes: ['id', 'jenis_analisis', 'tanggal_analisis'] },
        { model: Survei, attributes: ['id', 'judul'] },
      ],
    });
    
    if (!segment) {
      throw new Error('Segment not found');
    }
    
    // Check access
    if (segment.id_survei) {
      const survei = await Survei.findByPk(segment.id_survei);
      if (survei) {
        const umum = await db.Umum.findOne({ where: { id_pengguna: userId } });
        const user = await db.Pengguna.findByPk(userId);
        if (umum && survei.id_umum !== umum.id && user?.role !== 'admin') {
          throw new Error('Unauthorized access');
        }
      }
    }
    
    return segment;
  } catch (error) {
    throw new Error(`Failed to get segment: ${error.message}`);
  }
};

/**
 * Get segment details with respondents
 */
export const getSegmentDetails = async (id, userId) => {
  try {
    const segment = await getSegmentById(id, userId);
    
    // Get respondents in this segment
    const respondentIds = segment.respondent_ids || [];
    const respondents = await ResponSurvei.findAll({
      where: {
        id: { [Op.in]: respondentIds },
      },
      include: [
        { model: db.Umum, attributes: ['id', 'nama'] },
      ],
      attributes: ['id', 'is_completed', 'created_at'],
    });
    
    return {
      ...segment.toJSON(),
      respondents,
      respondent_count: respondents.length,
    };
  } catch (error) {
    throw new Error(`Failed to get segment details: ${error.message}`);
  }
};

/**
 * Compare segments
 */
export const compareSegments = async (segmentIds, userId) => {
  try {
    const segments = await SegmentasiResponden.findAll({
      where: {
        id: { [Op.in]: segmentIds },
      },
      include: [
        { model: Survei, attributes: ['id', 'judul'] },
      ],
    });
    
    if (segments.length === 0) {
      throw new Error('No segments found');
    }
    
    // Verify access for all segments
    for (const segment of segments) {
      if (segment.id_survei) {
        const survei = await Survei.findByPk(segment.id_survei);
        if (survei) {
          const umum = await db.Umum.findOne({ where: { id_pengguna: userId } });
          const user = await db.Pengguna.findByPk(userId);
          if (umum && survei.id_umum !== umum.id && user?.role !== 'admin') {
            throw new Error('Unauthorized access to one or more segments');
          }
        }
      }
    }
    
    // Build comparison data
    const comparison = {
      segments: segments.map(s => ({
        id: s.id,
        cluster_label: s.cluster_label,
        segment_size: s.segment_size,
        avg_satisfaction: s.avg_satisfaction,
        avg_sentiment: s.avg_sentiment,
        confidence_score: s.confidence_score,
        confidence_label: s.confidence_label,
        dominant_preference: s.top_features?.[0]?.feature || 'N/A',
        top_features: s.top_features?.slice(0, 3) || [],
      })),
      metrics: {
        total_respondents: segments.reduce((sum, s) => sum + (s.segment_size || 0), 0),
        avg_satisfaction_range: {
          min: Math.min(...segments.map(s => s.avg_satisfaction || 0)),
          max: Math.max(...segments.map(s => s.avg_satisfaction || 1)),
        },
        avg_confidence: segments.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / segments.length,
      },
    };
    
    return comparison;
  } catch (error) {
    throw new Error(`Failed to compare segments: ${error.message}`);
  }
};

/**
 * Get segment history (evolution over time)
 */
export const getSegmentHistory = async (id_survei, cluster_label, userId) => {
  try {
    const umum = await db.Umum.findOne({ where: { id_pengguna: userId } });
    if (!umum) {
      throw new Error('User profile not found');
    }
    
    // Verify survey ownership
    const survei = await Survei.findByPk(id_survei);
    if (!survei) {
      throw new Error('Survey not found');
    }
    
    const user = await db.Pengguna.findByPk(userId);
    if (survei.id_umum !== umum.id && user?.role !== 'admin') {
      throw new Error('Unauthorized access');
    }
    
    const segments = await SegmentasiResponden.findAll({
      where: {
        id_survei,
        cluster_label,
      },
      include: [
        { model: AnalisisAi, attributes: ['id', 'tanggal_analisis'] },
      ],
      order: [['tanggal_analisis', 'ASC']],
    });
    
    return segments.map(s => ({
      id: s.id,
      tanggal_analisis: s.tanggal_analisis,
      segment_size: s.segment_size,
      avg_satisfaction: s.avg_satisfaction,
      avg_sentiment: s.avg_sentiment,
      confidence_score: s.confidence_score,
      top_features: s.top_features?.slice(0, 3) || [],
    }));
  } catch (error) {
    throw new Error(`Failed to get segment history: ${error.message}`);
  }
};

/**
 * Get all segments for survey
 */
export const getSegmentsBySurvey = async (id_survei, userId, query = {}) => {
  try {
    const umum = await db.Umum.findOne({ where: { id_pengguna: userId } });
    if (!umum) {
      throw new Error('User profile not found');
    }
    
    // Verify survey ownership
    const survei = await Survei.findByPk(id_survei);
    if (!survei) {
      throw new Error('Survey not found');
    }
    
    const user = await db.Pengguna.findByPk(userId);
    if (survei.id_umum !== umum.id && user?.role !== 'admin') {
      throw new Error('Unauthorized access');
    }
    
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await SegmentasiResponden.findAndCountAll({
      where: { id_survei },
      include: [
        { model: AnalisisAi, attributes: ['id', 'tanggal_analisis'] },
      ],
      order: [['tanggal_analisis', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    
    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to get segments: ${error.message}`);
  }
};

