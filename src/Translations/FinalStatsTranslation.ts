import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    title: "Final Stats",
    score: "Your Score",
    time: "Time Taken",
    accuracy: "Accuracy",
    button: "Play Again",
  },
  es: {
    title: "Estadísticas Finales",
    score: "Tu Puntuación",
    time: "Tiempo Tomado",
    accuracy: "Precisión",
    button: "Jugar de Nuevo",
  }
};

export const useFinalStatsTranslations = computed(() => translations[lenguage.value] || translations.en);
