import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    waitingForPlayers: "Waiting for players to join...",
    roomReady: "Room is ready",
    startSoon: "Game will start soon",
  },
  es: {
    waitingForPlayers: "Esperando a que los jugadores se unan...",
    roomReady: "La sala está lista",
    startSoon: "El juego comenzará pronto",
  }
};

export const useWaitingTranslations = computed(() => translations[lenguage.value] || translations.en);
