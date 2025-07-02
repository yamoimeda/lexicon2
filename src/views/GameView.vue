<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import RoomNotFound from '../components/room/RoomNotFound.vue';
import Waiting from '../components/room/Waiting.vue';
import Playing from '../components/room/Playing.vue';
import Reviewing from '../components/room/Reviewing.vue';
import Final from '../components/room/Final.vue';

const isAdmin = ref(true); // Cambiar según el usuario actual
const router = useRouter();
const route = useRoute();
const db = getFirestore();

const roomId = route.params.roomId; // Extraer el ID de la sala desde la URL
const roomData = ref(null);

const fetchRoomData = async () => {
  try {
    if (!roomId) {
      console.error('El ID de la sala no está definido.');
      return;
    }

    const roomRef = doc(db, 'rooms', roomId);
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

const getComponentByGameStatus = (status) => {
  switch (status) {
    case 'waiting':
      return Waiting;
    case 'playing':
      return Playing;
    case 'reviewing':
      return Reviewing;
    case 'final':
      return Final;
    default:
      return null;
  }
};

onMounted(() => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  if (!userId || !username) {
    console.log('Usuario no autenticado. Redirigiendo a la página de inicio de sesión.');
    router.replace('/login');
  } else {
    fetchRoomData();
  }
});
</script>

<template>
  <div class="flex flex-col gap-6 min-h-screen p-6 max-w-2xl mx-auto">
    <h1 v-if="!roomData" class="text-4xl font-bold text-primary mb-4 text-center">Cargando...</h1>

    <template v-else>
      <h1 class="text-4xl font-bold text-primary mb-4 text-center">
        {{ $t('Sala') }}: {{ roomId }}
      </h1>

      <RoomNotFound v-if="!roomData" />

      <component v-else :is="getComponentByGameStatus(roomData.gameStatus)" />
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


