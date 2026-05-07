import { useAuth } from '@/composables/useAuth'
import { API_BASE_URL } from './api-config'

export async function request(path: string, options: RequestInit = {}) {
  const { token, logout, refreshAuthToken, resetInactivityTimer } = useAuth()
  
  const headers = new Headers(options.headers || {})
  if (token.value) {
    headers.set('Authorization', `Bearer ${token.value}`)
  }
  
  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  })

  // Reset timer on active response
  if (response.ok) {
    resetInactivityTimer()
  }
  
  if (response.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
    const refreshed = await refreshAuthToken()
    
    if (refreshed) {
      // Retry the original request with the new token
      const retryHeaders = new Headers(options.headers || {})
      if (token.value) {
        retryHeaders.set('Authorization', `Bearer ${token.value}`)
      }
      
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: retryHeaders
      })
      
      if (response.ok) {
        return response
      }
    }
    
    logout()
    throw new Error('Phiên làm việc hết hạn hoặc chưa xác thực')
  }
  
  return response
}
