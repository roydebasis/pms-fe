<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { X, RotateCcw, LifeBuoy, Sparkles } from 'lucide-vue-next'
import { navGroups } from '@/data/navigation'
import { useAppStore } from '@/stores/app'
import { notify } from '@/composables/useUi'

defineProps({ mobileOpen: Boolean })
const emit = defineEmits(['close'])

const { t } = useI18n()
const route = useRoute()
const store = useAppStore()
const org = computed(() => store.currentOrganization)

function isActive(to) {
  return route.path === to || route.path.startsWith(`${to}/`)
}

function resetData() {
  store.resetDemoData()
  notify(t('shell.demoRestored'), 'success')
  emit('close')
}
</script>

<template>
  <div v-if="mobileOpen" class="sidebar-backdrop" @click="emit('close')"></div>

  <aside class="sidebar" :class="{ 'sidebar-open': mobileOpen }">
    <div class="sidebar-brand">
      <div class="brand-mark"><span>Z</span></div>
      <div class="brand-text">
        <strong>zoniq</strong>
        <small>{{ t('shell.brandTagline') }}</small>
      </div>
      <button class="sidebar-close" :aria-label="t('common.closeMenu')" @click="emit('close')"><X :size="18" /></button>
    </div>

    <div class="workspace-chip">
      <span class="workspace-dot"></span>
      <div class="col" style="min-width: 0">
        <span class="workspace-name">{{ org.name }}</span>
        <span class="workspace-plan">{{ t('shell.plan', { plan: org.plan, status: t(`status.${org.subscription_status}`) }) }}</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div v-for="group in navGroups" :key="group.labelKey" class="nav-group">
        <div class="nav-label">{{ t(group.labelKey) }}</div>
        <RouterLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ 'nav-link-active': isActive(item.to) }"
          @click="emit('close')"
        >
          <component :is="item.icon" :size="17" :stroke-width="1.9" />
          <span>{{ t(item.labelKey) }}</span>
          <span v-if="item.to === '/proposals' && store.dashboardStats.pendingApprovals" class="nav-count">
            {{ store.dashboardStats.pendingApprovals }}
          </span>
        </RouterLink>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-tip">
        <Sparkles :size="16" />
        <div>
          <strong>{{ t('shell.demoWorkspace') }}</strong>
          <span>{{ t('shell.demoHint') }}</span>
        </div>
      </div>
      <button class="sidebar-action" @click="resetData"><RotateCcw :size="15" /> {{ t('shell.resetDemo') }}</button>
      <RouterLink to="/settings" class="sidebar-action" @click="emit('close')">
        <LifeBuoy :size="15" /> {{ t('shell.helpSupport') }}
      </RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 39;
  background: var(--backdrop);
}
.sidebar {
  position: sticky;
  top: 0;
  width: 252px;
  height: 100vh;
  flex: none;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--sidebar-bg) 0%, var(--sidebar-bg-2) 100%);
  color: var(--sidebar-text);
  border-right: 1px solid var(--sidebar-border);
  z-index: 40;
}
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 22px 20px 18px;
}
.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--brand-gradient);
  box-shadow: 0 4px 12px var(--brand-glow);
  flex: none;
}
.brand-mark span { font-weight: 800; font-size: 17px; color: var(--on-brand); }
.brand-text { display: flex; flex-direction: column; line-height: 1.15; }
.brand-text strong { font-size: 18px; letter-spacing: -0.045em; font-weight: 750; }
.brand-text small { color: var(--sidebar-muted); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; }
.sidebar-close { display: none; margin-left: auto; background: transparent; border: 0; color: var(--sidebar-muted); }
.workspace-chip {
  margin: 2px 14px 16px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--sidebar-border);
  border-radius: 10px;
  background: var(--glass-soft);
}
.workspace-dot { width: 8px; height: 8px; border-radius: 99px; background: var(--online); box-shadow: 0 0 0 3px var(--online-glow); flex: none; }
.workspace-name { font-size: 12.5px; font-weight: 650; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.workspace-plan { font-size: 10.5px; color: var(--sidebar-muted); text-transform: capitalize; }
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 18px;
}
.nav-group { margin-bottom: 18px; }
.nav-label {
  padding: 0 10px;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--sidebar-muted);
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 11px;
  margin-bottom: 2px;
  border-radius: 8px;
  color: var(--nav-text);
  font-size: 13px;
  font-weight: 550;
  transition: background 0.15s, color 0.15s;
}
.nav-link:hover { background: var(--glass-hover); color: var(--on-brand); }
.nav-link-active {
  background: var(--sidebar-active);
  color: var(--on-brand);
  box-shadow: inset 2px 0 0 var(--nav-active-bar);
}
.nav-link-active svg { color: var(--nav-active-icon); }
.nav-count {
  margin-left: auto;
  min-width: 20px;
  height: 19px;
  padding: 0 5px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  font-size: 10.5px;
  font-weight: 700;
  background: var(--nav-badge);
  color: var(--on-brand);
}
.sidebar-footer { padding: 14px; border-top: 1px solid var(--sidebar-border); }
.sidebar-tip {
  display: flex;
  gap: 10px;
  padding: 11px;
  border-radius: 9px;
  background: var(--tip-bg);
  color: var(--tip-text);
  margin-bottom: 6px;
}
.sidebar-tip svg { flex: none; margin-top: 1px; }
.sidebar-tip div { display: flex; flex-direction: column; gap: 2px; }
.sidebar-tip strong { font-size: 11.5px; color: var(--tip-strong); }
.sidebar-tip span { font-size: 10.5px; color: var(--tip-subtle); line-height: 1.35; }
.sidebar-action {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 11px;
  margin-top: 2px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--sidebar-muted);
  font-size: 12.5px;
  text-align: left;
}
.sidebar-action:hover { background: var(--glass-hover); color: var(--on-brand); }

@media (max-width: 1023px) {
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 0.24s ease;
  }
  .sidebar-open { transform: none; }
  .sidebar-close { display: block; }
}
</style>
