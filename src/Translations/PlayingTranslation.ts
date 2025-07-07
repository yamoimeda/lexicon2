import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    currentPlayer: "Current Player",
    actionRequired: "Action Required",
    waitingForTurn: "Waiting for your turn...",
    gameInProgress: "Game in Progress",
    round: "Round",
    rounds: "rounds",
    loadingRoomConfig: "Loading room configuration...",
    preparingRound: "Preparing round...",
    roundStartingSoon: "Round starting soon...",
    playersOnline: "Players Online",
    points: "Points",
    gameProgress: "Game Progress",
    currentRound: "Current Round",
    unknownState: "Unknown State",
    couldNotDetermineState: "Could not determine the current state.",
    advanceToNextRound: "Advance to Next Round",
    waitingForGameStart: "Waiting for the game to start..."
  },
  es: {
    currentPlayer: "Jugador Actual",
    actionRequired: "Acción Requerida",
    waitingForTurn: "Esperando tu turno...",
    gameInProgress: "Juego en Progreso",
    round: "Ronda",
    rounds: "rondas",
    loadingRoomConfig: "Cargando configuración de la sala...",
    preparingRound: "Preparando ronda...",
    roundStartingSoon: "La ronda comenzará pronto...",
    playersOnline: "Jugadores en línea",
    points: "Puntos",
    gameProgress: "Progreso del juego",
    currentRound: "Ronda Actual",
    unknownState: "Estado Desconocido",
    couldNotDetermineState: "No se pudo determinar el estado actual.",
    advanceToNextRound: "Avanzar a la siguiente ronda",
    waitingForGameStart: "Esperando que comience el juego..."
  }
};

export const usePlayingTranslations = computed(() => translations[lenguage.value] || translations.en);
