import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    title: "Log In",
    username: "Username",
    password: "Password",
    button: "Log In",
    error: "Invalid credentials. Please try again.",
  },
  es: {
    title: "Iniciar Sesión",
    username: "Nombre de Usuario",
    password: "Contraseña",
    button: "Iniciar Sesión",
    error: "Credenciales inválidas. Por favor, inténtelo de nuevo.",
  }
};

export const useLogInTranslations = computed(() => translations[lenguage.value] || translations.en);
