<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useTranslations } from '../Translations/HomeTranslation';
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
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  if (!userId || !username) {
    console.log('Usuario no autenticado. Redirigiendo a la página de inicio de sesión.');
    router.replace('/login');
  } else {
    listenToRoomChanges();
    fetchRoomData();
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// Exponer la API pública del componente
defineExpose({
  fetchRoomData,
  leaveRoom,
  roomData
});

</script>

<template>
  <div class="flex flex-col gap-6 min-h-screen p-6 max-w-2xl mx-auto">
    <h1 v-if="!roomData" class="text-4xl font-bold text-primary mb-4 text-center">Cargando...</h1>

    <template v-else>
      <h1 class="text-4xl font-bold text-primary mb-4 text-center">
        {{roomData.settings.roomName }} ID: {{ props.roomId }}
      </h1>

      <RoomNotFound v-if="!roomData" />

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
    </template>

    <!-- Botón para Salir de la Sala -->
    <div class="text-center">
      <button @click="leaveRoom" class="inline-flex items-center justify-center gap-2 
              whitespace-nowrap rounded-xl text-sm font-medium 
              ring-offset-background transition-colors 
              focus-visible:outline-none focus-visible:ring-2 
              focus-visible:ring-ring focus-visible:ring-offset-2 
              disabled:pointer-events-none disabled:opacity-50 
              [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 
              h-10 px-4 py-2 w-full 
              bg-secondary hover:bg-secondary/90 text-secondary-foreground">
        Salir de la Sala
      </button>
    </div>
  </div>
</template>


