<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useTranslations } from '../Translations/HomeTranslation';
import { useAuth } from '../composables/useAuth.js';
import RoomNotFound from '../components/room/RoomNotFound.vue';
import Waiting from '../components/room/Waiting.vue';
import Playing from '../components/room/Playing.vue';
import Reviewing from '../components/room/Reviewing.vue';
import Final from '../components/room/Final.vue';

// Definir props
const props = defineProps({
  roomId: {
    type: String,
    required: true
  }
});

const { isAuthenticated, userId, username } = useAuth();
const isAdmin = ref(true); // Cambiar según el usuario actual
const router = useRouter();
const db = getFirestore();
const roomData = ref(null);
let unsubscribe = null;
const T = useTranslations;

const fetchRoomData = async () => {
  try {
    if (!props.roomId) {
      console.error('El ID de la sala no está definido.');
      return;
    }

    const roomRef = doc(db, 'rooms', props.roomId);
    const roomSnapshot = await getDoc(roomRef);

    if (roomSnapshot.exists()) {
      const data = roomSnapshot.data();

      if (!data || typeof data !== 'object') {
        console.error('Los datos de la sala no son válidos:', data);
        return;
      }

      roomData.value = { ...data }; // Copiar los datos para evitar referencias directas
      console.log('Datos de la sala:', roomData.value);
    } else {
      console.log('La sala no existe.');
    }
  } catch (error) {
    console.error('Error al obtener los datos de la sala:', error);
  }
};

const leaveRoom = () => {
  console.log('Saliendo de la sala...');
  router.push('/');
};

// Función para verificar si todos los jugadores han enviado sus respuestas
const checkAllPlayersSubmitted = (roomData) => {
  const players = roomData.players || [];
  const submissions = roomData.submissions || {};

  return players.every(player => submissions[player.id]);
};

// Función para manejar transiciones automáticas
const handleRoundTransition = async (data) => {
  const settings = data.settings || {};

  if (settings.gameStatus === 'playing' && checkAllPlayersSubmitted(data)) {
    try {
      const roomRef = doc(db, 'rooms', props.roomId);
      await updateDoc(roomRef, {
        'settings.gameStatus': 'reviewing'
      });
      console.log('Transición automática a reviewing');
    } catch (error) {
      console.error('Error en transición a reviewing:', error);
    }
  }
};

// Escuchar cambios en tiempo real
const listenToRoomChanges = () => {
  const roomRef = doc(db, 'rooms', props.roomId);

  unsubscribe = onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      roomData.value = data;
      console.log('Datos de la sala actualizados:', data);

      handleRoundTransition(data);
    } else {
      console.log('La sala no existe.');
      roomData.value = null;
    }
  }, (error) => {
    console.error('Error al escuchar cambios de la sala:', error);
  });
};

onMounted(() => {
  // Verificar autenticación usando el composable
  if (!isAuthenticated.value || !userId.value || !username.value) {
    console.log('Usuario no autenticado. Redirigiendo a la página de inicio de sesión.');
    router.replace('/login');
  } else {
    listenToRoomChanges();
    fetchRoomData();
  }

  // Escuchar cambios en el estado de la sala para hacer scroll hacia arriba al iniciar una nueva ronda
  watch(() => roomData.value?.settings?.currentRound, (newRound, oldRound) => {
    if (newRound !== oldRound) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// Función para obtener el color del estado
const getStatusColor = (status) => {
  switch (status) {
    case 'waiting': return 'bg-yellow-500';
    case 'playing': return 'bg-green-500';
    case 'reviewing': return 'bg-blue-500';
    case 'final': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

// Función para obtener el texto del estado
const getStatusText = (status) => {
  switch (status) {
    case 'waiting': return 'Esperando';
    case 'playing': return 'Jugando';
    case 'reviewing': return 'Revisando';
    case 'final': return 'Finalizado';
    default: return 'Desconocido';
  }
};

// Exponer la API pública del componente
defineExpose({
  fetchRoomData,
  leaveRoom,
  roomData
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Estado de carga mejorado -->
    <div v-if="!roomData" class="flex justify-center items-center min-h-screen">
      <div class="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50 max-w-md mx-4">
        <div class="flex flex-col items-center space-y-6">
          <div class="relative">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            <div class="absolute inset-0 rounded-full h-16 w-16 border-4 border-primary/20"></div>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-foreground mb-2">Conectando a la sala</h1>
            <p class="text-muted-foreground font-medium">Cargando datos del juego...</p>
            <div class="mt-4 bg-white/80 rounded-lg px-4 py-3 border border-border/50">
              <div class="flex items-center justify-center space-x-2">
                <span class="text-sm text-muted-foreground">ID:</span>
                <span class="font-mono font-bold text-lg text-foreground">{{ props.roomId }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal cuando los datos están cargados -->
    <template v-else>
      <!-- Cabecera mejorada con bordes redondeados -->
      <div class="bg-muted/90 rounded-2xl backdrop-blur-sm border border-border/30 shadow-sm sticky top-0 z-50 md:sticky md:top-0 md:z-50 lg:sticky lg:top-0 lg:z-50 sm:fixed sm:bottom-0 sm:w-full">
        <div class="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3 md:space-x-4">
              <!-- Información de la sala con bordes muy redondeados -->
              <div class="px-3 py-2 md:px-4 md:py-3">
                <h1 class="text-lg md:text-xl lg:text-2xl font-bold text-foreground tracking-tight mb-1">
                  {{ roomData.settings.roomName }}
                </h1>
                <div class="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
                  <div class="flex items-center space-x-1 md:space-x-2 bg-white/80 rounded-xl px-2 py-1 md:px-3 border border-border/50">
                    <span class="text-xs md:text-sm">🆔</span>
                    <span class="font-mono font-bold text-sm md:text-base text-foreground">{{ props.roomId }}</span>
                  </div>
                  <span class="hidden md:inline w-1 h-1 bg-muted-foreground rounded-full"></span>
                  <span class="flex items-center space-x-1 text-muted-foreground">
                    <span class="text-xs md:text-sm">👥</span>
                    <span class="font-medium text-xs md:text-sm">{{ roomData.players?.length || 0 }}</span>
                  </span>
                  <span class="hidden md:inline w-1 h-1 bg-muted-foreground rounded-full"></span>
                  <span class="flex items-center space-x-1 text-muted-foreground">
                    <span class="w-2 h-2 rounded-full animate-pulse"
                          :class="getStatusColor(roomData.settings.gameStatus)"></span>
                    <span class="capitalize font-medium text-xs md:text-sm">{{ getStatusText(roomData.settings.gameStatus) }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Botón de salir mejorado -->
            <button @click="leaveRoom" 
                    class=" md:inline-flex items-center space-x-2 px-3 py-2 md:px-4 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <span class=" lg:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="max-w-7xl mx-auto">
        <!-- Error state -->
        <RoomNotFound v-if="!roomData" />

        <!-- Estados del juego -->
        <Waiting
          v-if="roomData.settings.gameStatus === 'waiting'"
          :room-data="roomData"
          :room-id="props.roomId"
        />
        <Playing
          v-else-if="roomData.settings.gameStatus === 'playing'"
          :room-data="roomData"
          :room-id="props.roomId"
        />
        <Reviewing
          v-else-if="roomData.settings.gameStatus === 'reviewing'"
          :room-data="roomData"
          :room-id="props.roomId"
        />
        <Final
          v-else-if="roomData.settings.gameStatus === 'final'"
          :room-data="roomData"
          :room-id="props.roomId"
        />

        <!-- Estado desconocido -->
        <div v-else class="flex justify-center items-center min-h-[50vh] p-6">
          <div class="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50 max-w-md">
            <div class="text-4xl mb-4">⚠️</div>
            <h2 class="text-xl font-bold text-foreground mb-2">Estado desconocido</h2>
            <p class="text-muted-foreground font-medium mb-4">
              El juego está en un estado no reconocido
            </p>
            <button @click="fetchRoomData" 
                    class="inline-flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
              <span>🔄</span>
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Indicador de conexión -->
      <div class="fixed bottom-4 left-4 z-40">
        <div class="bg-white/90 backdrop-blur-sm rounded-2xl px-2 py-1 md:px-3 md:py-2 shadow-lg border border-border/50 flex items-center space-x-1 md:space-x-2">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span class="text-xs font-medium text-muted-foreground">En vivo</span>
        </div>
      </div>
    </template>
  </div>
</template>


