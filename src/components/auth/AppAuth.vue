<template>
  <div class="auth">
    <div class="auth__wrapper">
      <!-- Кнопка закрыть модальное окно -->
      <button
        class="auth__close-btn"
        @click="closeModal"
        aria-label="Закрыть модальное окно для входа"
      >
        <IconCrossLarge class="auth__close-btn-icon" />
      </button>

      <!-- Логотип -->
      <div class="auth__logo">
        <LogoMarusia variant="dark" />
      </div>

      <span v-if="errorMessage" class="auth__error-message">
        {{ errorMessage }}
      </span>

      <Transition mode="out-in">
        <!-- Состояние: Успешная регистрация -->
        <AuthSuccess v-if="mode === 'success'" @login="handleSuccessLogin" />

        <!-- Состояние: Логин -->
        <AuthLoginForm
          v-else-if="mode === 'login'"
          @submit="onLoginSubmit"
          @switch-to-register="switchToRegister"
        />

        <!-- Состояние: Регистрация -->
        <AuthRegisterForm
          v-else-if="mode === 'register'"
          @submit="onRegisterSubmit"
          @switch-to-login="switchToLogin"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  // components
  import AuthLoginForm from '@/components/auth/AuthLoginForm.vue'
  import AuthRegisterForm from '@/components/auth/AuthRegisterForm.vue'
  import AuthSuccess from '@/components/auth/AuthSuccess.vue'
  import LogoMarusia from '@/components/ui/LogoMarusia.vue'

  // icons
  import IconCrossLarge from '@/components/ui/icons/cross/IconCrossLarge.vue'

  // vue
  import { ref } from 'vue'

  // pinia
  import { useUserStore } from '@/stores/user'
  const userStore = useUserStore()

  // types
  type AuthMode = 'login' | 'register' | 'success'

  // emits
  const emit = defineEmits<{
    close: []
  }>()

  // refs
  const mode = ref<AuthMode>('login')
  const pendingLoginCredentials = ref<{
    email: string
    password: string
  } | null>(null)
  const errorMessage = ref<string>('')

  const closeModal = () => {
    clearError()
    emit('close')
  }

  const switchToLogin = () => {
    clearError()
    mode.value = 'login'
  }

  const switchToRegister = () => {
    clearError()
    mode.value = 'register'
  }

  const clearError = () => {
    errorMessage.value = ''
  }

  // Обработчики отправки форм
  const onLoginSubmit = async (values: { email: string; password: string }) => {
    try {
      clearError()
      // Используем user store для логина
      await userStore.login({
        email: values.email,
        password: values.password,
      })

      closeModal()
    } catch {
      errorMessage.value = 'Неверный email или пароль'
    }
  }

  const onRegisterSubmit = async (values: {
    email: string
    name: string
    surname: string
    password: string
    confirmPassword: string
  }) => {
    try {
      // Используем user store для регистрации
      await userStore.register({
        email: values.email,
        password: values.password,
        name: values.name,
        surname: values.surname,
      })

      // Сохраняем credentials для автоматического входа
      pendingLoginCredentials.value = {
        email: values.email,
        password: values.password,
      }

      mode.value = 'success'
    } catch {
      errorMessage.value = 'Пользователь с такой почтой уже существует'
    }
  }

  // Обработчик входа после успешной регистрации
  const handleSuccessLogin = async () => {
    if (pendingLoginCredentials.value) {
      try {
        // Используем user store для логина
        await userStore.login(pendingLoginCredentials.value)

        closeModal()
      } catch (error) {
        console.error('Ошибка автоматического входа:', error)
      }
    } else {
      console.error('Нет данных для автоматического входа')
    }
  }
</script>

<style scoped lang="scss">
  .v-enter-active,
  .v-leave-active {
    transition: opacity $transition-300;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }

  .auth {
    position: fixed;
    inset: 0 0 0 0;
    background: $color-black-50;
    @include flex-center;
    z-index: 1000;
    padding: 20px;

    &__wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 40px;
      background-color: $color-white;
      border-radius: 24px;
      padding: 64px 40px;
      width: 420px;

      @include vp-767 {
        gap: 32px;
        padding: 64px 20px 32px;
      }
    }

    &__close-btn {
      position: absolute;
      top: 0;
      right: -24px;
      transform: translateX(100%);
      @include flex-center;
      width: 48px;
      height: 48px;
      background-color: $color-white;
      padding: 0;
      border: none;
      border-radius: 50%;
      color: $color-black;
      cursor: pointer;
      transition:
        background-color $transition-300,
        color $transition-300;

      @include vp-767 {
        top: 8px;
        right: 56px;
      }

      &:hover,
      &:focus-visible {
        background-color: $color-cornflower-blue;
        color: $color-white;
        outline: none;
      }
    }

    &__logo {
      width: 157px;
      height: 35px;
      align-self: center;

      @include vp-767 {
        width: 132px;
        height: 30px;
      }
    }

    &__error-message {
      position: absolute;
      top: 119px;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      max-width: max-content;
      text-align: center;
      color: $color-salmon;
      font-weight: 400;
      font-size: 18px;
      line-height: 24px;

      @include vp-767 {
        top: 110px;
      }
    }
  }
</style>
