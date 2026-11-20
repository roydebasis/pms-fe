<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Search, Wrench, AlertTriangle, Clock, CheckCircle2, Plus, LayoutGrid, List, MessageSquare, Send } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import StatCard from '@/components/StatCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import DetailDrawer from '@/components/DetailDrawer.vue'
import BaseModal from '@/components/BaseModal.vue'
import { relativeDate, formatDate, initials, titleCase } from '@/utils/format'
import { notify } from '@/composables/useUi'

const { t } = useI18n()
const store = useAppStore()
const route = useRoute()
const search = ref(route.query.q || '')
watch(() => route.query.q, (value) => { search.value = value || '' })
const priorityFilter = ref('all')
const viewMode = ref('board')
const selected = ref(null)
const showCreate = ref(false)
const commentText = ref('')
const form = ref({ unit_id: store.orgUnits[0]?.id, title: '', description: '', priority: 'medium' })

const columns = computed(() => [
  { key: 'open', label: t('status.open'), tone: 'warning' },
  { key: 'in_progress', label: t('status.in_progress'), tone: 'info' },
  { key: 'completed', label: t('status.completed'), tone: 'success' },
])

const priorityLabel = (priority) => t(`maintenance.priority${titleCase(priority)}`)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return store.maintenanceDetailed.filter((request) => {
    const text = `${request.title} ${request.property?.name || ''} ${request.unit?.unit_number || ''}`.toLowerCase()
    return (!q || text.includes(q)) && (priorityFilter.value === 'all' || request.priority === priorityFilter.value)
  })
})

const summary = computed(() => {
  const all = store.maintenanceDetailed
  return {
    open: all.filter((r) => r.status === 'open').length,
    inProgress: all.filter((r) => r.status === 'in_progress').length,
    high: all.filter((r) => r.priority === 'high' && r.status !== 'completed').length,
    completed: all.filter((r) => r.status === 'completed').length,
  }
})

const drawerFields = computed(() => {
  const r = selected.value
  if (!r) return []
  return [
    { label: t('maintenance.fieldRequestId'), value: `#MNT-${String(r.id).padStart(4, '0')}` },
    { label: t('maintenance.fieldUnit'), value: `${r.unit?.unit_number} · ${r.property?.name}` },
    { label: t('maintenance.fieldPriority'), value: priorityLabel(r.priority), tone: r.priority === 'high' ? 'danger' : r.priority === 'medium' ? 'warning' : 'info' },
    { label: t('common.status'), value: t(`status.${r.status}`) },
    { label: t('maintenance.fieldReportedBy'), value: r.reporter?.name || '—' },
    { label: t('maintenance.fieldReportedOn'), value: formatDate(r.created_at) },
    { label: t('maintenance.fieldAssignedTo'), value: r.assignee?.name || t('maintenance.unassigned') },
  ]
})

function setStatus(status) {
  if (!selected.value) return
  store.updateMaintenanceStatus(selected.value.id, status)
  notify(t('maintenance.moved', { status: t(`status.${status}`) }))
}
function addComment() {
  if (!selected.value || !commentText.value.trim()) return
  store.addComment(selected.value.id, commentText.value)
  commentText.value = ''
  notify(t('maintenance.commentAdded'))
}
function createRequest() {
  if (!form.value.title.trim()) {
    notify(t('maintenance.titleRequired'), 'error')
    return
  }
  store.addMaintenanceRequest(form.value)
  showCreate.value = false
  form.value = { unit_id: store.orgUnits[0]?.id, title: '', description: '', priority: 'medium' }
  notify(t('maintenance.requestCreated'))
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('maintenance.title') }}</h1>
        <p class="page-subtitle">{{ t('maintenance.subtitle') }}</p>
      </div>
      <button class="btn btn-primary" @click="showCreate = true"><Plus :size="16" /> {{ t('maintenance.newRequest') }}</button>
    </div>

    <div class="stat-strip" style="margin-bottom: 18px">
      <StatCard compact :label="t('status.open')" :value="summary.open" :icon="Clock" tone="warning" />
      <StatCard compact :label="t('status.in_progress')" :value="summary.inProgress" :icon="Wrench" tone="info" />
      <StatCard compact :label="t('maintenance.highPriority')" :value="summary.high" :icon="AlertTriangle" tone="danger" />
      <StatCard compact :label="t('status.completed')" :value="summary.completed" :icon="CheckCircle2" tone="success" />
    </div>

    <div class="card">
      <div class="toolbar">
        <div class="search-field" style="flex: 1; min-width: 220px">
          <Search :size="15" />
          <input v-model="search" class="input" :placeholder="t('maintenance.searchPlaceholder')" />
        </div>
        <select v-model="priorityFilter" class="select" style="width: 150px">
          <option value="all">{{ t('maintenance.allPriorities') }}</option>
          <option value="high">{{ t('maintenance.priorityHigh') }}</option>
          <option value="medium">{{ t('maintenance.priorityMedium') }}</option>
          <option value="low">{{ t('maintenance.priorityLow') }}</option>
        </select>
        <div class="view-toggle">
          <button :class="{ active: viewMode === 'board' }" :title="t('maintenance.boardView')" @click="viewMode = 'board'"><LayoutGrid :size="15" /></button>
          <button :class="{ active: viewMode === 'list' }" :title="t('maintenance.listView')" @click="viewMode = 'list'"><List :size="15" /></button>
        </div>
      </div>

      <div v-if="viewMode === 'board'" class="board">
        <div v-for="column in columns" :key="column.key" class="board-column">
          <div class="board-head">
            <span class="board-dot" :class="column.tone"></span>
            <strong>{{ column.label }}</strong>
            <span class="board-count">{{ filtered.filter((r) => r.status === column.key).length }}</span>
          </div>
          <button
            v-for="request in filtered.filter((r) => r.status === column.key)"
            :key="request.id"
            class="board-card"
            @click="selected = request"
          >
            <div class="row justify-between">
              <span class="priority-badge" :class="request.priority">{{ priorityLabel(request.priority) }}</span>
              <span class="subtle" style="font-size: 10.5px">{{ relativeDate(request.created_at) }}</span>
            </div>
            <strong class="board-title">{{ request.title }}</strong>
            <span class="subtle" style="font-size: 11px">{{ request.property?.name }} · {{ t('maintenance.unitLabel', { number: request.unit?.unit_number }) }}</span>
            <div class="row justify-between board-card-footer">
              <span class="row gap-6">
                <span v-if="request.assignee" class="avatar avatar-sm" :style="{ background: request.assignee.avatar_color }">
                  {{ initials(request.assignee.name) }}
                </span>
                <span v-else class="subtle" style="font-size: 11px">{{ t('maintenance.unassigned') }}</span>
              </span>
              <span v-if="request.comments.length" class="row gap-4 subtle" style="font-size: 11px"><MessageSquare :size="12" /> {{ request.comments.length }}</span>
            </div>
          </button>
          <div v-if="!filtered.some((r) => r.status === column.key)" class="board-empty">{{ t('maintenance.nothingHere') }}</div>
        </div>
      </div>

      <div v-else-if="filtered.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('maintenance.colRequest') }}</th>
              <th>{{ t('maintenance.colUnitProperty') }}</th>
              <th>{{ t('maintenance.colPriority') }}</th>
              <th>{{ t('common.status') }}</th>
              <th>{{ t('maintenance.colReported') }}</th>
              <th>{{ t('maintenance.colAssignee') }}</th>
              <th>{{ t('maintenance.colComments') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in filtered" :key="request.id" class="clickable" @click="selected = request">
              <td><strong>{{ request.title }}</strong><small class="subtle" style="display: block">#MNT-{{ String(request.id).padStart(4, '0') }}</small></td>
              <td><div class="col"><strong>{{ request.unit?.unit_number }}</strong><small class="muted">{{ request.property?.name }}</small></div></td>
              <td><span class="priority-badge" :class="request.priority">{{ priorityLabel(request.priority) }}</span></td>
              <td><StatusBadge :status="request.status" /></td>
              <td class="muted">{{ relativeDate(request.created_at) }}</td>
              <td>
                <div v-if="request.assignee" class="row gap-8"><span class="avatar avatar-sm" :style="{ background: request.assignee.avatar_color }">{{ initials(request.assignee.name) }}</span>{{ request.assignee.name }}</div>
                <span v-else class="subtle">{{ t('maintenance.unassigned') }}</span>
              </td>
              <td class="muted">{{ request.comments.length }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="viewMode === 'list'" class="empty-state">
        <div class="empty-icon"><Wrench :size="20" /></div>
        <strong>{{ t('maintenance.noRequests') }}</strong>
        <span>{{ t('maintenance.noRequestsHint') }}</span>
      </div>
    </div>

    <DetailDrawer
      :open="!!selected"
      :eyebrow="t('maintenance.drawerEyebrow')"
      :title="selected?.title || ''"
      :subtitle="selected ? `#MNT-${String(selected.id).padStart(4, '0')} · ${selected.property?.name} · ${t('maintenance.unitLabel', { number: selected.unit?.unit_number })}` : ''"
      @close="selected = null"
    >
      <template v-if="selected" #default>
        <p class="description">{{ selected.description }}</p>
        <div class="status-actions">
          <button
            v-for="option in columns"
            :key="option.key"
            class="status-option"
            :class="{ active: selected.status === option.key }"
            @click="setStatus(option.key)"
          >
            <span class="board-dot" :class="option.tone"></span>{{ option.label }}
          </button>
        </div>
        <div class="detail-list">
          <div v-for="field in drawerFields" :key="field.label" class="detail-row">
            <span class="detail-key">{{ field.label }}</span>
            <span class="detail-val" :style="field.tone ? { color: `var(--${field.tone})` } : null">{{ field.value }}</span>
          </div>
        </div>
        <div class="comments-section">
          <h4 class="section-title" style="margin-bottom: 12px">{{ t('maintenance.conversation', { count: selected.comments.length }) }}</h4>
          <div v-for="comment in selected.comments" :key="comment.id" class="comment">
            <span class="avatar avatar-sm" :style="{ background: comment.author?.avatar_color || 'var(--avatar-fallback)' }">{{ initials(comment.author?.name || '?') }}</span>
            <div class="col">
              <div class="row gap-8"><strong>{{ comment.author?.name }}</strong><small class="subtle">{{ relativeDate(comment.created_at) }}</small></div>
              <p>{{ comment.body }}</p>
            </div>
          </div>
          <p v-if="!selected.comments.length" class="muted" style="font-size: 12px">{{ t('maintenance.noComments') }}</p>
          <div class="comment-input">
            <input v-model="commentText" class="input" :placeholder="t('maintenance.writeComment')" @keyup.enter="addComment" />
            <button class="btn btn-primary btn-icon" @click="addComment"><Send :size="15" /></button>
          </div>
        </div>
      </template>
      <template #footer><button class="btn" @click="selected = null">{{ t('common.close') }}</button></template>
    </DetailDrawer>

    <BaseModal :open="showCreate" :title="t('maintenance.createTitle')" :subtitle="t('maintenance.createSubtitle')" @close="showCreate = false">
      <div class="form-grid">
        <div class="field" style="grid-column: 1 / -1">
          <label class="field-label">{{ t('maintenance.fieldUnit') }}</label>
          <select v-model="form.unit_id" class="select">
            <option v-for="unit in store.orgUnits" :key="unit.id" :value="unit.id">{{ store.propertyById(unit.property_id)?.name }} · {{ t('maintenance.unitLabel', { number: unit.unit_number }) }}</option>
          </select>
        </div>
        <div class="field" style="grid-column: 1 / -1"><label class="field-label">{{ t('maintenance.fieldTitle') }}</label><input v-model="form.title" class="input" :placeholder="t('maintenance.titlePlaceholder')" /></div>
        <div class="field" style="grid-column: 1 / -1"><label class="field-label">{{ t('maintenance.fieldDescription') }}</label><textarea v-model="form.description" class="textarea" :placeholder="t('maintenance.descriptionPlaceholder')"></textarea></div>
        <div class="field" style="grid-column: 1 / -1">
          <label class="field-label">{{ t('maintenance.fieldPriority') }}</label>
          <select v-model="form.priority" class="select"><option value="low">{{ t('maintenance.priorityLow') }}</option><option value="medium">{{ t('maintenance.priorityMedium') }}</option><option value="high">{{ t('maintenance.priorityHigh') }}</option></select>
        </div>
      </div>
      <template #footer>
        <button class="btn" @click="showCreate = false">{{ t('common.cancel') }}</button>
        <button class="btn btn-primary" @click="createRequest"><Plus :size="15" /> {{ t('maintenance.createRequest') }}</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.stat-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

.view-toggle { display: flex; border: 1px solid var(--border-strong); border-radius: 8px; overflow: hidden; }
.view-toggle button { width: 34px; height: 34px; border: 0; background: var(--surface); color: var(--text-muted); display: grid; place-items: center; }
.view-toggle button.active { background: var(--primary-soft); color: var(--primary-text); }

.board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 18px; background: var(--surface-2); min-height: 400px; }
.board-column { display: flex; flex-direction: column; gap: 9px; }
.board-head { display: flex; align-items: center; gap: 8px; padding: 4px 4px 8px; }
.board-head strong { font-size: 12.5px; }
.board-dot { width: 8px; height: 8px; border-radius: 99px; flex: none; }
.board-dot.warning { background: var(--warning); }
.board-dot.info { background: var(--info); }
.board-dot.success { background: var(--success); }
.board-count { padding: 1px 7px; border-radius: 6px; background: var(--surface-3); color: var(--text-muted); font-size: 10.5px; font-weight: 700; }
.board-card { display: flex; flex-direction: column; align-items: stretch; gap: 7px; padding: 13px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); text-align: left; transition: box-shadow 0.15s, transform 0.15s; }
.board-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.board-title { font-size: 13px; font-weight: 650; line-height: 1.35; }
.board-card > span { line-height: 1.3; }
.board-card-footer { margin-top: 4px; }
.board-empty { padding: 24px; text-align: center; border: 1px dashed var(--border-strong); border-radius: 10px; color: var(--text-subtle); font-size: 12px; }
.priority-badge { display: inline-flex; padding: 2px 8px; border-radius: 99px; font-size: 10.5px; font-weight: 700; text-transform: capitalize; }
.priority-badge.high { background: var(--danger-soft); color: var(--danger); }
.priority-badge.medium { background: var(--warning-soft); color: var(--warning); }
.priority-badge.low { background: var(--info-soft); color: var(--info); }

.description { font-size: 13px; color: var(--text-muted); line-height: 1.6; padding: 12px; background: var(--surface-2); border-radius: 9px; border: 1px solid var(--border); }
.status-actions { display: flex; gap: 7px; margin: 16px 0; }
.status-option { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid var(--border-strong); border-radius: 8px; background: var(--surface); font-size: 11.5px; font-weight: 600; color: var(--text-muted); }
.status-option.active { border-color: var(--primary); background: var(--primary-soft); color: var(--primary-text); }
.comments-section { margin-top: 22px; }
.comment { display: flex; gap: 9px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.comment strong { font-size: 12px; }
.comment small { font-size: 10.5px; }
.comment p { font-size: 12px; color: var(--text-muted); margin-top: 4px; line-height: 1.45; }
.comment-input { display: flex; gap: 8px; margin-top: 14px; }
.form-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
@media (max-width: 900px) { .stat-strip { grid-template-columns: repeat(2, 1fr); } .board { grid-template-columns: 1fr; } }
</style>
