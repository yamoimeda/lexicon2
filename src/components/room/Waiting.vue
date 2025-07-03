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
  <div class="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 md:p-6">
    <div class="max-w-6xl mx-auto">
      <div class="grid lg:grid-cols-3 gap-6 lg:gap-8">
        
        <!-- Panel principal con configuración del juego -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Cabecera de bienvenida -->
          <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 overflow-hidden">
            <div class="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
              <div class="text-center">
                <h1 class="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  🎮 Sala de Espera
                </h1>
                <p class="text-primary-foreground/80 text-lg font-medium">
                  Preparando el juego de palabras
                </p>
                <p class="text-primary-foreground/70 text-sm mt-2">
                  {{ isAdmin ? 'Revisa la configuración e inicia cuando estés listo' : 'Esperando que el administrador inicie el juego' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Configuración del Juego -->
          <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-500/10 to-blue-400/5 border-b border-border/50 p-6">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h2 class="text-2xl font-bold text-foreground">⚙️ Configuración del Juego</h2>
              </div>
            </div>
            
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Rondas y Tiempo -->
                <div class="space-y-4">
                  <div class="bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl p-4 border border-border/30">
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="text-2xl">🔄</span>
                      <span class="font-bold text-foreground">Rondas</span>
                    </div>
                    <p class="text-2xl font-bold text-primary">{{ gameSettings.numberOfRounds }}</p>
                    <p class="text-xs text-muted-foreground">rondas totales</p>
                  </div>
                  
                  <div class="bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl p-4 border border-border/30">
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="text-2xl">⏱️</span>
                      <span class="font-bold text-foreground">Tiempo</span>
                    </div>
                    <p class="text-2xl font-bold text-primary">{{ gameSettings.timePerRound }}</p>
                    <p class="text-xs text-muted-foreground">segundos por ronda</p>
                  </div>
                </div>

                <!-- Idioma y Final Rápido -->
                <div class="space-y-4">
                  <div class="bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl p-4 border border-border/30">
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="text-2xl">🌍</span>
                      <span class="font-bold text-foreground">Idioma</span>
                    </div>
                    <p class="text-lg font-semibold text-primary">{{ gameSettings.language }}</p>
                  </div>
                  
                  <div class="bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl p-4 border border-border/30">
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="text-2xl">⚡</span>
                      <span class="font-bold text-foreground">Final Rápido</span>
                    </div>
                    <p class="text-lg font-semibold"
                       :class="gameSettings.endRoundOnFirstSubmit ? 'text-green-600' : 'text-gray-500'">
                      {{ gameSettings.endRoundOnFirstSubmit ? 'Activado' : 'Desactivado' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Categorías -->
              <div class="mt-6">
                <div class="flex items-center space-x-2 mb-4">
                  <span class="text-2xl">📝</span>
                  <h3 class="text-lg font-bold text-foreground">Categorías del Juego</h3>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="category in gameSettings.categories || []" 
                        :key="category"
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                    {{ category }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Controles de Administrador -->
          <div v-if="isAdmin" class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 p-6">
            <div class="text-center space-y-4">
              <div class="mb-4">
                <h3 class="text-xl font-bold text-foreground mb-2">🚀 Controles de Administrador</h3>
                <p class="text-muted-foreground text-sm">
                  Cuando todos los jugadores estén listos, puedes iniciar el juego
                </p>
              </div>
              
              <button @click="startGame" 
                      class="w-full h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30">
                <span class="flex items-center justify-center space-x-3">
                  <span class="text-2xl">🎯</span>
                  <span>Iniciar Juego</span>
                </span>
              </button>
            </div>
          </div>

          <!-- Mensaje para Jugadores No-Admin -->
          <div v-else class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 p-8">
            <div class="text-center">
              <div class="animate-pulse mb-4">
                <div class="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                  <span class="text-3xl">⏳</span>
                </div>
              </div>
              <h3 class="text-xl font-bold text-foreground mb-2">Esperando al administrador</h3>
              <p class="text-muted-foreground font-medium">
                El administrador iniciará el juego cuando todos estén listos
              </p>
            </div>
          </div>
        </div>

        <!-- Panel lateral con jugadores -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Lista de Jugadores (similar a Playing.vue) -->
          <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 p-6">
            <div class="flex items-center space-x-2 mb-6">
              <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h2 class="text-xl font-bold text-foreground">👥 Jugadores Conectados</h2>
            </div>
            
            <div class="space-y-3">
              <div v-for="player in players" :key="player.id" 
                   class="flex justify-between items-center p-4 rounded-xl transition-all duration-200"
                   :class="player.isAdmin 
                     ? 'bg-primary/10 border-2 border-primary/30 shadow-sm' 
                     : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                       :class="player.isAdmin ? 'bg-primary' : 'bg-muted-foreground'">
                    {{ player.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <span class="font-semibold text-foreground block">{{ player.name }}</span>
                    <span v-if="player.isAdmin" 
                          class="text-xs text-primary font-medium flex items-center space-x-1">
                      <span>👑</span>
                      <span>Administrador</span>
                    </span>
                    <span v-else class="text-xs text-muted-foreground">
                      Jugador
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div class="text-xs text-muted-foreground font-medium mt-1">Conectado</div>
                </div>
              </div>
            </div>
            
            <!-- Estadísticas de la sala -->
            <div class="mt-6 pt-4 border-t border-border/30">
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-3 bg-muted/20 rounded-lg">
                  <div class="text-lg font-bold text-primary">{{ players.length }}</div>
                  <div class="text-xs text-muted-foreground font-medium">Jugadores</div>
                </div>
                <div class="text-center p-3 bg-muted/20 rounded-lg">
                  <div class="text-lg font-bold text-primary">{{ gameSettings.categories?.length || 0 }}</div>
                  <div class="text-xs text-muted-foreground font-medium">Categorías</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-border/50 p-6">
            <h3 class="text-lg font-bold text-foreground mb-4 flex items-center space-x-2">
              <span>💡</span>
              <span>Cómo Jugar</span>
            </h3>
            <div class="space-y-3 text-sm text-muted-foreground">
              <div class="flex items-start space-x-2">
                <span class="text-primary font-bold">1.</span>
                <span>Espera a que el administrador inicie el juego</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-primary font-bold">2.</span>
                <span>Escribe palabras que empiecen con la letra mostrada</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-primary font-bold">3.</span>
                <span>Completa todas las categorías antes del tiempo límite</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-primary font-bold">4.</span>
                <span>Gana puntos según la originalidad de tus respuestas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

