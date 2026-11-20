import { ref } from 'vue'

export const toastStack = ref([])

let toastId = 0

export function notify(message, type = 'success') {
  const id = ++toastId
  toastStack.value.push({ id, message, type })
  setTimeout(() => {
    toastStack.value = toastStack.value.filter((t) => t.id !== id)
  }, 3200)
}

const storedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('zoniq-theme') : null
export const theme = ref(storedTheme || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))

let bodyLockCount = 0
export function lockBody() {
  bodyLockCount += 1
  document.body.style.overflow = 'hidden'
}
export function unlockBody() {
  bodyLockCount = Math.max(0, bodyLockCount - 1)
  if (bodyLockCount === 0) document.body.style.overflow = ''
}

export function applyTheme() {
  document.documentElement.dataset.mode = theme.value
}

export function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('zoniq-theme', theme.value)
  applyTheme()
}
