<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Search, Users, ArrowUpRight, Mail, Phone, Receipt, SlidersHorizontal, X } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import StatusBadge from '@/components/StatusBadge.vue'
import DetailDrawer from '@/components/DetailDrawer.vue'
import { currency, formatDate, initials } from '@/utils/format'
import { notify } from '@/composables/useUi'

const { t } = useI18n()

const store = useAppStore()
const router = useRouter()
const route = useRoute()

const search = ref(route.query.q || '')
watch(() => route.query.q, (value) => { search.value = value || '' })
const propertyFilter = ref('all')
const selected = ref(null)

const advancedOpen = ref(false)
const balanceMin = ref('')
const balanceMax = ref('')
const leaseStatusFilter = ref('all')
const contactQuery = ref('')
const primaryOnly = ref(false)
const startFrom = ref('')
const startTo = ref('')

const activeFilterCount = computed(() =>
  [balanceMin, balanceMax, contactQuery, startFrom, startTo].filter((v) => v.value !== '' && v.value !== null && v.value !== undefined).length +
  (propertyFilter.value !== 'all' ? 1 : 0) +
  (leaseStatusFilter.value !== 'all' ? 1 : 0) +
  (primaryOnly.value ? 1 : 0),
)

function clearFilters() {
  search.value = ''
  propertyFilter.value = 'all'
  balanceMin.value = ''
  balanceMax.value = ''
  leaseStatusFilter.value = 'all'
  contactQuery.value = ''
  primaryOnly.value = false
  startFrom.value = ''
  startTo.value = ''
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const contact = contactQuery.value.trim().toLowerCase()
  const minBalance = balanceMin.value === '' ? null : Number(balanceMin.value)
  const maxBalance = balanceMax.value === '' ? null : Number(balanceMax.value)
  return store.tenantsDetailed.filter((tenant) => {
    const text = `${tenant.name} ${tenant.email} ${tenant.property?.name || ''} ${tenant.unit?.unit_number || ''}`.toLowerCase()
    const contactText = `${tenant.email || ''} ${tenant.phone || ''}`.toLowerCase()
    const startDate = tenant.lease?.start_date || ''
    return (!q || text.includes(q))
      && (!contact || contactText.includes(contact))
      && (propertyFilter.value === 'all' || tenant.property?.id === Number(propertyFilter.value))
      && (leaseStatusFilter.value === 'all' || (tenant.lease?.status || 'expired') === leaseStatusFilter.value)
      && (minBalance === null || tenant.balance >= minBalance)
      && (maxBalance === null || tenant.balance <= maxBalance)
      && (!primaryOnly.value || tenant.isPrimary)
      && (!startFrom.value || startDate >= startFrom.value)
      && (!startTo.value || startDate <= startTo.value)
  })
})

const coTenants = computed(() =>
  selected.value
    ? store.leaseTenants(selected.value.lease?.id).filter((lt) => lt.user_id !== selected.value.id)
    : [],
)
const tenantCharges = computed(() =>
  selected.value
    ? store.chargesDetailed.filter((c) => c.lease && selected.value.leases.some((l) => l.id === c.lease_id)).slice(0, 5)
    : [],
)

const drawerFields = computed(() => {
  const tenant = selected.value
  if (!tenant) return []
  return [
    { label: t('tenants.email'), value: tenant.email },
    { label: t('tenants.role'), value: t('tenants.roleTenant') },
    { label: t('common.status'), value: t(`status.${tenant.status}`), tone: 'success' },
    { label: t('tenants.lease'), value: tenant.lease ? `#${tenant.lease.id}` : '—' },
    { label: t('tenants.unit'), value: tenant.unit ? `${tenant.unit.unit_number} · ${tenant.property?.name}` : '—' },
    { label: t('tenants.leaseStart'), value: formatDate(tenant.lease?.start_date) },
    { label: t('tenants.leaseEnd'), value: formatDate(tenant.lease?.end_date) },
    { label: t('tenants.monthlyRent'), value: tenant.lease ? currency(tenant.lease.monthly_rent) : '—', tone: 'primary-text' },
    { label: t('tenants.outstandingBalance'), value: currency(tenant.balance), tone: tenant.balance ? 'danger' : 'success' },
    { label: t('tenants.primaryTenant'), value: tenant.isPrimary ? t('tenants.yes') : t('tenants.coTenant') },
  ]
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('tenants.title') }}</h1>
        <p class="page-subtitle">{{ t('tenants.subtitle', { count: store.tenantsDetailed.length }) }}</p>
      </div>
      <button class="btn" @click="router.push('/users')"><Users :size="16" /> {{ t('tenants.manageUsers') }}</button>
    </div>

    <div class="card">
      <div class="toolbar">
        <div class="search-field" style="flex: 1; min-width: 220px">
          <Search :size="15" />
          <input v-model="search" class="input" :placeholder="t('tenants.searchPlaceholder')" />
        </div>
        <select v-model="propertyFilter" class="select" style="width: 190px">
          <option value="all">{{ t('tenants.allProperties') }}</option>
          <option v-for="property in store.orgProperties" :key="property.id" :value="property.id">{{ property.name }}</option>
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
            <label class="field-label">{{ t('common.min') }} · {{ t('tenants.outstandingBalance') }}</label>
            <input v-model="balanceMin" class="input" type="number" min="0" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.max') }} · {{ t('tenants.outstandingBalance') }}</label>
            <input v-model="balanceMax" class="input" type="number" min="0" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('tenants.filterLeaseStatus') }}</label>
            <select v-model="leaseStatusFilter" class="select">
              <option value="all">{{ t('tenants.allLeaseStatuses') }}</option>
              <option value="active">{{ t('status.active') }}</option>
              <option value="expired">{{ t('status.expired') }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">{{ t('tenants.filterContact') }}</label>
            <input v-model="contactQuery" class="input" :placeholder="t('tenants.filterContactPlaceholder')" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.from') }} · {{ t('tenants.leaseStart') }}</label>
            <input v-model="startFrom" class="input" type="date" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('common.to') }} · {{ t('tenants.leaseStart') }}</label>
            <input v-model="startTo" class="input" type="date" />
          </div>
          <div class="field" style="justify-content: flex-end">
            <label class="row gap-8 filter-check">
              <input v-model="primaryOnly" type="checkbox" />
              {{ t('tenants.primaryOnly') }}
            </label>
          </div>
        </div>
      </div>

      <div v-if="filtered.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('tenants.colResident') }}</th>
              <th>{{ t('tenants.colContact') }}</th>
              <th>{{ t('tenants.colUnitProperty') }}</th>
              <th class="num">{{ t('tenants.monthlyRent') }}</th>
              <th class="num">{{ t('tenants.colBalance') }}</th>
              <th>{{ t('tenants.lease') }}</th>
              <th>{{ t('tenants.role') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tenant in filtered" :key="tenant.id" class="clickable" @click="selected = tenant">
              <td>
                <div class="row gap-10">
                  <span class="avatar" :style="{ background: tenant.avatar_color }">{{ initials(tenant.name) }}</span>
                  <div class="col"><strong>{{ tenant.name }}</strong><small class="subtle">#{{ tenant.id }}</small></div>
                </div>
              </td>
              <td>
                <div class="col"><span style="font-size: 12.5px">{{ tenant.email }}</span></div>
              </td>
              <td>
                <div class="col"><strong>{{ tenant.unit?.unit_number || '—' }}</strong><small class="muted">{{ tenant.property?.name }}</small></div>
              </td>
              <td class="num">{{ tenant.lease ? currency(tenant.lease.monthly_rent) : '—' }}</td>
              <td class="num">
                <strong :style="{ color: tenant.balance ? 'var(--danger)' : 'var(--success)' }">{{ currency(tenant.balance) }}</strong>
              </td>
              <td><StatusBadge :status="tenant.lease?.status || 'expired'" /></td>
              <td><span class="badge" :class="tenant.isPrimary ? 'badge-primary' : 'badge-neutral'">{{ tenant.isPrimary ? t('tenants.primary') : t('tenants.coTenant') }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon"><Users :size="20" /></div>
        <strong>{{ t('tenants.emptyTitle') }}</strong>
        <span>{{ t('tenants.emptyHint') }}</span>
      </div>

      <div class="table-footer">
        <span>{{ t('tenants.showing', { shown: filtered.length, total: store.tenantsDetailed.length }) }}</span>
        <span>{{ t('tenants.outstandingResults', { amount: currency(filtered.reduce((sum, entry) => sum + entry.balance, 0)) }) }}</span>
      </div>
    </div>

    <DetailDrawer
      :open="!!selected"
      :eyebrow="t('tenants.drawerEyebrow')"
      :title="selected?.name || ''"
      :subtitle="selected?.email || ''"
      @close="selected = null"
    >
      <template v-if="selected" #default>
        <div class="contact-actions">
          <a :href="`mailto:${selected.email}`" class="btn"><Mail :size="15" /> {{ t('tenants.email') }}</a>
          <button class="btn" @click="notify(selected?.phone ? t('tenants.phone', { phone: selected.phone }) : t('tenants.noPhone'), 'info')"><Phone :size="15" /> {{ t('tenants.call') }}</button>
        </div>
        <div class="detail-list">
          <div v-for="field in drawerFields" :key="field.label" class="detail-row">
            <span class="detail-key">{{ field.label }}</span>
            <span class="detail-val" :style="field.tone ? { color: `var(--${field.tone})` } : null">{{ field.value }}</span>
          </div>
        </div>

        <div v-if="coTenants.length" class="drawer-section">
          <h4 class="section-title" style="margin-bottom: 10px">{{ t('tenants.coTenants') }}</h4>
          <div v-for="link in coTenants" :key="link.user_id" class="resident-row">
            <span class="avatar avatar-sm" :style="{ background: link.user?.avatar_color || 'var(--avatar-fallback)' }">{{ initials(link.user?.name || '?') }}</span>
            <div class="col"><strong>{{ link.user?.name }}</strong><small class="subtle">{{ link.user?.email }}</small></div>
            <span class="badge badge-neutral">{{ t('tenants.coTenant') }}</span>
          </div>
        </div>

        <div class="drawer-section">
          <h4 class="section-title" style="margin-bottom: 10px">{{ t('tenants.recentCharges') }}</h4>
          <div v-for="charge in tenantCharges" :key="charge.id" class="charge-row">
            <div class="col"><strong>{{ currency(charge.amount_due) }}</strong><small class="subtle">{{ charge.property?.name }} · {{ formatDate(charge.due_date) }}</small></div>
            <StatusBadge :status="charge.status" />
          </div>
          <p v-if="!tenantCharges.length" class="muted" style="font-size: 12px">{{ t('tenants.noCharges') }}</p>
        </div>
      </template>
      <template #footer>
        <button class="btn" @click="selected = null">{{ t('common.close') }}</button>
        <button class="btn btn-primary" @click="router.push({ path: '/rent-charges', query: { q: selected?.name } }); selected = null">
          {{ t('tenants.viewCharges') }} <Receipt :size="14" /> <ArrowUpRight :size="13" />
        </button>
      </template>
    </DetailDrawer>
  </div>
</template>

<style scoped>
.filter-check { min-height: 34px; font-size: 12.5px; cursor: pointer; }
.filter-check input { width: 15px; height: 15px; accent-color: var(--primary); cursor: pointer; flex: none; }
.contact-actions { display: flex; gap: 8px; margin-bottom: 6px; }
.drawer-section { margin-top: 22px; }
.resident-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); }
.resident-row strong { font-size: 12.5px; }
.resident-row small { font-size: 11px; }
.resident-row .badge { margin-left: auto; }
.charge-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid var(--border); }
.charge-row:last-child { border-bottom: 0; }
.charge-row strong { font-size: 12.5px; }
.charge-row small { font-size: 11px; }
</style>
