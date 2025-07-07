import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import HomeView from '../views/HomeView.vue';
import GameView from '../views/GameView.vue';
import CreateRoomView from '../views/CreateRoomView.vue';
import LogInView from '../views/LogInView.vue';
import AppLayout from '../layout/AppLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
          meta: { requiresAuth: true }
        },
        {
          path: '/room/create',
          name: 'CreateRoom',
          component: CreateRoomView,
          meta: { requiresAuth: true }
        },
        {
          path: '/game/:roomId',
          name: 'GameView',
          component: GameView,
          props: true,
          meta: { requiresAuth: true }
        },
        {
          path: '/login',
          name: 'Login',
          component: LogInView,
          meta: { requiresAuth: false, hideForAuth: true }
        },
      ],
    },
    {
      path: '/final-stats',
      name: 'FinalStats',
      component: () => import('../views/FinalStatsView.vue'),
      meta: { requiresAuth: true }
    },
  ],
});

// Guard de navegación global
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, loading, initializeAuth, checkLocalAuth } = useAuth();
  
  // Si estamos cargando, esperar a que se inicialice la autenticación
  if (loading.value) {
    try {
      await initializeAuth();
    } catch (error) {
      console.error('Error inicializando autenticación:', error);
      // Fallback a verificación local
      checkLocalAuth();
    }
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const hideForAuth = to.matched.some(record => record.meta.hideForAuth);
  
  if (requiresAuth && !isAuthenticated.value) {
    // Ruta requiere autenticación pero usuario no está autenticado
    console.log('Redirigiendo a login - usuario no autenticado');
    next({ name: 'Login' });
  } else if (hideForAuth && isAuthenticated.value) {
    // Usuario autenticado tratando de acceder a login
    console.log('Redirigiendo a home - usuario ya autenticado');
    next({ name: 'home' });
  } else {
    // Permitir navegación
    next();
  }
});

export default router;
