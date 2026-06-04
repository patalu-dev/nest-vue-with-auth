import { ref } from 'vue'

export const user = ref<any>(null)
export const token = ref<string | null>(null) // No longer reading from localStorage
export const refreshToken = ref<string | null>(null) // No longer reading from localStorage
export const lastActivity = ref<number>(Date.now())
export const isSessionExpired = ref<boolean>(false)

// Initialize user from localStorage (still needed for user data)
const storedUser = localStorage.getItem('user')
if (storedUser) {
  try {
    user.value = JSON.parse(storedUser)
  } catch (e) {
    localStorage.removeItem('user')
  }
}
