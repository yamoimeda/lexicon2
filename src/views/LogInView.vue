<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signInAnonymously } from 'firebase/auth';
import '../firebase/config.js';
import { useAuth } from '../composables/useAuth.js';

const username = ref('');
const router = useRouter();
const { initializeAuth } = useAuth();

const handleLogin = async () => {
  if (!username.value.trim()) {
    alert('Por favor, ingresa un nombre de usuario.');
    return;
  }

  try {
    const auth = getAuth();
    const result = await signInAnonymously(auth);
    const userId = result.user.uid;

    // Guardar el ID del usuario y el nombre en localStorage
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username.value.trim());

    // Inicializar el estado de autenticación
    await initializeAuth();

    // Redirigir al inicio
    router.replace('/');
  } catch (error) {
    console.error('Error al autenticar:', error);
    alert('Hubo un error al iniciar sesión. Por favor, intenta de nuevo.');
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh] p-6">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h1 class="text-2xl font-bold text-primary mb-4 text-center">Iniciar Sesión</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Ingresa tu nombre"
            class="w-full px-4 py-2 border rounded bg-input border-border focus:ring focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          class="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Iniciar Sesión
        </button>
      </form>
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
