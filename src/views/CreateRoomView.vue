<script setup>
        import { ref, onMounted } from 'vue';
        import { useRouter } from 'vue-router';
        import CreateRoomForm from '../components/room/CreateRoomForm.vue'; // Assuming a Vue component for the form
        import { useTranslations } from '../Translations/CreateRommTranslation';
        import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
        
        // Dummy user context for now
        const isAuthenticated = ref(true); // Replace with actual auth state
        const language = ref('en'); // Replace with actual language state
        
        const T = useTranslations(language);
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

        const handleCreateRoom = async () => {
          const userId = localStorage.getItem('userId');
          const username = localStorage.getItem('username');

          if (!userId || !username) {
            alert('Usuario no autenticado. Por favor, inicia sesión.');
            router.replace('/login');
            return;
          }

          const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
          const roomSettings = {
            roomName: `${username}'s Game`,
            numberOfRounds: 3,
            timePerRound: 30,
            categories: ['Nombre', 'Apellido', 'Fruta', 'Color', 'Cosa'],
            language: 'Spanish',
            endRoundOnFirstSubmit: false,
            admin: userId,
            currentRound: 0,
            gameStatus: 'waiting',
          };

          const roomData = {
            id: roomId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            settings: roomSettings,
            players: [
              {
                id: userId,
                name: username,
                isAdmin: true,
                score: 0,
                joinedAt: serverTimestamp(),
              },
            ],
            rounds: [],
          };

          try {
            const db = getFirestore();
            await addDoc(collection(db, 'rooms'), roomData);
            alert(`Sala creada con éxito. ID: ${roomId}`);
            router.push(`/lobby/${roomId}`);
          } catch (error) {
            console.error('Error al crear la sala:', error);
            alert('Hubo un error al crear la sala. Por favor, intenta de nuevo.');
          }
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
        <CreateRoomForm @create-room="handleCreateRoom" />
      </div>
</template>
