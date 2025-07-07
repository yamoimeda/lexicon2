<script setup>
        import { ref, onMounted } from 'vue';
        import { useRouter } from 'vue-router';
        import CreateRoomForm from '../components/room/CreateRoomForm.vue'; // Assuming a Vue component for the form
        import { useTranslations } from '../Translations/CreateRommTranslation';
        import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
        import { ArrowLeft } from 'lucide-vue-next'
        // Dummy user context for now
        const isAuthenticated = ref(true); // Replace with actual auth state
        const language = ref('en'); // Replace with actual language state
        
        const T = useTranslations;
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
  
  <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-headline font-bold text-primary mb-4 text-center">{{T.pageTitle}}</h1>
        <div className="mb-8 text-center">
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
