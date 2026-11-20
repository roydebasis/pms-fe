<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Search, Plus, UserPlus, ShieldCheck, Mail, Check, X } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import StatusBadge from '@/components/StatusBadge.vue'
import DetailDrawer from '@/components/DetailDrawer.vue'
import BaseModal from '@/components/BaseModal.vue'
import { initials, titleCase } from '@/utils/format'
import { notify } from '@/composables/useUi'

const { t } = useI18n()
const store = useAppStore()
const route = useRoute()
const search = ref(route.query.q || '')
watch(() => route.query.q, (value) => { search.value = value || '' })
const roleFilter = ref('all')
const typeFilter = ref('all')
const selected = ref(null)
const showInvite = ref(false)
const form = ref({ name: '', email: '', role: 'property_manager' })

const teamRoles = ['admin', 'property_manager', 'maintenance', 'accountant', 'viewer']

const roleKeys = {
  admin: 'users.roleAdmin',
  property_manager: 'users.rolePropertyManager',
  maintenance: 'users.roleMaintenance',
  accountant: 'users.roleAccountant',
  viewer: 'users.roleViewer',
  tenant: 'users.roleTenant',
}
const roleLabel = (role) => (roleKeys[role] ? t(roleKeys[role]) : titleCase(role))

const namedRoleKeys = {
  Admin: 'users.roleAdmin',
  'Property manager': 'users.rolePropertyManager',
  Maintenance: 'users.roleMaintenance',
  Accountant: 'users.roleAccountant',
  Viewer: 'users.roleViewer',
  Tenant: 'users.roleTenant',
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return store.orgUsers.filter((user) => {
    const text = `${user.name} ${user.email}`.toLowerCase()
    const isTeam = teamRoles.includes(user.role)
    return (!q || text.includes(q))
      && (roleFilter.value === 'all' || user.role === roleFilter.value)
      && (typeFilter.value === 'all' || (typeFilter.value === 'team' ? isTeam : !isTeam))
  })
})

const roleFor = (userId) => store.model_has_role.find((mr) => mr.model_id === userId)?.role_id
const roleName = (userId) => {
  const name = store.roles.find((r) => r.id === roleFor(userId))?.name
  if (!name) return roleLabel(userRoleFallback(userId))
  return namedRoleKeys[name] ? t(namedRoleKeys[name]) : name
}
function userRoleFallback(userId) {
  return store.users.find((u) => u.id === userId)?.role || 'viewer'
}
const permissionCount = (userId) => {
  const rid = roleFor(userId)
  return rid ? store.role_has_permission.filter((rp) => rp.role_id === rid).length : 0
}

const drawerFields = computed(() => {
  const u = selected.value
  if (!u) return []
  return [
    { label: t('users.fieldEmail'), value: u.email },
    { label: t('users.fieldRole'), value: roleLabel(u.role) },
    { label: t('users.fieldUserType'), value: teamRoles.includes(u.role) ? t('users.teamMember') : t('users.resident') },
    { label: t('common.status'), value: t(`status.${u.status}`), tone: u.status === 'active' ? 'success' : 'danger' },
    { label: t('users.fieldPlatformAdmin'), value: u.is_platform_admin ? t('users.yes') : t('users.no') },
    { label: t('users.fieldRolePermissions'), value: permissionCount(u.id) },
  ]
})

function toggleStatus(user) {
  const next = user.status === 'active' ? 'suspended' : 'active'
  store.updateUserStatus(user.id, next)
  notify(t('users.notifyStatus', { name: user.name, status: t(`status.${next}`) }))
}
function inviteUser() {
  if (!form.value.name.trim() || !form.value.email.includes('@')) {
    notify(t('users.enterValid'), 'error')
    return
  }
  store.createUser(form.value)
  showInvite.value = false
  form.value = { name: '', email: '', role: 'property_manager' }
  notify(t('users.userInvited'))
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('users.title') }}</h1>
        <p class="page-subtitle">{{ t('users.subtitle', { organization: store.currentOrganization.name }) }}</p>
      </div>
      <button class="btn btn-primary" @click="showInvite = true"><UserPlus :size="16" /> {{ t('users.inviteUser') }}</button>
    </div>

    <div class="card">
      <div class="toolbar">
        <div class="search-field" style="flex: 1; min-width: 220px">
          <Search :size="15" />
          <input v-model="search" class="input" :placeholder="t('users.searchPlaceholder')" />
        </div>
        <select v-model="typeFilter" class="select" style="width: 145px">
          <option value="all">{{ t('users.everyone') }}</option>
          <option value="team">{{ t('users.teamMembers') }}</option>
          <option value="resident">{{ t('users.residents') }}</option>
        </select>
        <select v-model="roleFilter" class="select" style="width: 165px">
          <option value="all">{{ t('users.allRoles') }}</option>
          <option v-for="role in [...teamRoles, 'tenant']" :key="role" :value="role">{{ roleLabel(role) }}</option>
        </select>
      </div>

      <div v-if="filtered.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('users.colUser') }}</th>
              <th>{{ t('users.colEmail') }}</th>
              <th>{{ t('users.colRole') }}</th>
              <th>{{ t('users.colType') }}</th>
              <th>{{ t('common.status') }}</th>
              <th class="num">{{ t('users.colPermissions') }}</th>
              <th style="width: 100px">{{ t('users.colActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filtered" :key="user.id" class="clickable" @click="selected = user">
              <td>
                <div class="row gap-10">
                  <span class="avatar" :style="{ background: user.avatar_color || 'var(--avatar-fallback)' }">{{ initials(user.name) }}</span>
                  <div class="col"><strong>{{ user.name }}</strong><small class="subtle">{{ user.is_platform_admin ? t('users.platformAdmin') : `#${user.id}` }}</small></div>
                </div>
              </td>
              <td class="muted">{{ user.email }}</td>
              <td><span class="badge badge-primary">{{ roleLabel(user.role) }}</span></td>
              <td><span class="badge" :class="teamRoles.includes(user.role) ? 'badge-violet' : 'badge-neutral'">{{ teamRoles.includes(user.role) ? t('users.team') : t('users.resident') }}</span></td>
              <td><StatusBadge :status="user.status" /></td>
              <td class="num muted">{{ permissionCount(user.id) }}</td>
              <td>
                <button class="btn btn-sm" :class="user.status === 'active' ? 'btn-danger' : ''" @click.stop="toggleStatus(user)">
                  <X v-if="user.status === 'active'" :size="13" /> <Check v-else :size="13" />
                  {{ user.status === 'active' ? t('users.suspend') : t('users.activate') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon"><Search :size="20" /></div>
        <strong>{{ t('users.noUsers') }}</strong>
        <span>{{ t('users.noUsersHint') }}</span>
      </div>

      <div class="table-footer">
        <span>{{ t('users.showing', { shown: filtered.length, total: store.orgUsers.length }) }}</span>
        <span>{{ t('users.teamSummary', { team: filtered.filter((u) => teamRoles.includes(u.role)).length, residents: filtered.filter((u) => !teamRoles.includes(u.role)).length }) }}</span>
      </div>
    </div>

    <DetailDrawer
      :open="!!selected"
      :eyebrow="t('users.drawerEyebrow')"
      :title="selected?.name || ''"
      :subtitle="selected?.email || ''"
      @close="selected = null"
    >
      <template v-if="selected" #default>
        <div class="profile-head">
          <span class="avatar avatar-lg" :style="{ background: selected.avatar_color || 'var(--avatar-fallback)' }">{{ initials(selected.name) }}</span>
          <div class="col"><strong>{{ selected.name }}</strong><small class="muted">{{ selected.email }}</small></div>
        </div>
        <div class="detail-list">
          <div v-for="field in drawerFields" :key="field.label" class="detail-row">
            <span class="detail-key">{{ field.label }}</span>
            <span class="detail-val" :style="field.tone ? { color: `var(--${field.tone})` } : null">{{ field.value }}</span>
          </div>
        </div>
        <div class="drawer-section">
          <h4 class="section-title" style="margin-bottom: 10px">{{ t('users.accessRole') }}</h4>
          <div class="role-box">
            <ShieldCheck :size="18" class="primary-icon" />
            <div class="col"><strong>{{ roleName(selected.id) }}</strong><small class="subtle">{{ t('users.permissionsGranted', { count: permissionCount(selected.id) }) }}</small></div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn" @click="selected = null">{{ t('common.close') }}</button>
        <button class="btn" :class="selected?.status === 'active' ? 'btn-danger' : ''" @click="toggleStatus(selected); selected = null">
          {{ selected?.status === 'active' ? t('users.suspendUser') : t('users.activateUser') }}
        </button>
      </template>
    </DetailDrawer>

    <BaseModal :open="showInvite" :title="t('users.inviteTitle')" :subtitle="t('users.inviteSubtitle')" @close="showInvite = false">
      <div class="form-grid">
        <div class="field"><label class="field-label">{{ t('users.fieldFullName') }}</label><input v-model="form.name" class="input" :placeholder="t('users.fullNamePlaceholder')" /></div>
        <div class="field"><label class="field-label">{{ t('users.fieldEmailAddress') }}</label><input v-model="form.email" class="input" type="email" :placeholder="t('users.emailPlaceholder')" /></div>
        <div class="field" style="grid-column: 1 / -1">
          <label class="field-label">{{ t('users.fieldRole') }}</label>
          <select v-model="form.role" class="select"><option v-for="role in teamRoles" :key="role" :value="role">{{ roleLabel(role) }}</option></select>
        </div>
      </div>
      <p class="muted" style="font-size: 12px; margin-top: 14px">{{ t('users.inviteHint') }}</p>
      <template #footer>
        <button class="btn" @click="showInvite = false">{{ t('common.cancel') }}</button>
        <button class="btn btn-primary" @click="inviteUser"><Mail :size="15" /> {{ t('users.sendInvite') }}</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.primary-icon { color: var(--primary); }
.profile-head { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; margin-bottom: 6px; border-bottom: 1px solid var(--border); }
.profile-head strong { font-size: 15px; }
.profile-head small { font-size: 12px; }
.drawer-section { margin-top: 22px; }
.role-box { display: flex; align-items: center; gap: 12px; padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--primary-soft); }
.role-box strong { font-size: 13px; }
.role-box small { font-size: 11px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
</style>
