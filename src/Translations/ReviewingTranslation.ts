import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    reviewResults: "Review Results",
    playerScores: "Player Scores",
    gameSummary: "Game Summary",
    feedback: "Provide Feedback",
  },
  es: {
    reviewResults: "Revisar Resultados",
    playerScores: "Puntuaciones de los Jugadores",
    gameSummary: "Resumen del Juego",
    feedback: "Proporcionar Comentarios",
  }
};

export const useReviewingTranslations = computed(() => translations[lenguage.value] || translations.en);
