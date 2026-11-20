<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Plus, MapPin, LayoutGrid, List, Building2, ArrowUpRight, SlidersHorizontal, X } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import StatusBadge from '@/components/StatusBadge.vue'
import DetailDrawer from '@/components/DetailDrawer.vue'
import BaseModal from '@/components/BaseModal.vue'
import { currency, formatDate, initials } from '@/utils/format'
import { notify } from '@/composables/useUi'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useAppStore()
const router = useRouter()
const route = useRoute()

const search = ref(route.query.q || '')
watch(() => route.query.q, (value) => { search.value = value || '' })

const cityFilter = ref('all')
const typeFilter = ref('all')
const viewMode = ref('grid')
const selected = ref(null)
const showCreate = ref(false)
const form = ref({ name: '', city: '', address: '', type: 'Apartment' })

const advancedOpen = ref(false)
const occupancyMin = ref('')
const occupancyMax = ref('')
const rentRollMin = ref('')
const rentRollMax = ref('')
const unitCountMin = ref('')
const unitCountMax = ref('')
const acquiredFrom = ref('')
const acquiredTo = ref('')
const hasVacantOnly = ref(false)

const cities = computed(() => [...new Set(store.propertiesWithStats.map((p) => p.city.split(',')[0]))])

const activeFilterCount = computed(() =>
  [occupancyMin, occupancyMax, rentRollMin, rentRollMax, unitCountMin, unitCountMax, acquiredFrom, acquiredTo]
    .filter((v) => v.value !== '').length +
  (cityFilter.value !== 'all' ? 1 : 0) +
  (typeFilter.value !== 'all' ? 1 : 0) +
  (hasVacantOnly.value ? 1 : 0),
)

function clearFilters() {
  search.value = ''
  cityFilter.value = 'all'
  typeFilter.value = 'all'
  occupancyMin.value = ''
  occupancyMax.value = ''
  rentRollMin.value = ''
  rentRollMax.value = ''
  unitCountMin.value = ''
  unitCountMax.value = ''
  acquiredFrom.value = ''
  acquiredTo.value = ''
  hasVacantOnly.value = false
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return store.propertiesWithStats.filter((p) => {
    const matchesSearch = !q || `${p.name} ${p.city} ${p.address}`.toLowerCase().includes(q)
    const matchesCity = cityFilter.value === 'all' || p.city.startsWith(cityFilter.value)
    const matchesType = typeFilter.value === 'all' || p.type === typeFilter.value
    const matchesOccupancy =
      (!occupancyMin.value || p.occupancy >= Number(occupancyMin.value)) &&
      (!occupancyMax.value || p.occupancy <= Number(occupancyMax.value))
    const matchesRent =
      (!rentRollMin.value || p.monthlyRent >= Number(rentRollMin.value)) &&
      (!rentRollMax.value || p.monthlyRent <= Number(rentRollMax.value))
    const matchesUnits =
      (!unitCountMin.value || p.unitCount >= Number(unitCountMin.value)) &&
      (!unitCountMax.value || p.unitCount <= Number(unitCountMax.value))
    const acquired = p.acquired_at || ''
    const matchesAcquired =
      (!acquiredFrom.value || acquired >= acquiredFrom.value) &&
      (!acquiredTo.value || acquired <= acquiredTo.value)
    const matchesVacant = !hasVacantOnly.value || p.vacantCount > 0
    return matchesSearch && matchesCity && matchesType && matchesOccupancy &&
      matchesRent && matchesUnits && matchesAcquired && matchesVacant
  })
})

const tenantAvatars = (property) =>
  store.unitsDetailed
    .filter((u) => u.property_id === property.id && u.tenant)
    .slice(0, 4)
    .map((u) => u.tenant)

const drawerFields = computed(() => {
  const p = selected.value
  if (!p) return []
  return [
    { label: t('properties.fieldAddress'), value: p.address },
    { label: t('properties.fieldCity'), value: p.city },
    { label: t('properties.fieldType'), value: p.type },
    { label: t('properties.fieldAcquired'), value: formatDate(p.acquired_at) },
    { label: t('properties.fieldTotalUnits'), value: p.unitCount },
    { label: t('status.occupied'), value: `${p.occupiedCount} (${p.occupancy}%)` },
    { label: t('status.vacant'), value: p.vacantCount },
    { label: t('properties.fieldMonthlyRentRoll'), value: currency(p.monthlyRent), tone: 'primary-text' },
  ]
})

function createProperty() {
  if (!form.value.name.trim() || !form.value.city.trim()) {
    notify(t('properties.nameCityRequired'), 'error')
    return
  }
  store.createProperty(form.value)
  showCreate.value = false
  form.value = { name: '', city: '', address: '', type: 'Apartment' }
  notify(t('properties.propertyCreated'))
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('properties.title') }}</h1>
        <p class="page-subtitle">{{ t('properties.subtitle', { count: store.propertiesWithStats.length, name: store.currentOrganization.name }) }}</p>
      </div>
      <button class="btn btn-primary" @click="showCreate = true"><Plus :size="16" /> {{ t('properties.addProperty') }}</button>
    </div>

    <div class="card">
      <div class="toolbar">
        <div class="search-field" style="flex: 1; min-width: 220px">
          <Search :size="15" />
          <input v-model="search" class="input" :placeholder="t('properties.searchPlaceholder')" />
        </div>
        <select v-model="cityFilter" class="select" style="width: 150px">
          <option value="all">{{ t('properties.allCities') }}</option>
          <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
        </select>
        <select v-model="typeFilter" class="select" style="width: 150px">
          <option value="all">{{ t('properties.allTypes') }}</option>
          <option v-for="type in ['Apartment', 'Condo', 'Townhome', 'Mixed-use', 'Villa']" :key="type">{{ type }}</option>
        </select>
        <button class="btn btn-sm" :class="{ 'btn-primary': advancedOpen }" @click="advancedOpen = !advancedOpen">
          <SlidersHorizontal :size="15" /> {{ t('common.filters') }}
          <span v-if="activeFilterCount" class="filter-count">{{ activeFilterCount }}</span>
        </button>
        <button v-if="activeFilterCount" class="btn btn-ghost btn-sm" @click="clearFilters"><X :size="14" /> {{ t('common.clearFilters') }}</button>
        <div class="view-toggle">
          <button :class="{ active: viewMode === 'grid' }" :title="t('properties.gridView')" @click="viewMode = 'grid'"><LayoutGrid :size="15" /></button>
          <button :class="{ active: viewMode === 'list' }" :title="t('properties.listView')" @click="viewMode = 'list'"><List :size="15" /></button>
        </div>
      </div>

      <div v-if="advancedOpen" class="filter-panel">
        <div class="filter-grid">
          <div class="field">
            <label class="field-label">{{ t('properties.filterOccupancy') }}</label>
            <div class="row gap-8">
              <input v-model="occupancyMin" class="input" type="number" min="0" max="100" :placeholder="t('common.min')" />
              <input v-model="occupancyMax" class="input" type="number" min="0" max="100" :placeholder="t('common.max')" />
            </div>
          </div>
          <div class="field">
            <label class="field-label">{{ t('properties.filterRentRoll') }}</label>
            <div class="row gap-8">
              <input v-model="rentRollMin" class="input" type="number" min="0" :placeholder="t('common.min')" />
              <input v-model="rentRollMax" class="input" type="number" min="0" :placeholder="t('common.max')" />
            </div>
          </div>
          <div class="field">
            <label class="field-label">{{ t('properties.filterUnitCount') }}</label>
            <div class="row gap-8">
              <input v-model="unitCountMin" class="input" type="number" min="0" :placeholder="t('common.min')" />
              <input v-model="unitCountMax" class="input" type="number" min="0" :placeholder="t('common.max')" />
            </div>
          </div>
          <div class="field">
            <label class="field-label">{{ t('properties.filterAcquired') }}</label>
            <div class="row gap-8">
              <input v-model="acquiredFrom" class="input" type="date" :aria-label="t('common.from')" />
              <input v-model="acquiredTo" class="input" type="date" :aria-label="t('common.to')" />
            </div>
          </div>
          <div class="field">
            <label class="field-label">{{ t('properties.hasVacantUnits') }}</label>
            <label class="check-row"><input v-model="hasVacantOnly" type="checkbox" /> <span>{{ t('properties.hasVacantUnitsHint') }}</span></label>
          </div>
        </div>
      </div>

      <div v-if="filtered.length && viewMode === 'grid'" class="property-grid">
        <button v-for="property in filtered" :key="property.id" class="property-card" @click="selected = property">
          <div class="property-card-top">
            <span class="property-icon"><Building2 :size="19" /></span>
            <span class="badge badge-neutral">{{ property.type }}</span>
          </div>
          <h3>{{ property.name }}</h3>
          <div class="row gap-4 muted" style="font-size: 12px">
            <MapPin :size="13" /> {{ property.city }}
          </div>
          <div class="property-stats">
            <div><strong>{{ property.unitCount }}</strong><small>{{ t('properties.units') }}</small></div>
            <div><strong>{{ property.occupancy }}%</strong><small>{{ t('status.occupied') }}</small></div>
            <div><strong>{{ currency(property.monthlyRent) }}</strong><small>{{ t('properties.monthlyRoll') }}</small></div>
          </div>
          <div class="progress"><span :style="{ width: `${property.occupancy}%` }"></span></div>
          <div class="row justify-between property-card-footer">
            <div class="avatar-stack">
              <span v-for="tenant in tenantAvatars(property)" :key="tenant.id" class="avatar avatar-sm" :style="{ background: tenant.avatar_color }">
                {{ initials(tenant.name) }}
              </span>
              <span v-if="!tenantAvatars(property).length" class="subtle" style="font-size: 11px">{{ t('properties.noActiveTenants') }}</span>
            </div>
            <span class="link" style="font-size: 11.5px">{{ t('common.details') }} <ArrowUpRight :size="12" /></span>
          </div>
        </button>
      </div>

      <div v-else-if="filtered.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('properties.property') }}</th><th>{{ t('properties.city') }}</th><th>{{ t('properties.type') }}</th><th class="num">{{ t('properties.units') }}</th>
              <th style="width: 170px">{{ t('properties.occupancy') }}</th><th class="num">{{ t('properties.monthlyRoll') }}</th><th>{{ t('properties.acquired') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="property in filtered" :key="property.id" class="clickable" @click="selected = property">
              <td>
                <div class="row gap-10">
                  <span class="property-icon small"><Building2 :size="16" /></span>
                  <strong>{{ property.name }}</strong>
                </div>
              </td>
              <td class="muted">{{ property.city }}</td>
              <td><span class="badge badge-neutral">{{ property.type }}</span></td>
              <td class="num">{{ property.unitCount }}</td>
              <td>
                <div class="row gap-8">
                  <div class="progress grow"><span :style="{ width: `${property.occupancy}%` }"></span></div>
                  <strong style="font-size: 12px">{{ property.occupancy }}%</strong>
                </div>
              </td>
              <td class="num">{{ currency(property.monthlyRent) }}</td>
              <td class="muted">{{ formatDate(property.acquired_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon"><Search :size="20" /></div>
        <strong>{{ t('properties.noPropertiesFound') }}</strong>
        <span>{{ t('properties.tryAdjusting') }}</span>
      </div>

      <div class="table-footer">
        <span>{{ t('properties.showingOf', { shown: filtered.length, total: store.propertiesWithStats.length }) }}</span>
        <button class="link-button" @click="router.push('/units')">{{ t('properties.browseAllUnits') }} <ArrowUpRight :size="13" /></button>
      </div>
    </div>

    <DetailDrawer
      :open="!!selected"
      :eyebrow="t('properties.property')"
      :title="selected?.name || ''"
      :subtitle="selected?.address || ''"
      :fields="drawerFields"
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
            <h4 class="section-title">{{ t('properties.units') }}</h4>
            <span class="badge badge-primary">{{ t('properties.totalCount', { count: selected.unitCount }) }}</span>
          </div>
          <div class="unit-chips">
            <button
              v-for="unit in selected.units"
              :key="unit.id"
              class="unit-chip"
              @click="router.push({ path: '/units', query: { q: unit.unit_number } })"
            >
              <span class="chip-dot" :class="unit.status"></span>
              {{ unit.unit_number }}
            </button>
          </div>
        </div>
        <div class="drawer-section" v-if="tenantAvatars(selected).length">
          <h4 class="section-title" style="margin-bottom: 10px">{{ t('properties.activeResidents') }}</h4>
          <div v-for="tenant in tenantAvatars(selected)" :key="tenant.id" class="resident-row">
            <span class="avatar avatar-sm" :style="{ background: tenant.avatar_color }">{{ initials(tenant.name) }}</span>
            <div class="col"><strong>{{ tenant.name }}</strong><small class="subtle">{{ tenant.email }}</small></div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn" @click="selected = null">{{ t('common.close') }}</button>
        <button class="btn btn-primary" @click="router.push({ path: '/units', query: { q: selected?.name } }); selected = null">
          {{ t('properties.viewUnits') }} <ArrowUpRight :size="14" />
        </button>
      </template>
    </DetailDrawer>

    <BaseModal
      :open="showCreate"
      :title="t('properties.addTitle')"
      :subtitle="t('properties.addSubtitle')"
      @close="showCreate = false"
    >
      <div class="form-grid">
        <div class="field"><label class="field-label">{{ t('properties.fieldPropertyName') }}</label><input v-model="form.name" class="input" :placeholder="t('properties.placeholderName')" /></div>
        <div class="field"><label class="field-label">{{ t('properties.fieldCity') }}</label><input v-model="form.city" class="input" :placeholder="t('properties.placeholderCity')" /></div>
        <div class="field" style="grid-column: 1 / -1"><label class="field-label">{{ t('properties.fieldAddress') }}</label><input v-model="form.address" class="input" :placeholder="t('properties.placeholderAddress')" /></div>
        <div class="field" style="grid-column: 1 / -1">
          <label class="field-label">{{ t('properties.fieldPropertyType') }}</label>
          <select v-model="form.type" class="select"><option>Apartment</option><option>Condo</option><option>Townhome</option><option>Mixed-use</option><option>Villa</option></select>
        </div>
      </div>
      <template #footer>
        <button class="btn" @click="showCreate = false">{{ t('common.cancel') }}</button>
        <button class="btn btn-primary" @click="createProperty"><Plus :size="15" /> {{ t('properties.createProperty') }}</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.property-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; padding: 18px; }
.property-card {
  display: flex; flex-direction: column; gap: 8px; text-align: left;
  padding: 17px; border: 1px solid var(--border); border-radius: var(--radius);
  background: var(--surface); transition: box-shadow 0.16s, transform 0.16s, border-color 0.16s;
}
.property-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: var(--primary); }
.property-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.property-icon { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-text); }
.property-icon.small { width: 32px; height: 32px; }
.property-card h3 { font-size: 15px; font-weight: 650; letter-spacing: -0.02em; }
.property-stats { display: flex; gap: 18px; padding: 10px 0 4px; }
.property-stats div { display: flex; flex-direction: column; }
.property-stats strong { font-size: 14px; font-variant-numeric: tabular-nums; }
.property-stats small { font-size: 10.5px; color: var(--text-subtle); }
.property-card-footer { margin-top: 4px; }
.view-toggle { display: flex; border: 1px solid var(--border-strong); border-radius: 8px; overflow: hidden; }
.view-toggle button { width: 34px; height: 34px; border: 0; background: var(--surface); color: var(--text-muted); display: grid; place-items: center; }
.view-toggle button.active { background: var(--primary-soft); color: var(--primary-text); }
.link-button { display: inline-flex; align-items: center; gap: 4px; border: 0; background: transparent; color: var(--primary-text); font-size: 12px; font-weight: 650; }
.link-button:hover { text-decoration: underline; }
.check-row { display: flex; align-items: center; gap: 8px; min-height: 34px; font-size: 12px; color: var(--text-muted); cursor: pointer; }
.check-row input { width: 15px; height: 15px; accent-color: var(--primary); cursor: pointer; flex: none; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.drawer-section { margin-top: 22px; }
.unit-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
.unit-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 7px; background: var(--surface); font-size: 12px; font-weight: 600; }
.unit-chip:hover { border-color: var(--primary); color: var(--primary-text); }
.chip-dot { width: 7px; height: 7px; border-radius: 99px; }
.chip-dot.occupied { background: var(--success); }
.chip-dot.vacant { background: var(--info); }
.chip-dot.maintenance { background: var(--danger); }
.resident-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); }
.resident-row strong { font-size: 12.5px; }
.resident-row small { font-size: 11px; }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
</style>
