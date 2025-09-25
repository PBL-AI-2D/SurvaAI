export type JawabanSurvei = string | string[];

export type ResponSurveiPayload = Record<string, JawabanSurvei>;

export interface ResponSurveiDraft {
  status: string;
  message: string;
  data: {
    draft: ResponSurveiPayload;
    is_completed: boolean;
  };
}
