import * as analisisAiService from '../services/analisisAi.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';

/**
 * Get analysis by ID
 */
export const getAnalysisById = async (req, res) => {
  try {
    const analysis = await analisisAiService.getAnalysisById(
      req.params.id,
      req.user.id
    );
    resSuccess(res, 'Analysis retrieved successfully', analysis);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Get analysis status for survey
 */
export const getAnalysisStatus = async (req, res) => {
  try {
    const status = await analisisAiService.getAnalysisStatus(
      req.params.surveiId,
      req.user.id
    );
    resSuccess(res, 'Analysis status retrieved successfully', status);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Get all analyses for survey
 */
export const getAnalysesBySurvey = async (req, res) => {
  try {
    const result = await analisisAiService.getAnalysesBySurvey(
      req.params.surveiId,
      req.user.id,
      req.query
    );
    resSuccess(res, 'Analyses retrieved successfully', result);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Update analysis status (for manual trigger)
 */
export const updateAnalysisStatus = async (req, res) => {
  try {
    const { status, error_message } = req.body;
    const analysis = await analisisAiService.updateAnalysisStatus(
      req.params.id,
      status,
      error_message
    );
    resSuccess(res, 'Analysis status updated successfully', analysis);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

