<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES, setLocale, i18n } from '@/i18n'
import {
  Search, Bell, Menu, Sun, Moon, ChevronDown, ChevronsUpDown, Check,
  Settings, RotateCcw, ArrowUpRight, Building2, Home, Users,
  FileText, Wrench, TrendingUp, Command, Plus, Languages, LogOut,
} from 'lucide-vue-next'
import { navGroups } from '@/data/navigation'
import { useAppStore } from '@/stores/app'
import BaseModal from '@/components/BaseModal.vue'
import { theme, toggleTheme, notify } from '@/composables/useUi'
import { logout } from '@/composables/useAuth'
import { currency, relativeDate, initials } from '@/utils/format'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useAppStore()
const currentLocale = computed(() => i18n.global.locale.value)

const emit = defineEmits(['menu'])

const root = ref(null)
const searchInput = ref(null)
const openMenu = ref(null)
const query = ref('')
const unread = ref(true)
const showCreateWorkspace = ref(false)
const newWorkspaceName = ref('')

function toggleMenu(name) {
  openMenu.value = openMenu.value === name ? null : name
}
function closeMenus() {
  openMenu.value = null
}
function onDocumentClick(event) {
  if (root.value && !root.value.contains(event.target)) closeMenus()
}
function onKeydown(event) {
  if (event.key === 'Escape') closeMenus()
  if (
    event.key === '/' &&
    !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
  ) {
    event.preventDefault()
    searchInput.value?.focus()
    openMenu.value = 'search'
  }
}
onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})

const pageTitle = computed(() => (route.meta.titleKey ? t(route.meta.titleKey) : t('shell.workspace')))
const pageGroup = computed(() => (route.meta.groupKey ? t(route.meta.groupKey) : t('nav.overview')))
const currentUser = computed(() => store.userById(1) || store.orgUsers[0])
const currentUserInitials = computed(() => initials(currentUser.value?.name || ''))

const activityIcon = {
  payment: FileText,
  maintenance: Wrench,
  proposal: TrendingUp,
}
const activityTone = {
  payment: 'success',
  maintenance: 'warning',
  proposal: 'info',
}

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  const pages = navGroups
    .flatMap((g) => g.items)
    .filter((i) => t(i.labelKey).toLowerCase().includes(q))
    .slice(0, 4)
    .map((i) => {
      const Icon = i.icon
      const label = t(i.labelKey)
      return { id: `p-${i.to}`, type: t('topbar.page'), label, sub: label, to: { path: i.to }, icon: Icon }
    })

  const properties = store.propertiesWithStats
    .filter((p) => `${p.name} ${p.city}`.toLowerCase().includes(q))
    .slice(0, 3)
    .map((p) => ({ id: `pr-${p.id}`, type: t('topbar.property'), label: p.name, sub: p.city, to: { path: '/properties', query: { q: p.name } }, icon: Building2 }))

  const tenants = store.tenantsDetailed
    .filter((tenant) => `${tenant.name} ${tenant.email}`.toLowerCase().includes(q))
    .slice(0, 3)
    .map((tenant) => ({ id: `t-${tenant.id}`, type: t('topbar.tenant'), label: tenant.name, sub: tenant.email, to: { path: '/tenants', query: { q: tenant.name } }, icon: Users }))

  const units = store.unitsDetailed
    .filter((u) => `${u.property?.name || ''} ${u.unit_number}`.toLowerCase().includes(q))
    .slice(0, 3)
    .map((u) => ({ id: `u-${u.id}`, type: t('topbar.unit'), label: `${t('topbar.unit')} ${u.unit_number}`, sub: `${u.property?.name} · ${currency(u.base_rent)}/mo`, to: { path: '/units', query: { q: u.unit_number } }, icon: Home }))

  return [...pages, ...properties, ...tenants, ...units]
})

function goToResult(result) {
  router.push(result.to)
  query.value = ''
  closeMenus()
}

function selectOrganization(org) {
  store.setOrganization(org.id)
  closeMenus()
  notify(t('topbar.switched', { name: org.name }), 'info')
}

function createWorkspace() {
  const name = newWorkspaceName.value.trim()
  if (!name) {
    notify(t('topbar.nameRequired'), 'error')
    return
  }
  const workspace = store.createWorkspace(name)
  newWorkspaceName.value = ''
  showCreateWorkspace.value = false
  closeMenus()
  notify(t('topbar.created', { name: workspace.name }))
}

function resetDemo() {
  store.resetDemoData()
  closeMenus()
  notify(t('shell.demoRestored'), 'success')
}

function changeLocale(code) {
  setLocale(code)
  closeMenus()
}

function signOut() {
  logout()
  closeMenus()
  router.push({ name: 'login' })
  notify(t('auth.signedOut'), 'info')
}
</script>

<template>
  <header ref="root" class="topbar">
    <div class="topbar-left">
      <button class="mobile-menu" :aria-label="t('common.openMenu')" @click="emit('menu')"><Menu :size="20" /></button>
      <div class="breadcrumb">
        <span class="breadcrumb-muted">{{ pageGroup }}</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ pageTitle }}</span>
      </div>
    </div>

    <div class="topbar-right">
      <div class="search-wrap">
        <div class="search-field topbar-search">
          <Search :size="16" />
          <input
            ref="searchInput"
            v-model="query"
            class="input"
            type="text"
            :placeholder="t('topbar.searchPlaceholder')"
            @focus="openMenu = 'search'"
          />
          <kbd class="search-kbd">/</kbd>
        </div>

        <div v-if="openMenu === 'search'" class="dropdown search-dropdown">
          <template v-if="query.trim()">
            <button
              v-for="result in results"
              :key="result.id"
              class="search-result"
              @click="goToResult(result)"
            >
              <span class="result-icon"><component :is="result.icon" :size="15" /></span>
              <span class="col" style="min-width: 0; text-align: left">
                <strong>{{ result.label }}</strong>
                <small>{{ result.type }} · {{ result.sub }}</small>
              </span>
              <ArrowUpRight :size="14" class="subtle" />
            </button>
            <div v-if="!results.length" class="dropdown-empty">{{ t('topbar.noMatches', { query }) }}</div>
          </template>
          <template v-else>
            <div class="dropdown-hint"><Command :size="14" /> {{ t('topbar.searchHint') }}</div>
          </template>
        </div>
      </div>

      <button class="topbar-icon" :title="theme === 'dark' ? t('topbar.lightMode') : t('topbar.darkMode')" @click="toggleTheme">
        <Sun v-if="theme === 'dark'" :size="18" />
        <Moon v-else :size="18" />
      </button>

      <div class="dropdown-anchor">
        <button class="topbar-icon" :title="t('topbar.language')" @click="toggleMenu('language')">
          <Languages :size="18" />
        </button>
        <div v-if="openMenu === 'language'" class="dropdown language-dropdown">
          <div class="dropdown-label">{{ t('topbar.language') }}</div>
          <button
            v-for="lang in SUPPORTED_LOCALES"
            :key="lang.code"
            class="menu-option"
            @click="changeLocale(lang.code)"
          >
            <span class="lang-code">{{ lang.short }}</span>
            {{ lang.label }}
            <Check v-if="currentLocale === lang.code" :size="15" class="link" style="margin-left: auto" />
          </button>
        </div>
      </div>

      <div class="dropdown-anchor">
        <button class="topbar-icon" :title="t('topbar.notifications')" @click="toggleMenu('notifications')">
          <Bell :size="18" />
          <span v-if="unread" class="notification-dot"></span>
        </button>
        <div v-if="openMenu === 'notifications'" class="dropdown notifications-dropdown">
          <div class="dropdown-head">
            <strong>{{ t('topbar.activity') }}</strong>
            <button class="link-button" @click="unread = false">{{ t('topbar.markAllRead') }}</button>
          </div>
          <div class="notification-list">
            <div v-for="item in store.activityFeed" :key="item.id" class="notification-item">
              <span class="notification-icon" :class="`tone-${activityTone[item.type]}`">
                <component :is="activityIcon[item.type]" :size="14" />
              </span>
              <div class="col" style="min-width: 0">
                <strong>{{ item.title }}</strong>
                <small>{{ item.meta }} · {{ relativeDate(item.date) }}</small>
              </div>
              <span v-if="item.amount" class="notification-amount">{{ currency(item.amount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <span class="topbar-divider"></span>

      <div class="dropdown-anchor">
        <button class="org-button" @click="toggleMenu('org')">
          <span class="org-avatar">{{ initials(store.currentOrganization.name) }}</span>
          <span class="org-name">{{ store.currentOrganization.name }}</span>
          <ChevronsUpDown :size="14" />
        </button>
        <div v-if="openMenu === 'org'" class="dropdown org-dropdown">
          <div class="dropdown-label">{{ t('topbar.switchWorkspace') }}</div>
          <button
            v-for="org in store.organizationsList"
            :key="org.id"
            class="org-option"
            @click="selectOrganization(org)"
          >
            <span class="org-avatar">{{ initials(org.name) }}</span>
            <span class="col" style="text-align: left">
              <strong>{{ org.name }}</strong>
              <small>{{ t('shell.plan', { plan: org.plan, status: t(`status.${org.subscription_status}`) }) }}</small>
            </span>
            <Check v-if="org.id === store.activeOrganizationId" :size="15" class="link" />
          </button>
          <div class="dropdown-sep"></div>
          <button class="org-option create-workspace" @click="openMenu = null; showCreateWorkspace = true">
            <span class="create-org-icon"><Plus :size="15" /></span>
            <strong>{{ t('topbar.createWorkspace') }}</strong>
          </button>
        </div>
      </div>

      <div class="dropdown-anchor">
        <button class="user-button" @click="toggleMenu('user')">
          <span class="avatar" :style="{ background: currentUser?.avatar_color || 'var(--avatar-fallback)' }">{{ currentUserInitials }}</span>
          <ChevronDown :size="14" class="subtle" />
        </button>
        <div v-if="openMenu === 'user'" class="dropdown user-dropdown">
          <div class="user-card">
            <span class="avatar avatar-lg" :style="{ background: currentUser?.avatar_color || 'var(--avatar-fallback)' }">{{ currentUserInitials }}</span>
            <div class="col">
              <strong>{{ currentUser?.name }}</strong>
              <small>{{ currentUser?.email }}</small>
            </div>
          </div>
          <div class="dropdown-sep"></div>
          <button class="menu-option" @click="router.push('/settings'); closeMenus()"><Settings :size="15" /> {{ t('topbar.profileSettings') }}</button>
          <button class="menu-option" @click="toggleTheme(); closeMenus()">
            <component :is="theme === 'dark' ? Sun : Moon" :size="15" /> {{ theme === 'dark' ? t('topbar.lightAppearance') : t('topbar.darkAppearance') }}
          </button>
          <button class="menu-option" @click="resetDemo"><RotateCcw :size="15" /> {{ t('shell.resetDemo') }}</button>
          <div class="dropdown-sep"></div>
          <button class="menu-option danger" @click="signOut"><LogOut :size="15" /> {{ t('auth.signOut') }}</button>
        </div>
      </div>
    </div>

    <BaseModal
      :open="showCreateWorkspace"
      :title="t('topbar.createTitle')"
      :subtitle="t('topbar.createSubtitle')"
      @close="showCreateWorkspace = false"
    >
      <div class="field">
        <label class="field-label">{{ t('topbar.workspaceName') }}</label>
        <input v-model="newWorkspaceName" class="input" :placeholder="t('topbar.workspaceNamePlaceholder')" @keyup.enter="createWorkspace" />
      </div>
      <p class="muted" style="font-size: 12px; margin-top: 14px">
        {{ t('topbar.createHint') }}
      </p>
      <template #footer>
        <button class="btn" @click="showCreateWorkspace = false">{{ t('topbar.cancel') }}</button>
        <button class="btn btn-primary" @click="createWorkspace"><Plus :size="15" /> {{ t('topbar.create') }}</button>
      </template>
    </BaseModal>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  height: 66px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 32px;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.topbar-left, .topbar-right { display: flex; align-items: center; gap: 10px; }
.topbar-right { gap: 6px; }
.mobile-menu { display: none; background: transparent; border: 0; color: var(--text-muted); padding: 6px; }
.breadcrumb { display: flex; align-items: center; gap: 9px; font-size: 13px; white-space: nowrap; }
.breadcrumb-current { white-space: nowrap; }
.breadcrumb-muted { color: var(--text-subtle); }
.breadcrumb-sep { color: var(--border-strong); }
.breadcrumb-current { font-weight: 650; }
.topbar-search { width: 280px; }
.topbar-search .input { height: 36px; background: var(--surface-2); border-color: var(--border); }
.search-kbd {
  position: absolute;
  right: 9px;
  font-family: var(--font);
  font-size: 11px;
  color: var(--text-subtle);
  border: 1px solid var(--border-strong);
  border-radius: 5px;
  padding: 0 6px;
  line-height: 18px;
}
.search-wrap, .dropdown-anchor { position: relative; }
.topbar-icon {
  position: relative;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--text-muted);
  display: grid;
  place-items: center;
}
.topbar-icon:hover { background: var(--surface-3); color: var(--text); }
.notification-dot {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 7px;
  height: 7px;
  border-radius: 99px;
  background: var(--danger);
  box-shadow: 0 0 0 2px var(--surface);
}
.topbar-divider { width: 1px; height: 24px; background: var(--border); margin: 0 6px; }
.org-button {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 9px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 12.5px;
  font-weight: 600;
}
.org-button:hover { background: var(--surface-2); }
.org-avatar {
  width: 24px; height: 24px; flex: none;
  border-radius: 7px;
  display: grid; place-items: center;
  background: var(--avatar-gradient);
  color: var(--on-brand);
  font-size: 9px;
  font-weight: 700;
}
.org-name { max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-button {
  display: flex; align-items: center; gap: 5px;
  background: transparent; border: 0; padding: 3px; border-radius: 9px;
}
.user-button:hover { background: var(--surface-3); }

.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 50;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  animation: dropdown-in 0.15s ease both;
}
@keyframes dropdown-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: none; } }
.search-dropdown { width: 380px; left: 0; right: auto; }
.dropdown-hint { display: flex; align-items: center; gap: 8px; padding: 12px; color: var(--text-subtle); font-size: 12px; }
.search-result {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  text-align: left;
}
.search-result:hover { background: var(--surface-3); }
.search-result strong { font-size: 12.5px; font-weight: 600; }
.search-result small { font-size: 11px; color: var(--text-subtle); }
.result-icon { width: 30px; height: 30px; border-radius: 8px; background: var(--primary-soft); color: var(--primary-text); display: grid; place-items: center; flex: none; }
.dropdown-empty { padding: 18px; text-align: center; color: var(--text-subtle); font-size: 12px; }
.notifications-dropdown { width: 360px; }
.dropdown-head { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; }
.dropdown-head strong { font-size: 13px; }
.link-button { border: 0; background: transparent; color: var(--primary-text); font-size: 11.5px; font-weight: 600; }
.link-button:hover { text-decoration: underline; }
.notification-list { max-height: 360px; overflow: auto; }
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
}
.notification-item:hover { background: var(--surface-2); }
.notification-item strong { font-size: 12.5px; font-weight: 600; line-height: 1.35; }
.notification-item small { font-size: 11px; color: var(--text-subtle); }
.notification-icon { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; flex: none; }
.tone-success { background: var(--success-soft); color: var(--success); }
.tone-warning { background: var(--warning-soft); color: var(--warning); }
.tone-info { background: var(--info-soft); color: var(--info); }
.notification-amount { margin-left: auto; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
.org-dropdown { width: 260px; }
.create-workspace { color: var(--primary-text); }
.create-org-icon {
  width: 24px; height: 24px; border-radius: 7px;
  display: grid; place-items: center;
  background: var(--primary-soft); color: var(--primary-text); flex: none;
}
.dropdown-label { padding: 8px 10px; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-subtle); font-weight: 700; }
.org-option {
  width: 100%; display: flex; align-items: center; gap: 9px;
  padding: 8px 10px; border: 0; border-radius: 8px; background: transparent;
}
.org-option:hover { background: var(--surface-3); }
.org-option strong { font-size: 12.5px; }
.org-option small { font-size: 11px; color: var(--text-subtle); text-transform: capitalize; }
.org-option > svg:last-child { margin-left: auto; }
.language-dropdown { width: 190px; }
.lang-code {
  padding: 3px 6px; border-radius: 5px;
  background: var(--surface-3); color: var(--text-muted);
  font-size: 10px; font-weight: 700;
}
.user-dropdown { width: 250px; }
.user-card { display: flex; align-items: center; gap: 11px; padding: 10px; }
.user-card strong { font-size: 13px; }
.user-card small { font-size: 11px; color: var(--text-subtle); }
.dropdown-sep { height: 1px; background: var(--border); margin: 5px 4px; }
.menu-option {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border: 0; border-radius: 7px; background: transparent;
  font-size: 12.5px; color: var(--text); text-align: left;
}
.menu-option:hover { background: var(--surface-3); }
.menu-option.danger { color: var(--danger); }

@media (max-width: 1023px) {
  .topbar { padding: 0 18px; }
  .mobile-menu { display: grid; place-items: center; }
  .topbar-search { width: 220px; }
  .org-name { display: none; }
}
@media (max-width: 680px) {
  .topbar-search { display: none; }
  .breadcrumb-muted, .breadcrumb-sep { display: none; }
  .topbar-divider { display: none; }
}
</style>
