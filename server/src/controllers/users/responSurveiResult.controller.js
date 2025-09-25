import * as responSurveiService from '../../services/responSurvei.service.js';
import * as responSurveiResultService from '../../services/responSurveiResult.service.js';
import * as surveiService from '../../services/survei.service.js';
import { resSuccess, resFail } from '../../utils/responseHandler.js';
import { getUmumIdByUserId } from '../../utils/userMapper.js';

export const getAllResponFromMySurvei = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const survei = await surveiService.show(req.params.surveiId);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this survei', 403);
    }

    const result = await responSurveiService.index(req.params.surveiId, req.query);
    const message = result.data.length > 0
      ? 'Respon survei retrieved successfully'
      : 'No respon survei found';
    resSuccess(res, message, result);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getResponFromMySurvei = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const survei = await surveiService.show(req.params.surveiId);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this survei', 403);
    }

    const responSurvei = await responSurveiService.show(req.params.id);
    resSuccess(res, 'Respon survei details retrieved successfully', responSurvei);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export const getUserResponSurveiResultSummary = async (req, res) => {
  try {
    const umumId = await getUmumIdByUserId(req.user.userId);
    const survei = await surveiService.show(req.params.surveiId);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this survei', 403);
    }

    const summary = await responSurveiResultService.showSummary(req.params.surveiId);
    resSuccess(res, 'Respon survei result summary retrieved successfully', summary);
  } catch (error) {
    resFail(res, error.message, error.status);
  }
};

export async function handleExport(req, res) {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    const umumId = await getUmumIdByUserId(req.user.userId);
    const survei = await surveiService.show(req.params.surveiId);
    if (survei.id_umum !== umumId) {
      return resFail(res, 'Unauthorized to access this survei', 403);
    }

    const exportResult = await responSurveiResultService.exportSurveyResponses({
      surveiId: req.params.surveiId,
      format
    });

    const headers = {
      csv: {
        contentType: 'text/csv',
        fileExtension: 'csv'
      },
      xlsx: {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileExtension: 'xlsx'
      }
    };

    res.setHeader('Content-Type', headers[format].contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="survei_${survei.judul.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().replace(/[:]/g, '-').replace('T', '_').replace(/\..+/, '')}.${headers[format].fileExtension}"`
    );

    return res.send(exportResult);
  } catch (error) {
    return resFail(res, error.message, error.status);
  }
}
