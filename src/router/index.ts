import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/genres',
      children: [
        {
          path: '',
          name: 'genres',
          component: () => import('../views/GenresView.vue'),
        },
        {
          path: ':genre',
          name: 'genre',
          component: () => import('../views/MoviesByGenreView.vue'),
        },
      ],
    },
    {
      path: '/movie/:movieId',
      name: 'movie',
      component: () => import('../views/MovieView.vue'),
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../views/UserView.vue'),
      meta: { requiresAuth: true },
      redirect: { name: 'user-favorites' },
      children: [
        {
          path: 'favorites',
          name: 'user-favorites',
          component: () => import('../views/UserFavoritesView.vue'),
        },
        {
          path: 'settings',
          name: 'user-settings',
          component: () => import('../views/UserSettingsView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

// Флаг и promise для синхронизации
let authCheckPromise: Promise<void> | null = null
let isAuthChecked = false

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // Если авторизация еще не проверена (кроме главной страницы)
  if (!isAuthChecked && to.name !== 'home') {
    // Создаем promise если его еще нет (избегаем дублирования)
    if (!authCheckPromise) {
      authCheckPromise = userStore.checkAuth().finally(() => {
        isAuthChecked = true
      })
    }

    // Ждем завершения проверки
    await authCheckPromise
  }

  // Проверяем доступ после того как точно знаем статус авторизации
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    console.log('Доступ запрещен, редирект на главную')
    next('/')
  } else {
    next()
  }
})

export default router
