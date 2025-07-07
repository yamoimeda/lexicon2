<script setup>
import { computed } from 'vue';
import { useFinalTranslations } from '../../Translations/FinalTranslation';

// Props
const props = defineProps({
  roomData: { type: Object, required: true }
});

const T = useFinalTranslations;

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
  <div class="min-h-screen p-3 md:p-6 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
    <div class="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <!-- Cabecera mejorada y responsiva -->
      <div class="text-center bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 border border-border/50">
        <h1 class="text-2xl md:text-3xl lg:text-4xl font-headline text-primary mb-2">
          🎉 {{ T.gameFinished }} 🎉
        </h1>
        <p class="text-sm md:text-base lg:text-lg text-gray-600">
          {{ T.finalResults }} {{ settings.numberOfRounds }} {{ T.rounds }}
        </p>
      </div>

      <!-- Ganador destacado - mejorado y responsivo -->
      <div v-if="winner" class="text-center">
        <div class="bg-accent text-accent-foreground rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 border-4 border-accent transform hover:scale-[1.02] transition-transform duration-300">
          <div class="text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4">👑</div>
          <h2 class="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">{{ T.congratulations }}</h2>
          <h3 class="text-lg md:text-xl lg:text-2xl font-semibold mb-1">{{ winner.name }}</h3>
          <p class="text-base md:text-lg lg:text-xl opacity-90">{{ winner.score }} {{ T.points }}</p>
        </div>
      </div>

      <!-- Clasificación completa - mejorada y responsiva -->
      <div class="bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 border border-border/50">
        <h2 class="text-lg md:text-xl lg:text-2xl font-semibold text-primary mb-4 md:mb-6 text-center">
          📊 {{ T.finalRanking }}
        </h2>
        
        <div class="space-y-3 md:space-y-4">
          <div v-for="(player, index) in finalStats" 
               :key="player.id" 
               class="flex items-center justify-between p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all hover:shadow-md duration-300 hover:scale-[1.01]"
               :class="getPositionClasses(index)">
            
            <div class="flex items-center gap-3 md:gap-4">
              <!-- Posición -->
              <div class="text-lg md:text-xl lg:text-2xl font-bold min-w-[2.5rem] md:min-w-[3rem] text-center">
                {{ getPositionEmoji(index) }}
              </div>
              
              <!-- Información del jugador -->
              <div class="flex flex-col">
                <span class="text-base md:text-lg lg:text-xl font-semibold">{{ player.name }}</span>
                <span class="text-xs md:text-sm opacity-75">
                  {{ index === 0 ? T.winner : index === 1 ? T.secondPlace : index === 2 ? T.thirdPlace : `${index + 1}° ${T.place}` }}
                </span>
              </div>
            </div>
            
            <!-- Puntaje -->
            <div class="text-right">
              <div class="text-lg md:text-xl lg:text-2xl font-bold">{{ player.score }}</div>
              <div class="text-xs md:text-sm opacity-75">{{ T.points }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas adicionales - mejoradas y responsivas -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div class="bg-white/95 backdrop-blur-sm rounded-lg md:rounded-xl shadow-lg p-3 md:p-4 text-center border border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div class="text-lg md:text-xl lg:text-2xl font-bold text-primary">{{ finalStats.length }}</div>
          <div class="text-xs md:text-sm text-gray-600">{{ T.players }}</div>
        </div>
        
        <div class="bg-white/95 backdrop-blur-sm rounded-lg md:rounded-xl shadow-lg p-3 md:p-4 text-center border border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div class="text-lg md:text-xl lg:text-2xl font-bold text-primary">{{ settings.numberOfRounds || 0 }}</div>
          <div class="text-xs md:text-sm text-gray-600">{{ T.rounds }}</div>
        </div>
        
        <div class="bg-white/95 backdrop-blur-sm rounded-lg md:rounded-xl shadow-lg p-3 md:p-4 text-center border border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div class="text-lg md:text-xl lg:text-2xl font-bold text-primary">{{ winner?.score || 0 }}</div>
          <div class="text-xs md:text-sm text-gray-600">{{ T.maxScore }}</div>
        </div>
      </div>

      <!-- Botón para salir - mejorado y responsivo -->
      <div class="text-center">
        <button 
          @click="$router.push('/')"
          class="bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary text-primary-foreground py-3 md:py-4 px-6 md:px-8 rounded-xl text-sm md:text-base lg:text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary/30">
          🏠 {{ T.goHomeButton }}
        </button>
      </div>
    </div>
  </div>
</template>