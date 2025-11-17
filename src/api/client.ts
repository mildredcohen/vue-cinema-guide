import axios from 'axios'

const API_BASE_URL = 'https://cinemaguide.skillbox.cc'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)
