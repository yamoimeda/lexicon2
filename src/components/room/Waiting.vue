<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, doc, onSnapshot, updateDoc } from 'firebase/firestore';

// Definir props
const props = defineProps({
  roomData: {
    type: Object,
    required: true
  },
  roomId: {
    type: String,
    required: true
  }
});

const router = useRouter();
const db = getFirestore();
const players = ref([]);
const gameSettings = ref({});
const currentUserId = ref(localStorage.getItem('userId'));
let unsubscribe = null;

// Computed para verificar si el usuario actual es admin
const isAdmin = computed(() => {
  const currentPlayer = players.value.find(player => player.id === currentUserId.value);
  return currentPlayer ? currentPlayer.isAdmin : false;
});

// Escuchar cambios en tiempo real de la sala
const listenToRoomChanges = () => {
  const roomRef = doc(db, 'rooms', props.roomId);
  
  unsubscribe = onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      players.value = data.players || [];
      gameSettings.value = data.settings || {};
      console.log('Datos de la sala actualizados:', data);
    }
  }, (error) => {
    console.error('Error escuchando cambios de la sala:', error);
  });
};

const startGame = async () => {
  if (!isAdmin.value) return;

  try {
    const roomRef = doc(db, 'rooms', props.roomId);
    const startTime = new Date().toISOString();
    const randomLetter = generateRandomLetter();

    await updateDoc(roomRef, {
      'settings.gameStatus': 'playing',
      'settings.currentRound': 1,
      'settings.currentLetter': randomLetter,
      'settings.roundStartTime': startTime
    });

    console.log('Juego iniciado con tiempo de inicio:', startTime, 'y letra:', randomLetter);
  } catch (error) {
    console.error('Error al iniciar el juego:', error);
  }
};

// Función para generar letra aleatoria
const generateRandomLetter = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[Math.floor(Math.random() * letters.length)];
};

const leaveRoom = () => {
  console.log('Saliendo de la sala...');
  router.push('/');
};

onMounted(() => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  if (!userId || !username) {
    console.log('Usuario no autenticado. Redirigiendo a la página de inicio de sesión.');
    router.push('/login');
    return;
  }

  // Inicializar datos desde props
  if (props.roomData) {
    players.value = props.roomData.players || [];
    gameSettings.value = props.roomData.settings || {};
  }

  // Escuchar cambios en tiempo real
  listenToRoomChanges();
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

defineExpose({
  players,
  gameSettings,
  isAdmin
});
</script>

<template>
  <div class="flex flex-col gap-6 min-h-screen">
   
  <div class="flex flex-col gap-6">
    <!-- Configuración del Juego -->
    <div class="bg-white rounded-lg border border-gray-300 shadow-lg p-6 w-full ">
      <h2 class="text-2xl font-semibold text-primary mb-4">Ajustes del Juego</h2>
      <ul class="space-y-2">
        <li><strong>Rondas:</strong> {{ gameSettings.numberOfRounds }}</li>
        <li><strong>Tiempo por Ronda:</strong> {{ gameSettings.timePerRound }} segundos</li>
        <li><strong>Idioma:</strong> {{ gameSettings.language }}</li>
        <li><strong>Categorías:</strong> {{ (gameSettings.categories || []).join(', ') }}</li>
        <li><strong>Final Rápido:</strong> {{ gameSettings.endRoundOnFirstSubmit ? 'Sí' : 'No' }}</li>
      </ul>
    </div>

    <!-- Lista de Jugadores -->
    <div class="bg-white rounded-lg border border-gray-300 shadow-lg p-6 w-full ">
      <h2 class="text-2xl font-semibold text-primary mb-4">Jugadores en la Sala</h2>
      <ul class="space-y-2">

        <li
          v-for="(player, index) in players"
          :key="index"
          :class="[
          'text-center py-3 px-4 rounded-xl',
          player.isAdmin ? 'bg-secondary text-white font-semibold' : 'bg-background text-gray-800'
          ]"
          >
          <span>{{ player.name }}</span>
          <span v-if="player.isAdmin" class="text-sm text-white"> (Admin)</span>
        </li>
      </ul>
    </div>
  </div>

      <!-- Controles de Administrador -->
    <div v-if="isAdmin" class="text-center mb-6">
      <button @click="startGame" class="inline-flex items-center justify-center gap-2 
              whitespace-nowrap rounded-xl text-sm font-medium 
              ring-offset-background transition-colors 
              focus-visible:outline-none focus-visible:ring-2 
              focus-visible:ring-ring focus-visible:ring-offset-2 
              disabled:pointer-events-none disabled:opacity-50 
              [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 
              h-10 px-4 py-2 w-full 
              bg-primary hover:bg-primary/90 text-white">
        Iniciar Juego
      </button>
    </div>

    <!-- Mensaje para Jugadores No-Admin -->
    <div v-else class="text-center text-muted-foreground p-4 bg-muted rounded-md">
      Esperando que el admin inicie el juego...
    </div>

    
  </div>
</template>

