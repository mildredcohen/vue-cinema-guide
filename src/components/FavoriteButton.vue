<template>
  <BaseButton
    variant="secondary"
    type="button"
    @click="handleFavoriteClick"
    class="favorite-btn"
    :aria-label="
      isInFavorites ? 'Удалить из избранного' : 'Добавить в избранное'
    "
  >
    <IconHeartFilled v-if="isInFavorites" class="favorite-btn__icon" />
    <IconHeart v-else-if="!isInFavorites" class="favorite-btn__icon" />
  </BaseButton>

  <!-- Модалка авторизации -->
  <AppAuth
    v-if="showAuthModal"
    @close="showAuthModal = false"
    @login="handleLogin"
  />
</template>

<script setup lang="ts">
  // components
  import BaseButton from '@/components/ui/BaseButton.vue'
  import AppAuth from '@/components/auth/AppAuth.vue'

  // icons
  import IconHeart from '@/components/ui/icons/heart/IconHeart.vue'
  import IconHeartFilled from '@/components/ui/icons/heart/IconHeartFilled.vue'

  // vue
  import { ref, computed, onMounted, watch } from 'vue'

  // pinia
  import { useUserStore } from '@/stores/user'
  const userStore = useUserStore()

  // axios
  import { favoritesAPI } from '@/api/favorites'

  // types
  interface Props {
    movieId: number
  }

  // props
  const props = defineProps<Props>()

  // refs
  const showAuthModal = ref(false)
  const userFavorites = ref<string[]>([])
  const pendingFavoriteAction = ref<'add' | 'remove' | null>(null)

  // Проверяем, находится ли фильм в избранном
  const isInFavorites = computed(() => {
    return userFavorites.value.includes(props.movieId.toString())
  })

  // Загружаем избранные пользователя
  const loadUserFavorites = async () => {
    if (!userStore.isAuthenticated) {
      userFavorites.value = []
      return
    }

    try {
      const favorites = await favoritesAPI.getFavorites()
      // Сохраняем ID избранных фильмов
      userFavorites.value = favorites.map((movie) => movie.id.toString())
    } catch (error) {
      console.error('Ошибка загрузки избранных:', error)
      userFavorites.value = []
    }
  }

  // Выполняем действие с избранным
  const handleFavoriteAction = async () => {
    try {
      if (isInFavorites.value) {
        // Удаляем из избранного
        await favoritesAPI.removeFromFavorites(props.movieId)
        userFavorites.value = userFavorites.value.filter(
          (id) => id !== props.movieId.toString(),
        )
      } else {
        // Добавляем в избранное
        await favoritesAPI.addToFavorites(props.movieId.toString())
        userFavorites.value.push(props.movieId.toString())
      }
    } catch (error) {
      console.error('Ошибка работы с избранным:', error)
    }
  }

  // Обработчик клика по кнопке
  const handleFavoriteClick = async () => {
    // Если не авторизован - открываем модальное окно авторизации
    if (!userStore.isAuthenticated) {
      pendingFavoriteAction.value = isInFavorites.value ? 'remove' : 'add'
      showAuthModal.value = true
      return
    }

    await handleFavoriteAction()
  }

  // Обработчик успешного логина
  const handleLogin = async () => {
    showAuthModal.value = false
    // После успешной авторизации загружаем избранные и выполняем действие
    await loadUserFavorites()
    if (pendingFavoriteAction.value) {
      await handleFavoriteAction()
      pendingFavoriteAction.value = null
    }
  }

  // Следим за изменением авторизации
  watch(
    () => userStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        loadUserFavorites()
      } else {
        userFavorites.value = []
      }
    },
  )

  onMounted(() => {
    if (userStore.isAuthenticated) {
      loadUserFavorites()
    }
  })
</script>

<style scoped lang="scss">
  .favorite-btn {
    &__icon {
      width: 24px;
      height: 24px;
    }
  }
</style>
