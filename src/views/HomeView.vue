<template>
  <div class="min-h-screen p-6">
    <!-- Mensaje de bienvenida -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold text-primary mb-4 font-headline">
        {{ T.welcome }}<span class="text-accent">{{ username }}!</span>
      </h1>
      <p class="text-xl text-foreground/80">{{ T.readyToDuel }}</p>
    </div>

    <!-- Region Cards -->
    <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <!-- Create Room Card -->
      <div class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <div class="p-6">
          <h2 class="font-semibold tracking-tight font-headline text-2xl text-primary flex items-center">
            <PlusCircle class="w-5 h-5 mr-2 text-primary" />
            {{ T.createRoomTitle }}
          </h2>
          <p class="text-gray-600">{{ T.createRoomDescription }}</p>
        </div>
        <div class="p-6">
          <p>{{ T.createRoomContent }}</p>
        </div>
        <div class="p-6 ">
          <RouterLink
            to="/room/create"
            class="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            {{ T.createRoomButton }}
            <ArrowRight class="ml-2 w-4 h-4" />
          </RouterLink>
        </div>
      </div>

      <!-- Join Room Card -->
      <div class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <div class="p-6">
          <h2 class="text-2xl font-headline text-primary flex items-center">
            <Users class="w-5 h-5 mr-2 text-primary" />
            {{ T.joinRoomTitle }}
          </h2>
          <p class="text-gray-600">{{ T.joinRoomDescription }}</p>
        </div>
        <div class="p-6">
          <form @submit.prevent="handleJoinRoom" class="space-y-4">
            <div>
              <label for="roomId" class="block text-sm text-foreground/80">{{ T.roomIdLabel }}</label>
              <input
                id="roomId"
                v-model="roomIdToJoin"
                type="text"
                :placeholder="T.roomIdPlaceholder"
                class="w-full px-4 py-2 border rounded bg-input border-border focus:ring focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              :disabled="!roomIdToJoin.trim()"
              class="w-full px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 disabled:opacity-50"
            >
              {{ T.joinRoomButton }}
              <ArrowRight class="ml-2 w-4 h-4 inline" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PlusCircle, ArrowRight, Users } from 'lucide-vue-next';
import { useTranslations } from '../Translations/HomeTranslation';



// Simulación de contexto de usuario
const username = 'Juan';
const isAuthenticated = true;
const language = 'es';

const T = useTranslations(language);

const roomIdToJoin = ref('');
const router = useRouter();

const handleJoinRoom = () => {
  if (roomIdToJoin.value.trim()) {
    router.push(`/rooms/${roomIdToJoin.value.trim()}/lobby`);
  }
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
