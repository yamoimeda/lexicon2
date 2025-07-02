import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables'

export const translations = {
  en: {
    title: "Lexicon",
    logout: "Logout",
    login: "Login",
    language: "Language",
    english: "English",
    spanish: "Español",
  },
  es: {
    title: "Lexicon",
    logout: "Salir",
    login: "Ingresar",
    language: "Idioma",
    english: "English",
    spanish: "Español",
  }
};

export const useTranslations = computed(() => translations[lenguage.value] || translations.en);


