<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  Mail,
  ReceiptText,
  Sparkles,
  User,
} from 'lucide-vue-next'
import { login } from '@/composables/useAuth'
import { notify } from '@/composables/useUi'
import { SUPPORTED_LOCALES, setLocale } from '@/i18n'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const planOptions = [
  { id: 'free', nameKey: 'auth.signup.planFree', noteKey: 'auth.signup.planFreeNote' },
  { id: 'pro', nameKey: 'auth.signup.planPro', noteKey: 'auth.signup.planProNote' },
  { id: 'max', nameKey: 'auth.signup.planMax', noteKey: 'auth.signup.planMaxNote' },
]
const validPlans = planOptions.map((option) => option.id)
const normalizePlan = (value) => (validPlans.includes(value) ? value : 'free')
const plan = ref(normalizePlan(route.query.plan))
watch(() => route.query.plan, (value) => { plan.value = normalizePlan(value) })

const otherLocale = computed(
  () => SUPPORTED_LOCALES.find((item) => item.code !== locale.value) || SUPPORTED_LOCALES[0],
)

function toggleLocale() {
  setLocale(otherLocale.value.code)
}

function submit() {
  if (!name.value.trim() || !email.value.trim() || !password.value.trim()) {
    notify(t('auth.signup.required'), 'error')
    return
  }
  login()
  notify(t('auth.signup.success'))
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-layout">
      <aside class="auth-brand">
        <div class="brand-orb orb-one"></div>
        <div class="brand-orb orb-two"></div>

        <RouterLink :to="{ name: 'landing' }" class="brand-lockup">
          <span class="brand-mark"><span>Z</span></span>
          <span class="brand-word">
            <strong>zoniq</strong>
            <small>{{ t('shell.brandTagline') }}</small>
          </span>
        </RouterLink>

        <div class="brand-copy">
          <span class="brand-eyebrow"><Sparkles :size="14" /> {{ t('auth.panel.eyebrow') }}</span>
          <h2>{{ t('auth.panel.title') }}</h2>
          <p>{{ t('auth.panel.subtitle') }}</p>
          <ul class="brand-features">
            <li><span class="feature-icon"><Building2 :size="16" /></span>{{ t('auth.panel.features.portfolio') }}</li>
            <li><span class="feature-icon"><ReceiptText :size="16" /></span>{{ t('auth.panel.features.billing') }}</li>
            <li><span class="feature-icon"><KeyRound :size="16" /></span>{{ t('auth.panel.features.insights') }}</li>
          </ul>
        </div>

        <p class="brand-footer">{{ t('auth.panel.footer') }}</p>
      </aside>

      <main class="auth-main">
        <header class="auth-topbar">
          <RouterLink :to="{ name: 'landing' }" class="back-link">
            <ArrowLeft :size="16" /> {{ t('auth.backToSite') }}
          </RouterLink>
          <button class="lang-btn" type="button" :aria-label="t('topbar.language')" @click="toggleLocale">
            <Globe :size="15" /> {{ otherLocale.label }}
          </button>
        </header>

        <div class="auth-center">
          <div class="mobile-brand">
            <span class="mobile-mark">Z</span>
            <span class="mobile-word">zoniq</span>
          </div>

          <section class="card auth-card">
            <div class="auth-card-head">
              <span class="eyebrow">{{ t('auth.signup.eyebrow') }}</span>
              <h1>{{ t('auth.signup.title') }}</h1>
              <p>{{ t('auth.signup.subtitle') }}</p>
            </div>

            <form class="auth-form" novalidate @submit.prevent="submit">
              <div class="field">
                <label class="field-label" for="signup-name">{{ t('auth.signup.nameLabel') }}</label>
                <div class="input-icon">
                  <User :size="16" />
                  <input
                    id="signup-name"
                    v-model="name"
                    class="input"
                    type="text"
                    autocomplete="name"
                    :placeholder="t('auth.signup.namePlaceholder')"
                  />
                </div>
              </div>

              <div class="field">
                <label class="field-label" for="signup-email">{{ t('auth.signup.emailLabel') }}</label>
                <div class="input-icon">
                  <Mail :size="16" />
                  <input
                    id="signup-email"
                    v-model="email"
                    class="input"
                    type="email"
                    autocomplete="email"
                    :placeholder="t('auth.signup.emailPlaceholder')"
                  />
                </div>
              </div>

              <div class="field">
                <label class="field-label" for="signup-password">{{ t('auth.signup.passwordLabel') }}</label>
                <div class="input-icon has-action">
                  <Lock :size="16" />
                  <input
                    id="signup-password"
                    v-model="password"
                    class="input"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    :placeholder="t('auth.signup.passwordPlaceholder')"
                  />
                  <button
                    class="input-action"
                    type="button"
                    :aria-label="t(showPassword ? 'auth.login.hidePassword' : 'auth.login.showPassword')"
                    @click="showPassword = !showPassword"
                  >
                    <component :is="showPassword ? EyeOff : Eye" :size="16" />
                  </button>
                </div>
              </div>

              <div class="field">
                <span class="field-label">{{ t('auth.signup.planLabel') }}</span>
                <div class="plan-row" role="group" :aria-label="t('auth.signup.planLabel')">
                  <button
                    v-for="option in planOptions"
                    :key="option.id"
                    class="plan-chip"
                    :class="{ selected: plan === option.id }"
                    type="button"
                    :aria-pressed="plan === option.id"
                    @click="plan = option.id"
                  >
                    <span class="plan-chip-name">{{ t(option.nameKey) }}</span>
                    <span class="plan-chip-note">{{ t(option.noteKey) }}</span>
                  </button>
                </div>
                <p class="plan-desc">{{ t(`auth.signup.planDesc.${plan}`) }}</p>
                <p class="field-hint">{{ t('auth.signup.planHint') }}</p>
              </div>

              <button class="btn btn-primary submit-btn" type="submit">
                {{ t('auth.signup.submit') }} <ArrowRight :size="16" />
              </button>
            </form>

            <p class="auth-switch">
              {{ t('auth.signup.haveAccount') }}
              <RouterLink :to="{ name: 'login' }" class="link">{{ t('auth.signup.signIn') }}</RouterLink>
            </p>

            <div class="demo-note">
              <Sparkles :size="14" />
              <span>{{ t('auth.signup.demoNote') }}</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: var(--bg);
}

.auth-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
}

.auth-brand {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 36px;
  padding: 40px 48px;
  background: var(--brand-gradient);
  color: var(--on-brand);
}

.brand-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.orb-one {
  width: 360px;
  height: 360px;
  top: -150px;
  right: -130px;
  background: radial-gradient(circle, var(--brand-glow), transparent 68%);
}
.orb-two {
  width: 440px;
  height: 440px;
  left: -190px;
  bottom: -230px;
  background: radial-gradient(circle, var(--glass-hover), transparent 70%);
}

.brand-lockup,
.brand-copy,
.brand-footer {
  position: relative;
  z-index: 1;
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  align-self: flex-start;
}
.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--glass-soft);
  border: 1px solid var(--glass-hover);
  font-size: 20px;
  font-weight: 800;
}
.brand-word {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.brand-word strong {
  font-size: 20px;
  font-weight: 750;
  letter-spacing: -0.03em;
}
.brand-word small {
  margin-top: 3px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  opacity: 0.72;
}

.brand-copy {
  max-width: 460px;
  margin-top: auto;
  margin-bottom: auto;
}
.brand-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  opacity: 0.8;
}
.brand-copy h2 {
  margin-top: 18px;
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 750;
  line-height: 1.12;
  letter-spacing: -0.035em;
}
.brand-copy > p {
  margin-top: 16px;
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.82;
}
.brand-features {
  list-style: none;
  margin: 32px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.brand-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  font-weight: 550;
}
.feature-icon {
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--glass-hover);
  border: 1px solid var(--glass-hover);
}
.brand-footer {
  font-size: 12px;
  opacity: 0.7;
}

.auth-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.auth-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 32px;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
}
.back-link:hover {
  color: var(--primary-text);
}
.lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 600;
}
.lang-btn:hover {
  background: var(--surface-3);
  color: var(--text);
}

.auth-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px 56px;
}
.mobile-brand {
  display: none;
}
.auth-card {
  width: 100%;
  max-width: 460px;
  padding: 32px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.auth-card-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}
.auth-card-head h1 {
  font-size: 26px;
  font-weight: 750;
  line-height: 1.2;
  letter-spacing: -0.035em;
}
.auth-card-head p {
  color: var(--text-muted);
  font-size: 13.5px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.input-icon {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon > svg {
  position: absolute;
  left: 12px;
  color: var(--text-subtle);
  pointer-events: none;
}
.input-icon .input {
  padding-left: 38px;
}
.input-icon.has-action .input {
  padding-right: 42px;
}
.input-action {
  position: absolute;
  right: 5px;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-subtle);
}
.input-action:hover {
  background: var(--surface-3);
  color: var(--text);
}

.plan-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.plan-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  background: var(--surface);
  text-align: left;
  transition: background 0.16s, border-color 0.16s;
}
.plan-chip:hover {
  background: var(--surface-3);
}
.plan-chip.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
}
.plan-chip-name {
  font-size: 13px;
  font-weight: 650;
  color: var(--text);
}
.plan-chip.selected .plan-chip-name {
  color: var(--primary-text);
}
.plan-chip-note {
  color: var(--text-subtle);
  font-size: 10.5px;
  line-height: 1.3;
}
.plan-desc {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 12px;
}
.field-hint {
  color: var(--text-subtle);
  font-size: 11.5px;
}
.submit-btn {
  width: 100%;
  height: 42px;
  margin-top: 2px;
  font-size: 14px;
  border-radius: 10px;
}

.auth-switch {
  margin-top: 22px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}
.auth-switch .link {
  margin-left: 4px;
}
.demo-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 20px;
  padding: 12px 14px;
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
}
.demo-note svg {
  flex: none;
  margin-top: 1px;
  color: var(--primary-text);
}

@media (max-width: 900px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }
  .auth-brand {
    display: none;
  }
  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
  }
  .mobile-mark {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: var(--brand-gradient);
    color: var(--on-brand);
    font-size: 17px;
    font-weight: 800;
  }
  .mobile-word {
    font-size: 19px;
    font-weight: 750;
    letter-spacing: -0.03em;
  }
  .auth-topbar {
    padding: 18px 20px;
  }
  .auth-center {
    align-items: flex-start;
    padding: 8px 20px 40px;
  }
  .auth-card {
    max-width: 480px;
    padding: 26px 22px;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 22px 18px;
  }
  .auth-card-head h1 {
    font-size: 23px;
  }
  .plan-chip {
    padding: 9px 8px;
  }
}
</style>
