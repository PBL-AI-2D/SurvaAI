import db from '../models/index.js';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { DatasetAi, Survei, Umum } = db;

/**
 * Parse CSV file
 */
const parseCSV = (fileBuffer) => {
  const text = fileBuffer.toString('utf-8');
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) throw new Error('CSV file is empty');
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
  
  return { headers, rows };
};

/**
 * Parse Excel file
 */
const parseExcel = async (fileBuffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error('Excel file has no worksheets');
  
  const headers = [];
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
  });
  
  const rows = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const rowData = {};
    headers.forEach((header, index) => {
      const cell = row.getCell(index + 1);
      rowData[header] = cell.value?.toString() || '';
    });
    if (Object.values(rowData).some(v => v)) {
      rows.push(rowData);
    }
  }
  
  return { headers, rows };
};

/**
 * Validate dataset structure
 */
const validateDatasetStructure = (rows, headers) => {
  if (!headers || headers.length === 0) {
    throw new Error('Dataset must have at least one column');
  }
  
  if (rows.length === 0) {
    throw new Error('Dataset must have at least one row of data');
  }
  
  // Check for required columns (optional - can be customized)
  const requiredColumns = ['text', 'likert', 'categorical'];
  const hasRequired = requiredColumns.some(col => 
    headers.some(h => h.toLowerCase().includes(col.toLowerCase()))
  );
  
  if (!hasRequired) {
    console.warn('Warning: Dataset may not have expected columns (text, likert, categorical)');
  }
  
  return true;
};

/**
 * Get preview data (first 10 rows)
 */
const getPreviewData = (rows, limit = 10) => {
  return rows.slice(0, limit);
};

/**
 * Create dataset from file upload
 */
export const createDatasetFromFile = async (file, metadata, userId) => {
  try {
    const { originalname, buffer, mimetype } = file;
    const fileExtension = originalname.split('.').pop().toLowerCase();
    
    let headers, rows;
    
    // Parse file based on type
    if (fileExtension === 'csv' || mimetype === 'text/csv') {
      ({ headers, rows } = parseCSV(buffer));
    } else if (['xlsx', 'xls'].includes(fileExtension) || 
               mimetype.includes('spreadsheet') || 
               mimetype.includes('excel')) {
      ({ headers, rows } = await parseExcel(buffer));
    } else {
      throw new Error(`Unsupported file type: ${fileExtension}. Supported: CSV, Excel`);
    }
    
    // Validate structure
    validateDatasetStructure(rows, headers);
    
    // Get preview
    const previewData = getPreviewData(rows);
    
    // Save file to storage
    const uploadsDir = path.join(__dirname, '../../uploads/datasets');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const fileName = `${Date.now()}_${originalname}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    // Get user's umum record
    const umum = await Umum.findOne({ where: { id_pengguna: userId } });
    if (!umum) {
      throw new Error('User profile not found');
    }
    
    // Get latest version for this dataset name
    const latestVersion = await DatasetAi.findOne({
      where: {
        nama_dataset: metadata.nama_dataset || originalname,
        id_umum: umum.id,
      },
      order: [['versi', 'DESC']],
    });
    
    const newVersion = latestVersion ? latestVersion.versi + 1 : 1;
    
    // Create dataset record
    const dataset = await DatasetAi.create({
      nama_dataset: metadata.nama_dataset || originalname.replace(/\.[^/.]+$/, ''),
      sumber: metadata.sumber || 'file_upload',
      jumlah_data: rows.length,
      jumlah_umaks: headers.length,
      versi: newVersion,
      file_path: filePath,
      file_type: fileExtension,
      metadata: {
        ...metadata,
        original_filename: originalname,
        uploaded_at: new Date().toISOString(),
        headers,
      },
      preview_data: previewData,
      id_umum: umum.id,
      id_survei: metadata.id_survei || null,
      tanggal_upload: new Date(),
    });
    
    return dataset;
  } catch (error) {
    throw new Error(`Failed to create dataset: ${error.message}`);
  }
};

/**
 * Get all datasets with pagination
 */
export const getAllDatasets = async (query, userId) => {
  try {
    const { page = 1, limit = 10, search, id_survei } = query;
    const offset = (page - 1) * limit;
    
    const umum = await Umum.findOne({ where: { id_pengguna: userId } });
    if (!umum) {
      throw new Error('User profile not found');
    }
    
    const where = { id_umum: umum.id };
    
    if (search) {
      where[Op.or] = [
        { nama_dataset: { [Op.iLike]: `%${search}%` } },
        { sumber: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    if (id_survei) {
      where.id_survei = id_survei;
    }
    
    const { count, rows } = await DatasetAi.findAndCountAll({
      where,
      include: [
        { model: Survei, attributes: ['id', 'judul'] },
      ],
      order: [['tanggal_upload', 'DESC']],
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
    throw new Error(`Failed to get datasets: ${error.message}`);
  }
};

/**
 * Get dataset by ID
 */
export const getDatasetById = async (id, userId) => {
  try {
    const umum = await Umum.findOne({ where: { id_pengguna: userId } });
    if (!umum) {
      throw new Error('User profile not found');
    }
    
    const dataset = await DatasetAi.findOne({
      where: {
        id,
        id_umum: umum.id,
      },
      include: [
        { model: Survei, attributes: ['id', 'judul'] },
      ],
    });
    
    if (!dataset) {
      throw new Error('Dataset not found');
    }
    
    return dataset;
  } catch (error) {
    throw new Error(`Failed to get dataset: ${error.message}`);
  }
};

/**
 * Get dataset versions
 */
export const getDatasetVersions = async (namaDataset, userId) => {
  try {
    const umum = await Umum.findOne({ where: { id_pengguna: userId } });
    if (!umum) {
      throw new Error('User profile not found');
    }
    
    const versions = await DatasetAi.findAll({
      where: {
        nama_dataset: namaDataset,
        id_umum: umum.id,
      },
      order: [['versi', 'DESC']],
    });
    
    return versions;
  } catch (error) {
    throw new Error(`Failed to get dataset versions: ${error.message}`);
  }
};

/**
 * Get dataset preview
 */
export const getDatasetPreview = async (id, userId, limit = 10) => {
  try {
    const dataset = await getDatasetById(id, userId);
    
    // If preview_data exists, return it
    if (dataset.preview_data && dataset.preview_data.length > 0) {
      return dataset.preview_data.slice(0, limit);
    }
    
    // Otherwise, read from file
    if (!dataset.file_path || !fs.existsSync(dataset.file_path)) {
      throw new Error('Dataset file not found');
    }
    
    const fileBuffer = fs.readFileSync(dataset.file_path);
    let headers, rows;
    
    if (dataset.file_type === 'csv') {
      ({ headers, rows } = parseCSV(fileBuffer));
    } else if (['xlsx', 'xls'].includes(dataset.file_type)) {
      ({ headers, rows } = await parseExcel(fileBuffer));
    } else {
      throw new Error('Unsupported file type for preview');
    }
    
    return getPreviewData(rows, limit);
  } catch (error) {
    throw new Error(`Failed to get dataset preview: ${error.message}`);
  }
};

/**
 * Delete dataset
 */
export const deleteDataset = async (id, userId) => {
  try {
    const dataset = await getDatasetById(id, userId);
    
    // Delete file if exists
    if (dataset.file_path && fs.existsSync(dataset.file_path)) {
      fs.unlinkSync(dataset.file_path);
    }
    
    await dataset.destroy();
    
    return { message: 'Dataset deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete dataset: ${error.message}`);
  }
};

