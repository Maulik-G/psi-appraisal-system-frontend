import axios from 'axios'

const api = axios.create({
  baseURL: 'https://2dbc-13-127-254-60.ngrok-free.app',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('psi_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('psi_token')
      localStorage.removeItem('psi_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
