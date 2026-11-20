<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Building2, Sun, Moon, Key, Plus, Trash2, RotateCcw, Check, ShieldCheck, Bell } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import BaseModal from '@/components/BaseModal.vue'
import { formatDate, initials } from '@/utils/format'
import { theme, toggleTheme, notify } from '@/composables/useUi'

const { t } = useI18n()
const store = useAppStore()
const showToken = ref(false)
const tokenName = ref('')

const tokens = computed(() => store.personal_access_tokens.filter((t) => t.tokenable_id === 1))
const org = computed(() => store.currentOrganization)

function createToken() {
  if (!tokenName.value.trim()) {
    notify(t('settings.tokenNameRequired'), 'error')
    return
  }
  store.createToken(tokenName.value.trim())
  tokenName.value = ''
  showToken.value = false
  notify(t('settings.tokenCreated'))
}
function revokeToken(id) {
  store.revokeToken(id)
  notify(t('settings.tokenRevoked'), 'info')
}
function resetData() {
  store.resetDemoData()
  notify(t('shell.demoRestored'))
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('settings.title') }}</h1>
        <p class="page-subtitle">{{ t('settings.subtitle') }}</p>
      </div>
    </div>

    <div class="settings-grid">
      <section class="card card-pad">
        <div class="settings-head">
          <span class="settings-icon"><Building2 :size="18" /></span>
          <div><h2 class="section-title">{{ t('shell.workspace') }}</h2><p class="muted" style="font-size: 12px">{{ t('settings.workspaceHint') }}</p></div>
        </div>
        <div class="detail-list">
          <div class="detail-row"><span class="detail-key">{{ t('settings.orgLabel') }}</span><span class="detail-val">{{ org.name }}</span></div>
          <div class="detail-row"><span class="detail-key">{{ t('settings.plan') }}</span><span class="detail-val">{{ org.plan }}</span></div>
          <div class="detail-row"><span class="detail-key">{{ t('settings.subscription') }}</span><span class="detail-val" style="color: var(--success); text-transform: capitalize">{{ t(`status.${org.subscription_status}`) }}</span></div>
          <div class="detail-row"><span class="detail-key">{{ t('settings.created') }}</span><span class="detail-val">{{ formatDate(org.created_at) }}</span></div>
          <div class="detail-row"><span class="detail-key">{{ t('settings.properties') }}</span><span class="detail-val">{{ store.orgProperties.length }}</span></div>
          <div class="detail-row"><span class="detail-key">{{ t('settings.teamMembers') }}</span><span class="detail-val">{{ store.orgUsers.filter((u) => u.role !== 'tenant').length }}</span></div>
        </div>
      </section>

      <section class="card card-pad">
        <div class="settings-head">
          <span class="settings-icon"><Sun :size="18" /></span>
          <div><h2 class="section-title">{{ t('settings.appearanceTitle') }}</h2><p class="muted" style="font-size: 12px">{{ t('settings.appearanceHint') }}</p></div>
        </div>
        <div class="theme-options">
          <button class="theme-option" :class="{ active: theme === 'light' }" @click="theme === 'light' || toggleTheme()">
            <div class="theme-preview light"><span></span><span></span><span></span></div>
            <div class="row justify-between" style="width: 100%"><strong>{{ t('settings.light') }}</strong><Check v-if="theme === 'light'" :size="16" class="primary-icon" /></div>
          </button>
          <button class="theme-option" :class="{ active: theme === 'dark' }" @click="theme === 'dark' || toggleTheme()">
            <div class="theme-preview dark"><span></span><span></span><span></span></div>
            <div class="row justify-between" style="width: 100%"><strong>{{ t('settings.dark') }}</strong><Check v-if="theme === 'dark'" :size="16" class="primary-icon" /></div>
          </button>
        </div>
        <div class="divider" style="margin: 20px 0"></div>
        <div class="row justify-between">
          <div class="row gap-10"><Bell :size="17" class="muted" /><div class="col"><strong style="font-size: 12.5px">{{ t('settings.activityNotifications') }}</strong><small class="subtle">{{ t('settings.activityHint') }}</small></div></div>
          <span class="badge badge-success">{{ t('settings.enabled') }}</span>
        </div>
      </section>
    </div>

    <section class="card" style="margin-top: 18px">
      <div class="row justify-between" style="padding: 18px 20px; border-bottom: 1px solid var(--border)">
        <div class="settings-head" style="margin: 0">
          <span class="settings-icon"><Key :size="18" /></span>
          <div><h2 class="section-title">{{ t('settings.tokensTitle') }}</h2><p class="muted" style="font-size: 12px">{{ t('settings.tokensHint') }}</p></div>
        </div>
        <button class="btn btn-primary" @click="showToken = true"><Plus :size="15" /> {{ t('settings.createToken') }}</button>
      </div>
      <div v-if="tokens.length" class="table-wrap">
        <table class="table">
          <thead><tr><th>{{ t('settings.colName') }}</th><th>{{ t('settings.colToken') }}</th><th>{{ t('settings.created') }}</th><th>{{ t('settings.lastUsed') }}</th><th style="width: 80px"></th></tr></thead>
          <tbody>
            <tr v-for="token in tokens" :key="token.id">
              <td><strong>{{ token.name }}</strong></td>
              <td><code class="token-code">{{ token.token }}</code></td>
              <td class="muted">{{ formatDate(token.created_at) }}</td>
              <td class="muted">{{ token.last_used_at ? formatDate(token.last_used_at) : t('settings.never') }}</td>
              <td><button class="btn btn-sm btn-danger" @click="revokeToken(token.id)"><Trash2 :size="13" /> {{ t('settings.revoke') }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state"><strong>{{ t('settings.noTokens') }}</strong><span>{{ t('settings.noTokensHint') }}</span></div>
    </section>

    <section class="card card-pad" style="margin-top: 18px">
      <div class="settings-head">
        <span class="settings-icon danger"><RotateCcw :size="18" /></span>
        <div><h2 class="section-title" style="color: var(--danger)">{{ t('settings.demoTitle') }}</h2><p class="muted" style="font-size: 12px">{{ t('settings.demoHint') }}</p></div>
      </div>
      <div class="row justify-between wrap gap-12">
        <p class="muted" style="font-size: 12.5px; max-width: 560px">{{ t('settings.demoDescription') }}</p>
        <button class="btn btn-danger" @click="resetData"><RotateCcw :size="15" /> {{ t('shell.resetDemo') }}</button>
      </div>
    </section>

    <BaseModal :open="showToken" :title="t('settings.createTokenTitle')" :subtitle="t('settings.createTokenSubtitle')" @close="showToken = false">
      <div class="field"><label class="field-label">{{ t('settings.tokenNameLabel') }}</label><input v-model="tokenName" class="input" :placeholder="t('settings.tokenNamePlaceholder')" /></div>
      <template #footer>
        <button class="btn" @click="showToken = false">{{ t('common.cancel') }}</button>
        <button class="btn btn-primary" @click="createToken"><Key :size="15" /> {{ t('settings.createToken') }}</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.settings-head { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 18px; }
.settings-icon { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-text); flex: none; }
.settings-icon.danger { background: var(--danger-soft); color: var(--danger); }
.theme-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.theme-option { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 12px; border: 1px solid var(--border-strong); border-radius: 10px; background: var(--surface); font-size: 12.5px; }
.theme-option.active { border-color: var(--primary); box-shadow: 0 0 0 3px var(--ring); }
.theme-option strong { font-size: 12.5px; }
.primary-icon { color: var(--primary); }
.theme-preview { width: 100%; height: 74px; border-radius: 7px; padding: 8px; display: flex; flex-direction: column; gap: 5px; }
.theme-preview span { display: block; border-radius: 4px; }
.theme-preview.light { background: #f1f3f8; }
.theme-preview.light span:nth-child(1) { height: 12px; width: 45%; background: #c7cbd8; }
.theme-preview.light span:nth-child(2) { flex: 1; background: #fff; }
.theme-preview.light span:nth-child(3) { height: 10px; width: 70%; background: #dfe2ea; }
.theme-preview.dark { background: #111827; }
.theme-preview.dark span:nth-child(1) { height: 12px; width: 45%; background: #374151; }
.theme-preview.dark span:nth-child(2) { flex: 1; background: #1f2937; }
.theme-preview.dark span:nth-child(3) { height: 10px; width: 70%; background: #374151; }
.token-code { padding: 3px 8px; border-radius: 5px; background: var(--surface-3); font-size: 11.5px; color: var(--text-muted); }
@media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } }
</style>
