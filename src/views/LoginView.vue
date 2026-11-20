<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
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
} from 'lucide-vue-next'
import { login } from '@/composables/useAuth'
import { notify } from '@/composables/useUi'
import { SUPPORTED_LOCALES, setLocale } from '@/i18n'

const { t, locale } = useI18n()
const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)

const otherLocale = computed(
  () => SUPPORTED_LOCALES.find((item) => item.code !== locale.value) || SUPPORTED_LOCALES[0],
)

function toggleLocale() {
  setLocale(otherLocale.value.code)
}

function submit() {
  if (!email.value.trim() || !password.value.trim()) {
    notify(t('auth.login.required'), 'error')
    return
  }
  login()
  notify(t('auth.login.success'))
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
              <span class="eyebrow">{{ t('auth.login.eyebrow') }}</span>
              <h1>{{ t('auth.login.title') }}</h1>
              <p>{{ t('auth.login.subtitle') }}</p>
            </div>

            <form class="auth-form" novalidate @submit.prevent="submit">
              <div class="field">
                <label class="field-label" for="login-email">{{ t('auth.login.emailLabel') }}</label>
                <div class="input-icon">
                  <Mail :size="16" />
                  <input
                    id="login-email"
                    v-model="email"
                    class="input"
                    type="email"
                    autocomplete="email"
                    :placeholder="t('auth.login.emailPlaceholder')"
                  />
                </div>
              </div>

              <div class="field">
                <label class="field-label" for="login-password">{{ t('auth.login.passwordLabel') }}</label>
                <div class="input-icon has-action">
                  <Lock :size="16" />
                  <input
                    id="login-password"
                    v-model="password"
                    class="input"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    :placeholder="t('auth.login.passwordPlaceholder')"
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

              <label class="checkbox-label">
                <input v-model="remember" type="checkbox" />
                {{ t('auth.login.remember') }}
              </label>

              <button class="btn btn-primary submit-btn" type="submit">
                {{ t('auth.login.submit') }} <ArrowRight :size="16" />
              </button>
            </form>

            <p class="auth-switch">
              {{ t('auth.login.noAccount') }}
              <RouterLink :to="{ name: 'signup' }" class="link">{{ t('auth.login.signUp') }}</RouterLink>
            </p>

            <div class="demo-box">
              <span class="demo-box-title"><Sparkles :size="13" /> {{ t('auth.login.demoTitle') }}</span>
              <code class="demo-creds">{{ t('auth.login.demoEmail') }} / {{ t('auth.login.demoPassword') }}</code>
              <p>{{ t('auth.login.demoHint') }}</p>
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
  max-width: 430px;
  padding: 32px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.auth-card-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 26px;
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
  gap: 18px;
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
.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 12.5px;
  cursor: pointer;
}
.checkbox-label input {
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: var(--primary);
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
.demo-box {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 22px;
  padding: 14px 16px;
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
  background: var(--surface-2);
}
.demo-box-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--text-subtle);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.demo-creds {
  color: var(--text);
  font-size: 12.5px;
  font-weight: 600;
}
.demo-box p {
  color: var(--text-muted);
  font-size: 12px;
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
}
</style>
