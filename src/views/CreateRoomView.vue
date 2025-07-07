<script setup>
        import { ref, onMounted } from 'vue';
        import { useRouter } from 'vue-router';
        import CreateRoomForm from '../components/room/CreateRoomForm.vue'; // Assuming a Vue component for the form
        import { useCreateRoomTranslations } from '../Translations/CreateRoomTranslation';
        import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
        import { ArrowLeft } from 'lucide-vue-next'
        // Dummy user context for now
        const isAuthenticated = ref(true); // Replace with actual auth state
        const language = ref('en'); // Replace with actual language state
        
        const T = useCreateRoomTranslations;
        const router = useRouter();
        
        onMounted(() => {
          const userId = localStorage.getItem('userId');
          const username = localStorage.getItem('username');

          if (!userId || !username) {
            console.log('Usuario no autenticado. Redirigiendo a la página de inicio de sesión.');
            router.replace('/login');
          }
        });

        const Regresar = () => {
          router.replace('/');
        };

       
        </script>
<template>
  
  <div class="min-h-screen p-6">
    <!-- Create Room Header -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold text-primary mb-4 font-headline">
        {{ T.title }}
      </h1>
      <p class="text-xl text-foreground/80">{{ T.description }}</p>
    </div>

    <!-- Room Settings -->
    <div class="grid gap-8 max-w-4xl mx-auto">
      <div class="bg-white border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <div class="p-6">
          <h2 class="font-semibold tracking-tight font-headline text-2xl text-primary">
            {{ T.content }}
          </h2>
        </div>
        <div class="p-6 pt-0">
          <button
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {{ T.button }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
