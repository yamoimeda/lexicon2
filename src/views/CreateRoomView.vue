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
      <br>
      <button
          @click="Regresar"
          class="w-full px-4 py-2 border-1 text-secondary rounded hover:bg-secondary/90 disabled:opacity-50 hover:text-white"
          >
              <ArrowLeft class="ml-2 w-4 h-4 inline" />
              {{T.backToHome}}
      </button>
    </div>
    <CreateRoomForm />
    
  </div>
</template>
