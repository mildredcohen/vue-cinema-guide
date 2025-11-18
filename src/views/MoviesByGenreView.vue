<template>
  <section class="genre">
    <div class="container">
      <div class="genre__wrapper">
        <div class="genre__wrapper-title">
          <!-- кнопка вернуться на страницу с жанрами -->
          <RouterLink
            :to="`/genres`"
            class="genre__back"
            aria-label="Вернуться на страницу со списком жанров"
          >
            <IconVector class="genre__icon" />
          </RouterLink>
          <h1 class="genre__title">{{ russianName }}</h1>
        </div>

        <!-- список фильмов по жанру -->
        <TransitionGroup tag="ul" class="genre__list">
          <li
            class="genre__item"
            v-for="movie in displayedMovies"
            :key="movie.id"
          >
            <MovieTopCard :movie="movie" class="genre__movie-top-card" />
          </li>
        </TransitionGroup>

        <!-- кнопка для загрузки дополнительных фильмов по жанру -->
        <BaseButton
          v-if="showLoadMoreButton"
          variant="primary"
          type="button"
          @click="loadMoreMovies"
          class="genre__more-movies"
        >
          Показать ещё
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  // components
  import BaseButton from '@/components/ui/BaseButton.vue'
  import MovieTopCard from '@/components/cards/MovieTopCard.vue'

  // icons
  import IconVector from '@/components/ui/icons/IconVector.vue'

  // vue
  import { ref, onMounted, watch, computed } from 'vue'

  // vue-router
  import { useRoute } from 'vue-router'
  const route = useRoute()

  // types
  import type { Movie } from '@/components/types'
  import { genreMap } from '@/components/types'

  // refs
  const movies = ref<Movie[]>([])
  const page = ref(0)
  const displayedCount = ref(15)

  const displayedMovies = computed(() => {
    return movies.value.slice(0, displayedCount.value)
  })

  const showLoadMoreButton = computed(() => {
    return (
      displayedCount.value < movies.value.length ||
      (page.value === 0 && movies.value.length > 0)
    )
  })

  const loadMoreMovies = () => {
    if (displayedCount.value + 10 <= movies.value.length) {
      displayedCount.value += 10
    } else {
      page.value += 1
    }
  }

  const genreByMovies = async () => {
    try {
      const response = await fetch(
        `https://cinemaguide.skillbox.cc/movie?count=50&page=${page.value}&genre=${route.params.genre}`,
      )

      const responseJson = await response.json()

      if (page.value === 0) {
        movies.value = responseJson
        displayedCount.value = 15
      } else {
        movies.value = [...movies.value, ...responseJson]
        displayedCount.value += 10
      }
    } catch (error) {
      console.error('Ошибка загрузки жанров:', error)
    }
  }

  const genreName = route.params.genre as string

  const russianName = computed(() => genreMap[genreName])

  onMounted(() => {
    genreByMovies()
  })

  watch(page, genreByMovies)
</script>

<style lang="scss" scoped>
  .v-move,
  .v-enter-active,
  .v-leave-active {
    transition: opacity $transition-300, transform $transition-300;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
    transform: translateX(10px);
  }

  .genre {
    padding: 64px 0 160px;

    @include vp-767 {
      padding: 16px 0 40px;
    }

    &__wrapper {
      display: flex;
      flex-direction: column;
      gap: 64px;

      @include vp-767 {
        gap: 40px;
      }
    }

    &__wrapper-title {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 16px;
    }

    &__back {
      position: relative;
      width: 40px;
      height: 40px;

      @include vp-767 {
        width: 32px;
        height: 32px;
      }

      &:hover,
      &:focus-visible {
        outline: none;

        .genre__icon {
          left: 15%;
        }
      }
    }

    &__icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transition: left $transition-300;
    }

    &__title {
      margin: 0;
      font-weight: 700;
      font-size: 48px;
      line-height: 56px;

      @include vp-767 {
        font-size: 24px;
        line-height: 32px;
      }
    }

    &__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 64px 40px;
      justify-content: center;

      @media (max-width: 791px) {
        gap: 24px;
      }
    }

    &__movie-top-card {
      @media (max-width: 791px) {
        width: 335px;
        height: 502px;
      }
    }

    &__more-movies {
      margin: 0 auto;
      width: 218px;

      @media (max-width: 791px) {
        width: 100%;
      }
    }
  }
</style>
