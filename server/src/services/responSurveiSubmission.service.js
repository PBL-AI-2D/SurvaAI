import db from '../models/index.js';
const { ResponSurvei, Umum, sequelize, Survei, PertanyaanSurvei } = db;

const loadPertanyaan = async (surveiId) => {
  return await PertanyaanSurvei.findAll({
    where: { id_survei: surveiId },
    attributes: ['id', 'is_required']
  });
};

const validateResponSurvei = async (survei) => {
  if (survei.status !== 'published') {
    throw { status: 400, message: 'Survei is not published' };
  }

  const today = new Date().toISOString().split('T')[0];
  if (today < survei.tanggal_mulai || today > survei.tanggal_berakhir) {
    throw { status: 400, message: 'This survei is not currently active' };
  }

  const count = await ResponSurvei.count({
    where: { id_survei: survei.id, is_completed: true }
  });
  if (count >= survei.jumlah_responden) {
    throw { status: 400, message: 'This survei has reached the maximum number of respondents' };
  }
};

const validateKriteria = (kriteria, profilResponden) => {
  if (!kriteria || Object.keys(kriteria).length === 0) return;

  const unmetCriteria = Object.entries(kriteria).reduce((acc, [key, expected]) => {
    if (
      expected == null || 
      (Array.isArray(expected) && expected.length === 0)
    ) {
      return acc;
    }

    const actual = profilResponden?.[key];
    const isValid = Array.isArray(expected)
      ? expected.includes(actual)
      : actual === expected;
    if (!isValid) {
      const expectedStr = Array.isArray(expected) ? expected.join('/') : expected;
      acc.push(`${key}: ${expectedStr}`);
    }

    return acc;
  }, []);

  if (unmetCriteria.length > 0) {
    const message = `Profil responden does not meet the criteria; ${unmetCriteria.join('; ')}`;
    throw { status: 400, message };
  }
};

export const getOrCreateDraft = async (surveiId, umumId) => {
  const survei = await Survei.findByPk(surveiId);
  if (!survei) throw { status: 404, message: 'Survei not found' };

  const umum = await Umum.findByPk(umumId);
  validateKriteria(survei.kriteria, {
    ...umum.profil_responden,
    usia: umum.usia
  });

  if (survei.id_umum === umumId) {
    throw { status: 400, message: 'You cannot fill your own survei' };
  }

  await validateResponSurvei(survei); 

  const existingCompleted = await ResponSurvei.findOne({
    where: {
      id_survei: surveiId,
      id_umum: umumId,
      is_completed: true
    }
  });

  if (existingCompleted) {
    throw { status: 400, message: 'You have submitted respon survei, cannot send more in this survei' };
  }
  const { tanggal_lahir, ...filteredProfil } = umum.profil_responden || {};
  return await ResponSurvei.findOrCreate({
    where: {
      id_survei: surveiId,
      id_umum: umumId,
      is_completed: false
    },
    defaults: {
      profil_metadata: {
        ...filteredProfil,
        usia: umum.usia,
      }
    }
  });
};

const validateResponKeys = async (pertanyaanSurveiList, respon) => {
  const validIds = pertanyaanSurveiList.map(p => p.id.toString());
  const responKeys = Object.keys(respon);
  const invalidKeys = responKeys.filter(key => !validIds.includes(key));
  if (invalidKeys.length > 0) {
    throw { status: 400, message: `Invalid pertanyaan ID(s) in response: ${invalidKeys.join(', ')}`};
  }
};

export const saveDraftResponse = async (surveiId, umumId, respons) => {
  const transaction = await sequelize.transaction();
  
  try {
    const [responSurvei] = await getOrCreateDraft(surveiId, umumId);
    const pertanyaanList = await loadPertanyaan(surveiId);
    await validateResponKeys(pertanyaanList, respons);

    await responSurvei.update({
      respon: {
        ...responSurvei.respon,
        ...respons
      }
    }, { transaction });

    await transaction.commit();
    return await ResponSurvei.findByPk(responSurvei.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const validateRequiredPertanyaan = async (pertanyaanSurveiList, respon) => {
  const requiredIds = pertanyaanSurveiList
    .filter(p => p.is_required)
    .map(p => p.id.toString());

  const unanswered = requiredIds.filter(id => {
    const jawaban = respon[id];
    return jawaban === undefined || jawaban === null;
  });

  if (unanswered.length > 0) {
    throw { status: 400, message: `Required pertanyaan not answered: ${unanswered.join(', ')}`};
  }
};

export const submitFinalResponse = async (surveiId, umumId) => {
  const transaction = await sequelize.transaction();

  try {
    const draft = await ResponSurvei.findOne({
      where: {
        id_survei: surveiId,
        id_umum: umumId,
        is_completed: false
      },
      include: [{
        model: Survei
      }],
      transaction
    });

    if (!draft) throw { status: 404, message: 'No draft found' };

    const survei = draft.Survei;
    await validateResponSurvei(survei); 

    const respon = draft.respon || {};
    if (Object.keys(respon).length === 0) {
      throw { status: 400, message: 'Respon survei cannot be empty' };
    }

    const pertanyaanList = await loadPertanyaan(surveiId);
    await validateRequiredPertanyaan(pertanyaanList, respon);

    await draft.update({ 
      is_completed: true 
    }, { transaction });

    await Umum.increment('poin', {
      by: draft.Survei.hadiah_poin,
      where: { id: umumId },
      transaction
    });

    const currentCompleted = await ResponSurvei.count({
      where: { id_survei: surveiId, is_completed: true },
      transaction
    });
    if (currentCompleted >= survei.jumlah_responden) {
      await survei.update({ status: 'closed' }, { transaction });
    }

    await transaction.commit();
    return draft;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
