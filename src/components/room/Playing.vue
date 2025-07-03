<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getFirestore, doc, onSnapshot, updateDoc } from 'firebase/firestore';

// Props
const props = defineProps({
  roomData: { type: Object, required: true },
  roomId: { type: String, required: true }
});

const db = getFirestore();
let unsubscribe = null;
let timerInterval = null;

// Refs para el estado local
const currentRoomData = ref(props.roomData);
const wordSubmissions = ref([]);
const isSubmitting = ref(false);
const timeLeft = ref(0);
const showNextRoundButton = ref(false);

// Computed properties
const settings = computed(() => currentRoomData.value?.settings || {});
const players = computed(() => currentRoomData.value?.players || []);
const isLoading = computed(() => !currentRoomData.value || !settings.value.gameStatus);
const isPlaying = computed(() => settings.value.gameStatus === 'playing');
const isWaiting = computed(() => settings.value.gameStatus === 'waiting');
const currentLetter = computed(() => settings.value.currentLetter || '?');
const currentRound = computed(() => settings.value.currentRound || 1);
const categories = computed(() => settings.value.categories || []);
const currentUserId = computed(() => localStorage.getItem('userId'));
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

// Escuchar cambios en tiempo real de la sala
const listenToRoomChanges = () => {
  const roomRef = doc(db, 'rooms', props.roomId);
  
  unsubscribe = onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const previousLetter = currentRoomData.value?.settings?.currentLetter;
      const previousRound = currentRoomData.value?.settings?.currentRound;
      
      currentRoomData.value = data;
      
      // Inicializar o reiniciar formulario si es necesario
      if (!wordSubmissions.value.length || 
          previousLetter !== data.settings?.currentLetter ||
          previousRound !== data.settings?.currentRound) {
        initializeWordSubmissions();
        if (data.settings?.gameStatus === 'playing') {
          startTimer();
        }
      }
      
      console.log('Datos de la sala actualizados:', data);
    }
  });
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
  <div class="min-h-screen p-6">
    <!-- Loader -->
    <div v-if="isLoading" class="flex justify-center items-center h-full pt-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span class="ml-2">Cargando configuración de la sala...</span>
    </div>

    <!-- Estado: jugando -->
    <div v-else-if="isPlaying" class="grid lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="shadow-lg bg-white rounded p-6">
          <!-- Cabecera con ronda y tiempo -->
          <div class="flex justify-between items-center mb-4">
            <div class="text-3xl font-headline text-primary">
              Ronda {{ currentRound }}/{{ settings.numberOfRounds }}
            </div>
            <div class="flex items-center gap-2">
              <div class="text-xl font-semibold" :class="timeLeft <= 10 ? 'text-red-500' : 'text-accent'">
                {{ timeLeft }}s
              </div>
            </div>
          </div>

          <!-- Letra actual -->
          <div class="text-center mb-6 p-4 bg-primary/10 rounded-lg">
            <p class="text-sm text-primary font-medium mb-1">Letra actual</p>
            <p class="text-6xl font-headline font-bold tracking-widest text-primary">
              {{ currentLetter }}
            </p>
          </div>

          <!-- Formulario de palabras -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div v-for="submission in wordSubmissions" :key="submission.category" 
                 class="bg-white p-4 rounded-lg border border-gray-200">
              <label :for="submission.category" class="block text-sm font-medium text-gray-700 mb-1">
                {{ submission.category }}
              </label>
              <input
                :id="submission.category"
                v-model="submission.word"
                @input="handleWordChange(submission.category, $event.target.value)"
                type="text"
                :placeholder="'Ingresa una palabra que empiece con ' + currentLetter"
                class="w-full px-4 py-2 border rounded bg-white focus:ring focus:ring-primary"
                :disabled="isSubmitting || hasSubmitted"
              />
            </div>

            <button
              type="submit"
              :disabled="isSubmitting || hasSubmitted"
              class="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 disabled:opacity-50"
            >
              <span v-if="hasSubmitted">¡Palabras enviadas!</span>
              <span v-else-if="isSubmitting">Enviando...</span>
              <span v-else>Enviar palabras</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Panel lateral con información -->
      <div class="lg:col-span-1 space-y-6">
        <div class="shadow-lg bg-white rounded p-6">
          <div class="text-2xl font-headline text-primary mb-4">Jugadores</div>
          <ul class="space-y-2">
            <li v-for="player in players" :key="player.id" 
                class="flex justify-between items-center p-3 rounded-md"
                :class="currentRoomData.submissions?.[player.id] ? 'bg-green-50' : 'bg-muted/50'">
              <div class="flex items-center gap-2">
                <span class="font-semibold">{{ player.name }}</span>
                <span v-if="currentRoomData.submissions?.[player.id]" 
                      class="text-xs text-green-600 font-medium">
                  ¡Listo!
                </span>
              </div>
              <span class="text-lg font-bold text-primary">{{ player.score || 0 }} pts</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Botón para avanzar a la siguiente ronda -->
    <div v-if="showNextRoundButton && isAdmin" class="text-center mt-6">
      <button @click="advanceToNextRound" class="bg-primary text-white py-2 px-4 rounded hover:bg-primary/90">
        Avanzar a la siguiente ronda
      </button>
    </div>

    <!-- Estado: esperando o error -->
    <div v-else class="flex justify-center items-center h-full pt-10">
      <div class="max-w-md text-center p-8 bg-white rounded shadow">
        <div class="text-muted-foreground">
          {{ isWaiting ? 'Esperando que inicie la ronda...' : 'Estado de juego desconocido.' }}
        </div>
      </div>
    </div>
  </div>
</template>