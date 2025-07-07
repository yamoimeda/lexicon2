<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getFirestore, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../composables/useAuth.js';

// Props
const props = defineProps({
  roomData: { type: Object, required: true },
  roomId: { type: String, required: true }
});

const db = getFirestore();
const { userId: currentUserId, isAuthenticated } = useAuth();
let unsubscribe = null;
let timerInterval = null;

// Refs para el estado local
const currentRoomData = ref(props.roomData);
const wordSubmissions = ref([]);
const isSubmitting = ref(false);
const timeLeft = ref(0);
const showNextRoundButton = ref(false);
const countdown = ref(5);
const isCountdownActive = ref(false);

// Computed properties
const settings = computed(() => currentRoomData.value?.settings || {});
const players = computed(() => currentRoomData.value?.players || []);
const isLoading = computed(() => !currentRoomData.value || !settings.value.gameStatus);
const isPlaying = computed(() => settings.value.gameStatus === 'playing');
const isWaiting = computed(() => settings.value.gameStatus === 'waiting');
const currentLetter = computed(() => settings.value.currentLetter || '?');
const currentRound = computed(() => settings.value.currentRound || 1);
const categories = computed(() => settings.value.categories || []);
const hasSubmitted = computed(() => {
  const submissions = currentRoomData.value?.submissions || {};
  return !!submissions[currentUserId.value];
});
const isAdmin = computed(() => {
  const currentPlayer = players.value.find(player => player.id === currentUserId.value);
  return currentPlayer ? currentPlayer.isAdmin : false;
});

// Inicializar formulario basado en categorías
const initializeWordSubmissions = () => {
  if (categories.value.length) {
    wordSubmissions.value = categories.value.map(category => ({
      category,
      word: ''
    }));
  }
};

// Funciones para el temporizador
const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);

  const roundDuration = settings.value.timePerRound || 60;
  const roundStartTime = new Date(settings.value.roundStartTime);
  const currentTime = new Date();
  const elapsedTime = Math.floor((currentTime - roundStartTime) / 1000);

  timeLeft.value = Math.max(roundDuration - elapsedTime, 0);

  timerInterval = setInterval(async () => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      clearInterval(timerInterval);
      timerInterval = null;

      // Enviar palabras automáticamente y deshabilitar campos
      if (!hasSubmitted.value) {
        await handleSubmit();
      }

      showNextRoundButton.value = true; // Mostrar botón al admin
    }
  }, 1000);
};

// Adjust round timer to compensate for countdown and hide other content during countdown
const startCountdown = () => {
  isCountdownActive.value = true;
  countdown.value = 5;

  const countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(countdownInterval);
      isCountdownActive.value = false;
      timeLeft.value += 5; // Compensate for countdown time
      startTimer(); // Start the round timer after countdown
    }
  }, 1000);
};

// Escuchar cambios en tiempo real de la sala
const listenToRoomChanges = () => {
  const roomRef = doc(db, 'rooms', props.roomId);

  unsubscribe = onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const previousLetter = currentRoomData.value?.settings?.currentLetter;
      const previousRound = currentRoomData.value?.settings?.currentRound;

      currentRoomData.value = data;

      if (!wordSubmissions.value.length || 
          previousLetter !== data.settings?.currentLetter ||
          previousRound !== data.settings?.currentRound) {
        initializeWordSubmissions();
        if (data.settings?.gameStatus === 'playing') {
          startCountdown(); // Trigger countdown before starting the round
        }
      }

      console.log('Datos de la sala actualizados:', data);
    }
  });
};

// Manejar cambios en las palabras
const handleWordChange = (category, value) => {
  const submission = wordSubmissions.value.find(s => s.category === category);
  if (submission) {
    submission.word = value;
  }
};

// Enviar palabras
const handleSubmit = async () => {
  if (isSubmitting.value || hasSubmitted.value) return;
  
  try {
    isSubmitting.value = true;
    const submissions = {};
    let hasValidWords = false;

    wordSubmissions.value.forEach(({ category, word }) => {
      const trimmedWord = word.trim();
      if (validateWord(trimmedWord)) {
        submissions[category] = trimmedWord.toLowerCase();
        hasValidWords = true;
      } else {
        submissions[category] = ''; // Palabra inválida
      }
    });

    if (!hasValidWords) {
      console.warn('No hay palabras válidas para enviar');
      return;
    }

    const roomRef = doc(db, 'rooms', props.roomId);
    await updateDoc(roomRef, {
      [`submissions.${currentUserId.value}`]: submissions,
      [`submissionTimes.${currentUserId.value}`]: new Date().toISOString()
    });

    console.log('Palabras enviadas con éxito');
  } catch (error) {
    console.error('Error al enviar palabras:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Validar palabra
const validateWord = (word) => {
  if (!word || word.trim() === '') return false;
  const currentLetterLower = currentLetter.value?.toLowerCase() || '';
  return word.toLowerCase().startsWith(currentLetterLower);
};

const advanceToNextRound = async () => {
  if (!isAdmin.value) return;

  try {
    const roomRef = doc(db, 'rooms', props.roomId);
    await updateDoc(roomRef, {
      'settings.gameStatus': 'reviewing'
    });
    console.log('Avanzando a la siguiente ronda');
  } catch (error) {
    console.error('Error al avanzar a la siguiente ronda:', error);
  } finally {
    showNextRoundButton.value = false;
  }
};

onMounted(() => {
  listenToRoomChanges();
  initializeWordSubmissions();
  startTimer();
});

// Cleanup
onUnmounted(() => {
  if (unsubscribe) unsubscribe();
  if (timerInterval) clearInterval(timerInterval);
});

// Exponer métodos públicos
defineExpose({
  startTimer,
  handleSubmit,
  initializeWordSubmissions
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-3 md:p-6">
    <!-- Loader -->
    <div v-if="isLoading" class="flex justify-center items-center h-full pt-10">
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <span class="text-muted-foreground font-medium">Cargando configuración de la sala...</span>
      </div>
    </div>

    <!-- Countdown display -->
    <div v-else-if="isCountdownActive" class="flex justify-center items-center h-full">
      <div class="text-center mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-br from-primary/8 to-primary/15 rounded-2xl border border-primary/25 shadow-inner">
        <p class="text-xs md:text-sm font-semibold text-primary/90 mb-2 uppercase tracking-widest">
          Preparando la ronda
        </p>
        <div class="text-6xl md:text-8xl lg:text-9xl font-black tracking-wider text-primary drop-shadow-sm">
          {{ countdown }}
        </div>
        <p class="text-xs text-muted-foreground mt-2 font-medium">
          La ronda comenzará en breve
        </p>
      </div>
    </div>

    <!-- Estado: jugando -->
    <div v-else-if="isPlaying" class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <div class="lg:col-span-2 space-y-4 md:space-y-6">
          <!-- Card principal del juego - mejorada -->
          <div class="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 overflow-hidden">
            <!-- Cabecera elegante con gradiente -->
            <div class="bg-gradient-to-r from-primary via-primary/95 to-primary/80 text-white p-4 md:p-6">
              <div class="flex flex-row justify-between items-center gap-3">
                <!-- Ronda x/d x rondas a la izquierda -->
                <div class="text-left">
                  <p class="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                    Ronda {{ currentRound }} / <span class="text-primary-foreground/90 text-sm font-medium"> de {{ settings.numberOfRounds }} rondas
                    </span>
                  </p>
                </div>

                <!-- Tiempo restante a la derecha -->
                <div class="flex items-center space-x-4">
                  <div class="text-center">
                    <div class="text-xs font-medium text-primary-foreground/80 uppercase tracking-wider">
                      Tiempo restante
                    </div>
                    <div class="text-2xl md:text-3xl font-bold tabular-nums" 
                         :class="timeLeft <= 10 ? 'text-red-100 animate-pulse' : 'text-white'">
                      {{ Math.floor(timeLeft / 60) }}:{{ String(timeLeft % 60).padStart(2, '0') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sección de la letra actual - mejorada -->
            <div class="px-4 md:px-6 pt-4 md:pt-6">
              <div class="text-center mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-br from-primary/8 to-primary/15 rounded-2xl border border-primary/25 shadow-inner">
                <p class="text-xs md:text-sm font-semibold text-primary/90 mb-2 uppercase tracking-widest">
                  Letra actual
                </p>
                <div class="text-5xl md:text-5xl lg:text-8xl font-black tracking-wider text-primary drop-shadow-sm">
                  {{ currentLetter }}
                </div>
              </div>

              <!-- Formulario mejorado y más responsivo -->
              <div class="pb-4 md:pb-6">
                <form @submit.prevent="handleSubmit" class="space-y-4 md:space-y-6">
                  <div class="grid gap-3 md:gap-4">
                    <div v-for="submission in wordSubmissions" :key="submission.category" 
                         class="group">
                      <label :for="submission.category" 
                             class="block text-sm font-semibold text-foreground mb-2 group-focus-within:text-primary transition-colors">
                        {{ submission.category }}
                      </label>
                      <input
                        :id="submission.category"
                        v-model="submission.word"
                        @input="handleWordChange(submission.category, $event.target.value)"
                        type="text"
                        :placeholder="'Palabra con ' + currentLetter + '...'"
                        class="flex h-12 w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted transition-all duration-200 hover:border-border/80"
                        :disabled="isSubmitting || hasSubmitted || timeLeft === 0 || isCountdownActive"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    :disabled="isSubmitting || hasSubmitted || timeLeft === 0 || isCountdownActive"
                    class="w-full h-12 md:h-14 bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary text-primary-foreground font-bold text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/30 transform hover:scale-[1.02] disabled:hover:scale-100"
                  >
                    <span v-if="hasSubmitted" class="flex items-center justify-center space-x-2">
                      <span>✅</span>
                      <span>¡Palabras enviadas!</span>
                    </span>
                    <span v-else-if="isSubmitting" class="flex items-center justify-center space-x-2">
                      <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Enviando...</span>
                    </span>
                    <span v-else-if="timeLeft === 0" class="flex items-center justify-center space-x-2">
                      <span>⏰</span>
                      <span>Tiempo agotado</span>
                    </span>
                    <span v-else class="flex items-center justify-center space-x-2">
                      <span>📝</span>
                      <span>Enviar palabras</span>
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel lateral mejorado y más responsivo -->
        <div class="lg:col-span-1 space-y-4 md:space-y-6">
          <div class="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 p-4 md:p-6">
            <div class="flex items-center justify-between mb-4 md:mb-6">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h2 class="text-lg md:text-xl font-bold text-foreground">Jugadores en vivo</h2>
              </div>
              <span class="text-xs md:text-sm text-muted-foreground font-medium bg-muted/30 px-2 py-1 rounded-full">
                {{ players.length }}
              </span>
            </div>
            
            <div class="space-y-2 md:space-y-3">
              <div v-for="player in players" :key="player.id" 
                   class="flex justify-between items-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                   :class="currentRoomData.submissions?.[player.id] 
                     ? 'bg-green-50 border-2 border-green-200 shadow-sm' 
                     : 'bg-muted/40 border-2 border-transparent hover:bg-muted/60'">
                <div class="flex items-center space-x-2 md:space-x-3">
                  <div class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-md"
                       :class="currentRoomData.submissions?.[player.id] ? 'bg-green-500' : 'bg-muted-foreground'">
                    {{ player.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <span class="font-semibold text-foreground block text-sm md:text-base">{{ player.name }}</span>
                    <span v-if="currentRoomData.submissions?.[player.id]" 
                          class="text-xs text-green-600 font-medium flex items-center space-x-1">
                      <span>✓</span>
                      <span>Completado</span>
                    </span>
                    <span v-else class="text-xs text-muted-foreground">
                      Escribiendo...
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-primary">{{ player.score || 0 }}</div>
                  <div class="text-xs text-muted-foreground font-medium">puntos</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Progreso de la partida - mejorado -->
          <div class="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 p-4 md:p-6">
            <h3 class="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4">Progreso del juego</h3>
            <div class="space-y-3 md:space-y-4">
              <div>
                <div class="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                  <span>Ronda actual</span>
                  <span>{{ currentRound }}/{{ settings.numberOfRounds }}</span>
                </div>
                <div class="w-full bg-muted/50 rounded-full h-2">
                  <div class="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500" 
                       :style="{ width: `${(currentRound / settings.numberOfRounds) * 100}%` }"></div>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3 md:gap-4 pt-2">
                <div class="text-center p-2 md:p-3 bg-muted/30 rounded-lg border border-border/30">
                  <div class="text-base md:text-lg font-bold text-primary">{{ categories.length }}</div>
                  <div class="text-xs text-muted-foreground font-medium">Categorías</div>
                </div>
                <div class="text-center p-2 md:p-3 bg-muted/30 rounded-lg border border-border/30">
                  <div class="text-base md:text-lg font-bold text-primary">{{ players.length }}</div>
                  <div class="text-xs text-muted-foreground font-medium">Jugadores</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón para avanzar (con mejor diseño y responsivo) -->
      <div v-if="showNextRoundButton && isAdmin" class="text-center mt-6 md:mt-8">
        <button @click="advanceToNextRound" 
                class="inline-flex items-center space-x-2 bg-gradient-to-r from-accent via-accent/95 to-accent/90 hover:from-accent/95 hover:via-accent hover:to-accent text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-accent/30 transform hover:scale-[1.02]">
         
          <span class="text-sm md:text-base">Avanzar a la siguiente ronda</span>
        </button>
      </div>
    </div>

    <!-- Estados de espera (mejorados y responsivos) -->
    <div v-else-if="isWaiting" class="flex justify-center items-center h-full pt-20">
      <div class="max-w-md w-full mx-auto text-center p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50">
        <div class="animate-pulse mb-4">
          <div class="w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
            <div class="text-xl md:text-2xl">⏳</div>
          </div>
        </div>
        <h3 class="text-lg md:text-xl font-bold text-foreground mb-2">Preparando la ronda</h3>
        <div class="text-muted-foreground font-medium text-sm md:text-base">
          Esperando que inicie la ronda...
        </div>
      </div>
    </div>

    <!-- Estado desconocido (mejorado y responsivo) -->
    <div v-else class="flex justify-center items-center h-full pt-20">
      <div class="max-w-md w-full mx-auto text-center p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50">
        <div class="text-3xl md:text-4xl mb-4">❓</div>
        <h3 class="text-lg md:text-xl font-bold text-foreground mb-2">Estado desconocido</h3>
        <div class="text-muted-foreground font-medium text-sm md:text-base">
          No se pudo determinar el estado del juego.
        </div>
      </div>
    </div>
  </div>
</template>