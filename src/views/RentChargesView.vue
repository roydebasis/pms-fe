<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Search, Receipt, Wallet, AlertTriangle, CheckCircle2, Plus, CreditCard, SlidersHorizontal, X } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import StatCard from '@/components/StatCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import DetailDrawer from '@/components/DetailDrawer.vue'
import BaseModal from '@/components/BaseModal.vue'
import { currency, formatDate, initials } from '@/utils/format'
import { notify } from '@/composables/useUi'

const { t } = useI18n()

const store = useAppStore()
const route = useRoute()

const search = ref(route.query.q || '')
watch(() => route.query.q, (value) => { search.value = value || '' })
const statusFilter = ref('all')
const periodFilter = ref('all')
const selected = ref(null)
const showPayment = ref(false)
const paymentCharge = ref(null)
const paymentForm = ref({ amount: 0, method: 'Bank transfer' })

const advancedOpen = ref(false)
const residentQuery = ref('')
const propertyFilter = ref('all')
const dueFrom = ref('')
const dueTo = ref('')
const amountMin = ref('')
const amountMax = ref('')
const yearFilter = ref('all')
const monthFilter = ref('all')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const resident = residentQuery.value.trim().toLowerCase()
  const min = amountMin.value === '' ? null : Number(amountMin.value)
  const max = amountMax.value === '' ? null : Number(amountMax.value)
  return store.chargesDetailed.filter((charge) => {
    const text = `${charge.tenant?.name || ''} ${charge.property?.name || ''} ${charge.unit?.unit_number || ''} ${charge.id}`.toLowerCase()
    const residentText = `${charge.tenant?.name || ''} ${charge.tenant?.email || ''} ${charge.tenant?.phone || ''}`.toLowerCase()
    const [year, month] = (charge.due_date || '').split('-')
    return (!q || text.includes(q))
      && (statusFilter.value === 'all' || charge.status === statusFilter.value)
      && (periodFilter.value === 'all' || charge.due_date.startsWith(periodFilter.value))
      && (!resident || residentText.includes(resident))
      && (propertyFilter.value === 'all' || String(charge.property?.id) === propertyFilter.value)
      && (!dueFrom.value || charge.due_date >= dueFrom.value)
      && (!dueTo.value || charge.due_date <= dueTo.value)
      && (min === null || charge.amount_due >= min)
      && (max === null || charge.amount_due <= max)
      && (yearFilter.value === 'all' || year === yearFilter.value)
      && (monthFilter.value === 'all' || month === monthFilter.value)
  })
})

const periods = computed(() => [...new Set(store.chargesDetailed.map((c) => c.due_date.slice(0, 7)))])

const properties = computed(() => store.orgProperties)
const years = computed(() =>
  [...new Set(store.chargesDetailed.map((c) => c.due_date.slice(0, 4)))].sort().reverse(),
)
const months = computed(() => [
  ['01', t('rentCharges.january')], ['02', t('rentCharges.february')],
  ['03', t('rentCharges.march')], ['04', t('rentCharges.april')],
  ['05', t('rentCharges.may')], ['06', t('rentCharges.june')],
  ['07', t('rentCharges.july')], ['08', t('rentCharges.august')],
  ['09', t('rentCharges.september')], ['10', t('rentCharges.october')],
  ['11', t('rentCharges.november')], ['12', t('rentCharges.december')],
])
const presets = computed(() => [
  { key: 'all', label: t('rentCharges.presetAll') },
  { key: 'thisMonth', label: t('rentCharges.presetThisMonth') },
  { key: 'lastMonth', label: t('rentCharges.presetLastMonth') },
  { key: 'thisYear', label: t('rentCharges.presetThisYear') },
])

const activeFilterCount = computed(() =>
  [residentQuery, dueFrom, dueTo, amountMin, amountMax].filter((v) => v.value !== '' && v.value !== null && v.value !== undefined).length +
  (statusFilter.value !== 'all' ? 1 : 0) +
  (periodFilter.value !== 'all' ? 1 : 0) +
  (propertyFilter.value !== 'all' ? 1 : 0) +
  (yearFilter.value !== 'all' ? 1 : 0) +
  (monthFilter.value !== 'all' ? 1 : 0),
)

function clearFilters() {
  search.value = ''
  statusFilter.value = 'all'
  periodFilter.value = 'all'
  residentQuery.value = ''
  propertyFilter.value = 'all'
  dueFrom.value = ''
  dueTo.value = ''
  amountMin.value = ''
  amountMax.value = ''
  yearFilter.value = 'all'
  monthFilter.value = 'all'
}

function applyPreset(preset) {
  dueFrom.value = ''
  dueTo.value = ''
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

const summary = computed(() => {
  const charges = store.chargesDetailed
  const paid = charges.filter((c) => c.status === 'paid')
  const outstanding = charges.filter((c) => c.status !== 'paid')
  return {
    billed: charges.reduce((s, c) => s + c.amount_due, 0),
    collected: paid.reduce((s, c) => s + c.amount_due, 0),
    outstanding: outstanding.reduce((s, c) => s + c.amount_due, 0),
    overdue: outstanding.filter((c) => c.status === 'overdue').length,
  }
})

const drawerFields = computed(() => {
  const c = selected.value
  if (!c) return []
  return [
    { label: t('rentCharges.invoiceId'), value: `#CHG-${String(c.id).padStart(4, '0')}` },
    { label: t('rentCharges.resident'), value: c.tenant?.name || '—' },
    { label: t('rentCharges.unit'), value: `${c.unit?.unit_number} · ${c.property?.name}` },
    { label: t('rentCharges.dueDate'), value: formatDate(c.due_date) },
    { label: t('rentCharges.amountDue'), value: currency(c.amount_due), tone: 'primary-text' },
    { label: t('common.status'), value: t(`status.${c.status}`) },
    { label: t('rentCharges.lease'), value: c.lease ? `#${c.lease.id}` : '—' },
    { label: t('rentCharges.payment'), value: c.payment ? `${currency(c.payment.amount)} · ${formatDate(c.payment.paid_at)}` : t('rentCharges.notReceived') },
  ]
})

function openPayment(charge) {
  paymentCharge.value = charge
  paymentForm.value = { amount: charge.amount_due, method: 'Bank transfer' }
  selected.value = null
  showPayment.value = true
}
function submitPayment() {
  if (!paymentCharge.value) return
  store.recordPayment(paymentCharge.value.id, paymentForm.value.amount, paymentForm.value.method)
  showPayment.value = false
  paymentCharge.value = null
  notify(t('rentCharges.paymentRecorded'))
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('rentCharges.title') }}</h1>
        <p class="page-subtitle">{{ t('rentCharges.subtitle') }}</p>
      </div>
      <button class="btn" @click="statusFilter = 'overdue'"><AlertTriangle :size="16" /> {{ t('rentCharges.viewOverdue') }}</button>
    </div>

    <div class="grid grid-4" style="margin-bottom: 18px">
      <StatCard :label="t('rentCharges.statBilled')" :value="currency(summary.billed)" :icon="Receipt" tone="primary" :hint="t('rentCharges.statBilledHint')" />
      <StatCard :label="t('rentCharges.statCollected')" :value="currency(summary.collected)" :icon="CheckCircle2" tone="success" :delta="t('rentCharges.collectedPercent', { percent: summary.billed ? Math.round(summary.collected / summary.billed * 100) : 0 })" />
      <StatCard :label="t('rentCharges.statOutstanding')" :value="currency(summary.outstanding)" :icon="Wallet" tone="warning" :hint="t('rentCharges.overdueCount', { count: summary.overdue })" />
      <StatCard :label="t('rentCharges.statOverdue')" :value="summary.overdue" :icon="AlertTriangle" tone="danger" :hint="t('rentCharges.overdueHint')" />
    </div>

    <div class="card">
      <div class="toolbar">
        <div class="search-field" style="flex: 1; min-width: 220px">
          <Search :size="15" />
          <input v-model="search" class="input" :placeholder="t('rentCharges.searchPlaceholder')" />
        </div>
        <select v-model="statusFilter" class="select" style="width: 145px">
          <option value="all">{{ t('rentCharges.allStatuses') }}</option>
          <option value="paid">{{ t('status.paid') }}</option>
          <option value="pending">{{ t('status.pending') }}</option>
          <option value="overdue">{{ t('status.overdue') }}</option>
        </select>
        <select v-model="periodFilter" class="select" style="width: 145px">
          <option value="all">{{ t('rentCharges.allPeriods') }}</option>
          <option v-for="period in periods" :key="period" :value="period">{{ period }}</option>
        </select>
        <button class="btn btn-sm" :class="{ 'btn-primary': advancedOpen }" @click="advancedOpen = !advancedOpen">
          <SlidersHorizontal :size="15" /> {{ t('common.filters') }}
          <span v-if="activeFilterCount" class="filter-count">{{ activeFilterCount }}</span>
        </button>
        <button v-if="activeFilterCount" class="btn btn-ghost btn-sm" @click="clearFilters"><X :size="14" /> {{ t('common.clearFilters') }}</button>
      </div>

      <div v-if="advancedOpen" class="filter-panel">
        <div class="filter-grid">
          <div class="field">
            <label class="field-label">{{ t('rentCharges.filterResident') }}</label>
            <input v-model="residentQuery" class="input" :placeholder="t('rentCharges.filterResidentPlaceholder')" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('rentCharges.filterProperty') }}</label>
            <select v-model="propertyFilter" class="select">
              <option value="all">{{ t('rentCharges.allProperties') }}</option>
              <option v-for="property in properties" :key="property.id" :value="String(property.id)">{{ property.name }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.from') }} · {{ t('rentCharges.filterDueDate') }}</label>
            <input v-model="dueFrom" class="input" type="date" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.to') }} · {{ t('rentCharges.filterDueDate') }}</label>
            <input v-model="dueTo" class="input" type="date" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('rentCharges.filterAmount') }}</label>
            <div class="row gap-8">
              <input v-model="amountMin" class="input" type="number" min="0" :placeholder="t('common.min')" />
              <input v-model="amountMax" class="input" type="number" min="0" :placeholder="t('common.max')" />
            </div>
          </div>
          <div class="field">
            <label class="field-label">{{ t('rentCharges.filterYear') }}</label>
            <select v-model="yearFilter" class="select">
              <option value="all">{{ t('rentCharges.allYears') }}</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">{{ t('rentCharges.filterMonth') }}</label>
            <select v-model="monthFilter" class="select">
              <option value="all">{{ t('rentCharges.allMonths') }}</option>
              <option v-for="[value, label] in months" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
        </div>
        <div class="row gap-8 wrap preset-row">
          <span class="subtle" style="font-size: 11.5px">{{ t('common.quickRanges') }}</span>
          <button v-for="preset in presets" :key="preset.key" class="btn btn-sm" @click="applyPreset(preset.key)">{{ preset.label }}</button>
        </div>
      </div>

      <div v-if="filtered.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('rentCharges.colInvoice') }}</th>
              <th>{{ t('rentCharges.resident') }}</th>
              <th>{{ t('rentCharges.colUnitProperty') }}</th>
              <th>{{ t('rentCharges.dueDate') }}</th>
              <th class="num">{{ t('common.amount') }}</th>
              <th>{{ t('common.status') }}</th>
              <th>{{ t('rentCharges.payment') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="charge in filtered" :key="charge.id" class="clickable" @click="selected = charge">
              <td class="muted">#CHG-{{ String(charge.id).padStart(4, '0') }}</td>
              <td>
                <div class="row gap-8">
                  <span class="avatar avatar-sm" :style="{ background: charge.tenant?.avatar_color || 'var(--avatar-fallback)' }">{{ initials(charge.tenant?.name || '?') }}</span>
                  <strong>{{ charge.tenant?.name || t('rentCharges.unassigned') }}</strong>
                </div>
              </td>
              <td>
                <div class="col"><strong>{{ charge.unit?.unit_number }}</strong><small class="muted">{{ charge.property?.name }}</small></div>
              </td>
              <td class="muted">{{ formatDate(charge.due_date) }}</td>
              <td class="num"><strong>{{ currency(charge.amount_due) }}</strong></td>
              <td><StatusBadge :status="charge.status" /></td>
              <td>
                <span v-if="charge.payment" class="row gap-6 muted" style="font-size: 12px"><CheckCircle2 :size="14" class="success-icon" /> {{ formatDate(charge.payment.paid_at, { month: 'short', day: 'numeric' }) }}</span>
                <button v-else class="btn btn-sm btn-primary" @click.stop="openPayment(charge)"><Plus :size="13" /> {{ t('rentCharges.record') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon"><Receipt :size="20" /></div>
        <strong>{{ t('rentCharges.emptyTitle') }}</strong>
        <span>{{ t('rentCharges.emptyHint') }}</span>
      </div>

      <div class="table-footer">
        <span>{{ t('rentCharges.showing', { shown: filtered.length, total: store.chargesDetailed.length }) }}</span>
        <span class="row gap-6"><CreditCard :size="13" /> {{ t('rentCharges.inResults', { amount: currency(filtered.reduce((s, c) => s + c.amount_due, 0)) }) }}</span>
      </div>
    </div>

    <DetailDrawer
      :open="!!selected"
      :eyebrow="t('rentCharges.drawerEyebrow')"
      :title="selected ? t('rentCharges.invoiceTitle', { id: String(selected.id).padStart(4, '0') }) : ''"
      :subtitle="selected ? t('rentCharges.dueSubtitle', { date: formatDate(selected.due_date) }) : ''"
      @close="selected = null"
    >
      <template v-if="selected" #default>
        <div class="detail-list">
          <div v-for="field in drawerFields" :key="field.label" class="detail-row">
            <span class="detail-key">{{ field.label }}</span>
            <span class="detail-val" :style="field.tone ? { color: `var(--${field.tone})` } : null">{{ field.value }}</span>
          </div>
        </div>
        <div v-if="selected.status !== 'paid'" class="info-banner">
          <AlertTriangle :size="17" />
          <div>
            <strong>{{ selected.status === 'overdue' ? t('rentCharges.paymentOverdue') : t('rentCharges.awaitingPayment') }}</strong>
            <span>{{ t('rentCharges.dueFrom', { amount: currency(selected.amount_due), name: selected.tenant?.name }) }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn" @click="selected = null">{{ t('common.close') }}</button>
        <button v-if="selected?.status !== 'paid'" class="btn btn-primary" @click="openPayment(selected)">
          <CreditCard :size="14" /> {{ t('rentCharges.recordPayment') }}
        </button>
      </template>
    </DetailDrawer>

    <BaseModal :open="showPayment" :title="t('rentCharges.modalTitle')" :subtitle="t('rentCharges.modalSubtitle')" @close="showPayment = false">
      <div class="form-grid">
        <div class="field"><label class="field-label">{{ t('common.amount') }}</label><input v-model.number="paymentForm.amount" class="input" type="number" min="0" /></div>
        <div class="field">
          <label class="field-label">{{ t('rentCharges.paymentMethod') }}</label>
          <select v-model="paymentForm.method" class="select"><option>Bank transfer</option><option>Card</option><option>Cash</option><option>Check</option></select>
        </div>
      </div>
      <p class="muted" style="font-size: 12px; margin-top: 14px">{{ t('rentCharges.modalHint') }}</p>
      <template #footer>
        <button class="btn" @click="showPayment = false">{{ t('common.cancel') }}</button>
        <button class="btn btn-primary" @click="submitPayment"><CheckCircle2 :size="15" /> {{ t('rentCharges.confirmPayment') }}</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.success-icon { color: var(--success); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.info-banner { display: flex; align-items: center; gap: 11px; margin-top: 20px; padding: 12px; border-radius: 10px; background: var(--warning-soft); color: var(--warning); }
.info-banner > div { display: flex; flex-direction: column; }
.info-banner strong { font-size: 12.5px; }
.info-banner span { font-size: 11px; }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
</style>
