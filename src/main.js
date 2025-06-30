import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'; // Importa tu configuración de router


// createApp(App).mount('#app')

const app = createApp(App);

app.use(router); // Agrega el router a la aplicación

app.mount('#app');
