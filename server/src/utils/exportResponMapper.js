export const mapResponSurveiToRows = (responSurveis, pertanyaanSurveis) => {
  if (!responSurveis?.length) return [];

  const questionMap = pertanyaanSurveis.reduce((acc, q) => {
    acc[q.id] = q.teks_pertanyaan;
    return acc;
  }, {});

  const allProfileKeys = new Set();
  responSurveis.forEach(response => {
    const meta = response.profil_metadata || {};
    Object.keys(meta).forEach(key => allProfileKeys.add(key));
  });

  const profileKeyMap = Array.from(allProfileKeys).reduce((acc, key) => {
    acc[key] = toTitleCase(key);
    return acc;
  }, {});

  return responSurveis.map(response => {
    const answers = processSurveyAnswers(response.respon, questionMap);
    const profileMeta = processProfileMetadata(response.profil_metadata, profileKeyMap);

    return {
      'Timestamps (UTC)': response.updated_at,
      'Email': response.Umum?.Pengguna?.email || '-',
      ...profileMeta,
      ...answers
    };
  });
};

const processProfileMetadata = (metadata, keyMap = {}) => {
  const safeMetadata = (typeof metadata === 'object' && metadata !== null) ? metadata : {};
  return Object.entries(keyMap).reduce((acc, [rawKey, titleKey]) => {
    acc[titleKey] = formatAnswerValue(safeMetadata[rawKey]);
    return acc;
  }, {});
};

const processSurveyAnswers = (answers = {}, questionMap) => {
  return Object.entries(questionMap).reduce((result, [id, question]) => {
    const answer = answers[id];
    result[question] = formatAnswerValue(answer);
    return result;
  }, {});
};

const formatAnswerValue = (answer) => {
  if (answer === undefined || answer === null) return '-';
  if (Array.isArray(answer)) return `[${answer.map(v => `"${v}"`).join(', ')}]`;
  return answer;
};

const toTitleCase = (str) => {
  return str
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
};
