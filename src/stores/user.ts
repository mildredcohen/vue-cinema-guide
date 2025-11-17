import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authAPI } from '@/api/auth'
import type { User, LoginData, RegisterData } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // state
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // getters
  const userFullName = () => {
    if (user.value) {
      return `${user.value.name} ${user.value.surname}`
    }
    return ''
  }

  const userInitials = () => {
    if (user.value) {
      return `${user.value.name[0]}${user.value.surname[0]}`.toUpperCase()
    }
    return ''
  }

  const userSurname = () => {
    if (user.value) {
      return `${user.value.surname}`
    }
    return ''
  }

  // actions
  const setUser = (userData: User) => {
    user.value = userData
    isAuthenticated.value = true
  }

  const clearUser = () => {
    user.value = null
    isAuthenticated.value = false
  }

  const login = async (credentials: LoginData) => {
    isLoading.value = true
    try {
      const result = await authAPI.login(credentials)

      // После успешного логина загружаем профиль
      await loadUserProfile()
      return result
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterData) => {
    isLoading.value = true
    try {
      const result = await authAPI.register(userData)

      return result
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const loadUserProfile = async () => {
    isLoading.value = true
    try {
      const userData = await authAPI.getProfile()
      setUser(userData)
    } catch (error) {
      clearUser()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()

      // чтобы при анимации выхода данные еще оставались
      setTimeout(() => {
        clearUser()
      }, 300)
    } catch (error) {
      throw error
    }
  }

  // Проверяем авторизацию при загрузке приложения
  const checkAuth = async () => {
    try {
      await loadUserProfile()
    } catch {
      // Если не авторизован, просто очищаем состояние
      clearUser()
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,

    // Getters
    userFullName,
    userInitials,
    userSurname,

    // Actions
    setUser,
    clearUser,
    login,
    register,
    loadUserProfile,
    logout,
    checkAuth,
  }
})
