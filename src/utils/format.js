export const currency = (value, opts = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    ...opts,
  }).format(Number(value) || 0)

export const compactCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value) || 0)

import { i18n } from '@/i18n'

export const dateLocale = () => (i18n.global.locale.value === 'bn' ? 'bn-BD' : 'en-US')

export const formatDate = (value, opts = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!value) return '—'
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat(dateLocale(), opts).format(d)
}

export const formatShortDate = (value) => formatDate(value, { month: 'short', day: 'numeric' })

export const relativeDate = (value) => {
  if (!value) return '—'
  const then = new Date(`${value}T00:00:00`).getTime()
  const days = Math.round((Date.now() - then) / 86400000)
  if (days <= 0) return i18n.global.t('relative.today')
  if (days === 1) return i18n.global.t('relative.yesterday')
  if (days < 7) return i18n.global.t('relative.daysAgo', { count: days })
  if (days < 30) return i18n.global.t('relative.weeksAgo', { count: Math.floor(days / 7) })
  return formatShortDate(value)
}

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

export const titleCase = (value = '') =>
  value
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const formatTodayLong = () =>
  new Intl.DateTimeFormat(dateLocale(), { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
