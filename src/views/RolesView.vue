<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ShieldCheck, Users, Lock, Check, Info } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import DetailDrawer from '@/components/DetailDrawer.vue'
import { initials, titleCase } from '@/utils/format'
import { notify } from '@/composables/useUi'

const { t } = useI18n()
const store = useAppStore()
const selected = ref(null)

const roleKeys = {
  Admin: 'roles.roleAdmin',
  'Property manager': 'roles.rolePropertyManager',
  Maintenance: 'roles.roleMaintenance',
  Accountant: 'roles.roleAccountant',
  Viewer: 'roles.roleViewer',
}
const roleLabel = (name) => (roleKeys[name] ? t(roleKeys[name]) : name)

const groupKeys = {
  properties: 'roles.groupProperties',
  units: 'roles.groupUnits',
  leases: 'roles.groupLeases',
  payments: 'roles.groupPayments',
  maintenance: 'roles.groupMaintenance',
  users: 'roles.groupUsers',
  roles: 'roles.groupRoles',
  reports: 'roles.groupReports',
}
const groupLabel = (module) => (groupKeys[module] ? t(groupKeys[module]) : titleCase(module))
const actionLabel = (action) => (action === 'view' ? t('roles.actionView') : action === 'manage' ? t('roles.actionManage') : action)

const groups = computed(() => {
  const result = {}
  store.permissions.forEach((permission) => {
    const module = permission.name.split('.')[0]
    if (!result[module]) result[module] = []
    result[module].push(permission)
  })
  return result
})

const members = computed(() =>
  selected.value
    ? store.orgUsers.filter((u) => store.model_has_role.some((mr) => mr.role_id === selected.value.id && mr.model_id === u.id))
    : [],
)

const isEnabled = (permissionId) =>
  Boolean(selected.value && store.role_has_permission.some((rp) => rp.role_id === selected.value.id && rp.permission_id === permissionId))

function togglePermission(permission) {
  if (!selected.value) return
  const granted = !isEnabled(permission.id)
  store.toggleRolePermission(selected.value.id, permission.id)
  notify(t('roles.notifyPermission', {
    permission: permission.name,
    action: t(granted ? 'roles.granted' : 'roles.revoked'),
    role: roleLabel(selected.value.name),
  }), 'info')
}

const drawerFields = computed(() => {
  const role = selected.value
  if (!role) return []
  return [
    { label: t('roles.fieldRoleName'), value: roleLabel(role.name) },
    { label: t('roles.fieldType'), value: role.is_system ? t('roles.systemRole') : t('roles.customRole') },
    { label: t('roles.fieldDescription'), value: role.description || '—' },
    { label: t('roles.fieldMembers'), value: role.memberCount },
    { label: t('roles.fieldPermissions'), value: role.permissionIds.length, tone: 'primary-text' },
  ]
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('roles.title') }}</h1>
        <p class="page-subtitle">{{ t('roles.subtitle') }}</p>
      </div>
      <span class="badge badge-primary" style="height: 34px; padding: 0 12px"><Lock :size="13" /> {{ t('roles.permissionsAvailable', { count: store.permissions.length }) }}</span>
    </div>

    <div class="info-card">
      <Info :size="17" />
      <div>
        <strong>{{ t('roles.infoTitle') }}</strong>
        <span>{{ t('roles.infoText') }}</span>
      </div>
    </div>

    <div class="roles-grid">
      <button v-for="role in store.rolesDetailed" :key="role.id" class="role-card" @click="selected = role">
        <div class="row justify-between">
          <span class="role-icon"><ShieldCheck :size="19" /></span>
          <span class="badge" :class="role.is_system ? 'badge-neutral' : 'badge-violet'">{{ role.is_system ? t('roles.system') : t('roles.custom') }}</span>
        </div>
        <h3>{{ roleLabel(role.name) }}</h3>
        <p class="muted">{{ role.description }}</p>
        <div class="role-stats">
          <span class="row gap-6"><Users :size="14" /> {{ t('roles.membersCount', { count: role.memberCount }) }}</span>
          <span class="row gap-6"><Lock :size="14" /> {{ t('roles.permissionsCount', { count: role.permissionIds.length }) }}</span>
        </div>
        <div class="permission-preview">
          <span v-for="permission in store.permissions.filter((p) => role.permissionIds.includes(p.id)).slice(0, 5)" :key="permission.id" class="permission-chip">
            <Check :size="10" /> {{ permission.name }}
          </span>
          <span v-if="role.permissionIds.length > 5" class="permission-chip more">+{{ role.permissionIds.length - 5 }}</span>
        </div>
      </button>
    </div>

    <DetailDrawer
      :open="!!selected"
      :eyebrow="t('roles.drawerEyebrow')"
      :title="selected ? roleLabel(selected.name) : ''"
      :subtitle="selected?.description || ''"
      :fields="drawerFields"
      @close="selected = null"
    >
      <template v-if="selected" #default>
        <div class="detail-list">
          <div v-for="field in drawerFields" :key="field.label" class="detail-row">
            <span class="detail-key">{{ field.label }}</span>
            <span class="detail-val">{{ field.value }}</span>
          </div>
        </div>

        <div class="permission-section">
          <div class="row justify-between" style="margin-bottom: 10px">
            <h4 class="section-title">{{ t('roles.fieldPermissions') }}</h4>
            <span class="badge badge-primary">{{ selected.permissionIds.length }}/{{ store.permissions.length }}</span>
          </div>
          <div v-for="(permissions, module) in groups" :key="module" class="permission-group">
            <div class="permission-group-title">{{ groupLabel(module) }}</div>
            <label v-for="permission in permissions" :key="permission.id" class="permission-row">
              <span class="col">
                <strong>{{ actionLabel(permission.name.split('.')[1]) }}</strong>
                <small class="subtle">{{ permission.name }}</small>
              </span>
              <input type="checkbox" :checked="isEnabled(permission.id)" @change="togglePermission(permission)" />
            </label>
          </div>
        </div>

        <div class="members-section">
          <h4 class="section-title" style="margin-bottom: 10px">{{ t('roles.membersHeading', { count: members.length }) }}</h4>
          <div v-for="member in members" :key="member.id" class="member-row">
            <span class="avatar avatar-sm" :style="{ background: member.avatar_color || 'var(--avatar-fallback)' }">{{ initials(member.name) }}</span>
            <div class="col"><strong>{{ member.name }}</strong><small class="subtle">{{ member.email }}</small></div>
          </div>
          <p v-if="!members.length" class="muted" style="font-size: 12px">{{ t('roles.noMembers') }}</p>
        </div>
      </template>
      <template #footer><button class="btn" @click="selected = null">{{ t('roles.done') }}</button></template>
    </DetailDrawer>
  </div>
</template>

<style scoped>
.info-card { display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; margin-bottom: 18px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--primary-soft); color: var(--primary-text); }
.info-card > div { display: flex; flex-direction: column; gap: 2px; }
.info-card strong { font-size: 13px; }
.info-card span { font-size: 12px; opacity: 0.85; }
.roles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.role-card { display: flex; flex-direction: column; gap: 9px; align-items: stretch; text-align: left; padding: 18px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); box-shadow: var(--shadow-sm); transition: box-shadow 0.16s, transform 0.16s, border-color 0.16s; }
.role-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: var(--primary); }
.role-icon { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-text); }
.role-card h3 { font-size: 15px; font-weight: 650; }
.role-card p { font-size: 12px; }
.role-stats { display: flex; gap: 16px; padding-top: 4px; color: var(--text-muted); font-size: 11.5px; }
.permission-preview { display: flex; flex-wrap: wrap; gap: 5px; padding-top: 8px; border-top: 1px solid var(--border); }
.permission-chip { display: inline-flex; align-items: center; gap: 3px; padding: 3px 7px; border-radius: 5px; background: var(--surface-3); color: var(--text-muted); font-size: 9.5px; font-family: ui-monospace, monospace; }
.permission-chip.more { color: var(--primary-text); background: var(--primary-soft); }
.permission-section, .members-section { margin-top: 24px; }
.permission-group { margin-bottom: 16px; }
.permission-group-title { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-subtle); margin-bottom: 4px; }
.permission-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
.permission-row strong { font-size: 12.5px; }
.permission-row small { font-size: 10.5px; }
.permission-row input { accent-color: var(--primary); width: 16px; height: 16px; cursor: pointer; }
.member-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); }
.member-row strong { font-size: 12.5px; }
.member-row small { font-size: 11px; }
</style>
