import * as xenditService from './xendit.service.js';
import * as konfigurasiService from './konfigurasiHarga.service.js';
import db from '../models/index.js';
const { PembayaranSurvei, Survei, PertanyaanSurvei, Pengguna, Umum, sequelize } = db;
import { parseQuery, metaQueryFormat } from '../utils/queryParser.js';
import { kalkulasiJumlahTagihanSurvei, kalkulasiHadiahPoinSurvei } from '../utils/surveiCalculations.js';
import { sendSurveyInvoiceEmail } from './email.service.js';

export const index = async (queryParams) => {
  const { where, order, pagination } = parseQuery(queryParams, {
    allowedFilters: ['id_umum', 'status']
  });

  const { count, rows } = await PembayaranSurvei.findAndCountAll({
    where: {
      ...where,
    },
    include: [
      {
				model: Survei,
				attributes: ['id', 'judul']
			},
      {
        model: Umum,
        attributes: ['id', 'nama'],
        include: [
          {
            model: Pengguna,
            attributes: ['id', 'email']
          }
        ]
      }
    ],
    order,
    ...pagination,
    distinct: true
  });

  return {
    data: rows,
    ...metaQueryFormat({ count }, pagination)
  };
};

export const create = async (surveiId, umumId) => {
  const transaction = await sequelize.transaction();

  try {
    const existingPembayaran = await PembayaranSurvei.findOne({
      where: {
        id_survei: surveiId,
        status: 'paid'
      }
    });
    if (existingPembayaran) throw { status: 400, message: 'This survei has already been paid' };

    const umum = await Umum.findByPk(umumId, {
      include: [{ model: Pengguna }]
    });
    const survei = await Survei.findByPk(surveiId, {
      include: [{ model: PertanyaanSurvei }]
    });
    if (!survei) throw { status: 404, message: 'Survei not found'};

    if (survei.status !== 'payment_pending') {
      throw { status: 400, message: 'Survei status must be "payment_pending"' };
    }

    const konfigurasi = await konfigurasiService.index();
    const jumlahPertanyaan = survei.PertanyaanSurveis?.length || 0;
    const jumlah_tagihan = kalkulasiJumlahTagihanSurvei(konfigurasi, survei, jumlahPertanyaan);

    const pembayaranSurvei = await PembayaranSurvei.create({
      id_survei: surveiId,
      id_umum: umum.id,
      jumlah_tagihan,
      metode_pembayaran: null,
      status: 'pending'
    }, { transaction });

    const { invoiceUrl } = await xenditService.createXenditInvoice({
      pembayaranSurveiId: pembayaranSurvei.id,
      jumlahTagihan: jumlah_tagihan,
      penggunaEmail: umum.Pengguna.email,
      judulSurvei: survei.judul
    });

    await pembayaranSurvei.update({
      invoice_url: invoiceUrl
    }, { transaction });

    await transaction.commit();
    return PembayaranSurvei.findByPk(pembayaranSurvei.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const webhook = async (headers, payload) => {
  const { 
    pembayaranSurveiId, 
    status, 
    paidAmount, 
    paymentMethod 
  } = xenditService.validateWebhook(headers, payload);
  const transaction = await sequelize.transaction();

  try {
    const pembayaranSurvei = await PembayaranSurvei.findByPk(pembayaranSurveiId, { transaction });
    if (!pembayaranSurvei) throw { status: 404, message: 'Pembayaran survei data not found' };

    const survei = await Survei.findByPk(pembayaranSurvei.id_survei, { transaction });
    if (!survei) throw { status: 404, message: 'Survei not found' };

    const umum = await Umum.findByPk(survei.id_umum, {
      transaction,
      include: [
        {
          model: Pengguna,
          attributes: ['id', 'email'],
        },
      ],
    });
    if (!umum) throw { status: 404, message: 'Umum not found' };

    const hadiahPoin = status === 'paid'
      ? kalkulasiHadiahPoinSurvei({
          paidAmount,
          jumlahResponden: survei.jumlah_responden
        })
      : null;

    await pembayaranSurvei.update({
      status,
      ...(status === 'paid' && { jumlah_dibayar: paidAmount }),
      ...(paymentMethod && { metode_pembayaran: paymentMethod })
    }, { transaction });

    if (status === 'paid') {
      await survei.update({
        status: 'published',
        hadiah_poin: hadiahPoin
      }, { transaction });
    }

    await transaction.commit();

    await sendSurveyInvoiceEmail({
      email: umum.Pengguna.email,
      namaSurvei: survei.judul,
      paidAmount,
      paymentMethod,
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const show = async (surveiId) => {
  const pembayaranSurvei = await PembayaranSurvei.findByPk(surveiId, {
    include: [
      {
				model: Survei,
				attributes: ['id', 'judul']
			},
      {
        model: Umum,
        attributes: ['id', 'nama'],
        include: [
          {
            model: Pengguna,
            attributes: ['id', 'email']
          }
        ]
      }
    ],
  });
  if (!pembayaranSurvei) throw { status: 404, message: 'Pembayaran survei not found' };
  return pembayaranSurvei;
};

export const destroy = async (pembayaranSurveiId) => {
  const transaction = await sequelize.transaction();

  try {
    const pembayaranSurvei = await PembayaranSurvei.findByPk(pembayaranSurveiId, { transaction });
    if (!pembayaranSurvei) throw { status: 404, message: 'Pembayaran survei not found' };

    await pembayaranSurvei.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
