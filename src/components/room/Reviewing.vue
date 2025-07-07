<script setup>
import { ref, computed } from 'vue';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../composables/useAuth.js';
import { useReviewingTranslations } from '../../Translations/ReviewingTranslation';

// Props
const props = defineProps({
  roomData: { type: Object, required: true },
  roomId: { type: String, required: true }
});

const db = getFirestore();
const isStartingNextRound = ref(false);
const categoryValidations = ref({});
const { userId: currentUserId } = useAuth();
const T = useReviewingTranslations;

// Computed properties
const settings = computed(() => props.roomData.settings || {});
const players = computed(() => props.roomData.players || []);
const submissions = computed(() => props.roomData.submissions || {});
const categories = computed(() => settings.value.categories || []);
const currentRound = computed(() => settings.value.currentRound || 1);
const numberOfRounds = computed(() => settings.value.numberOfRounds || 3);
const isLastRound = computed(() => currentRound.value >= numberOfRounds.value);

const isAdmin = computed(() => {
  const currentPlayer = players.value.find(player => player.id === currentUserId.value);
  return currentPlayer ? currentPlayer.isAdmin : false;
});

// Obtener respuestas del usuario actual (para no-admin)
const currentUserSubmissions = computed(() => {
  return submissions.value[currentUserId.value] || {};
});

// Agrupar respuestas por categoría (para admin)
const groupedAnswers = computed(() => {
  const grouped = {};
  
  categories.value.forEach(category => {
    grouped[category] = {};
    
    // Obtener todas las respuestas para esta categoría
    Object.entries(submissions.value).forEach(([playerId, playerSubmissions]) => {
      const answer = playerSubmissions[category]?.toLowerCase().trim() || '';
      const playerName = players.value.find(p => p.id === playerId)?.name || 'Jugador desconocido';
      
      if (answer) {
        if (!grouped[category][answer]) {
          grouped[category][answer] = [];
        }
        grouped[category][answer].push({ id: playerId, name: playerName });
      } else {
        // Respuesta vacía
        if (!grouped[category]['']) {
          grouped[category][''] = [];
        }
        grouped[category][''].push({ id: playerId, name: playerName });
      }
    });
  });
  
  return grouped;
});

// Calcular puntos basados en repeticiones
const calculatePoints = (playersWithSameAnswer) => {
  const count = playersWithSameAnswer.length;
  if (count === 1) return 150;
  if (count === 2) return 75;
  if (count === 3) return 50;
  return 25; // 4 o más
};

// Obtener puntos para una respuesta específica
const getPointsForAnswer = (category, answer) => {
  const playersWithAnswer = groupedAnswers.value[category]?.[answer] || [];
  if (answer === '') return 0; // Sin respuesta = 0 puntos
  return calculatePoints(playersWithAnswer);
};

// Validar/invalidar respuesta
const toggleAnswerValidation = (category, answer) => {
  const key = `${category}_${answer}`;
  categoryValidations.value[key] = !categoryValidations.value[key];
};

// Verificar si una respuesta está validada
const isAnswerValid = (category, answer) => {
  const key = `${category}_${answer}`;
  return categoryValidations.value[key] ?? true; // Por defecto válida
};

// Calcular puntos finales considerando validaciones
const getFinalPoints = (category, answer) => {
  if (!isAnswerValid(category, answer) || answer === '') return 0;
  return getPointsForAnswer(category, answer);
};

// Función para continuar a la siguiente ronda o finalizar el juego
const continueGame = async () => {
  if (isStartingNextRound.value) return;

  try {
    isStartingNextRound.value = true;
    const roomRef = doc(db, 'rooms', props.roomId);

    // Calcular y asignar puntos si es admin
    if (isAdmin.value) {
      const updatedPlayers = players.value.map(player => {
        const playerSubmissions = submissions.value[player.id] || {};
        let roundPoints = 0;

        categories.value.forEach(category => {
          const answer = playerSubmissions[category]?.toLowerCase().trim() || '';
          roundPoints += getFinalPoints(category, answer);
        });

        return {
          ...player,
          score: (player.score || 0) + roundPoints
        };
      });

      if (isLastRound.value) {
        await updateDoc(roomRef, {
          'settings.gameStatus': 'final',
          players: updatedPlayers
        });
        console.log('Juego finalizado');
      } else {
        await updateDoc(roomRef, {
          'settings.gameStatus': 'playing',
          'settings.currentRound': currentRound.value + 1,
          'settings.currentLetter': generateRandomLetter(),
          'settings.roundStartTime': new Date().toISOString(),
          players: updatedPlayers,
          'submissions': {},
          'submissionTimes': {}
        });
        console.log(`Iniciando ronda ${currentRound.value + 1}`);
      }
    }
  } catch (error) {
    console.error('Error al continuar el juego:', error);
  } finally {
    isStartingNextRound.value = false;
  }
};

// Generar letra aleatoria
const generateRandomLetter = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[Math.floor(Math.random() * letters.length)];
};

// Validar que la palabra empiece con la letra correcta
const validateWord = (word) => {
  if (!word || word.trim() === '') return false;
  const currentLetter = settings.value.currentLetter?.toLowerCase() || '';
  return word.toLowerCase().startsWith(currentLetter);
};
</script>

<template>
  <div class="min-h-screen p-6">
    <!-- Revisar Encabezado -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold text-primary mb-4 font-headline">
        {{ T.reviewResults }}
      </h1>
      <p class="text-xl text-foreground/80">{{ T.playerScores }}</p>
    </div>

    <!-- Contenido de Revisión -->
    <div class="grid gap-8 max-w-4xl mx-auto">
      <div class="bg-white border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <div class="p-6">
          <h2 class="font-semibold tracking-tight font-headline text-2xl text-primary">
            {{ T.gameSummary }}
          </h2>
        </div>
        <div class="p-6 pt-0">
          <button
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {{ T.feedback }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>