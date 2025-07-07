import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables'

const translations = {
  en: {
    loading: "Loading...",
    welcome: "Welcome, ",
    readyToDuel: "Ready to duel with words?",
    createRoomTitle: "Create a New Room",
    createRoomDescription: "Set up your own game and invite friends.",
    createRoomContent: "Customize rounds, categories, time limits, and more.",
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
    createRoomContent: "Personaliza rondas, categorías, límites de tiempo y más.",
    createRoomButton: "Crear Sala",
    joinRoomTitle: "Unirse a una Sala",
    joinRoomDescription: "Ingresa un ID de sala para unirte a un juego existente.",
    roomIdLabel: "ID de Sala",
    roomIdPlaceholder: "Ingresa el ID de la Sala",
    joinRoomButton: "Unirse a Sala",
  }
};

export const useTranslations = computed(() => translations[lenguage.value] || translations.en);

