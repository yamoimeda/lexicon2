<script setup>
import { ref, computed } from 'vue';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

// Props
const props = defineProps({
  roomData: { type: Object, required: true },
  roomId: { type: String, required: true }
});

const db = getFirestore();
const isStartingNextRound = ref(false);
const categoryValidations = ref({});

// Computed properties
const settings = computed(() => props.roomData.settings || {});
const players = computed(() => props.roomData.players || []);
const submissions = computed(() => props.roomData.submissions || {});
const categories = computed(() => settings.value.categories || []);
const currentRound = computed(() => settings.value.currentRound || 1);
const numberOfRounds = computed(() => settings.value.numberOfRounds || 3);
const isLastRound = computed(() => currentRound.value >= numberOfRounds.value);
const currentUserId = computed(() => localStorage.getItem('userId'));

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
    <div class="max-w-6xl mx-auto space-y-6">
      <div class="text-center bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-3xl font-headline text-primary mb-2">
          Resultados - Ronda {{ currentRound }}/{{ numberOfRounds }}
        </h1>
        <p class="text-gray-600">
          {{ isAdmin ? 'Revisa y valida las respuestas de todos los jugadores' : 'Tus respuestas de esta ronda' }}
        </p>
      </div>

      <!-- Vista para jugadores no-admin: solo sus respuestas -->
      <div v-if="!isAdmin" class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-primary mb-4">Tus Respuestas</h2>
        <div class="grid gap-4">
          <div v-for="category in categories" :key="category" 
               class="border rounded-lg p-4 bg-gray-50">
            <h3 class="font-semibold text-gray-700 mb-2">{{ category }}</h3>
            <p class="text-lg text-gray-900">
              {{ currentUserSubmissions[category] || 'Sin respuesta' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Vista para admin: todas las respuestas agrupadas por categoría -->
      <div v-else class="space-y-6">
        <div v-for="category in categories" :key="category" 
             class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold text-primary mb-4">{{ category }}</h2>
          
          <div class="space-y-4">
            <div v-for="(playersWithAnswer, answer) in groupedAnswers[category]" 
                 :key="answer || 'empty'" 
                 class="border rounded-lg p-4"
                 :class="isAnswerValid(category, answer) ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
              
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold text-lg">
                      {{ answer || 'Sin respuesta' }}
                    </h3>
                    <span v-if="answer && !validateWord(answer)" 
                          class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      ⚠️ No empieza con {{ settings.currentLetter }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">
                    {{ playersWithAnswer.length }} jugador(es): 
                    {{ playersWithAnswer.map(p => p.name).join(', ') }}
                  </p>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium">
                      Puntos: {{ getFinalPoints(category, answer) }}
                    </span>
                    <span v-if="answer" class="text-xs text-gray-500">
                      (Base: {{ getPointsForAnswer(category, answer) }} pts)
                    </span>
                  </div>
                </div>
                
                <button v-if="answer" 
                        @click="toggleAnswerValidation(category, answer)"
                        class="px-3 py-1 rounded text-sm font-medium transition-colors"
                        :class="isAnswerValid(category, answer) 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'">
                  {{ isAnswerValid(category, answer) ? 'Válida' : 'Inválida' }}
                </button>
              </div>
            </div>
            
            <div v-if="Object.keys(groupedAnswers[category] || {}).length === 0" 
                 class="text-center text-gray-500 py-4">
              No hay respuestas para esta categoría
            </div>
          </div>
        </div>

        <!-- Resumen de puntos -->
        <div class="bg-blue-50 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-blue-800 mb-4">Resumen de Puntos</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="player in players" :key="player.id" 
                 class="bg-white rounded-lg p-4 border">
              <h4 class="font-semibold text-gray-800">{{ player.name }}</h4>
              <p class="text-sm text-gray-600">Puntos actuales: {{ player.score || 0 }}</p>
              <div class="mt-2">
                <p class="text-lg font-bold text-blue-600">
                  +{{ categories.reduce((total, category) => {
                    const answer = submissions[player.id]?.[category]?.toLowerCase().trim() || '';
                    return total + getFinalPoints(category, answer);
                  }, 0) }} pts esta ronda
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="text-center space-y-4">
        <div v-if="isAdmin">
          <p class="text-sm text-gray-600 mb-4">
            Revisa todas las respuestas y marca como válidas/inválidas antes de continuar
          </p>
          
          <button @click="continueGame" 
                  :disabled="isStartingNextRound"
                  class="bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isStartingNextRound">Procesando...</span>
            <span v-else-if="isLastRound">Finalizar Juego</span>
            <span v-else>Iniciar Siguiente Ronda</span>
          </button>
        </div>
        
        <div v-else class="text-center text-gray-600">
          <p>Esperando a que el administrador continue...</p>
        </div>
      </div>
    </div>
  </div>
</template>