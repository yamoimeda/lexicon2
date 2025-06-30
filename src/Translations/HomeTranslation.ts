import { computed } from 'vue';

const translations = {
  en: {
    loading: "Loading...",
    welcome: "Welcome, ",
    readyToDuel: "Ready to duel with words?",
    createRoomTitle: "Create a New Room",
    createRoomDescription: "Set up your own game and invite friends.",
    createRoomContent: "Customize rounds, categories, time limits, and more. Be the master of your WordDuel arena!",
    createRoomButton: "Create Room",
    joinRoomTitle: "Join a Room",
    joinRoomDescription: "Enter a Room ID to join an existing game.",
    roomIdLabel: "Room ID",
    roomIdPlaceholder: "Enter Room ID",
    joinRoomButton: "Join Room",
  },
  es: {
    loading: "Cargando...",
    welcome: "¡Bienvenido, ",
    readyToDuel: "¿Listo para un duelo de palabras?",
    createRoomTitle: "Crear Nueva Sala",
    createRoomDescription: "Configura tu propio juego e invita amigos.",
    createRoomContent: "Personaliza rondas, categorías, límites de tiempo y más. ¡Sé el maestro de tu arena WordDuel!",
    createRoomButton: "Crear Sala",
    joinRoomTitle: "Unirse a una Sala",
    joinRoomDescription: "Ingresa un ID de sala para unirte a un juego existente.",
    roomIdLabel: "ID de Sala",
    roomIdPlaceholder: "Ingresa el ID de la Sala",
    joinRoomButton: "Unirse a Sala",
  }
};

export function useTranslations(language: keyof typeof translations = 'en') {
  return computed(() => translations[language] || translations.en);
}
