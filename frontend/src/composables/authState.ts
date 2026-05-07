import { ref } from 'vue'

export const user = ref<any>(null)
export const token = ref<string | null>(localStorage.getItem('token'))
export const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
export const lastActivity = ref<number>(
  parseInt(localStorage.getItem('lastActivity') || String(Date.now()), 10)
)
export const isSessionExpired = ref<boolean>(false)

// Initialize from local storage
const storedUser = localStorage.getItem('user')
if (storedUser) {
  try {
    user.value = JSON.parse(storedUser)
  } catch (e) {
    localStorage.removeItem('user')
  }
}
