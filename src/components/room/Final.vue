<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  roomData: { type: Object, required: true }
});

// Computed properties
const players = computed(() => props.roomData.players || []);
const finalStats = computed(() => {
  return players.value.map(player => ({
    id: player.id,
    name: player.name,
    score: player.score || 0
  })).sort((a, b) => b.score - a.score);
});

const winner = computed(() => finalStats.value[0] || null);
const settings = computed(() => props.roomData.settings || {});

// Función para obtener el emoji de posición
const getPositionEmoji = (index) => {
  switch (index) {
    case 0: return '👑'; // Corona para el ganador
    case 1: return '🥈'; // Plata
    case 2: return '🥉'; // Bronce
    default: return `${index + 1}.`; // Número normal
  }
};

// Función para obtener las clases CSS según la posición
const getPositionClasses = (index) => {
  if (index === 0) {
    return 'bg-accent text-accent-foreground border-accent';
  } else if (index === 1) {
    return 'bg-gray-100 border-gray-300';
  } else if (index === 2) {
    return 'bg-orange-50 border-orange-200';
  }
  return 'bg-white border-gray-200';
};
</script>

<template>
  <div class="min-h-screen p-6 bg-gradient-to-br from-primary/10 to-accent/10">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Cabecera -->
      <div class="text-center bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-4xl font-headline text-primary mb-2">
          🎉 ¡Juego Finalizado! 🎉
        </h1>
        <p class="text-lg text-gray-600">
          Resultados finales después de {{ settings.numberOfRounds }} rondas
        </p>
      </div>

      <!-- Ganador destacado -->
      <div v-if="winner" class="text-center">
        <div class="bg-accent text-accent-foreground rounded-lg shadow-xl p-8 border-4 border-accent">
          <div class="text-6xl mb-4">👑</div>
          <h2 class="text-3xl font-bold mb-2">¡Felicitaciones!</h2>
          <h3 class="text-2xl font-semibold mb-1">{{ winner.name }}</h3>
          <p class="text-xl opacity-90">{{ winner.score }} puntos</p>
        </div>
      </div>

      <!-- Clasificación completa -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-primary mb-6 text-center">
          📊 Clasificación Final
        </h2>
        
        <div class="space-y-4">
          <div v-for="(player, index) in finalStats" 
               :key="player.id" 
               class="flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-md"
               :class="getPositionClasses(index)">
            
            <div class="flex items-center gap-4">
              <!-- Posición -->
              <div class="text-2xl font-bold min-w-[3rem] text-center">
                {{ getPositionEmoji(index) }}
              </div>
              
              <!-- Información del jugador -->
              <div class="flex flex-col">
                <span class="text-xl font-semibold">{{ player.name }}</span>
                <span class="text-sm opacity-75">
                  {{ index === 0 ? '¡Ganador!' : index === 1 ? 'Segundo lugar' : index === 2 ? 'Tercer lugar' : `${index + 1}° lugar` }}
                </span>
              </div>
            </div>
            
            <!-- Puntaje -->
            <div class="text-right">
              <div class="text-2xl font-bold">{{ player.score }}</div>
              <div class="text-sm opacity-75">puntos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas adicionales -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <div class="text-2xl font-bold text-primary">{{ finalStats.length }}</div>
          <div class="text-sm text-gray-600">Jugadores</div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <div class="text-2xl font-bold text-primary">{{ settings.numberOfRounds || 0 }}</div>
          <div class="text-sm text-gray-600">Rondas</div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <div class="text-2xl font-bold text-primary">{{ winner?.score || 0 }}</div>
          <div class="text-sm text-gray-600">Puntaje máximo</div>
        </div>
      </div>

      <!-- Botón para salir -->
      <div class="text-center">
        <button 
          @click="$router.push('/')"
          class="bg-primary text-primary-foreground py-3 px-8 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
          🏠 Volver al inicio
        </button>
      </div>
    </div>
  </div>
</template>