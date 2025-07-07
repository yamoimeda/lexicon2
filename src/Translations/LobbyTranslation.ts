import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    welcomeLobby: "Welcome to the Lobby",
    waitingForHost: "Waiting for the host to start the game...",
    playersJoined: "Players Joined",
    startGame: "Start Game",
  },
  es: {
    welcomeLobby: "Bienvenido al Lobby",
    waitingForHost: "Esperando que el anfitrión inicie el juego...",
    playersJoined: "Jugadores Unidos",
    startGame: "Iniciar Juego",
  }
};

export const useLobbyTranslations = computed(() => translations[lenguage.value] || translations.en);
