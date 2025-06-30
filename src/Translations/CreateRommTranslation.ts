import { computed } from 'vue';

const defaultCategories = {
  en: ['Name', 'Surname', 'Fruit', 'Color', 'Thing'],
  es: ['Nombre', 'Apellido', 'Fruta', 'Color', 'Cosa']
}

const translations = {
    en: {
        pageTitle: "Create New Game Room",
        backToHome: "Back to Home",
        customizeTitle: 'Customize Your Game',
    customizeDescription: 'Set the rules for your WordDuel!',
    roomNameLabel: 'Room Name',
    roundsLabel: 'Number of Rounds',
    timePerRoundLabel: 'Time Per Round (seconds)',
    categoriesLabel: 'Categories (comma-separated)',
    categoriesDescription: 'Enter a list of categories for players to find words for.',
    languageLabel: 'Language (Game Content)',
    english: 'English',
    spanish: 'Español (Spanish)',
    french: 'Français (French)',
    german: 'Deutsch (German)',
    endRoundOnFirstSubmitLabel: 'Quick Finish',
    endRoundOnFirstSubmitDescription:
      'If active, round ends for all when one player submits. If inactive, round ends on timer.',
    createRoomButton: 'Create Room',
    creatingRoomButton: 'Creating Room...',
    defaultCategoriesPlaceholder:  defaultCategories.en.join(', ')
 
      },
      es: {
        pageTitle: "Crear Nueva Sala de Juego",
        backToHome: "Volver al Inicio",
          customizeTitle: "Personaliza Tu Juego",
          customizeDescription: "¡Establece las reglas para tu WordDuel!",
          roomNameLabel: "Nombre de la Sala",
          roundsLabel: "Número de Rondas",
          timePerRoundLabel: "Tiempo por Ronda (segundos)",
          categoriesLabel: "Categorías (separadas por coma)",
          categoriesDescription: "Ingresa una lista de categorías para que los jugadores encuentren palabras.",
          languageLabel: "Idioma (Contenido del Juego)",
          selectLanguagePlaceholder: "Seleccionar idioma",
          english: "Inglés (English)",
          spanish: "Español",
          french: "Francés (French)",
          german: "Alemán (German)",
          endRoundOnFirstSubmitLabel: "Final Rápido",
          endRoundOnFirstSubmitDescription: "Si está activo, la ronda termina para todos cuando un jugador envía. Si está inactivo, la ronda termina con el temporizador.",
          createRoomButton: "Crear Sala",
          creatingRoomButton: "Creando Sala...",
          toastRoomCreatedTitle: "¡Sala Creada!",
          //toastRoomCreatedDescription: (roomName: string, roomId: string) => `La sala ${roomName} (ID: ${roomId}) está lista.`,
          toastCreationFailedTitle: "Error al crear la sala",
          toastCreationFailedDescription: "No se pudieron guardar los ajustes de la sala localmente. Por favor, inténtalo de nuevo.",
          defaultCategoriesPlaceholder:  defaultCategories.es.join(', '),
          usernameNotAvailableError: "Nombre de usuario no disponible. No se puede crear la sala.",
        
      }
};

export function useTranslations(language: keyof typeof translations = 'en') {
  return computed(() => translations[language] || translations.en);
}
