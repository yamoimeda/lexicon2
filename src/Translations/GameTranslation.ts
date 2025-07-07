import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    start: "Start Game",
    pause: "Pause Game",
    resume: "Resume Game",
    end: "End Game",
    score: "Score",
    timer: "Timer",
    playerTurn: "Player's Turn",
    waitingForPlayers: "Waiting for players...",
    round: "Round",
    category: "Category",
    timeLeft: "Time Left",
  },
  es: {
    start: "Iniciar Juego",
    pause: "Pausar Juego",
    resume: "Reanudar Juego",
    end: "Finalizar Juego",
    score: "Puntuación",
    timer: "Temporizador",
    playerTurn: "Turno del Jugador",
    waitingForPlayers: "Esperando a los jugadores...",
    round: "Ronda",
    category: "Categoría",
    timeLeft: "Tiempo Restante",
  }
};

export const useGameTranslations = computed(() => translations[lenguage.value] || translations.en);
