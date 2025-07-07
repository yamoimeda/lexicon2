import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    title: "Create a New Room",
    description: "Set up your own game and invite friends.",
    content: "Customize rounds, categories, time limits, and more.",
    button: "Create Room",
  },
  es: {
    title: "Crear Nueva Sala",
    description: "Configura tu propio juego e invita amigos.",
    content: "Personaliza rondas, categorías, límites de tiempo y más.",
    button: "Crear Sala",
  }
};

export const useCreateRoomTranslations = computed(() => translations[lenguage.value] || translations.en);
