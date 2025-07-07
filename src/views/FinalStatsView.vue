<template>
  <div class="min-h-screen p-6">
    <h1 class="text-4xl font-bold text-primary mb-4 text-center">Estadísticas Finales</h1>
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-semibold text-primary mb-4">Resultados del Juego</h2>
      <ul class="space-y-2">
        <li v-for="(player, index) in players" :key="index" class="flex justify-between">
          <span>{{ player.name }}</span>
          <span>{{ player.score }} puntos</span>
        </li>
      </ul>
    </div>
    <div class="mt-6 text-center">
      <button @click="goHome" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
        Volver al Inicio
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFinalStatsTranslations } from '../Translations/FinalStatsTranslation';

const players = ref([
  { name: 'Jugador 1', score: 100 },
  { name: 'Jugador 2', score: 80 },
  { name: 'Jugador 3', score: 60 },
]);

const router = useRouter();
const T = useFinalStatsTranslations;

const goHome = () => {
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

<style scoped>
</style>
