import { ref } from 'vue'

const STORAGE_KEY = 'zoniq-auth'

export const isAuthenticated = ref(
  typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true',
)

export function login() {
  isAuthenticated.value = true
  localStorage.setItem(STORAGE_KEY, 'true')
}

export function logout() {
  isAuthenticated.value = false
  localStorage.removeItem(STORAGE_KEY)
}
