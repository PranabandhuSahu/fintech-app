import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT to every request if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize errors into a readable message
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong. Please try again.'

    if (error.response) {
      const data = error.response.data
      if (data?.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
        message = Object.values(data.fieldErrors).join(' ')
      } else if (data?.message) {
        message = data.message
      } else if (error.response.status === 401) {
        message = 'Your session has expired. Please log in again.'
      }
      // Auto-logout on auth failure (but not on the login/register calls themselves)
      const url = error.config?.url || ''
      if (error.response.status === 401 && !url.includes('/api/auth/')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login') {
          window.location.assign('/login')
        }
      }
    } else if (error.request) {
      message = 'Cannot reach the server. Please make sure the backend is running.'
    }

    error.userMessage = message
    return Promise.reject(error)
  }
)

export const closeAccount = (accountId, destinationAccountId) =>
  apiClient.post('/api/close-account', {
    accountId,
    destinationAccountId
  })

export default apiClient
