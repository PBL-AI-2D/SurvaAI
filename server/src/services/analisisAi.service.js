import db from '../models/index.js';
import { Op } from 'sequelize';

const { AnalisisAi, ResponSurvei, Survei, DatasetAi, PerformaModel } = db;

/**
 * Create or update analysis record
 */
export const createOrUpdateAnalysis = async (analysisData) => {
  try {
    const {
      id_respon,
      id_survei,
      id_dataset,
      id_performa,
      model_name,
      jenis_analisis,
      confidence_score,
      sentiment_score,
      satisfaction_score,
      preference_score,
      predicted_label,
      processing_status = 'idle',
      error_message,
    } = analysisData;
    
    // Check if analysis already exists
    let analysis = await AnalisisAi.findOne({
      where: {
        id_respon: id_respon || null,
        id_survei: id_survei || null,
        jenis_analisis,
      },
    });
    
    const now = new Date();
    const analysisDataToSave = {
      id_respon: id_respon || null,
      id_survei: id_survei || null,
      id_dataset: id_dataset || null,
      id_performa: id_performa || null,
      model_name,
      jenis_analisis,
      confidence_score,
      sentiment_score,
      satisfaction_score,
      preference_score,
      predicted_label,
      processing_status,
      error_message,
      tanggal_analisis: now,
    };
    
    if (processing_status === 'processing') {
      analysisDataToSave.processing_started_at = now;
    } else if (processing_status === 'done') {
      if (analysis && analysis.processing_started_at) {
        analysisDataToSave.processing_completed_at = now;
        analysisDataToSave.processing_duration = 
          now.getTime() - new Date(analysis.processing_started_at).getTime();
      }
    }
    
    if (analysis) {
      await analysis.update(analysisDataToSave);
      return analysis.reload();
    } else {
      return await AnalisisAi.create(analysisDataToSave);
    }
  } catch (error) {
    throw new Error(`Failed to create/update analysis: ${error.message}`);
  }
};

/**
 * Update analysis status
 */
export const updateAnalysisStatus = async (id, status, errorMessage = null) => {
  try {
    const analysis = await AnalisisAi.findByPk(id);
    if (!analysis) {
      throw new Error('Analysis not found');
    }
    
    const updateData = { processing_status: status };
    const now = new Date();
    
    if (status === 'processing') {
      updateData.processing_started_at = now;
    } else if (status === 'done' || status === 'error') {
      if (analysis.processing_started_at) {
        updateData.processing_completed_at = now;
        updateData.processing_duration = 
          now.getTime() - new Date(analysis.processing_started_at).getTime();
      }
      if (status === 'error' && errorMessage) {
        updateData.error_message = errorMessage;
      }
    }
    
    await analysis.update(updateData);
    return analysis.reload();
  } catch (error) {
    throw new Error(`Failed to update analysis status: ${error.message}`);
  }
};

/**
 * Get analysis by ID
 */
export const getAnalysisById = async (id, userId) => {
  try {
    const analysis = await AnalisisAi.findByPk(id, {
      include: [
        { model: ResponSurvei, attributes: ['id', 'is_completed'] },
        { model: Survei, attributes: ['id', 'judul'] },
        { model: DatasetAi, attributes: ['id', 'nama_dataset'] },
        { model: PerformaModel, attributes: ['id', 'nama_model', 'akurasi'] },
      ],
    });
    
    if (!analysis) {
      throw new Error('Analysis not found');
    }
    
    // Check access (user should own the survey)
    const user = await db.Pengguna.findByPk(userId);
    if (analysis.id_survei) {
      const survei = await Survei.findByPk(analysis.id_survei);
      if (survei) {
        const umum = await db.Umum.findOne({ where: { id_pengguna: userId } });
        if (umum && survei.id_umum !== umum.id && user?.role !== 'admin') {
          throw new Error('Unauthorized access');
        }
      }
    }
    
    return analysis;
  } catch (error) {
    throw new Error(`Failed to get analysis: ${error.message}`);
  }
};

/**
 * Get analysis status for survey
 */
export const getAnalysisStatus = async (id_survei, userId) => {
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
    
    const analyses = await AnalisisAi.findAll({
      where: { id_survei },
      order: [['tanggal_analisis', 'DESC']],
      limit: 1,
    });
    
    if (analyses.length === 0) {
      return {
        status: 'idle',
        last_analysis_at: null,
        processing_duration: null,
        error_message: null,
      };
    }
    
    const latest = analyses[0];
    return {
      status: latest.processing_status,
      last_analysis_at: latest.tanggal_analisis,
      processing_duration: latest.processing_duration,
      error_message: latest.error_message,
      analysis_id: latest.id,
    };
  } catch (error) {
    throw new Error(`Failed to get analysis status: ${error.message}`);
  }
};

/**
 * Get all analyses for survey
 */
export const getAnalysesBySurvey = async (id_survei, userId, query = {}) => {
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
    
    const { page = 1, limit = 10, status } = query;
    const offset = (page - 1) * limit;
    
    const where = { id_survei };
    if (status) {
      where.processing_status = status;
    }
    
    const { count, rows } = await AnalisisAi.findAndCountAll({
      where,
      include: [
        { model: ResponSurvei, attributes: ['id'] },
        { model: DatasetAi, attributes: ['id', 'nama_dataset', 'versi'] },
        { model: PerformaModel, attributes: ['id', 'nama_model', 'akurasi'] },
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
    throw new Error(`Failed to get analyses: ${error.message}`);
  }
};

