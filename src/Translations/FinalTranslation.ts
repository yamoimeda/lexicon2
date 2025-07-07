import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    congratulations: "Congratulations!",
    finalScore: "Final Score",
    playAgain: "Play Again",
    exitGame: "Exit Game",
  },
  es: {
    congratulations: "¡Felicidades!",
    finalScore: "Puntuación Final",
    playAgain: "Jugar de Nuevo",
    exitGame: "Salir del Juego",
  }
};

export const useFinalTranslations = computed(() => translations[lenguage.value] || translations.en);
