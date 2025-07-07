import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    title: "Room Not Found",
    description: "The room ID you entered does not exist.",
    button: "Go Back",
  },
  es: {
    title: "Sala No Encontrada",
    description: "El ID de sala que ingresaste no existe.",
    button: "Regresar",
  }
};

export const useRoomNotFoundTranslations = computed(() => translations[lenguage.value] || translations.en);
