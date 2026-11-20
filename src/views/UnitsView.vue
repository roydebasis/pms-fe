<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Plus, Home, Wrench, ArrowUpRight, SlidersHorizontal, X } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import StatusBadge from '@/components/StatusBadge.vue'
import DetailDrawer from '@/components/DetailDrawer.vue'
import BaseModal from '@/components/BaseModal.vue'
import { currency, formatDate, initials, relativeDate } from '@/utils/format'
import { notify } from '@/composables/useUi'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useAppStore()
const router = useRouter()
const route = useRoute()

const search = ref(route.query.q || '')
watch(() => route.query.q, (value) => { search.value = value || '' })
const statusFilter = ref('all')
const propertyFilter = ref('all')
const sortBy = ref('unit')
const selected = ref(null)
const showCreate = ref(false)
const form = ref({ property_id: store.orgProperties[0]?.id, unit_number: '', base_rent: '', bedrooms: 1, bathrooms: 1, sqft: '' })

const advancedOpen = ref(false)
const baseRentMin = ref('')
const baseRentMax = ref('')
const bedroomsFilter = ref('all')
const bathroomsFilter = ref('all')
const sqftMin = ref('')
const tenantQuery = ref('')
const hasOpenMaintenance = ref(false)

const bedroomOptions = computed(() => [...new Set(store.unitsDetailed.map((u) => u.bedrooms))].sort((a, b) => a - b))
const bathroomOptions = computed(() => [...new Set(store.unitsDetailed.map((u) => u.bathrooms))].sort((a, b) => a - b))

const activeFilterCount = computed(() =>
  [baseRentMin, baseRentMax, sqftMin, tenantQuery].filter((v) => v.value !== '' && v.value !== null && v.value !== undefined).length +
  (statusFilter.value !== 'all' ? 1 : 0) +
  (propertyFilter.value !== 'all' ? 1 : 0) +
  (bedroomsFilter.value !== 'all' ? 1 : 0) +
  (bathroomsFilter.value !== 'all' ? 1 : 0) +
  (hasOpenMaintenance.value ? 1 : 0),
)

function clearFilters() {
  search.value = ''
  statusFilter.value = 'all'
  propertyFilter.value = 'all'
  baseRentMin.value = ''
  baseRentMax.value = ''
  bedroomsFilter.value = 'all'
  bathroomsFilter.value = 'all'
  sqftMin.value = ''
  tenantQuery.value = ''
  hasOpenMaintenance.value = false
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const tenant = tenantQuery.value.trim().toLowerCase()
  const list = store.unitsDetailed.filter((unit) => {
    const text = `${unit.unit_number} ${unit.property?.name || ''} ${unit.tenant?.name || ''}`.toLowerCase()
    const tenantText = `${unit.tenant?.name || ''} ${unit.tenant?.email || ''}`.toLowerCase()
    return (!q || text.includes(q))
      && (!tenant || tenantText.includes(tenant))
      && (statusFilter.value === 'all' || unit.status === statusFilter.value)
      && (propertyFilter.value === 'all' || unit.property_id === Number(propertyFilter.value))
      && (!baseRentMin.value || unit.base_rent >= Number(baseRentMin.value))
      && (!baseRentMax.value || unit.base_rent <= Number(baseRentMax.value))
      && (bedroomsFilter.value === 'all' || unit.bedrooms === bedroomsFilter.value)
      && (bathroomsFilter.value === 'all' || unit.bathrooms === bathroomsFilter.value)
      && (!sqftMin.value || (unit.sqft || 0) >= Number(sqftMin.value))
      && (!hasOpenMaintenance.value || unit.openRequests > 0)
  })
  if (sortBy.value === 'rent-desc') return [...list].sort((a, b) => b.base_rent - a.base_rent)
  if (sortBy.value === 'rent-asc') return [...list].sort((a, b) => a.base_rent - b.base_rent)
  if (sortBy.value === 'property') return [...list].sort((a, b) => a.property?.name.localeCompare(b.property?.name) || a.unit_number.localeCompare(b.unit_number))
  return list
})

const priorityKeys = {
  high: 'maintenance.priorityHigh',
  medium: 'maintenance.priorityMedium',
  low: 'maintenance.priorityLow',
}
const priorityLabel = (level) => (priorityKeys[level] ? t(priorityKeys[level]) : level)

const drawerFields = computed(() => {
  const u = selected.value
  if (!u) return []
  return [
    { label: t('units.property'), value: u.property?.name || '—' },
    { label: t('units.fieldUnitNumber'), value: u.unit_number },
    { label: t('common.status'), value: t(`status.${u.status}`) },
    { label: t('units.baseRent'), value: t('units.perMonth', { amount: currency(u.base_rent) }), tone: 'primary-text' },
    { label: t('units.fieldLayout'), value: t('units.layout', { bd: u.bedrooms, ba: u.bathrooms, sqft: u.sqft }) },
    { label: t('units.fieldCurrentTenant'), value: u.tenant?.name || '—' },
    { label: t('units.fieldMonthlyRent'), value: u.lease ? currency(u.lease.monthly_rent) : '—' },
    { label: t('units.leaseEnds'), value: u.lease ? formatDate(u.lease.end_date) : '—' },
    { label: t('units.fieldOpenMaintenance'), value: u.openRequests, tone: u.openRequests ? 'warning' : null },
  ]
})

const unitRequests = computed(() =>
  selected.value
    ? store.maintenanceDetailed.filter((r) => r.unit_id === selected.value.id)
    : [],
)

function createUnit() {
  if (!form.value.unit_number || !form.value.base_rent) {
    notify(t('units.numberRentRequired'), 'error')
    return
  }
  store.createUnit(form.value)
  showCreate.value = false
  form.value = { property_id: store.orgProperties[0]?.id, unit_number: '', base_rent: '', bedrooms: 1, bathrooms: 1, sqft: '' }
  notify(t('units.unitAdded'))
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('units.title') }}</h1>
        <p class="page-subtitle">{{ t('units.subtitle', { units: store.orgUnits.length, properties: store.orgProperties.length }) }}</p>
      </div>
      <button class="btn btn-primary" @click="showCreate = true"><Plus :size="16" /> {{ t('units.addUnit') }}</button>
    </div>

    <div class="card">
      <div class="toolbar">
        <div class="search-field" style="flex: 1; min-width: 220px">
          <Search :size="15" />
          <input v-model="search" class="input" :placeholder="t('units.searchPlaceholder')" />
        </div>
        <select v-model="propertyFilter" class="select" style="width: 180px">
          <option value="all">{{ t('units.allProperties') }}</option>
          <option v-for="property in store.orgProperties" :key="property.id" :value="property.id">{{ property.name }}</option>
        </select>
        <select v-model="statusFilter" class="select" style="width: 135px">
          <option value="all">{{ t('units.allStatuses') }}</option>
          <option value="occupied">{{ t('status.occupied') }}</option>
          <option value="vacant">{{ t('status.vacant') }}</option>
          <option value="maintenance">{{ t('status.maintenance') }}</option>
        </select>
        <select v-model="sortBy" class="select" style="width: 155px">
          <option value="unit">{{ t('units.sortUnit') }}</option>
          <option value="property">{{ t('units.sortProperty') }}</option>
          <option value="rent-desc">{{ t('units.rentHighLow') }}</option>
          <option value="rent-asc">{{ t('units.rentLowHigh') }}</option>
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
            <label class="field-label">{{ t('units.filterBaseRent') }}</label>
            <div class="row gap-8">
              <input v-model="baseRentMin" class="input" type="number" min="0" :placeholder="t('common.min')" />
              <input v-model="baseRentMax" class="input" type="number" min="0" :placeholder="t('common.max')" />
            </div>
          </div>
          <div class="field">
            <label class="field-label">{{ t('units.filterBedrooms') }}</label>
            <select v-model="bedroomsFilter" class="select">
              <option value="all">{{ t('common.all') }}</option>
              <option v-for="n in bedroomOptions" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">{{ t('units.filterBathrooms') }}</label>
            <select v-model="bathroomsFilter" class="select">
              <option value="all">{{ t('common.all') }}</option>
              <option v-for="n in bathroomOptions" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">{{ t('units.filterMinSqft') }}</label>
            <input v-model="sqftMin" class="input" type="number" min="0" :placeholder="t('common.min')" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('units.filterTenant') }}</label>
            <input v-model="tenantQuery" class="input" :placeholder="t('units.tenantSearchPlaceholder')" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('units.hasOpenMaintenance') }}</label>
            <label class="check-row"><input v-model="hasOpenMaintenance" type="checkbox" /> <span>{{ t('units.hasOpenMaintenanceHint') }}</span></label>
          </div>
        </div>
      </div>

      <div v-if="filtered.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('units.unit') }}</th><th>{{ t('units.property') }}</th><th>{{ t('units.tenant') }}</th><th class="num">{{ t('units.baseRent') }}</th>
              <th>{{ t('common.status') }}</th><th class="num">{{ t('units.requests') }}</th><th>{{ t('units.leaseEnds') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="unit in filtered" :key="unit.id" class="clickable" @click="selected = unit">
              <td>
                <div class="row gap-10">
                  <span class="unit-icon"><Home :size="15" /></span>
                  <strong>{{ unit.unit_number }}</strong>
                </div>
              </td>
              <td class="muted">{{ unit.property?.name }}</td>
              <td>
                <div v-if="unit.tenant" class="row gap-8">
                  <span class="avatar avatar-sm" :style="{ background: unit.tenant.avatar_color }">{{ initials(unit.tenant.name) }}</span>
                  <span>{{ unit.tenant.name }}</span>
                </div>
                <span v-else class="subtle">—</span>
              </td>
              <td class="num">{{ currency(unit.base_rent) }}</td>
              <td><StatusBadge :status="unit.status" /></td>
              <td class="num">
                <span v-if="unit.openRequests" class="badge badge-warning"><span class="dot"></span>{{ unit.openRequests }}</span>
                <span v-else class="subtle">—</span>
              </td>
              <td class="muted">{{ unit.lease ? formatDate(unit.lease.end_date, { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon"><Home :size="20" /></div>
        <strong>{{ t('units.noUnitsMatch') }}</strong>
        <span>{{ t('units.tryDifferent') }}</span>
      </div>

      <div class="table-footer">
        <span>{{ t('units.showingOf', { shown: filtered.length, total: store.orgUnits.length }) }}</span>
        <span>{{ t('units.occupiedVacant', { occupied: filtered.filter((u) => u.status === 'occupied').length, vacant: filtered.filter((u) => u.status === 'vacant').length }) }}</span>
      </div>
    </div>

    <DetailDrawer
      :open="!!selected"
      :eyebrow="t('units.unit')"
      :title="selected ? t('units.unitLabel', { number: selected.unit_number }) : ''"
      :subtitle="selected?.property?.name || ''"
      @close="selected = null"
    >
      <template v-if="selected" #default>
        <div class="detail-list">
          <div v-for="field in drawerFields" :key="field.label" class="detail-row">
            <span class="detail-key">{{ field.label }}</span>
            <span class="detail-val" :style="field.tone ? { color: `var(--${field.tone})` } : null">{{ field.value }}</span>
          </div>
        </div>

        <div class="drawer-section">
          <div class="row justify-between">
            <h4 class="section-title">{{ t('units.maintenanceHistory') }}</h4>
            <span class="badge badge-neutral">{{ unitRequests.length }}</span>
          </div>
          <div v-for="request in unitRequests" :key="request.id" class="request-row">
            <span class="request-icon"><Wrench :size="14" /></span>
            <div class="col" style="flex: 1; min-width: 0">
              <strong>{{ request.title }}</strong>
              <small class="subtle">{{ relativeDate(request.created_at) }} · {{ t('units.priority', { level: priorityLabel(request.priority) }) }}</small>
            </div>
            <StatusBadge :status="request.status" />
          </div>
          <p v-if="!unitRequests.length" class="muted" style="font-size: 12px; margin-top: 10px">{{ t('units.noRequests') }}</p>
        </div>
      </template>
      <template #footer>
        <button class="btn" @click="selected = null">{{ t('common.close') }}</button>
        <button class="btn btn-primary" @click="router.push({ path: '/leases', query: { q: selected?.unit_number } }); selected = null">
          {{ t('units.viewLease') }} <ArrowUpRight :size="14" />
        </button>
      </template>
    </DetailDrawer>

    <BaseModal :open="showCreate" :title="t('units.addTitle')" :subtitle="t('units.addSubtitle')" @close="showCreate = false">
      <div class="form-grid">
        <div class="field">
          <label class="field-label">{{ t('units.property') }}</label>
          <select v-model.number="form.property_id" class="select">
            <option v-for="property in store.orgProperties" :key="property.id" :value="property.id">{{ property.name }}</option>
          </select>
        </div>
        <div class="field"><label class="field-label">{{ t('units.fieldUnitNumber') }}</label><input v-model="form.unit_number" class="input" :placeholder="t('units.placeholderUnit')" /></div>
        <div class="field"><label class="field-label">{{ t('units.fieldBaseRentForm') }}</label><input v-model.number="form.base_rent" class="input" type="number" placeholder="2400" /></div>
        <div class="field"><label class="field-label">{{ t('units.fieldSquareFeet') }}</label><input v-model.number="form.sqft" class="input" type="number" placeholder="850" /></div>
        <div class="field"><label class="field-label">{{ t('units.fieldBedrooms') }}</label><input v-model.number="form.bedrooms" class="input" type="number" min="0" /></div>
        <div class="field"><label class="field-label">{{ t('units.fieldBathrooms') }}</label><input v-model.number="form.bathrooms" class="input" type="number" min="0" /></div>
      </div>
      <template #footer>
        <button class="btn" @click="showCreate = false">{{ t('common.cancel') }}</button>
        <button class="btn btn-primary" @click="createUnit"><Plus :size="15" /> {{ t('units.addUnit') }}</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.unit-icon { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; background: var(--surface-3); color: var(--text-muted); }
.drawer-section { margin-top: 22px; }
.request-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.request-row:last-child { border-bottom: 0; }
.request-row strong { font-size: 12.5px; }
.request-row small { font-size: 11px; }
.request-icon { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; background: var(--warning-soft); color: var(--warning); flex: none; }
.check-row { display: flex; align-items: center; gap: 8px; min-height: 34px; font-size: 12px; color: var(--text-muted); cursor: pointer; }
.check-row input { width: 15px; height: 15px; accent-color: var(--primary); cursor: pointer; flex: none; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
</style>
