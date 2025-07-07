import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'; // Importa tu configuración de router
import './firebase/config.js'; // Inicializar Firebase
import { useAuth } from './composables/useAuth.js';

const app = createApp(App);

app.use(router); // Agrega el router a la aplicación

// Inicializar autenticación antes de montar la app
const { initializeAuth } = useAuth();

initializeAuth().then(() => {
  app.mount('#app');
}).catch((error) => {
  console.error('Error inicializando autenticación:', error);
  // Montar la app de todas formas
  app.mount('#app');
});
