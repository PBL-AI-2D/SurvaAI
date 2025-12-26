import * as datasetAiService from '../services/datasetAi.service.js';
import { resSuccess, resFail } from '../utils/responseHandler.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  },
});

export const uploadMiddleware = upload.single('file');

/**
 * Upload dataset
 */
export const uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return resFail(res, 'No file uploaded', 400);
    }
    
    const metadata = {
      nama_dataset: req.body.nama_dataset,
      sumber: req.body.sumber || 'file_upload',
      id_survei: req.body.id_survei || null,
    };
    
    const dataset = await datasetAiService.createDatasetFromFile(
      req.file,
      metadata,
      req.user.id
    );
    
    resSuccess(res, 'Dataset uploaded successfully', dataset, 201);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Get all datasets
 */
export const getAllDatasets = async (req, res) => {
  try {
    const result = await datasetAiService.getAllDatasets(req.query, req.user.id);
    resSuccess(res, 'Datasets retrieved successfully', result);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Get dataset by ID
 */
export const getDatasetById = async (req, res) => {
  try {
    const dataset = await datasetAiService.getDatasetById(req.params.id, req.user.id);
    resSuccess(res, 'Dataset retrieved successfully', dataset);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Get dataset versions
 */
export const getDatasetVersions = async (req, res) => {
  try {
    const versions = await datasetAiService.getDatasetVersions(
      req.params.namaDataset,
      req.user.id
    );
    resSuccess(res, 'Dataset versions retrieved successfully', versions);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Get dataset preview
 */
export const getDatasetPreview = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const preview = await datasetAiService.getDatasetPreview(
      req.params.id,
      req.user.id,
      limit
    );
    resSuccess(res, 'Dataset preview retrieved successfully', preview);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

/**
 * Delete dataset
 */
export const deleteDataset = async (req, res) => {
  try {
    const result = await datasetAiService.deleteDataset(req.params.id, req.user.id);
    resSuccess(res, result.message, null);
  } catch (error) {
    resFail(res, error.message, error.status || 500);
  }
};

