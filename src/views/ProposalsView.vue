<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Check, X, TrendingUp, Clock, CalendarClock, ArrowUpRight, Search, FileCheck2, SlidersHorizontal } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import StatCard from '@/components/StatCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import DetailDrawer from '@/components/DetailDrawer.vue'
import { currency, formatDate, formatShortDate, initials, relativeDate } from '@/utils/format'
import { notify } from '@/composables/useUi'

const { t } = useI18n()

const store = useAppStore()
const router = useRouter()
const route = useRoute()
const tab = ref('all')
const search = ref(route.query.q || '')
watch(() => route.query.q, (value) => { search.value = value || '' })
const selected = ref(null)

const advancedOpen = ref(false)
const residentQuery = ref('')
const propertyFilter = ref('all')
const modeFilter = ref('all')
const proposedMin = ref('')
const proposedMax = ref('')
const createdFrom = ref('')
const createdTo = ref('')
const increaseMin = ref('')
const increaseMax = ref('')

const tabs = computed(() => [
  { key: 'all', label: t('common.all'), count: store.proposalsDetailed.length },
  { key: 'pending', label: t('status.pending'), count: store.proposalsDetailed.filter((p) => p.status === 'pending').length },
  { key: 'approved', label: t('status.approved'), count: store.proposalsDetailed.filter((p) => p.status === 'approved').length },
  { key: 'rejected', label: t('status.rejected'), count: store.proposalsDetailed.filter((p) => p.status === 'rejected').length },
])

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const resident = residentQuery.value.trim().toLowerCase()
  const rentMin = proposedMin.value === '' ? null : Number(proposedMin.value)
  const rentMax = proposedMax.value === '' ? null : Number(proposedMax.value)
  const incMin = increaseMin.value === '' ? null : Number(increaseMin.value)
  const incMax = increaseMax.value === '' ? null : Number(increaseMax.value)
  return store.proposalsDetailed.filter((p) => {
    const text = `${p.tenant?.name || ''} ${p.property?.name || ''} ${p.unit?.unit_number || ''}`.toLowerCase()
    const residentText = `${p.tenant?.name || ''} ${p.tenant?.email || ''}`.toLowerCase()
    return (tab.value === 'all' || p.status === tab.value)
      && (!q || text.includes(q))
      && (!resident || residentText.includes(resident))
      && (propertyFilter.value === 'all' || String(p.property?.id) === propertyFilter.value)
      && (modeFilter.value === 'all' || p.lease?.rent_increment_mode === modeFilter.value)
      && (rentMin === null || p.proposed_rent >= rentMin)
      && (rentMax === null || p.proposed_rent <= rentMax)
      && (!createdFrom.value || p.created_at >= createdFrom.value)
      && (!createdTo.value || p.created_at <= createdTo.value)
      && (incMin === null || p.increasePercent >= incMin)
      && (incMax === null || p.increasePercent <= incMax)
  })
})

const modeKeys = {
  fixed_percent: 'leases.modeFixed',
  cpi: 'leases.modeCpi',
  none: 'leases.modeNone',
}
const modeLabel = (mode) => (modeKeys[mode] ? t(modeKeys[mode]) : mode || '—')

const properties = computed(() => store.orgProperties)
const modes = computed(() => {
  const seen = new Set()
  return store.proposalsDetailed
    .map((p) => p.lease?.rent_increment_mode)
    .filter((mode) => mode && !seen.has(mode) && seen.add(mode))
    .map((value) => ({ value, label: modeLabel(value) }))
})
const presets = computed(() => [
  { key: 'all', label: t('proposals.presetAll') },
  { key: 'thisMonth', label: t('proposals.presetThisMonth') },
  { key: 'lastMonth', label: t('proposals.presetLastMonth') },
  { key: 'thisYear', label: t('proposals.presetThisYear') },
])

const activeFilterCount = computed(() =>
  [residentQuery, proposedMin, proposedMax, createdFrom, createdTo, increaseMin, increaseMax].filter((v) => v.value !== '' && v.value !== null && v.value !== undefined).length +
  (tab.value !== 'all' ? 1 : 0) +
  (propertyFilter.value !== 'all' ? 1 : 0) +
  (modeFilter.value !== 'all' ? 1 : 0),
)

function clearFilters() {
  search.value = ''
  tab.value = 'all'
  residentQuery.value = ''
  propertyFilter.value = 'all'
  modeFilter.value = 'all'
  proposedMin.value = ''
  proposedMax.value = ''
  createdFrom.value = ''
  createdTo.value = ''
  increaseMin.value = ''
  increaseMax.value = ''
}

function applyPreset(preset) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const pad = (n) => String(n).padStart(2, '0')
  const fmt = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
  if (preset === 'thisMonth') {
    createdFrom.value = fmt(year, month, 1)
    createdTo.value = fmt(year, month, new Date(year, month + 1, 0).getDate())
  } else if (preset === 'lastMonth') {
    const last = new Date(year, month - 1, 1)
    createdFrom.value = fmt(last.getFullYear(), last.getMonth(), 1)
    createdTo.value = fmt(last.getFullYear(), last.getMonth(), new Date(last.getFullYear(), last.getMonth() + 1, 0).getDate())
  } else if (preset === 'thisYear') {
    createdFrom.value = `${year}-01-01`
    createdTo.value = `${year}-12-31`
  } else {
    createdFrom.value = ''
    createdTo.value = ''
  }
}

const nextIncrement = computed(() => {
  const dates = store.orgLeases.map((l) => l.next_increment_due_date).filter(Boolean).sort()
  return dates.length ? formatShortDate(dates[0]) : '—'
})

const summary = computed(() => {
  const pending = store.proposalsDetailed.filter((p) => p.status === 'pending')
  const approved = store.proposalsDetailed.filter((p) => p.status === 'approved')
  return {
    pending: pending.length,
    potential: pending.reduce((s, p) => s + (p.proposed_rent - (p.lease?.monthly_rent || 0)), 0),
    approved: approved.length,
    avgIncrease: pending.length ? Math.round(pending.reduce((s, p) => s + p.increasePercent, 0) / pending.length * 10) / 10 : 0,
  }
})

const drawerFields = computed(() => {
  const p = selected.value
  if (!p) return []
  return [
    { label: t('proposals.proposalId'), value: `#PRP-${String(p.id).padStart(4, '0')}` },
    { label: t('proposals.resident'), value: p.tenant?.name || '—' },
    { label: t('proposals.unit'), value: `${p.unit?.unit_number} · ${p.property?.name}` },
    { label: t('proposals.currentRent'), value: currency(p.lease?.monthly_rent || 0) },
    { label: t('proposals.proposedRent'), value: currency(p.proposed_rent), tone: 'primary-text' },
    { label: t('proposals.approvedRent'), value: p.approved_rent ? currency(p.approved_rent) : '—', tone: p.approved_rent ? 'success' : null },
    { label: t('proposals.increase'), value: `+${p.increasePercent}%`, tone: 'warning' },
    { label: t('proposals.incrementMode'), value: modeLabel(p.lease?.rent_increment_mode) },
    { label: t('proposals.created'), value: formatDate(p.created_at) },
    { label: t('proposals.decided'), value: p.decided_at ? formatDate(p.decided_at) : '—' },
    { label: t('common.status'), value: t(`status.${p.status}`) },
  ]
})

function approve(id) {
  store.approveProposal(id)
  notify(t('proposals.notifyApproved'))
  if (selected.value?.id === id) selected.value = null
}
function reject(id) {
  store.rejectProposal(id)
  notify(t('proposals.notifyRejected'), 'error')
  if (selected.value?.id === id) selected.value = null
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('proposals.title') }}</h1>
        <p class="page-subtitle">{{ t('proposals.subtitle') }}</p>
      </div>
      <div class="summary-pill">
        <TrendingUp :size="16" />
        <div class="col"><strong>{{ currency(summary.potential) }}</strong><small>{{ t('proposals.potentialUplift') }}</small></div>
      </div>
    </div>

    <div class="stat-strip">
      <StatCard compact :label="t('proposals.statPending')" :value="summary.pending" :icon="Clock" tone="warning" />
      <StatCard compact :label="t('status.approved')" :value="summary.approved" :icon="Check" tone="success" />
      <StatCard compact :label="t('proposals.statAvgIncrease')" :value="`+${summary.avgIncrease}%`" :icon="TrendingUp" tone="primary" />
      <StatCard compact :label="t('proposals.statNextIncrement')" :value="nextIncrement" :icon="CalendarClock" tone="info" />
    </div>

    <div class="card">
      <div class="tabs">
        <button
          v-for="item in tabs"
          :key="item.key"
          :class="{ 'tab-active': tab === item.key }"
          @click="tab = item.key"
        >
          {{ item.label }} <span class="tab-count">{{ item.count }}</span>
        </button>
        <div class="grow"></div>
        <div class="search-field" style="width: 240px">
          <Search :size="15" />
          <input v-model="search" class="input" :placeholder="t('proposals.searchPlaceholder')" />
        </div>
      </div>

      <div class="toolbar">
        <button class="btn btn-sm" :class="{ 'btn-primary': advancedOpen }" @click="advancedOpen = !advancedOpen">
          <SlidersHorizontal :size="15" /> {{ t('common.filters') }}
          <span v-if="activeFilterCount" class="filter-count">{{ activeFilterCount }}</span>
        </button>
        <button v-if="activeFilterCount" class="btn btn-ghost btn-sm" @click="clearFilters"><X :size="14" /> {{ t('common.clearFilters') }}</button>
      </div>

      <div v-if="advancedOpen" class="filter-panel">
        <div class="filter-grid">
          <div class="field">
            <label class="field-label">{{ t('proposals.filterResident') }}</label>
            <input v-model="residentQuery" class="input" :placeholder="t('proposals.filterResidentPlaceholder')" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('proposals.filterProperty') }}</label>
            <select v-model="propertyFilter" class="select">
              <option value="all">{{ t('proposals.allProperties') }}</option>
              <option v-for="property in properties" :key="property.id" :value="String(property.id)">{{ property.name }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">{{ t('proposals.filterMode') }}</label>
            <select v-model="modeFilter" class="select">
              <option value="all">{{ t('proposals.allModes') }}</option>
              <option v-for="mode in modes" :key="mode.value" :value="mode.value">{{ mode.label }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">{{ t('proposals.filterProposedRent') }}</label>
            <div class="row gap-8">
              <input v-model="proposedMin" class="input" type="number" min="0" :placeholder="t('common.min')" />
              <input v-model="proposedMax" class="input" type="number" min="0" :placeholder="t('common.max')" />
            </div>
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.from') }} · {{ t('proposals.filterCreated') }}</label>
            <input v-model="createdFrom" class="input" type="date" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.to') }} · {{ t('proposals.filterCreated') }}</label>
            <input v-model="createdTo" class="input" type="date" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('proposals.filterIncrease') }}</label>
            <div class="row gap-8">
              <input v-model="increaseMin" class="input" type="number" min="0" :placeholder="t('common.min')" />
              <input v-model="increaseMax" class="input" type="number" min="0" :placeholder="t('common.max')" />
            </div>
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
              <th>{{ t('proposals.colResident') }}</th>
              <th>{{ t('proposals.colUnitProperty') }}</th>
              <th class="num">{{ t('proposals.currentRent') }}</th>
              <th class="num">{{ t('proposals.proposed') }}</th>
              <th class="num">{{ t('proposals.increase') }}</th>
              <th>{{ t('proposals.created') }}</th>
              <th>{{ t('common.status') }}</th>
              <th style="width: 165px">{{ t('proposals.colActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="proposal in filtered" :key="proposal.id">
              <td>
                <div class="row gap-8">
                  <span class="avatar avatar-sm" :style="{ background: proposal.tenant?.avatar_color || 'var(--avatar-fallback)' }">{{ initials(proposal.tenant?.name || '?') }}</span>
                  <button class="text-link" @click="selected = proposal">{{ proposal.tenant?.name || t('proposals.unassigned') }}</button>
                </div>
              </td>
              <td>
                <div class="col"><strong>{{ proposal.unit?.unit_number }}</strong><small class="muted">{{ proposal.property?.name }}</small></div>
              </td>
              <td class="num muted">{{ currency(proposal.lease?.monthly_rent || 0) }}</td>
              <td class="num"><strong>{{ currency(proposal.proposed_rent) }}</strong></td>
              <td class="num"><span class="badge badge-primary">+{{ proposal.increasePercent }}%</span></td>
              <td>
                <div class="col"><span class="muted" style="font-size: 12.5px">{{ formatDate(proposal.created_at) }}</span><small class="subtle">{{ relativeDate(proposal.created_at) }}</small></div>
              </td>
              <td><StatusBadge :status="proposal.status" /></td>
              <td>
                <div v-if="proposal.status === 'pending'" class="row gap-6">
                  <button class="btn btn-sm btn-primary" @click="approve(proposal.id)"><Check :size="13" /> {{ t('proposals.approve') }}</button>
                  <button class="btn btn-sm btn-danger" @click="reject(proposal.id)"><X :size="13" /></button>
                </div>
                <button v-else class="link-button" @click="selected = proposal">{{ t('common.details') }} <ArrowUpRight :size="12" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon"><FileCheck2 :size="20" /></div>
        <strong>{{ t('proposals.emptyTitle') }}</strong>
        <span>{{ tab === 'pending' ? t('proposals.emptyCaughtUp') : t('proposals.emptyTryAnother') }}</span>
      </div>

      <div class="table-footer">
        <span>{{ t('proposals.showing', { shown: filtered.length, total: store.proposalsDetailed.length }) }}</span>
        <button class="link-button" @click="router.push('/leases')">{{ t('proposals.viewAllLeases') }} <ArrowUpRight :size="13" /></button>
      </div>
    </div>

    <DetailDrawer
      :open="!!selected"
      :eyebrow="t('proposals.drawerEyebrow')"
      :title="selected ? t('proposals.proposalTitle', { id: String(selected.id).padStart(4, '0') }) : ''"
      :subtitle="selected ? `${selected.unit?.unit_number} · ${selected.property?.name}` : ''"
      @close="selected = null"
    >
      <template v-if="selected" #default>
        <div class="compare">
          <div><span class="muted">{{ t('proposals.currentRent') }}</span><strong>{{ currency(selected.lease?.monthly_rent || 0) }}</strong></div>
          <ArrowUpRight :size="18" class="primary-icon" />
          <div><span class="muted">{{ t('proposals.proposedRent') }}</span><strong class="primary-text">{{ currency(selected.proposed_rent) }}</strong></div>
        </div>
        <div class="detail-list">
          <div v-for="field in drawerFields" :key="field.label" class="detail-row">
            <span class="detail-key">{{ field.label }}</span>
            <span class="detail-val" :style="field.tone ? { color: `var(--${field.tone})` } : null">{{ field.value }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn" @click="selected = null">{{ t('common.close') }}</button>
        <template v-if="selected?.status === 'pending'">
          <button class="btn btn-danger" @click="reject(selected.id)"><X :size="14" /> {{ t('proposals.decline') }}</button>
          <button class="btn btn-primary" @click="approve(selected.id)"><Check :size="14" /> {{ t('proposals.approve') }}</button>
        </template>
      </template>
    </DetailDrawer>
  </div>
</template>

<style scoped>
.summary-pill { display: flex; align-items: center; gap: 10px; padding: 9px 14px; border-radius: 10px; background: var(--primary-soft); color: var(--primary-text); }
.summary-pill strong { font-size: 15px; }
.summary-pill small { font-size: 11px; opacity: 0.8; }
.stat-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.primary-icon { color: var(--primary); }
.tabs { display: flex; align-items: center; gap: 4px; padding: 10px 16px; border-bottom: 1px solid var(--border); }
.tabs button { display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px; border: 0; border-radius: 8px; background: transparent; color: var(--text-muted); font-size: 12.5px; font-weight: 600; }
.tabs button:hover { background: var(--surface-3); color: var(--text); }
.tabs button.tab-active { background: var(--primary-soft); color: var(--primary-text); }
.tab-count { padding: 1px 6px; border-radius: 5px; background: var(--surface-3); font-size: 10.5px; }
.tab-active .tab-count { background: var(--surface); }
.text-link { border: 0; background: transparent; padding: 0; font-weight: 600; font-size: 13px; }
.text-link:hover { color: var(--primary-text); text-decoration: underline; }
.link-button { display: inline-flex; align-items: center; gap: 4px; border: 0; background: transparent; color: var(--primary-text); font-size: 12px; font-weight: 650; }
.compare { display: flex; align-items: center; justify-content: center; gap: 18px; padding: 18px; margin-bottom: 8px; border-radius: 12px; background: var(--surface-2); }
.compare div { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.compare span { font-size: 11px; }
.compare strong { font-size: 19px; letter-spacing: -0.03em; }
@media (max-width: 900px) { .stat-strip { grid-template-columns: repeat(2, 1fr); } }
</style>
