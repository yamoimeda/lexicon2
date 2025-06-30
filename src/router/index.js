import { createRouter, createWebHistory } from 'vue-router';
    import HomeView from '../views/HomeView.vue';
    import GameView from '../views/GameView.vue';
    import CreateRoomView from '../views/CreateRoomView.vue';
    import LobbyView from '../views/LobbyView.vue';
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
              path: '/Lobby',
              name: 'Lobby',
              component: LobbyView,
            },
            {
              path: '/Game',
              name: 'Game',
              component: GameView,
            },
          ],
        },
        {
          path: '/LogIn',
          name: 'LogIn',
          component: LogInView,
          meta: { hideHeader: true } // Optional: add a meta field to hide the header on the login page
        },
      ],
    });

    export default router;
