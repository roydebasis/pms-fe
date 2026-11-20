import { createI18n } from 'vue-i18n'
import en from './locales/en'
import bn from './locales/bn'

const STORAGE_KEY = 'zoniq-locale'
export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'bn', label: 'বাংলা', short: 'বাং' },
]

function initialLocale() {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  return SUPPORTED_LOCALES.some((l) => l.code === saved) ? saved : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: 'en',
  messages: { en, bn },
  missingWarn: false,
  fallbackWarn: false,
})

export function setLocale(code) {
  if (!SUPPORTED_LOCALES.some((l) => l.code === code)) return
  i18n.global.locale.value = code
  localStorage.setItem(STORAGE_KEY, code)
  document.documentElement.lang = code === 'bn' ? 'bn' : 'en'
}

export function applyStoredLocale() {
  document.documentElement.lang = i18n.global.locale.value === 'bn' ? 'bn' : 'en'
}
