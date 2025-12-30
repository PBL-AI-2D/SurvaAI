import db from '../models/index.js';
import { Op } from 'sequelize';
import redis, { safeRedisOperation } from '../config/redis.js';

const { Survei, AnalisisAi, SegmentasiResponden, Pengguna } = db;

/**
 * Trigger manual analysis for survey
 */
export const triggerManualAnalysis = async (id_survei, userId) => {
  try {
    // Verify user is admin or survey owner
    const user = await Pengguna.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const survei = await Survei.findByPk(id_survei);
    if (!survei) {
      throw new Error('Survey not found');
    }
    
    if (user.role !== 'admin') {
      const umum = await db.Umum.findOne({ where: { id_pengguna: userId } });
      if (!umum || survei.id_umum !== umum.id) {
        throw new Error('Unauthorized: Only admin or survey owner can trigger analysis');
      }
    }
    
    // Create analysis record with processing status
    const analysis = await db.AnalisisAi.create({
      id_survei,
      model_name: 'dashboard_analysis',
      jenis_analisis: 'full_dashboard',
      processing_status: 'processing',
      processing_started_at: new Date(),
      tanggal_analisis: new Date(),
    });
    
    // Return analysis ID for tracking
    return {
      analysis_id: analysis.id,
      message: 'Analysis triggered successfully. Check status endpoint for progress.',
    };
  } catch (error) {
    throw new Error(`Failed to trigger analysis: ${error.message}`);
  }
};

/**
 * Reset/refresh analysis
 */
export const resetAnalysis = async (id_survei, userId) => {
  try {
    // Verify user is admin or survey owner
    const user = await Pengguna.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const survei = await Survei.findByPk(id_survei);
    if (!survei) {
      throw new Error('Survey not found');
    }
    
    if (user.role !== 'admin') {
      const umum = await db.Umum.findOne({ where: { id_pengguna: userId } });
      if (!umum || survei.id_umum !== umum.id) {
        throw new Error('Unauthorized: Only admin or survey owner can reset analysis');
      }
    }
    
    // Delete existing analyses and segments
    await AnalisisAi.destroy({
      where: { id_survei },
    });
    
    await SegmentasiResponden.destroy({
      where: { id_survei },
    });
    
    // Clear cache
    const cacheKey = `analysis:${id_survei}`;
    await safeRedisOperation(async () => {
      if (redis && redis.isOpen) {
        await redis.del(cacheKey);
      }
    });
    
    return {
      message: 'Analysis reset successfully. You can trigger a new analysis.',
    };
  } catch (error) {
    throw new Error(`Failed to reset analysis: ${error.message}`);
  }
};

/**
 * Get threshold configuration
 */
export const getThresholdConfig = async () => {
  try {
    // Default thresholds
    const defaultConfig = {
      confidence_high: 0.8,
      confidence_medium: 0.6,
      confidence_low: 0.0,
      sentiment_positive: 0.6,
      sentiment_neutral: 0.4,
      sentiment_negative: 0.0,
      satisfaction_high: 0.7,
      satisfaction_medium: 0.5,
      satisfaction_low: 0.0,
      low_confidence_warning: 0.6,
      minimum_respondents: 5,
    };
    
    // Try to get from cache or database (if you have a config table)
    const cached = await safeRedisOperation(async () => {
      if (redis && redis.isOpen) {
        return await redis.get('threshold_config');
      }
      return null;
    });
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    return defaultConfig;
  } catch (error) {
    throw new Error(`Failed to get threshold config: ${error.message}`);
  }
};

/**
 * Update threshold configuration (admin only)
 */
export const updateThresholdConfig = async (config, userId) => {
  try {
    // Verify user is admin
    const user = await Pengguna.findByPk(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Only admin can update threshold config');
    }
    
    // Validate config
    const validKeys = [
      'confidence_high',
      'confidence_medium',
      'confidence_low',
      'sentiment_positive',
      'sentiment_neutral',
      'sentiment_negative',
      'satisfaction_high',
      'satisfaction_medium',
      'satisfaction_low',
      'low_confidence_warning',
      'minimum_respondents',
    ];
    
    const validatedConfig = {};
    for (const key of validKeys) {
      if (config[key] !== undefined) {
        const value = parseFloat(config[key]);
        if (isNaN(value) || value < 0 || value > 1) {
          throw new Error(`Invalid threshold value for ${key}: must be between 0 and 1`);
        }
        validatedConfig[key] = value;
      }
    }
    
    // Save to cache
    await safeRedisOperation(async () => {
      if (redis && redis.isOpen) {
        await redis.set('threshold_config', JSON.stringify(validatedConfig));
      }
    });
    
    // TODO: Save to database if you have a config table
    
    return {
      message: 'Threshold configuration updated successfully',
      config: validatedConfig,
    };
  } catch (error) {
    throw new Error(`Failed to update threshold config: ${error.message}`);
  }
};

/**
 * Clear cache
 */
export const clearCache = async (pattern, userId) => {
  try {
    // Verify user is admin
    const user = await Pengguna.findByPk(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Only admin can clear cache');
    }
    
    let cleared = 0;
    
    const result = await safeRedisOperation(async () => {
      if (!redis || !redis.isOpen) {
        return { cleared: 0, message: 'Redis not configured, no cache to clear' };
      }
      
      if (pattern) {
        // Clear specific pattern
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
          return { cleared: keys.length };
        }
      } else {
        // Clear all analysis cache
        const keys = await redis.keys('analysis:*');
        if (keys.length > 0) {
          await redis.del(...keys);
          return { cleared: keys.length };
        }
      }
      return { cleared: 0 };
    }, { cleared: 0 });
    
    cleared = result.cleared;
    
    return {
      message: `Cache cleared successfully`,
      cleared_count: cleared,
    };
  } catch (error) {
    throw new Error(`Failed to clear cache: ${error.message}`);
  }
};

/**
 * Get system status (for admin dashboard)
 */
export const getSystemStatus = async (userId) => {
  try {
    // Verify user is admin
    const user = await Pengguna.findByPk(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Only admin can view system status');
    }
    
    const [
      totalSurveys,
      totalAnalyses,
      processingAnalyses,
      errorAnalyses,
    ] = await Promise.all([
      Survei.count(),
      AnalisisAi.count(),
      AnalisisAi.count({ where: { processing_status: 'processing' } }),
      AnalisisAi.count({ where: { processing_status: 'error' } }),
    ]);
    
    return {
      total_surveys: totalSurveys,
      total_analyses: totalAnalyses,
      processing_analyses: processingAnalyses,
      error_analyses: errorAnalyses,
      cache_status: redis && redis.isOpen ? 'connected' : 'not_configured',
      timestamp: new Date(),
    };
  } catch (error) {
    throw new Error(`Failed to get system status: ${error.message}`);
  }
};

