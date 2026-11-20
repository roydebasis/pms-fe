<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Search, CreditCard, Wallet, TrendingUp, ArrowDownLeft, Landmark, SlidersHorizontal, X } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import StatCard from '@/components/StatCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import DetailDrawer from '@/components/DetailDrawer.vue'
import { currency, formatDate, initials } from '@/utils/format'

const { t } = useI18n()

const store = useAppStore()
const route = useRoute()
const search = ref(route.query.q || '')
watch(() => route.query.q, (value) => { search.value = value || '' })
const methodFilter = ref('all')
const selected = ref(null)

const advancedOpen = ref(false)
const residentQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const yearFilter = ref('all')
const monthFilter = ref('all')

const years = computed(() =>
  [...new Set(store.paymentsDetailed.map((p) => p.paid_at.slice(0, 4)))].sort().reverse(),
)
const months = computed(() => [
  ['01', t('payments.january')], ['02', t('payments.february')],
  ['03', t('payments.march')], ['04', t('payments.april')],
  ['05', t('payments.may')], ['06', t('payments.june')],
  ['07', t('payments.july')], ['08', t('payments.august')],
  ['09', t('payments.september')], ['10', t('payments.october')],
  ['11', t('payments.november')], ['12', t('payments.december')],
])
const presets = computed(() => [
  { key: 'all', label: t('payments.presetAllTime') },
  { key: 'thisMonth', label: t('payments.presetThisMonth') },
  { key: 'lastMonth', label: t('payments.presetLastMonth') },
  { key: 'thisYear', label: t('payments.presetThisYear') },
])

const activeFilterCount = computed(() =>
  [residentQuery, dateFrom, dateTo].filter((v) => v.value.trim()).length +
  (methodFilter.value !== 'all' ? 1 : 0) +
  (yearFilter.value !== 'all' ? 1 : 0) +
  (monthFilter.value !== 'all' ? 1 : 0),
)

function clearFilters() {
  search.value = ''
  methodFilter.value = 'all'
  residentQuery.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  yearFilter.value = 'all'
  monthFilter.value = 'all'
}

function applyPreset(preset) {
  dateFrom.value = ''
  dateTo.value = ''
  yearFilter.value = 'all'
  monthFilter.value = 'all'
  const now = new Date()
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  if (preset === 'thisMonth') {
    yearFilter.value = year
    monthFilter.value = month
  } else if (preset === 'lastMonth') {
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    yearFilter.value = String(last.getFullYear())
    monthFilter.value = String(last.getMonth() + 1).padStart(2, '0')
  } else if (preset === 'thisYear') {
    yearFilter.value = year
  }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const resident = residentQuery.value.trim().toLowerCase()
  return store.paymentsDetailed.filter((payment) => {
    const text = `${payment.tenant?.name || ''} ${payment.property?.name || ''} ${payment.unit?.unit_number || ''} ${payment.id}`.toLowerCase()
    const residentText = `${payment.tenant?.name || ''} ${payment.tenant?.email || ''} ${payment.tenant?.phone || ''}`.toLowerCase()
    const [year, month] = (payment.paid_at || '').split('-')
    return (!q || text.includes(q))
      && (!resident || residentText.includes(resident))
      && (methodFilter.value === 'all' || payment.method === methodFilter.value)
      && (!dateFrom.value || payment.paid_at >= dateFrom.value)
      && (!dateTo.value || payment.paid_at <= dateTo.value)
      && (yearFilter.value === 'all' || year === yearFilter.value)
      && (monthFilter.value === 'all' || month === monthFilter.value)
  })
})

const methods = computed(() => [...new Set(store.paymentsDetailed.map((p) => p.method))])

const summary = computed(() => {
  const payments = store.paymentsDetailed
  const total = payments.reduce((s, p) => s + p.amount, 0)
  const thisMonth = payments.filter((p) => p.paid_at.startsWith('2026-11')).reduce((s, p) => s + p.amount, 0)
  return {
    total,
    thisMonth,
    count: payments.length,
    average: payments.length ? Math.round(total / payments.length) : 0,
  }
})

const byMethod = computed(() => {
  const totals = {}
  store.paymentsDetailed.forEach((p) => { totals[p.method] = (totals[p.method] || 0) + p.amount })
  const total = Object.values(totals).reduce((a, b) => a + b, 0) || 1
  return Object.entries(totals).map(([name, amount]) => ({ name, amount, percent: Math.round(amount / total * 100) }))
})

const drawerFields = computed(() => {
  const p = selected.value
  if (!p) return []
  return [
    { label: t('payments.paymentId'), value: `#PAY-${String(p.id).padStart(4, '0')}` },
    { label: t('payments.resident'), value: p.tenant?.name || p.payer?.name || '—' },
    { label: t('payments.unit'), value: `${p.unit?.unit_number} · ${p.property?.name}` },
    { label: t('payments.invoice'), value: `#CHG-${String(p.charge?.id).padStart(4, '0')}` },
    { label: t('common.amount'), value: currency(p.amount), tone: 'success' },
    { label: t('payments.method'), value: p.method },
    { label: t('payments.paidOn'), value: formatDate(p.paid_at) },
    { label: t('common.status'), value: t(`status.${p.status}`), tone: 'success' },
  ]
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('payments.title') }}</h1>
        <p class="page-subtitle">{{ t('payments.subtitle') }}</p>
      </div>
      <span class="badge badge-success" style="height: 34px; padding: 0 12px"><span class="dot"></span> {{ t('payments.ledgerUpToDate') }}</span>
    </div>

    <div class="grid grid-4" style="margin-bottom: 18px">
      <StatCard :label="t('payments.statTotalReceived')" :value="currency(summary.total)" :icon="Wallet" tone="primary" :hint="t('payments.statTotalHint')" :sparkline="[40, 52, 49, 61, 70, 78]" />
      <StatCard :label="t('payments.statReceivedMonth')" :value="currency(summary.thisMonth)" :icon="ArrowDownLeft" tone="success" :delta="t('payments.currentPeriod')" delta-tone="info" />
      <StatCard :label="t('payments.statTransactions')" :value="summary.count" :icon="CreditCard" tone="violet" :hint="t('payments.statTransactionsHint')" />
      <StatCard :label="t('payments.statAverage')" :value="currency(summary.average)" :icon="TrendingUp" tone="info" :hint="t('payments.statAverageHint')" />
    </div>

    <section class="card card-pad" style="margin-bottom: 18px">
      <div class="row justify-between wrap gap-12" style="margin-bottom: 14px">
        <div>
          <h2 class="section-title">{{ t('payments.methodsTitle') }}</h2>
          <p class="muted" style="font-size: 12px; margin-top: 2px">{{ t('payments.methodsSubtitle') }}</p>
        </div>
        <span class="badge badge-success"><span class="dot"></span> {{ t('payments.successfulRate', { percent: 100 }) }}</span>
      </div>
      <div class="methods-grid">
        <div v-for="method in byMethod" :key="method.name" class="method-item">
          <div class="row justify-between" style="margin-bottom: 8px">
            <span class="row gap-8"><Landmark :size="15" class="muted" /> <strong style="font-size: 12.5px">{{ method.name }}</strong></span>
            <strong style="font-size: 13px">{{ method.percent }}%</strong>
          </div>
          <div class="progress"><span :style="{ width: `${method.percent}%` }"></span></div>
          <small class="subtle" style="display: block; margin-top: 6px">{{ t('payments.collectedAmount', { amount: currency(method.amount) }) }}</small>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <div class="search-field" style="flex: 1; min-width: 200px">
          <Search :size="15" />
          <input v-model="search" class="input" :placeholder="t('payments.searchPlaceholder')" />
        </div>
        <select v-model="methodFilter" class="select" style="width: 160px">
          <option value="all">{{ t('payments.allMethods') }}</option>
          <option v-for="method in methods" :key="method">{{ method }}</option>
        </select>
        <button class="btn btn-sm" :class="{ 'btn-primary': advancedOpen }" @click="advancedOpen = !advancedOpen">
          <SlidersHorizontal :size="15" /> {{ t('payments.filters') }}
          <span v-if="activeFilterCount" class="filter-count">{{ activeFilterCount }}</span>
        </button>
        <button v-if="activeFilterCount" class="btn btn-ghost btn-sm" @click="clearFilters"><X :size="14" /> {{ t('payments.clear') }}</button>
      </div>

      <div v-if="advancedOpen" class="filter-panel">
        <div class="filter-grid">
          <div class="field">
            <label class="field-label">{{ t('payments.filterResident') }}</label>
            <input v-model="residentQuery" class="input" :placeholder="t('payments.filterResidentPlaceholder')" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('payments.filterYear') }}</label>
            <select v-model="yearFilter" class="select">
              <option value="all">{{ t('payments.allYears') }}</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">{{ t('payments.filterMonth') }}</label>
            <select v-model="monthFilter" class="select">
              <option value="all">{{ t('payments.allMonths') }}</option>
              <option v-for="[value, label] in months" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">{{ t('payments.paidFrom') }}</label>
            <input v-model="dateFrom" class="input" type="date" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('payments.paidTo') }}</label>
            <input v-model="dateTo" class="input" type="date" />
          </div>
        </div>
        <div class="row gap-8 wrap preset-row">
          <span class="subtle" style="font-size: 11.5px">{{ t('payments.quickRanges') }}</span>
          <button v-for="preset in presets" :key="preset.key" class="btn btn-sm" @click="applyPreset(preset.key)">{{ preset.label }}</button>
        </div>
      </div>

      <div v-if="filtered.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('payments.colPayment') }}</th>
              <th>{{ t('payments.resident') }}</th>
              <th>{{ t('payments.colUnitProperty') }}</th>
              <th>{{ t('payments.colMethod') }}</th>
              <th>{{ t('payments.paidOn') }}</th>
              <th class="num">{{ t('common.amount') }}</th>
              <th>{{ t('common.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filtered" :key="payment.id" class="clickable" @click="selected = payment">
              <td class="muted">#PAY-{{ String(payment.id).padStart(4, '0') }}</td>
              <td>
                <div class="row gap-8">
                  <span class="avatar avatar-sm" :style="{ background: payment.tenant?.avatar_color || 'var(--avatar-fallback)' }">{{ initials(payment.tenant?.name || payment.payer?.name || '?') }}</span>
                  <strong>{{ payment.tenant?.name || payment.payer?.name }}</strong>
                </div>
              </td>
              <td>
                <div class="col"><strong>{{ payment.unit?.unit_number }}</strong><small class="muted">{{ payment.property?.name }}</small></div>
              </td>
              <td>
                <span class="row gap-6"><Landmark :size="14" class="subtle" /> {{ payment.method }}</span>
              </td>
              <td class="muted">{{ formatDate(payment.paid_at) }}</td>
              <td class="num"><strong>{{ currency(payment.amount) }}</strong></td>
              <td><StatusBadge :status="payment.status" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon"><CreditCard :size="20" /></div>
        <strong>{{ t('payments.emptyTitle') }}</strong>
        <span>{{ t('payments.emptyHint') }}</span>
      </div>
      <div class="table-footer">
        <span>{{ t('payments.showing', { shown: filtered.length, total: store.paymentsDetailed.length }) }}</span>
        <span>{{ t('payments.inResults', { amount: currency(filtered.reduce((s, p) => s + p.amount, 0)) }) }}</span>
      </div>
    </section>

    <DetailDrawer
      :open="!!selected"
      :eyebrow="t('payments.drawerEyebrow')"
      :title="selected ? t('payments.receiptTitle', { id: String(selected.id).padStart(4, '0') }) : ''"
      :subtitle="selected ? t('payments.receivedSubtitle', { date: formatDate(selected.paid_at) }) : ''"
      @close="selected = null"
    >
      <template v-if="selected" #default>
        <div class="receipt-amount">
          <span class="muted" style="font-size: 12px">{{ t('payments.amountPaid') }}</span>
          <strong>{{ currency(selected.amount) }}</strong>
          <StatusBadge :status="selected.status" />
        </div>
        <div class="detail-list">
          <div v-for="field in drawerFields" :key="field.label" class="detail-row">
            <span class="detail-key">{{ field.label }}</span>
            <span class="detail-val" :style="field.tone ? { color: `var(--${field.tone})` } : null">{{ field.value }}</span>
          </div>
        </div>
      </template>
      <template #footer><button class="btn" @click="selected = null">{{ t('common.close') }}</button></template>
    </DetailDrawer>
  </div>
</template>

<style scoped>
.methods-grid { display: flex; flex-wrap: wrap; gap: 18px; }
.method-item { flex: 1 1 180px; min-width: 0; }
.receipt-amount { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 20px; margin-bottom: 16px; border-radius: 12px; background: var(--success-soft); }
.receipt-amount strong { font-size: 30px; letter-spacing: -0.04em; color: var(--success); }
</style>
