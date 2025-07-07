import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    currentPlayer: "Current Player",
    actionRequired: "Action Required",
    waitingForTurn: "Waiting for your turn...",
    gameInProgress: "Game in Progress",
    round: "Round",
    rounds: "rounds"
  },
  es: {
    currentPlayer: "Jugador Actual",
    actionRequired: "Acción Requerida",
    waitingForTurn: "Esperando tu turno...",
    gameInProgress: "Juego en Progreso",
    round: "Ronda",
    rounds: "rondas"
  }
};

export const usePlayingTranslations = computed(() => translations[lenguage.value] || translations.en);
