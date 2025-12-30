import * as segmentasiRespondenService from '../services/segmentasiResponden.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';

/**
 * Get segment by ID
 */
export const getSegmentById = async (req, res) => {
  try {
    const segment = await segmentasiRespondenService.getSegmentById(
      req.params.id,
      req.user.id
    );
    resSuccess(res, 'Segment retrieved successfully', segment);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Get segment details with respondents
 */
export const getSegmentDetails = async (req, res) => {
  try {
    const details = await segmentasiRespondenService.getSegmentDetails(
      req.params.id,
      req.user.id
    );
    resSuccess(res, 'Segment details retrieved successfully', details);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Compare segments
 */
export const compareSegments = async (req, res) => {
  try {
    const { segment_ids } = req.body;
    if (!Array.isArray(segment_ids) || segment_ids.length < 2) {
      return resFail(res, 'At least 2 segment IDs required for comparison', 400);
    }
    
    const comparison = await segmentasiRespondenService.compareSegments(
      segment_ids,
      req.user.id
    );
    resSuccess(res, 'Segments compared successfully', comparison);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Get segment history
 */
export const getSegmentHistory = async (req, res) => {
  try {
    const { cluster_label } = req.query;
    if (!cluster_label) {
      return resFail(res, 'cluster_label query parameter is required', 400);
    }
    
    const history = await segmentasiRespondenService.getSegmentHistory(
      req.params.surveiId,
      cluster_label,
      req.user.id
    );
    resSuccess(res, 'Segment history retrieved successfully', history);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Get all segments for survey
 */
export const getSegmentsBySurvey = async (req, res) => {
  try {
    const result = await segmentasiRespondenService.getSegmentsBySurvey(
      req.params.surveiId,
      req.user.id,
      req.query
    );
    resSuccess(res, 'Segments retrieved successfully', result);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

