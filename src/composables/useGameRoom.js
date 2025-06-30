import { ref, onMounted } from 'vue';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';

export function useGameRoom(roomId) {
  const room = ref(null);
  const loading = ref(true);
  const error = ref(null);
  const isAdmin = ref(false);
  
  let unsubscribe = null;

  const joinRoom = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      
      if (!userId || !username) {
        throw new Error('Usuario no autenticado');
      }

      const db = getFirestore();
      const roomRef = doc(db, 'rooms', roomId);
      
      // Agregar jugador a la sala
      await updateDoc(roomRef, {
        players: arrayUnion({
          id: userId,
          name: username,
          isAdmin: false,
          score: 0,
          joinedAt: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      });

    } catch (err) {
      error.value = err.message;
    }
  };

  const startRound = async (roundNumber, letter) => {
    try {
      const db = getFirestore();
      const roomRef = doc(db, 'rooms', roomId);
      
      await updateDoc(roomRef, {
        'settings.gameStatus': 'playing',
        'settings.currentRound': roundNumber,
        'settings.currentLetter': letter,
        'settings.roundStartTime': serverTimestamp(),
        updatedAt: serverTimestamp()
      });

    } catch (err) {
      error.value = err.message;
    }
  };

  const leaveRoom = async () => {
    try {
      // Lógica para salir de la sala
      if (unsubscribe) {
        unsubscribe();
      }
    } catch (err) {
      error.value = err.message;
    }
  };

  // Escuchar cambios en tiempo real
  onMounted(() => {
    if (!roomId) return;

    const db = getFirestore();
    const roomRef = doc(db, 'rooms', roomId);

    unsubscribe = onSnapshot(roomRef, 
      (doc) => {
        if (doc.exists()) {
          room.value = doc.data();
          const userId = localStorage.getItem('userId');
          isAdmin.value = room.value.settings.admin === userId;
        } else {
          error.value = 'Sala no encontrada';
        }
        loading.value = false;
      },
      (err) => {
        error.value = err.message;
        loading.value = false;
      }
    );
  });

  return {
    room,
    loading,
    error,
    isAdmin,
    joinRoom,
    startRound,
    leaveRoom
  };
}
