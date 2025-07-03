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
  <div class="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 md:p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Cabecera moderna -->
      <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 overflow-hidden">
        <div class="bg-gradient-to-r from-accent to-accent/80 text-white p-6">
          <div class="text-center">
            <h1 class="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              📊 Revisión de Respuestas
            </h1>
            <p class="text-accent-foreground/80 text-lg font-medium">
              Ronda {{ currentRound }} de {{ numberOfRounds }}
            </p>
            <p class="text-accent-foreground/70 text-sm mt-2">
              {{ isAdmin ? 'Revisa y valida las respuestas de todos los jugadores' : 'Tus respuestas de esta ronda' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Vista para jugadores no-admin: solo sus respuestas -->
      <div v-if="!isAdmin" class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 p-6">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
          <h2 class="text-2xl font-bold text-foreground">Tus Respuestas</h2>
        </div>
        
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="category in categories" :key="category" 
               class="bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-border rounded-xl p-4 hover:shadow-md transition-all duration-200">
            <div class="flex items-center space-x-2 mb-3">
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              <h3 class="font-bold text-foreground text-sm uppercase tracking-wide">{{ category }}</h3>
            </div>
            <p class="text-lg font-semibold text-foreground bg-white rounded-lg p-3 border border-border/50">
              {{ currentUserSubmissions[category] || 'Sin respuesta' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Vista para admin: todas las respuestas agrupadas por categoría -->
      <div v-else class="space-y-6">
        <div v-for="category in categories" :key="category" 
             class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 overflow-hidden">
          
          <!-- Cabecera de la categoría -->
          <div class="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50 p-6">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-primary rounded-full"></div>
              <h2 class="text-2xl font-bold text-primary">{{ category }}</h2>
              <div class="text-sm text-muted-foreground font-medium">
                {{ Object.keys(groupedAnswers[category] || {}).length }} respuesta(s) única(s)
              </div>
            </div>
          </div>
          
          <!-- Respuestas agrupadas -->
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="(playersWithAnswer, answer) in groupedAnswers[category]" 
                   :key="answer || 'empty'" 
                   class="border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                   :class="isAnswerValid(category, answer) 
                     ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                     : 'bg-red-50 border-red-200 hover:bg-red-100'">
                
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-3">
                      <div class="text-2xl font-bold text-foreground bg-white rounded-lg px-3 py-1 border border-border/50">
                        {{ answer || 'Sin respuesta' }}
                      </div>
                      <span v-if="answer && !validateWord(answer)" 
                            class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium border border-yellow-200">
                        ⚠️ No empieza con {{ settings.currentLetter }}
                      </span>
                    </div>
                    
                    <div class="flex items-center space-x-4 mb-3">
                      <div class="flex -space-x-2">
                        <div v-for="player in playersWithAnswer.slice(0, 3)" 
                             :key="player.id"
                             class="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-sm">
                          {{ player.name.charAt(0).toUpperCase() }}
                        </div>
                        <div v-if="playersWithAnswer.length > 3"
                             class="w-8 h-8 rounded-full bg-muted-foreground text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-sm">
                          +{{ playersWithAnswer.length - 3 }}
                        </div>
                      </div>
                      <div class="text-sm text-muted-foreground">
                        <span class="font-medium">{{ playersWithAnswer.length }} jugador(es):</span>
                        {{ playersWithAnswer.map(p => p.name).join(', ') }}
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                      <div class="bg-white rounded-lg px-3 py-1 border border-border/50">
                        <span class="text-lg font-bold text-primary">{{ getFinalPoints(category, answer) }}</span>
                        <span class="text-xs text-muted-foreground ml-1">puntos</span>
                      </div>
                      <span v-if="answer" class="text-xs text-muted-foreground">
                        Base: {{ getPointsForAnswer(category, answer) }} pts
                      </span>
                    </div>
                  </div>
                  
                  <button v-if="answer" 
                          @click="toggleAnswerValidation(category, answer)"
                          class="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-4"
                          :class="isAnswerValid(category, answer) 
                            ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300' 
                            : 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300'">
                    {{ isAnswerValid(category, answer) ? '✓ Válida' : '✗ Inválida' }}
                  </button>
                </div>
              </div>
              
              <div v-if="Object.keys(groupedAnswers[category] || {}).length === 0" 
                   class="text-center py-8 text-muted-foreground">
                <div class="text-4xl mb-2">📝</div>
                <p class="font-medium">No hay respuestas para esta categoría</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen de puntos mejorado -->
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500/10 to-blue-400/5 border-b border-border/50 p-6">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 class="text-2xl font-bold text-foreground">Resumen de Puntos</h3>
            </div>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="player in players" :key="player.id" 
                   class="bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl p-4 border-2 border-border hover:shadow-md transition-all duration-200">
                <div class="flex items-center space-x-3 mb-3">
                  <div class="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
                    {{ player.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <h4 class="font-bold text-foreground">{{ player.name }}</h4>
                    <p class="text-xs text-muted-foreground">Puntos actuales: {{ player.score || 0 }}</p>
                  </div>
                </div>
                <div class="bg-white rounded-lg p-3 border border-border/50">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">
                      +{{ categories.reduce((total, category) => {
                        const answer = submissions[player.id]?.[category]?.toLowerCase().trim() || '';
                        return total + getFinalPoints(category, answer);
                      }, 0) }}
                    </div>
                    <div class="text-xs text-muted-foreground font-medium">puntos esta ronda</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción mejorados -->
      <div class="text-center">
        <div v-if="isAdmin" class="space-y-4">
          <div class="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <p class="text-sm text-muted-foreground font-medium mb-4">
              💡 Revisa todas las respuestas y marca como válidas/inválidas antes de continuar
            </p>
          </div>
          
          <button @click="continueGame" 
                  :disabled="isStartingNextRound"
                  class="inline-flex items-center space-x-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-primary/30">
            <span v-if="isStartingNextRound">
              <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            </span>
            <span v-else-if="isLastRound">🏁</span>
            <span v-else>🚀</span>
            
            <span v-if="isStartingNextRound">Procesando...</span>
            <span v-else-if="isLastRound">Finalizar Juego</span>
            <span v-else>Iniciar Siguiente Ronda</span>
          </button>
        </div>
        
        <div v-else class="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
          <div class="animate-pulse mb-4">
            <div class="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
              <div class="text-2xl">⏳</div>
            </div>
          </div>
          <h3 class="text-lg font-bold text-foreground mb-2">Esperando al administrador</h3>
          <p class="text-muted-foreground font-medium">El administrador está revisando las respuestas...</p>
        </div>
      </div>
    </div>
  </div>
</template>