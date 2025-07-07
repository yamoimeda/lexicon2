<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../composables/useAuth.js';

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
const { userId: currentUserId, username, isAuthenticated } = useAuth();
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
  // Verificar autenticación usando el composable
  if (!isAuthenticated.value || !currentUserId.value || !username.value) {
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
  <div class="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-3 md:p-6">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        
        <!-- Cabecera de bienvenida - mejorada -->
        <div class="bg-white/95 backdrop-blur-sm shadow-lg md:shadow-xl rounded-xl md:rounded-2xl border border-border/50 overflow-hidden">
          <div class="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white p-4 md:p-6">
            <div class="text-center">
              <h1 class="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight mb-1 md:mb-2">
                Sala de Espera
              </h1>
              <p class="text-primary-foreground/80 text-xs md:text-sm mt-1 md:mt-2">
                {{ isAdmin ? 'Revisa la configuración e inicia cuando estés listo' : 'Esperando que el administrador inicie el juego' }}
              </p>
            </div>
          </div>
        </div>
        <!-- Panel principal con configuración del juego -->
        <div class="order-2 lg:order-1 lg:col-span-2 space-y-4 md:space-y-6">

          <!-- Configuración del Juego - mejorada -->
          <div class="bg-white/95 backdrop-blur-sm shadow-lg md:shadow-xl rounded-xl md:rounded-2xl border border-border/50 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-500/15 via-blue-400/10 to-blue-500/5 border-b border-border/50 p-4 md:p-6">
              <div class="flex items-center space-x-2 md:space-x-3">
                <div class="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <h2 class="text-lg md:text-xl lg:text-2xl font-bold text-foreground">Configuración</h2>
              </div>
            </div>
            
            <div class="p-4 md:p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                <!-- Rondas -->
                <div class="bg-gradient-to-br from-muted/30 to-muted/15 rounded-lg md:rounded-xl p-3 md:p-4 border border-border/40 hover:border-border/60 transition-colors">
                  <div class="flex items-center space-x-1 md:space-x-2">
                    
                    <span class="font-bold text-foreground text-sm md:text-base">Rondas:</span>
                    <p class="text-lg md:text-xl lg:text-2xl font-bold text-primary">{{ gameSettings.numberOfRounds }}</p>
                  
                  </div>
                </div>
                
                <!-- Tiempo -->
                <div class="bg-gradient-to-br from-muted/30 to-muted/15 rounded-lg md:rounded-xl p-3 md:p-4 border border-border/40 hover:border-border/60 transition-colors">
                  <div class="flex items-center space-x-1 md:space-x-2">
                    
                    <span class="font-bold text-foreground text-sm md:text-base">Tiempo:</span>
                    <p class="text-lg md:text-xl lg:text-2xl font-bold text-primary">{{ gameSettings.timePerRound }}</p>
                    <p class="text-xs text-muted-foreground"> segundos</p>
                  </div>
                </div>

                <!-- Idioma -->
                <div class="bg-gradient-to-br from-muted/30 to-muted/15 rounded-lg md:rounded-xl p-3 md:p-4 border border-border/40 hover:border-border/60 transition-colors">
                  <div class="flex items-center space-x-1 md:space-x-2">
                    
                    <span class="font-bold text-foreground text-sm md:text-base">Idioma:</span>
                    <p class="text-sm md:text-base lg:text-lg font-semibold text-primary">{{ gameSettings.language }}</p>
                  </div>
                </div>
                
                <!-- Final Rápido -->
                <div class="bg-gradient-to-br from-muted/30 to-muted/15 rounded-lg md:rounded-xl p-3 md:p-4 border border-border/40 hover:border-border/60 transition-colors">
                  <div class="flex items-center space-x-1 md:space-x-2">
                    
                    <span class="font-bold text-foreground text-sm md:text-base">Fin Rápido:</span>
                    <p class="text-sm md:text-base lg:text-lg font-semibold"
                       :class="gameSettings.endRoundOnFirstSubmit ? 'text-green-600' : 'text-gray-500'">
                      {{ gameSettings.endRoundOnFirstSubmit ? 'Sí' : 'No' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Categorías - mejoradas -->
              <div class="mt-4 md:mt-6">
                <div class="flex items-center space-x-1 md:space-x-2 mb-3 md:mb-4">
                  <h3 class="text-base md:text-lg font-bold text-foreground">Categorías</h3>
                  <span class="text-xs md:text-sm text-muted-foreground font-medium ml-2">
                    ({{ gameSettings.categories?.length || 0 }})
                  </span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="category in gameSettings.categories || []" 
                        :key="category"
                        class="inline-flex items-center px-3 py-2 rounded-full text-xs md:text-sm font-medium bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20 transition-colors">
                    {{ category }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Controles de Administrador - mejorados -->
          <div v-if="isAdmin" class="bg-white/95 backdrop-blur-sm shadow-lg md:shadow-xl rounded-xl md:rounded-2xl border border-border/50 p-4 md:p-6">
            <div class="text-center space-y-3 md:space-y-4">
              <div class="mb-3 md:mb-4">
                <h3 class="text-lg md:text-xl font-bold text-foreground mb-1 md:mb-2">Controles Admin</h3>
                <p class="text-muted-foreground text-xs md:text-sm">
                  Inicia cuando todos estén listos
                </p>
              </div>
              
              <button @click="startGame" 
                      class="w-full h-12 md:h-14 bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary text-white font-bold text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/30 transform hover:scale-[1.02]">
                <span class="flex items-center justify-center space-x-2 md:space-x-3">
                  <span class="text-xl md:text-2xl"></span>
                  <span>Iniciar Juego</span>
                </span>
              </button>
            </div>
          </div>

          <!-- Mensaje para Jugadores No-Admin - mejorado -->
          <div v-else class="bg-white/95 backdrop-blur-sm shadow-lg md:shadow-xl rounded-xl md:rounded-2xl border border-border/50 p-6 md:p-8">
            <div class="text-center">
              <div class="animate-pulse mb-3 md:mb-4">
                <div class="w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                  <span class="text-2xl md:text-3xl">⏳</span>
                </div>
              </div>
              <h3 class="text-lg md:text-xl font-bold text-foreground mb-1 md:mb-2">Esperando al admin</h3>
              <p class="text-muted-foreground font-medium text-sm md:text-base">
                El admin iniciará cuando todos estén listos
              </p>
            </div>
          </div>
        </div>

        <!-- Panel lateral con jugadores - mejorado -->
        <div class="order-1 lg:order-2 lg:col-span-1 space-y-4 md:space-y-6">
          <!-- Lista de Jugadores -->
          <div class="bg-white/95 backdrop-blur-sm shadow-lg md:shadow-xl rounded-xl md:rounded-2xl border border-border/50 p-4 md:p-6">
            <div class="flex items-center justify-between mb-4 md:mb-6">
              <div class="flex items-center space-x-1 md:space-x-2">
                <div class="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h2 class="text-base md:text-lg lg:text-xl font-bold text-foreground">👥 Jugadores</h2>
              </div>
              <span class="text-xs md:text-sm text-muted-foreground font-medium bg-muted/30 px-2 py-1 rounded-full">
                {{ players.length }}
              </span>
            </div>
            
            <div class="space-y-2 md:space-y-3">
              <div v-for="player in players" :key="player.id" 
                   class="flex justify-between items-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                   :class="player.isAdmin 
                     ? 'bg-primary/15 border-2 border-primary/40 shadow-sm' 
                     : 'bg-muted/40 border-2 border-transparent hover:bg-muted/60'">
                <div class="flex items-center space-x-2 md:space-x-3">
                  <div class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-md"
                       :class="player.isAdmin ? 'bg-primary' : 'bg-muted-foreground'">
                    {{ player.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <span class="font-semibold text-foreground block text-sm md:text-base">{{ player.name }}</span>
                    <span v-if="player.isAdmin" 
                          class="text-xs text-primary font-medium flex items-center space-x-1">
                      <span>👑</span>
                      <span>Admin</span>
                    </span>
                    <span v-else class="text-xs text-muted-foreground">
                      Jugador
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                  <div class="text-xs text-muted-foreground font-medium mt-1">Online</div>
                </div>
              </div>
            </div>
            
            <!-- Estadísticas compactas - mejoradas -->
            <div class="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-border/40">
              <div class="grid grid-cols-2 gap-2 md:gap-4">
                <div class="text-center p-2 md:p-3 bg-muted/30 rounded-lg border border-border/30 hover:border-border/50 transition-colors">
                  <div class="text-base md:text-lg font-bold text-primary">{{ players.length }}</div>
                  <div class="text-xs text-muted-foreground font-medium">Jugadores</div>
                </div>
                <div class="text-center p-2 md:p-3 bg-muted/30 rounded-lg border border-border/30 hover:border-border/50 transition-colors">
                  <div class="text-base md:text-lg font-bold text-primary">{{ gameSettings.categories?.length || 0 }}</div>
                  <div class="text-xs text-muted-foreground font-medium">Categorías</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="order-3 lg:order-2 lg:col-span-1 space-y-4 md:space-y-6">
          <!-- Información compacta en móvil - mejorada -->
          <div class="bg-white/95 backdrop-blur-sm shadow-lg md:shadow-xl rounded-xl md:rounded-2xl border border-border/50 p-4 md:p-6">
            <h3 class="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4 flex items-center space-x-1 md:space-x-2">
              <span>💡</span>
              <span>Cómo Jugar</span>
            </h3>
            <div class="space-y-3 text-xs md:text-sm text-muted-foreground">
              <div class="flex items-start space-x-3 p-2 rounded-lg bg-muted/20 border border-border/30">
                <span class="text-primary font-bold text-base">1.</span>
                <span>Espera al administrador</span>
              </div>
              <div class="flex items-start space-x-3 p-2 rounded-lg bg-muted/20 border border-border/30">
                <span class="text-primary font-bold text-base">2.</span>
                <span>Escribe palabras con la letra dada</span>
              </div>
              <div class="flex items-start space-x-3 p-2 rounded-lg bg-muted/20 border border-border/30">
                <span class="text-primary font-bold text-base">3.</span>
                <span>Completa antes del tiempo</span>
              </div>
              <div class="flex items-start space-x-3 p-2 rounded-lg bg-muted/20 border border-border/30">
                <span class="text-primary font-bold text-base">4.</span>
                <span>Gana puntos por originalidad</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

