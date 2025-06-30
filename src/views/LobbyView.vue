<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Logos from '../components/Logos.vue';

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
</script>

<template>
  <div class="min-h-screen p-6">
    <Logos />
    <h1 class="text-4xl font-bold text-primary mb-4 text-center">Sala de Espera</h1>

    <!-- Configuración del Juego -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
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
    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 class="text-2xl font-semibold text-primary mb-4">Jugadores en la Sala</h2>
      <ul class="space-y-2">
        <li v-for="(player, index) in players" :key="index" class="flex justify-between">
          <span>{{ player.name }}</span>
          <span v-if="player.isAdmin" class="text-sm text-secondary">(Admin)</span>
        </li>
      </ul>
    </div>

    <!-- Controles de Administrador -->
    <div v-if="isAdmin" class="text-center mb-6">
      <button @click="startGame" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
        Iniciar Juego
      </button>
    </div>

    <!-- Mensaje para Jugadores No-Admin -->
    <div v-else class="text-center text-muted-foreground p-4 bg-muted rounded-md">
      Esperando que el admin inicie el juego...
    </div>

    <!-- Botón para Salir de la Sala -->
    <div class="text-center">
      <button @click="leaveRoom" class="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90">
        Salir de la Sala
      </button>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
