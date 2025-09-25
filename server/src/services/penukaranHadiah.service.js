import db from '../models/index.js';
const { PenukaranHadiah, Umum, Pengguna, Hadiah, sequelize } = db;
import { parseQuery, metaQueryFormat } from '../utils/queryParser.js';
import { sendHadiahRedemptionEmail } from './email.service.js';

export const index = async (queryParams) => {
  const { where, order, pagination } = parseQuery(queryParams, {
    allowedFilters: ['id_umum']
  });

  const { count, rows } = await PenukaranHadiah.findAndCountAll({
    where: {
      ...where,
    },
    include: [
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

export const create = async (dataPenukaranHadiah) => {
  const transaction = await sequelize.transaction();

  try {
    const hadiah = await Hadiah.findByPk(dataPenukaranHadiah.id_hadiah, { transaction });
    if (!hadiah) throw { status: 404, message: 'Hadiah not found' };

    const stok_hadiah = parseInt(hadiah.stok);
    const total_poin = parseInt(hadiah.harga_poin);
    if (stok_hadiah <= 0) {
      throw { status: 400, message: 'Out of stock hadiah' };
    }

    const umum = await Umum.findByPk(dataPenukaranHadiah.id_umum, {
      transaction,
      include: [
        {
          model: Pengguna,
          attributes: ['id', 'email'],
        },
      ],
    });
    if (!umum) throw { status: 404, message: 'Umum not found' };

    const poin_pengguna = parseInt(umum.poin);
    if (poin_pengguna < total_poin) {
      throw { status: 400, message: 'Not enough poin' };
    }

    const keterangan = `Penukaran hadiah: ${hadiah.nama}`;
    const penukaranHadiah = await PenukaranHadiah.create(
      {
        id_umum: dataPenukaranHadiah.id_umum,
        total_poin: total_poin,
        keterangan,
      },
      { transaction }
    );

    await Promise.all([
      umum.decrement('poin', { by: total_poin, transaction }),
      hadiah.decrement('stok', { by: 1, transaction }),
    ]);

    await sendHadiahRedemptionEmail({
      email: umum.Pengguna.email,
      nama: umum.nama,
      namaHadiah: hadiah.nama,
      totalPoin: total_poin,
    });

    await transaction.commit();
    return PenukaranHadiah.findByPk(penukaranHadiah.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const show = async (penukaranHadiahId) => {
  const penukaranHadiah = await PenukaranHadiah.findByPk(penukaranHadiahId, {
    include: [
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
    ]
  });
  if (!penukaranHadiah) throw { status: 404, message: 'Penukaran hadiah not found' };
  return penukaranHadiah;
};

export const destroy = async (penukaranHadiahId) => {
  const transaction = await sequelize.transaction();

  try {
    const penukaranHadiah = await PenukaranHadiah.findByPk(penukaranHadiahId, { transaction });
    if (!penukaranHadiah) throw { status: 404, message: 'Penukaran hadiah not found' };

    await penukaranHadiah.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
