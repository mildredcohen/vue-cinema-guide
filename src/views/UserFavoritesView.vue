<template>
  <div class="user-favorites">
    <!-- загрузка избранных фильмов -->
    <div v-if="isLoading" class="user-favorites__loading">
      <span>Загрузка избранных фильмов...</span>
    </div>

    <!-- избранных фильмов нет -->
    <div v-else-if="favoritesMovies.length === 0" class="user-favorites__empty">
      <IconHeart />
      <p class="user-favorites__empty-text">У вас пока нет избранных фильмов</p>
    </div>

    <!-- избранные фильмы -->
    <!-- <ul v-else class="user-favorites__list">
      <li
        v-for="movie in favoritesMovies"
        :key="movie.id"
        class="user-favorites__item"
      >
        избранный фильм
        <MovieTopCard :movie="movie" class="user-favorites__card" />

        удалить избранный фильм
        <button
          @click.stop="removeFromFavorites(movie.id)"
          class="user-favorites__remove"
          aria-label="Удалить из избранного"
        >
          <IconCrossSmall />
        </button>
      </li>
    </ul> -->
    <TransitionGroup v-else tag="ul" class="user-favorites__list">
      <li
        v-for="movie in favoritesMovies"
        :key="movie.id"
        class="user-favorites__item"
      >
        <!-- избранный фильм -->
        <MovieTopCard :movie="movie" class="user-favorites__card" />

        <!-- удалить избранный фильм -->
        <button
          @click.stop="removeFromFavorites(movie.id)"
          class="user-favorites__remove"
          aria-label="Удалить из избранного"
        >
          <IconCrossSmall />
        </button>
      </li>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
  // components
  import MovieTopCard from '@/components/cards/MovieTopCard.vue'

  // icons
  import IconCrossSmall from '@/components/ui/icons/cross/IconCrossSmall.vue'
  import IconHeart from '@/components/ui/icons/heart/IconHeart.vue'

  // vue
  import { ref, onMounted } from 'vue'

  // types
  import type { Movie } from '@/components/types'

  // axios
  import { favoritesAPI } from '@/api/favorites'

  // refs
  const favoritesMovies = ref<Movie[]>([])
  const isLoading = ref(false)

  const loadFavorites = async () => {
    isLoading.value = true
    try {
      // Получаем массив объектов Movie
      const favoritesResponse = await favoritesAPI.getFavorites()

      // Просто присваиваем массив фильмов
      favoritesMovies.value = favoritesResponse
    } catch (error) {
      console.error('Ошибка загрузки избранных фильмов:', error)
      favoritesMovies.value = []
    } finally {
      isLoading.value = false
    }
  }

  const removeFromFavorites = async (movieId: number) => {
    try {
      const movieIndex = favoritesMovies.value.findIndex(movie => movie.id === movieId)
      if (movieIndex !== -1) {
        favoritesMovies.value.splice(movieIndex, 1)
      }

      await favoritesAPI.removeFromFavorites(movieId)

      // await loadFavorites()
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error)
    }
  }

  onMounted(() => {
    loadFavorites()
  })
</script>

<style scoped lang="scss">
  .v-move,
  .v-enter-active,
  .v-leave-active {
    transition:
      opacity $transition-300,
      transform $transition-300;
  }

  .v-enter-from {
    opacity: 0;
    transform: translateX(10px);
  }

  .v-leave-to {
    opacity: 0;
    transform: translateX(-10px);
  }

  .user-favorites {
    &__loading {
      @include flex-center;
      flex-direction: row;
      gap: 16px;
      font-size: 24px;
      line-height: 32px;
    }

    &__empty {
      @include flex-center;
      flex-direction: row;
      gap: 24px;
      text-align: center;
      color: $color-white;
    }

    &__empty-text {
      margin: 0;
      font-size: 24px;
      line-height: 32px;
    }

    &__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 64px 40px;

      @media (max-width: 791px) {
        justify-content: center;
      }

      @media (max-width: 527px) {
        justify-content: unset;
        flex-wrap: nowrap;
        overflow: auto;
        margin: -80px -20px -80px -20px;
        padding: 80px 20px 80px 20px;
        scrollbar-width: none;
      }
    }

    &__item {
      position: relative;

      &:hover {
        & .user-favorites__remove {
          opacity: 1;
        }
      }
    }

    &__remove {
      position: absolute;
      top: 0px;
      left: 100%;
      transform: translate(-50%, -50%);
      @include flex-center;
      width: 40px;
      height: 40px;
      color: $color-black;
      background-color: $color-white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      opacity: 0;
      transition:
        opacity $transition-300,
        background-color $transition-300,
        color $transition-300;
      z-index: 10;

      @include vp-1023 {
        opacity: 1;
      }

      &:hover,
      &:focus-visible {
        background-color: $color-cornflower-blue;
        color: $color-white;
        outline: none;
      }
    }
  }
</style>
