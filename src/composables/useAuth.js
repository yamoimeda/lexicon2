import { ref, computed } from 'vue';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const user = ref(null);
const isAuthenticated = ref(false);
const loading = ref(true);

// Función para inicializar el estado de autenticación
const initializeAuth = () => {
  const auth = getAuth();
  
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado con Firebase
        const username = localStorage.getItem('username');
        if (username) {
          user.value = {
            uid: firebaseUser.uid,
            username: username
          };
          isAuthenticated.value = true;
        } else {
          // Usuario de Firebase pero sin username guardado - desautenticar
          logout();
        }
      } else {
        // No hay usuario autenticado
        user.value = null;
        isAuthenticated.value = false;
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
      }
      loading.value = false;
      resolve(isAuthenticated.value);
      unsubscribe();
    });
  });
};

// Función para cerrar sesión
const logout = async () => {
  try {
    const auth = getAuth();
    await signOut(auth);
    
    // Limpiar localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    
    // Actualizar estado
    user.value = null;
    isAuthenticated.value = false;
    
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return false;
  }
};

// Función para verificar si el usuario está autenticado (solo localStorage)
const checkLocalAuth = () => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  
  if (userId && username) {
    user.value = {
      uid: userId,
      username: username
    };
    isAuthenticated.value = true;
    return true;
  }
  
  return false;
};

// Computed para obtener información del usuario
const currentUser = computed(() => user.value);
const currentUsername = computed(() => user.value?.username || '');
const currentUserId = computed(() => user.value?.uid || '');

export function useAuth() {
  return {
    user: currentUser,
    username: currentUsername,
    userId: currentUserId,
    isAuthenticated: computed(() => isAuthenticated.value),
    loading: computed(() => loading.value),
    initializeAuth,
    logout,
    checkLocalAuth
  };
}
