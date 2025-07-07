import { computed } from 'vue';
import { lenguage } from '../composables/GlobalVariables';

const translations = {
  en: {
    congratulations: "Congratulations!",
    finalScore: "Final Score",
    playAgain: "Play Again",
    exitGame: "Exit Game",
    gameFinished: "¡Game Finished!",
    finalResults: "Final Results after",
    rounds: "rounds",
    seconds: "seconds",
    points: "points",
    finalRanking: "Final Ranking",
    backToHome: "Back to Home",
    winner: "Winner",
    score: "Score",
    secondPlace: "Second Place",
    thirdPlace: "Third Place",
    place: "Place",
    players: "Players",
    startNewGame: "Start New Game",
    maxScore: "Max Score",
    minScore: "Min Score",
    averageScore: "Average Score",
    goHomeButton : "Go Home",
  },
  es: {
    congratulations: "¡Felicidades!",
    finalScore: "Puntuación Final",
    playAgain: "Jugar de Nuevo",
    exitGame: "Salir del Juego",
    gameFinished: "¡Juego Terminado!",
    finalResults: "Resultados Finales después de",
    rounds: "rondas",
    seconds: "segundos",
    points: "puntos",
    finalRanking: "Clasificación Final",
    backToHome: "Volver al Inicio",
    winner: "Ganador",
    score: "Puntuación",
    secondPlace: "Segundo Lugar",
    thirdPlace: "Tercer Lugar",
    place: "Lugar",
    players: "Jugadores",
    startNewGame: "Iniciar Nuevo Juego",
    maxScore: "Puntuación Máxima",
    minScore: "Puntuación Mínima",
    averageScore: "Puntuación Promedio",
    goHomeButton: "Ir al Inicio"
  }
  
};

export const useFinalTranslations = computed(() => translations[lenguage.value] || translations.en);
