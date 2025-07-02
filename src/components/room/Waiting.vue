<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const players = ref([
  { name: 'Jugador 1', isAdmin: true },
  { name: 'Jugador 2', isAdmin: false },
  { name: 'Jugador 3', isAdmin: false },
]);

const gameSettings = ref({
  numberOfRounds: 3,
  timePerRound: 60,
  language: 'Español',
  categories: ['Nombre', 'Apellido', 'Fruta', 'Color', 'Cosa'],
  endRoundOnFirstSubmit: false,
});

const isAdmin = ref(true); // Cambiar según el usuario actual
const router = useRouter();

const startGame = () => {
  console.log('Iniciando el juego...');
  router.push('/game');
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
    router.replace('/login');
  }
});

defineExpose({});
</script>

<template>
  <div class="flex flex-col gap-6 min-h-screen">
   
  <div class="flex flex-col gap-6 lg:flex-row">
    <!-- Configuración del Juego -->
    <div class="bg-white rounded-lg border border-gray-300 shadow-lg p-6 w-full lg:w-1/3">
      <h2 class="text-2xl font-semibold text-primary mb-4">Ajustes del Juego</h2>
      <ul class="space-y-2">
        <li><strong>Rondas:</strong> {{ gameSettings.numberOfRounds }}</li>
        <li><strong>Tiempo por Ronda:</strong> {{ gameSettings.timePerRound }} segundos</li>
        <li><strong>Idioma:</strong> {{ gameSettings.language }}</li>
        <li><strong>Categorías:</strong> {{ gameSettings.categories.join(', ') }}</li>
        <li><strong>Final Rápido:</strong> {{ gameSettings.endRoundOnFirstSubmit ? 'Sí' : 'No' }}</li>
      </ul>
    </div>

    <!-- Lista de Jugadores -->
    <div class="bg-white rounded-lg border border-gray-300 shadow-lg p-6 w-full lg:w-2/3">
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

