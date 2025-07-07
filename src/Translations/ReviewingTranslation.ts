import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    reviewingAnswers: "Reviewing Answers",
    round: "Round",
    of: "of",
    adminReviewingInstructions: "Review and validate all players' answers",
    playerReviewingInstructions: "Your answers for this round",
    unknownPlayer: "Unknown Player",
    gameFinishedLog: "Game finished",
    startingNextRoundLog: "Starting next round {round}",
    errorContinuingGameLog: "Error while continuing the game",
    noAnswersForCategory: "No answers for this category",
    valid: "Valid",
    invalid: "Invalid",
    points: "points",
    currentPoints: "Current Points",
    pointsThisRound: "Points this round",
    waitingForAdmin: "Waiting for the administrator",
    processing: "Processing...",
    finalizeGame: "Finalize Game",
    startNextRound: "Start Next Round",
  },
  es: {
    reviewingAnswers: "Revisión de Respuestas",
    round: "Ronda",
    of: "de",
    adminReviewingInstructions: "Revisa y valida las respuestas de todos los jugadores",
    playerReviewingInstructions: "Tus respuestas de esta ronda",
    unknownPlayer: "Jugador desconocido",
    gameFinishedLog: "Juego finalizado",
    startingNextRoundLog: "Iniciando siguiente ronda {round}",
    errorContinuingGameLog: "Error al continuar el juego",
    noAnswersForCategory: "No hay respuestas para esta categoría",
    valid: "Válida",
    invalid: "Inválida",
    points: "puntos",
    currentPoints: "Puntos actuales",
    pointsThisRound: "Puntos esta ronda",
    waitingForAdmin: "Esperando al administrador",
    processing: "Procesando...",
    finalizeGame: "Finalizar Juego",
    startNextRound: "Iniciar Siguiente Ronda",
  }
};

export const useReviewingTranslations = computed(() => translations[lenguage.value] || translations.en);
