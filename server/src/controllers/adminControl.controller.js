import * as adminControlService from '../services/adminControl.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';

/**
 * Trigger manual analysis
 */
export const triggerManualAnalysis = async (req, res) => {
  try {
    const result = await adminControlService.triggerManualAnalysis(
      req.params.surveiId,
      req.user.id
    );
    resSuccess(res, result.message, result, 202);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Reset analysis
 */
export const resetAnalysis = async (req, res) => {
  try {
    const result = await adminControlService.resetAnalysis(
      req.params.surveiId,
      req.user.id
    );
    resSuccess(res, result.message, null);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Get threshold configuration
 */
export const getThresholdConfig = async (req, res) => {
  try {
    const config = await adminControlService.getThresholdConfig();
    resSuccess(res, 'Threshold configuration retrieved successfully', config);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Update threshold configuration
 */
export const updateThresholdConfig = async (req, res) => {
  try {
    const result = await adminControlService.updateThresholdConfig(
      req.body,
      req.user.id
    );
    resSuccess(res, result.message, result.config);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Clear cache
 */
export const clearCache = async (req, res) => {
  try {
    const result = await adminControlService.clearCache(
      req.query.pattern,
      req.user.id
    );
    resSuccess(res, result.message, { cleared_count: result.cleared_count });
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Get system status
 */
export const getSystemStatus = async (req, res) => {
  try {
    const status = await adminControlService.getSystemStatus(req.user.id);
    resSuccess(res, 'System status retrieved successfully', status);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

