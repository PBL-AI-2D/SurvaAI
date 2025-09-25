import db from "../models/index.js";
const { PertanyaanSurvei, ResponSurvei, Survei, Umum, Pengguna } = db;
import { mapResponSurveiToRows } from '../utils/exportResponMapper.js';
import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify/sync';

export const showSummary = async (surveiId) => {
  const pertanyaanList = await PertanyaanSurvei.findAll({
    where: { id_survei: surveiId },
    attributes: ['id', 'teks_pertanyaan', 'tipe_pertanyaan', 'tipe_visualisasi', 'index'],
    order: [['index', 'ASC']],
    raw: true
  });

  if (!pertanyaanList.length) {
    throw new Error('Survei tidak ditemukan atau belum memiliki pertanyaan');
  }

  const responList = await ResponSurvei.findAll({
    where: { id_survei: surveiId, is_completed: true },
    attributes: ['respon'],
    raw: true
  });

  const totalResponden = responList.length;

  return pertanyaanList.map(pertanyaan => {
    const responses = responList
      .map(r => r.respon[pertanyaan.id])
      .filter(answer => answer !== undefined && answer !== null && answer !== '')

    const summary = pertanyaan.tipe_pertanyaan === 'essay'
      ? responses
      : responses.flat().reduce((acc, answer) => {
          acc[answer] = (acc[answer] || 0) + 1;
          return acc;
        }, {});

		return {
			id_pertanyaan: pertanyaan.id,
			index: pertanyaan.index,
			teks_pertanyaan: pertanyaan.teks_pertanyaan,
			tipe_pertanyaan: pertanyaan.tipe_pertanyaan,
			tipe_visualisasi: pertanyaan.tipe_visualisasi,
			summary,
			total_responden: totalResponden,
			total_respon: responses.length
		};
  });
};

export async function exportSurveyResponses({ surveiId, format = 'csv' }) {
  const survei = await Survei.findOne({
    where: { id: surveiId },
    include: [
      {
        model: ResponSurvei,
        where: { is_completed: true },
        include: {
          model: Umum,
          include: { model: Pengguna, attributes: ['email'] }
        }
      },
      { 
        model: PertanyaanSurvei,
        separate: true,
        order: [['index', 'ASC']],
      }
    ]
  });

  const rows = mapResponSurveiToRows(survei?.ResponSurveis || [], survei?.PertanyaanSurveis || []);
  rows.sort((a, b) => new Date(a['Timestamps (UTC)']) - new Date(b['Timestamps (UTC)']));

  switch (format) {
    case 'csv':
      return stringify(rows, { header: true });
    case 'xlsx':
      return generateExcelBuffer(rows);
    default:
      throw { status: 400, message: 'Unsupported export format' };
  }
}

function generateExcelBuffer(rows) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Survey Results');

  if (rows.length > 0) {
    worksheet.columns = Object.keys(rows[0]).map(key => ({
      header: key,
      key,
      width: Math.max(20, key.length + 5),
      style: key === 'Timestamps (UTC)' ? { numFmt: 'yyyy-mm-dd hh:mm:ss' } : undefined
    }));

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    rows.forEach(row => worksheet.addRow(row));
  }

  return workbook.xlsx.writeBuffer();
}
