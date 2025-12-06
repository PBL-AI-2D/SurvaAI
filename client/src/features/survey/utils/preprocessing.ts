import { ResponSurvei } from '@/features/survey-response-result/types/types';

/**
 * Preprocessing utility untuk data survey responses
 */

export interface PreprocessedResponse {
  id: string;
  is_completed: boolean;
  has_text: boolean;
  has_likert: boolean;
  has_categorical: boolean;
  text_length: number;
  likert_count: number;
  categorical_count: number;
  created_at: string;
}

/**
 * Preprocess survey responses untuk analisis
 */
export function preprocessResponses(responses: ResponSurvei[]): PreprocessedResponse[] {
  return responses.map((response) => {
    const textResponses: string[] = [];
    const likertResponses: Record<string, number> = {};
    const categoricalResponses: Record<string, any> = {};

    // Extract responses berdasarkan tipe pertanyaan
    if (response.Survei?.PertanyaanSurveis) {
      response.Survei.PertanyaanSurveis.forEach((question) => {
        const answer = response.respon[question.id];
        
        if (question.tipe_pertanyaan === "essay" && answer) {
          const textAnswer = Array.isArray(answer) ? answer.join(" ") : String(answer);
          if (textAnswer.trim()) {
            textResponses.push(textAnswer);
          }
        } else if (question.tipe_pertanyaan === "scale" && answer) {
          const scaleValue = Array.isArray(answer) ? parseFloat(answer[0]) : parseFloat(String(answer));
          if (!isNaN(scaleValue)) {
            likertResponses[question.teks_pertanyaan] = scaleValue;
          }
        } else if (
          ["radio", "checkbox", "dropdown"].includes(question.tipe_pertanyaan) &&
          answer
        ) {
          categoricalResponses[question.teks_pertanyaan] = answer;
        }
      });
    }

    const combinedText = textResponses.join(" ");

    return {
      id: response.id,
      is_completed: response.is_completed,
      has_text: combinedText.trim().length > 0,
      has_likert: Object.keys(likertResponses).length > 0,
      has_categorical: Object.keys(categoricalResponses).length > 0,
      text_length: combinedText.length,
      likert_count: Object.keys(likertResponses).length,
      categorical_count: Object.keys(categoricalResponses).length,
      created_at: response.created_at,
    };
  });
}

/**
 * Hitung statistik dasar dari preprocessed responses
 */
export interface ResponseStatistics {
  total: number;
  completed: number;
  incomplete: number;
  with_text: number;
  with_likert: number;
  with_categorical: number;
  completion_rate: number;
  average_text_length: number;
  average_likert_count: number;
  average_categorical_count: number;
}

export function calculateResponseStatistics(
  preprocessed: PreprocessedResponse[]
): ResponseStatistics {
  const total = preprocessed.length;
  const completed = preprocessed.filter((r) => r.is_completed).length;
  const incomplete = total - completed;
  const with_text = preprocessed.filter((r) => r.has_text).length;
  const with_likert = preprocessed.filter((r) => r.has_likert).length;
  const with_categorical = preprocessed.filter((r) => r.has_categorical).length;

  const completedResponses = preprocessed.filter((r) => r.is_completed);
  const totalTextLength = completedResponses.reduce((sum, r) => sum + r.text_length, 0);
  const totalLikertCount = completedResponses.reduce((sum, r) => sum + r.likert_count, 0);
  const totalCategoricalCount = completedResponses.reduce((sum, r) => sum + r.categorical_count, 0);

  return {
    total,
    completed,
    incomplete,
    with_text,
    with_likert,
    with_categorical,
    completion_rate: total > 0 ? (completed / total) * 100 : 0,
    average_text_length: completed > 0 ? totalTextLength / completed : 0,
    average_likert_count: completed > 0 ? totalLikertCount / completed : 0,
    average_categorical_count: completed > 0 ? totalCategoricalCount / completed : 0,
  };
}

/**
 * Filter responses yang valid untuk analisis
 */
export function filterValidResponses(responses: ResponSurvei[]): ResponSurvei[] {
  return responses.filter((response) => {
    // Hanya ambil yang completed
    if (!response.is_completed) {
      return false;
    }

    // Pastikan ada minimal satu jawaban
    const hasAnswer = response.respon && Object.keys(response.respon).length > 0;
    if (!hasAnswer) {
      return false;
    }

    // Pastikan ada data pertanyaan untuk analisis yang akurat
    // Jika tidak ada PertanyaanSurveis, kita tidak bisa membedakan tipe pertanyaan
    if (!response.Survei?.PertanyaanSurveis || response.Survei.PertanyaanSurveis.length === 0) {
      // Log warning tapi tetap return true jika ada jawaban
      // Karena mungkin masih bisa diproses dengan fallback
      console.warn(`Response ${response.id} tidak memiliki PertanyaanSurveis, akan menggunakan fallback`);
      return true; // Tetap valid jika ada jawaban, meskipun tidak ada pertanyaan
    }

    return true;
  });
}

