<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, FileText, ArrowUpRight, TrendingUp, Clock, AlertCircle, SlidersHorizontal, X } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import StatusBadge from '@/components/StatusBadge.vue'
import DetailDrawer from '@/components/DetailDrawer.vue'
import { currency, formatDate, initials, titleCase } from '@/utils/format'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useAppStore()
const router = useRouter()
const route = useRoute()

const search = ref(route.query.q || '')
watch(() => route.query.q, (value) => { search.value = value || '' })
const modeFilter = ref('all')
const statusFilter = ref('all')
const selected = ref(null)

const advancedOpen = ref(false)
const rentMin = ref('')
const rentMax = ref('')
const incrementFrom = ref('')
const incrementTo = ref('')
const startFrom = ref('')
const startTo = ref('')
const endFrom = ref('')
const endTo = ref('')
const tenantQuery = ref('')
const propertyFilter = ref('all')
const outstandingOnly = ref(false)

const activeFilterCount = computed(() =>
  [rentMin, rentMax, incrementFrom, incrementTo, startFrom, startTo, endFrom, endTo, tenantQuery].filter((v) => v.value !== '' && v.value !== null && v.value !== undefined).length +
  (propertyFilter.value !== 'all' ? 1 : 0) +
  (modeFilter.value !== 'all' ? 1 : 0) +
  (statusFilter.value !== 'all' ? 1 : 0) +
  (outstandingOnly.value ? 1 : 0),
)

function clearFilters() {
  search.value = ''
  modeFilter.value = 'all'
  statusFilter.value = 'all'
  rentMin.value = ''
  rentMax.value = ''
  incrementFrom.value = ''
  incrementTo.value = ''
  startFrom.value = ''
  startTo.value = ''
  endFrom.value = ''
  endTo.value = ''
  tenantQuery.value = ''
  propertyFilter.value = 'all'
  outstandingOnly.value = false
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const tenant = tenantQuery.value.trim().toLowerCase()
  const minRent = rentMin.value === '' ? null : Number(rentMin.value)
  const maxRent = rentMax.value === '' ? null : Number(rentMax.value)
  return store.leasesDetailed.filter((lease) => {
    const text = `${lease.tenant?.name || ''} ${lease.unit?.unit_number || ''} ${lease.property?.name || ''}`.toLowerCase()
    const tenantText = `${lease.tenant?.name || ''} ${lease.tenant?.email || ''} ${lease.tenant?.phone || ''}`.toLowerCase()
    const nextIncrement = lease.next_increment_due_date || ''
    return (!q || text.includes(q))
      && (!tenant || tenantText.includes(tenant))
      && (modeFilter.value === 'all' || lease.rent_increment_mode === modeFilter.value)
      && (statusFilter.value === 'all' || lease.status === statusFilter.value)
      && (minRent === null || lease.monthly_rent >= minRent)
      && (maxRent === null || lease.monthly_rent <= maxRent)
      && (!incrementFrom.value || nextIncrement >= incrementFrom.value)
      && (!incrementTo.value || nextIncrement <= incrementTo.value)
      && (!startFrom.value || lease.start_date >= startFrom.value)
      && (!startTo.value || lease.start_date <= startTo.value)
      && (!endFrom.value || lease.end_date >= endFrom.value)
      && (!endTo.value || lease.end_date <= endTo.value)
      && (propertyFilter.value === 'all' || lease.property?.id === Number(propertyFilter.value))
      && (!outstandingOnly.value || lease.outstanding)
  })
})

const modeLabel = (mode) => ({
  fixed_percent: t('leases.modeFixed'), cpi: t('leases.modeCpi'), none: t('leases.modeNone'),
}[mode] || titleCase(mode))

const revisions = computed(() =>
  selected.value
    ? store.lease_rent_revisions.filter((r) => r.lease_id === selected.value.id).slice().sort((a, b) => b.effective_from.localeCompare(a.effective_from))
    : [],
)
const proposal = computed(() =>
  selected.value
    ? store.rent_increment_proposals.find((p) => p.lease_id === selected.value.id && p.status === 'pending')
    : null,
)
const charges = computed(() =>
  selected.value
    ? store.rent_charges.filter((c) => c.lease_id === selected.value.id).slice().sort((a, b) => b.due_date.localeCompare(a.due_date)).slice(0, 4)
    : [],
)

const drawerFields = computed(() => {
  const l = selected.value
  if (!l) return []
  return [
    { label: t('leases.fieldTenant'), value: l.tenant?.name || '—' },
    { label: t('leases.fieldUnit'), value: `${l.unit?.unit_number} · ${l.property?.name}` },
    { label: t('leases.fieldMonthlyRent'), value: currency(l.monthly_rent), tone: 'primary-text' },
    { label: t('leases.fieldIncrementMode'), value: modeLabel(l.rent_increment_mode) },
    { label: t('leases.fieldIncrementPercent'), value: l.increment_percent ? `${l.increment_percent}%` : '—' },
    { label: t('leases.fieldNextIncrement'), value: formatDate(l.next_increment_due_date) },
    { label: t('leases.fieldStartDate'), value: formatDate(l.start_date) },
    { label: t('leases.fieldEndDate'), value: formatDate(l.end_date) },
    { label: t('common.status'), value: t(`status.${l.status}`), tone: 'success' },
    { label: t('leases.fieldRentRevisions'), value: l.revisionCount },
  ]
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('leases.title') }}</h1>
        <p class="page-subtitle">{{ t('leases.subtitle', { count: store.orgLeases.length }) }}</p>
      </div>
      <button class="btn btn-primary" @click="router.push('/proposals')"><TrendingUp :size="16" /> {{ t('leases.rentProposals') }}</button>
    </div>

    <div class="card">
      <div class="toolbar">
        <div class="search-field" style="flex: 1; min-width: 220px">
          <Search :size="15" />
          <input v-model="search" class="input" :placeholder="t('leases.searchPlaceholder')" />
        </div>
        <select v-model="modeFilter" class="select" style="width: 165px">
          <option value="all">{{ t('leases.allModes') }}</option>
          <option value="fixed_percent">{{ t('leases.modeFixed') }}</option>
          <option value="cpi">{{ t('leases.modeCpi') }}</option>
          <option value="none">{{ t('leases.modeNone') }}</option>
        </select>
        <select v-model="statusFilter" class="select" style="width: 140px">
          <option value="all">{{ t('leases.allStatuses') }}</option>
          <option value="active">{{ t('status.active') }}</option>
          <option value="expired">{{ t('status.expired') }}</option>
        </select>
        <button class="btn btn-sm" :class="{ 'btn-primary': advancedOpen }" @click="advancedOpen = !advancedOpen">
          <SlidersHorizontal :size="15" /> {{ t('common.filters') }}
          <span v-if="activeFilterCount" class="filter-count">{{ activeFilterCount }}</span>
        </button>
        <button v-if="activeFilterCount" class="btn btn-ghost btn-sm" @click="clearFilters"><X :size="14" /> {{ t('common.clearFilters') }}</button>
      </div>

      <div v-if="advancedOpen" class="filter-panel" :aria-label="t('common.advancedFilters')">
        <div class="filter-grid">
          <div class="field">
            <label class="field-label">{{ t('common.min') }} · {{ t('leases.monthlyRent') }}</label>
            <input v-model="rentMin" class="input" type="number" min="0" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.max') }} · {{ t('leases.monthlyRent') }}</label>
            <input v-model="rentMax" class="input" type="number" min="0" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.from') }} · {{ t('leases.filterNextIncrement') }}</label>
            <input v-model="incrementFrom" class="input" type="date" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.to') }} · {{ t('leases.filterNextIncrement') }}</label>
            <input v-model="incrementTo" class="input" type="date" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.from') }} · {{ t('leases.fieldStartDate') }}</label>
            <input v-model="startFrom" class="input" type="date" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.to') }} · {{ t('leases.fieldStartDate') }}</label>
            <input v-model="startTo" class="input" type="date" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.from') }} · {{ t('leases.fieldEndDate') }}</label>
            <input v-model="endFrom" class="input" type="date" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.to') }} · {{ t('leases.fieldEndDate') }}</label>
            <input v-model="endTo" class="input" type="date" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('leases.filterTenant') }}</label>
            <input v-model="tenantQuery" class="input" :placeholder="t('leases.filterTenantPlaceholder')" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('leases.filterProperty') }}</label>
            <select v-model="propertyFilter" class="select">
              <option value="all">{{ t('leases.allProperties') }}</option>
              <option v-for="property in store.orgProperties" :key="property.id" :value="property.id">{{ property.name }}</option>
            </select>
          </div>
          <div class="field" style="justify-content: flex-end">
            <label class="row gap-8 filter-check">
              <input v-model="outstandingOnly" type="checkbox" />
              {{ t('leases.onlyOutstanding') }}
            </label>
          </div>
        </div>
      </div>

      <div v-if="filtered.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('leases.tenant') }}</th><th>{{ t('leases.unitProperty') }}</th><th class="num">{{ t('leases.monthlyRent') }}</th>
              <th>{{ t('leases.increment') }}</th><th>{{ t('leases.nextReview') }}</th><th>{{ t('leases.endDate') }}</th><th>{{ t('common.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lease in filtered" :key="lease.id" class="clickable" @click="selected = lease">
              <td>
                <div class="row gap-8">
                  <span class="avatar avatar-sm" :style="{ background: lease.tenant?.avatar_color || 'var(--avatar-fallback)' }">{{ initials(lease.tenant?.name || '?') }}</span>
                  <div class="col"><strong>{{ lease.tenant?.name || t('leases.unassigned') }}</strong><small class="subtle">{{ lease.tenant?.email }}</small></div>
                </div>
              </td>
              <td>
                <div class="col"><strong>{{ lease.unit?.unit_number }}</strong><small class="muted">{{ lease.property?.name }}</small></div>
              </td>
              <td class="num"><strong>{{ currency(lease.monthly_rent) }}</strong></td>
              <td><span class="badge badge-neutral">{{ modeLabel(lease.rent_increment_mode) }}</span></td>
              <td>
                <div class="row gap-6">
                  <CalendarDays :size="14" class="subtle" />
                  <span class="muted">{{ formatDate(lease.next_increment_due_date, { month: 'short', year: 'numeric' }) }}</span>
                </div>
              </td>
              <td class="muted">{{ formatDate(lease.end_date) }}</td>
              <td>
                <div class="row gap-6">
                  <StatusBadge :status="lease.status" />
                  <span v-if="lease.outstanding" :title="t('leases.outstandingCharges')"><AlertCircle :size="14" class="alert-icon" /></span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon"><FileText :size="20" /></div>
        <strong>{{ t('leases.noLeasesFound') }}</strong>
        <span>{{ t('leases.tryAdjusting') }}</span>
      </div>

      <div class="table-footer">
        <span>{{ t('leases.showingOf', { shown: filtered.length, total: store.orgLeases.length }) }}</span>
        <span class="row gap-6"><Clock :size="13" /> {{ t('leases.avgRent', { amount: currency(Math.round(store.orgLeases.reduce((s, l) => s + l.monthly_rent, 0) / (store.orgLeases.length || 1))) }) }}</span>
      </div>
    </div>

    <DetailDrawer
      :open="!!selected"
      :eyebrow="t('leases.eyebrow')"
      :title="selected ? t('leases.leaseNumber', { id: selected.id }) : ''"
      :subtitle="selected ? `${selected.unit?.unit_number} · ${selected.property?.name}` : ''"
      @close="selected = null"
    >
      <template v-if="selected" #default>
        <div class="detail-list">
          <div v-for="field in drawerFields" :key="field.label" class="detail-row">
            <span class="detail-key">{{ field.label }}</span>
            <span class="detail-val" :style="field.tone ? { color: `var(--${field.tone})` } : null">{{ field.value }}</span>
          </div>
        </div>

        <div v-if="proposal" class="info-banner">
          <TrendingUp :size="16" />
          <div>
            <strong>{{ t('leases.pendingIncrease') }}</strong>
            <span>{{ t('leases.proposedOn', { amount: currency(proposal.proposed_rent), date: formatDate(proposal.created_at) }) }}</span>
          </div>
          <button class="btn btn-sm btn-primary" @click="router.push('/proposals'); selected = null">{{ t('leases.review') }}</button>
        </div>

        <div class="drawer-section">
          <h4 class="section-title" style="margin-bottom: 10px">{{ t('leases.revisionHistory') }}</h4>
          <div v-for="revision in revisions" :key="revision.id" class="revision-row">
            <span class="revision-line"></span>
            <div class="col">
              <strong>{{ currency(revision.monthly_rent) }}</strong>
              <small class="subtle">{{ formatDate(revision.effective_from) }} → {{ formatDate(revision.effective_to) }}</small>
            </div>
          </div>
          <p v-if="!revisions.length" class="muted" style="font-size: 12px">{{ t('leases.noRevisions') }}</p>
        </div>

        <div class="drawer-section">
          <h4 class="section-title" style="margin-bottom: 10px">{{ t('leases.recentCharges') }}</h4>
          <div v-for="charge in charges" :key="charge.id" class="charge-row">
            <div class="col"><strong>{{ currency(charge.amount_due) }}</strong><small class="subtle">{{ t('leases.due', { date: formatDate(charge.due_date) }) }}</small></div>
            <StatusBadge :status="charge.status" />
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn" @click="selected = null">{{ t('common.close') }}</button>
        <button class="btn btn-primary" @click="router.push({ path: '/rent-charges', query: { q: selected?.tenant?.name } }); selected = null">
          {{ t('leases.viewCharges') }} <ArrowUpRight :size="14" />
        </button>
      </template>
    </DetailDrawer>
  </div>
</template>

<style scoped>
.filter-check { min-height: 34px; font-size: 12.5px; cursor: pointer; }
.filter-check input { width: 15px; height: 15px; accent-color: var(--primary); cursor: pointer; flex: none; }
.alert-icon { color: var(--warning); }
.info-banner { display: flex; align-items: center; gap: 11px; margin-top: 20px; padding: 12px; border-radius: 10px; background: var(--primary-soft); color: var(--primary-text); }
.info-banner > div { display: flex; flex-direction: column; flex: 1; }
.info-banner strong { font-size: 12.5px; }
.info-banner span { font-size: 11px; opacity: 0.8; }
.drawer-section { margin-top: 22px; }
.revision-row { display: flex; align-items: stretch; gap: 12px; padding-bottom: 14px; }
.revision-line { width: 2px; background: var(--border); border-radius: 2px; position: relative; }
.revision-line::before { content: ''; position: absolute; top: 3px; left: -3px; width: 8px; height: 8px; border-radius: 99px; background: var(--primary); }
.revision-row strong { font-size: 12.5px; }
.revision-row small { font-size: 11px; }
.charge-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid var(--border); }
.charge-row:last-child { border-bottom: 0; }
.charge-row strong { font-size: 12.5px; }
.charge-row small { font-size: 11px; }
</style>
