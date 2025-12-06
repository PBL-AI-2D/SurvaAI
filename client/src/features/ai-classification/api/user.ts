import { pythonApi } from "@/lib/api";
import { AIClassificationResponse } from "../types/types";
import { ResponSurvei } from "@/features/survey-response-result/types/types";

export const aiClassificationService = {
  classifySurvey: async (
    surveyId: string,
    responses: ResponSurvei[]
  ): Promise<AIClassificationResponse> => {
    // Transform survey responses to format expected by Python service
    const formattedResponses = responses
      .filter((response) => response.is_completed)
      .map((response) => {
        // Extract text responses (essay questions)
        const textResponses: string[] = [];
        const likertResponses: Record<string, number> = {};
        const categoricalResponses: Record<string, any> = {};

        if (response.Survei?.PertanyaanSurveis && response.Survei.PertanyaanSurveis.length > 0) {
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
                // Use question text as key for better readability
                likertResponses[question.teks_pertanyaan] = scaleValue;
              }
            } else if (
              ["radio", "checkbox", "dropdown"].includes(question.tipe_pertanyaan) &&
              answer
            ) {
              const catAnswer = Array.isArray(answer) ? answer : [answer];
              categoricalResponses[question.teks_pertanyaan] = catAnswer;
            }
          });
        } else {
          // Fallback: jika tidak ada PertanyaanSurveis, coba proses langsung dari respon
          // Asumsi: semua jawaban text adalah essay, semua numeric adalah scale
          if (response.respon) {
            Object.entries(response.respon).forEach(([key, value]) => {
              if (value) {
                const stringValue = Array.isArray(value) ? value.join(" ") : String(value);
                const numericValue = parseFloat(stringValue);
                
                if (!isNaN(numericValue) && isFinite(numericValue)) {
                  // Anggap sebagai scale/likert
                  likertResponses[`question_${key}`] = numericValue;
                } else if (stringValue.trim().length > 0) {
                  // Anggap sebagai text/essay
                  textResponses.push(stringValue.trim());
                }
              }
            });
          }
        }

        // Combine all text responses
        const combinedText = textResponses.join(" ");

        // Ensure likert is not empty (required by Python service)
        // If no likert responses, use a default value
        if (Object.keys(likertResponses).length === 0) {
          likertResponses["overall_satisfaction"] = 3.0; // Default neutral
        }

        return {
          text: combinedText || null,
          likert: likertResponses,
          categorical: Object.keys(categoricalResponses).length > 0 ? categoricalResponses : null,
        };
      });

    if (formattedResponses.length === 0) {
      throw new Error("No completed responses found for this survey");
    }

    // Call Python service dashboard endpoint
    const response = await pythonApi.post("/api/dashboard/overview", {
      responses: formattedResponses,
      likert_min: 1.0,
      likert_max: 5.0,
      k: null, // Auto-determine optimal clusters
      k_min: 2,
      k_max: 10,
    });

    return response.data;
  },
};

