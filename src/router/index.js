import { createRouter, createWebHistory } from 'vue-router';
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
            },
            {
              path: '/room/create',
              name: 'CreateRoom',
              component: CreateRoomView,
            },
            {
              path: '/game/:roomId',
              name: 'GameView',
              component: GameView,
              props: true
            },
            {
              path: '/login',
              name: 'Login',
              component: LogInView,
            },
          ],
        },
        {
          path: '/final-stats',
          name: 'FinalStats',
          component: () => import('../views/FinalStatsView.vue'),
        },
      ],
    });

    export default router;
