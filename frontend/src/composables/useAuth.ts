import { h, computed } from 'vue'
import router from '@/router' 
import { API_BASE_URL } from '@/lib/api-config'
import { toast } from 'vue-sonner'
import { XCircle } from 'lucide-vue-next'
import { user, token, lastActivity, isSessionExpired } from './authState'

const INACTIVITY_LIMIT = 1 * 60 * 1000 // 30 minutes

export function useAuth() {
  const setAuth = (newToken: string, newUser: any) => {
    token.value = newToken
    user.value = newUser
    isSessionExpired.value = false // Reset expiry state on new login
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    resetInactivityTimer()
  }

  const clearAuth = () => {
    const currentRoute = router.currentRoute.value
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('lastActivity')
    
    console.log('Logging out, current path:', currentRoute.fullPath)
    
    router.push({ name: 'login' })
  }

  const login = async (username: string, password: string, redirectPath?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại')
      }

      setAuth(data.access_token, data.user)

      // Xử lý chuyển hướng sau khi đăng nhập thành công
      let target = redirectPath || (router.currentRoute.value.query.redirect as string) || '/dashboard'
      
      // Nếu target vẫn là trang login hoặc trang chủ thì mặc định về dashboard
      if (target === '/' || target === '/login' || target.startsWith('/?')) {
        target = '/dashboard'
      }
      
      router.push(target)
      
      return true
    } catch (err: any) {
      toast('Lỗi', {
        description: err.message,
        icon: h(XCircle, { class: 'text-red-500 w-5 h-5' }),
        position: 'top-center',
      })
      return false
    }
  }

  const logout = () => {
    clearAuth()
  }

  const resetInactivityTimer = () => {
    if (isSessionExpired.value) return
    const now = Date.now()
    lastActivity.value = now
    localStorage.setItem('lastActivity', String(now))
  }

  const checkInactivity = () => {
    if (token.value && Date.now() - lastActivity.value > INACTIVITY_LIMIT) {
      isSessionExpired.value = true
    }
  }

  const can = (action: string, subject: string, data?: any) => {
    if (!user.value) return false
    
    try {
      // Helper to check conditions
      const checkConditions = (conditions: any, data: any) => {
        if (!conditions) return true
        if (!data) return false
        
        try {
          const condObj = typeof conditions === 'string' ? JSON.parse(conditions) : conditions
          for (const key in condObj) {
            if (data[key] !== condObj[key]) return false
          }
          return true
        } catch (e) {
          return false
        }
      }

      // Flatten all permissions from all roles
      let allPermissions: any[] = []
      
      if (user.value.roles && Array.isArray(user.value.roles)) {
        allPermissions = user.value.roles.flatMap((role: any) => 
          Array.isArray(role.permissions) ? role.permissions : []
        )
      }

      // Fallback nếu permissions nằm trực tiếp trong user
      if (allPermissions.length === 0 && Array.isArray(user.value.permissions)) {
        allPermissions = user.value.permissions
      }

      // 1. Check for ANY 'cannot' (inverted) permissions that match
      const isForbidden = allPermissions.some((p: any) => {
        if (!p.inverted) return false
        const actionMatch = (p.action === 'manage' || p.action === action || (p.action.includes(',') && p.action.split(',').map((a: string) => a.trim()).includes(action)))
        const subjectMatch = (p.subject === 'all' || p.subject === subject)
        return actionMatch && subjectMatch && checkConditions(p.conditions, data)
      })

      if (isForbidden) {
        return false
      }

      // 2. Check for ANY 'can' (regular) permissions that match
      const isAllowed = allPermissions.some((p: any) => {
        if (p.inverted) return false
        const actionMatch = (p.action === 'manage' || p.action === action || (p.action.includes(',') && p.action.split(',').map((a: string) => a.trim()).includes(action)))
        const subjectMatch = (p.subject === 'all' || p.subject === subject)
        return actionMatch && subjectMatch && checkConditions(p.conditions, data)
      })

      if (isAllowed) return true

      return false
    } catch (e) {
      console.error('Permission check error:', e)
      return false
    }
  }

  return {
    user,
    token,
    login,
    logout,
    can,
    checkInactivity,
    resetInactivityTimer,
    isSessionExpired,
    isAuthenticated: computed(() => !!token.value)
  }
}

// Sync across tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'token') {
    token.value = event.newValue
  }
  if (event.key === 'user') {
    if (event.newValue) {
      try {
        user.value = JSON.parse(event.newValue)
      } catch (e) {
        user.value = null
      }
    } else {
      user.value = null
    }
  }
})
