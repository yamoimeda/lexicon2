        
        <script setup>
        import { ref, onMounted } from 'vue';
        import { useRouter } from 'vue-router';
        import CreateRoomForm from '../components/room/CreateRoomForm.vue'; // Assuming a Vue component for the form
        import { useTranslations } from '../Translations/CreateRommTranslation';
        
        // Dummy user context for now
        const isAuthenticated = ref(true); // Replace with actual auth state
        const language = ref('en'); // Replace with actual language state
        
        const T = useTranslations(language);
        const router = useRouter();
        
        onMounted(() => {
          if (!isAuthenticated.value) {
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
              {{T.backToHome}}
              <ArrowRight class="ml-2 w-4 h-4 inline" />
            </button>
           
        </div>
        <CreateRoomForm />
      </div>
</template>
