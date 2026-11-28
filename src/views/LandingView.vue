<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowRight,
  Check,
  Menu,
  X,
  Sparkles,
  Building2,
  CreditCard,
  Wrench,
  Users,
  FileText,
  BarChart3,
  ClipboardList,
  Send,
  ArrowUp,
} from 'lucide-vue-next'
import { SUPPORTED_LOCALES, setLocale } from '@/i18n'
import { useAppStore } from '@/stores/app'
import { notify } from '@/composables/useUi'

const { t, locale } = useI18n()
const store = useAppStore()

const mobileOpen = ref(false)
const activeSection = ref('')
const year = new Date().getFullYear()

const signupTo = (plan) => ({ name: 'signup', query: { plan } })

// Demo values come from the seeded workspace, not from invented performance claims.
const demoStats = computed(() => ({
  properties: store.orgProperties.length,
  units: store.orgUnits.length,
  leases: store.orgLeases.length,
  requests: store.maintenance_requests.filter(
    (item) => store.orgUnitIds.includes(item.unit_id) && item.status !== 'completed',
  ).length,
}))

const demoProperties = computed(() =>
  store.propertiesWithStats.slice(0, 3).map((property) => ({
    name: property.name,
    unitCount: property.unitCount,
    occupancy: property.occupancy,
  })),
)

const trustAreas = computed(() => [
  { icon: Building2, labelKey: 'nav.properties' },
  { icon: Users, labelKey: 'nav.tenants' },
  { icon: FileText, labelKey: 'nav.leases' },
  { icon: CreditCard, labelKey: 'nav.payments' },
])

// Placeholder testimonials: replace with verified customer quotes when available.
const testimonials = computed(() => [
  { id: 1, tone: 'primary' },
  { id: 2, tone: 'violet' },
  { id: 3, tone: 'success' },
])

const contactForm = ref({ name: '', email: '', company: '', message: '', requestDemo: false })
const submitting = ref(false)
let submitTimer = null

function submitContact() {
  const { name, email, message } = contactForm.value
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!name || !emailValid || !message) {
    notify(t('landing.contactError'), 'error')
    return
  }
  if (submitting.value) return
  submitting.value = true
  submitTimer = setTimeout(() => {
    submitting.value = false
    notify(t('landing.contactSent'), 'success')
    contactForm.value = { name: '', email: '', company: '', message: '', requestDemo: false }
  }, 650)
}

// Keep the localized page description in sync with the selected language.
watch(
  locale,
  () => {
    const description = t('landing.seoDescription')
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:locale"]')?.setAttribute(
      'content',
      locale.value === 'bn' ? 'bn_BD' : 'en_US',
    )
  },
  { immediate: true },
)

const showBackToTop = ref(false)
const headerOffset = 72
let scrollTimer = null
let sectionObserver = null

function updateBackToTop() {
  const remaining = document.documentElement.scrollHeight - window.scrollY - window.innerHeight
  showBackToTop.value = window.scrollY > 240 && remaining < 140
}

function animateScroll(targetY, duration = 550) {
  if (scrollTimer) clearInterval(scrollTimer)
  const startY = window.scrollY
  const distance = targetY - startY
  if (Math.abs(distance) < 2) return

  const startedAt = Date.now()
  scrollTimer = setInterval(() => {
    const progress = Math.min((Date.now() - startedAt) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    window.scrollTo({ top: startY + distance * eased, behavior: 'auto' })
    if (progress >= 1) {
      clearInterval(scrollTimer)
      scrollTimer = null
    }
  }, 16)
}

function goToSection(id) {
  const target = document.getElementById(id)
  if (!target) return
  const targetY = Math.max(target.getBoundingClientRect().top + window.scrollY - headerOffset, 0)
  history.replaceState(history.state, '', `#${id}`)
  mobileOpen.value = false
  animateScroll(targetY)
}

function scrollToTop() {
  history.replaceState(history.state, '', window.location.pathname + window.location.search)
  animateScroll(0)
}

onMounted(() => {
  updateBackToTop()
  window.addEventListener('scroll', updateBackToTop, { passive: true })
  window.addEventListener('resize', updateBackToTop)

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeSection.value = entry.target.id
      })
    },
    { rootMargin: '-88px 0px -65% 0px', threshold: 0 },
  )
  ;['features', 'how-it-works', 'product', 'testimonials', 'pricing', 'faq', 'contact'].forEach((id) => {
    const el = document.getElementById(id)
    if (el) sectionObserver.observe(el)
  })
})

onUnmounted(() => {
  if (scrollTimer) clearInterval(scrollTimer)
  if (submitTimer) clearTimeout(submitTimer)
  sectionObserver?.disconnect()
  window.removeEventListener('scroll', updateBackToTop)
  window.removeEventListener('resize', updateBackToTop)
})

const features = computed(() => [
  {
    icon: Building2,
    tone: 'violet',
    titleKey: 'landing.feature1Title',
    descKey: 'landing.feature1Desc',
    rows: [
      { labelKey: 'nav.properties', statusKey: 'status.active', tone: 'primary' },
      { labelKey: 'nav.tenants', statusKey: 'status.active', tone: 'violet' },
    ],
  },
  {
    icon: Users,
    tone: 'primary',
    titleKey: 'landing.feature4Title',
    descKey: 'landing.feature4Desc',
    rows: [
      { labelKey: 'nav.tenants', statusKey: 'status.active', tone: 'primary' },
      { labelKey: 'nav.leases', statusKey: 'status.active', tone: 'success' },
    ],
  },
  {
    icon: FileText,
    tone: 'warning',
    titleKey: 'landing.feature5Title',
    descKey: 'landing.feature5Desc',
    rows: [
      { labelKey: 'nav.leases', statusKey: 'status.active', tone: 'success' },
      { labelKey: 'nav.rentCharges', statusKey: 'status.pending', tone: 'warning' },
    ],
  },
  {
    icon: CreditCard,
    tone: 'success',
    titleKey: 'landing.feature2Title',
    descKey: 'landing.feature2Desc',
    rows: [
      { labelKey: 'nav.rentCharges', statusKey: 'status.paid', tone: 'success' },
      { labelKey: 'nav.payments', statusKey: 'status.paid', tone: 'success' },
    ],
  },
  {
    icon: Wrench,
    tone: 'warning',
    titleKey: 'landing.feature3Title',
    descKey: 'landing.feature3Desc',
    rows: [
      { labelKey: 'nav.maintenance', statusKey: 'status.in_progress', tone: 'warning' },
      { labelKey: 'nav.properties', statusKey: 'status.active', tone: 'primary' },
    ],
  },
  {
    icon: BarChart3,
    tone: 'violet',
    titleKey: 'landing.feature6Title',
    descKey: 'landing.feature6Desc',
    rows: [
      { labelKey: 'nav.payments', statusKey: 'status.paid', tone: 'success' },
      { labelKey: 'nav.rentCharges', statusKey: 'status.pending', tone: 'warning' },
    ],
  },
])

const howSteps = computed(() => [
  { icon: Building2, titleKey: 'landing.step1Title', descKey: 'landing.step1Desc' },
  { icon: Users, titleKey: 'landing.step2Title', descKey: 'landing.step2Desc' },
  { icon: CreditCard, titleKey: 'landing.step3Title', descKey: 'landing.step3Desc' },
  { icon: BarChart3, titleKey: 'landing.step4Title', descKey: 'landing.step4Desc' },
])

const productPreviews = computed(() => [
  { icon: BarChart3, titleKey: 'landing.productCard1Title', descKey: 'landing.productCard1Desc', kind: 'dashboard' },
  { icon: Building2, titleKey: 'landing.productCard2Title', descKey: 'landing.productCard2Desc', kind: 'properties' },
  { icon: FileText, titleKey: 'landing.productCard3Title', descKey: 'landing.productCard3Desc', kind: 'tenants' },
  { icon: ClipboardList, titleKey: 'landing.productCard4Title', descKey: 'landing.productCard4Desc', kind: 'activity' },
])

const faqs = computed(() =>
  Array.from({ length: 13 }, (_, index) => ({
    qKey: `landing.faqQ${index + 1}`,
    aKey: `landing.faqA${index + 1}`,
  })),
)

const billingPeriod = ref('monthly')

const billingOptions = computed(() => [
  { id: 'monthly', key: 'landing.pricingMonthly' },
  { id: 'annual', key: 'landing.pricingAnnual', soon: true },
])

const plans = computed(() => [
  {
    id: 'free',
    nameKey: 'landing.planFree',
    taglineKey: 'landing.freeTagline',
    limitKey: 'landing.planLimitFree',
    price: 0,
    currency: 'USD',
    billing: 'monthly',
    featured: false,
    features: [
      t('landing.freeF1'),
      t('landing.freeF2'),
      t('landing.freeF3'),
      t('landing.freeF4'),
    ],
  },
  {
    id: 'pro',
    nameKey: 'landing.planPro',
    taglineKey: 'landing.proTagline',
    limitKey: 'landing.planLimitPro',
    price: 29,
    currency: 'USD',
    billing: 'monthly',
    featured: true,
    features: [
      t('landing.proF1'),
      t('landing.proF2'),
      t('landing.proF3'),
      t('landing.proF4'),
      t('landing.proF5'),
    ],
  },
  {
    id: 'max',
    nameKey: 'landing.planMax',
    taglineKey: 'landing.maxTagline',
    limitKey: 'landing.planLimitMax',
    price: 79,
    currency: 'USD',
    billing: 'monthly',
    featured: false,
    features: [
      t('landing.maxF1'),
      t('landing.maxF2'),
      t('landing.maxF3'),
      t('landing.maxF4'),
      t('landing.maxF5'),
    ],
  },
])

const previewRows = computed(() => [
  { icon: Building2, labelKey: 'nav.properties', statusKey: 'status.active', tone: 'primary' },
  { icon: CreditCard, labelKey: 'nav.payments', statusKey: 'status.paid', tone: 'success' },
  { icon: Wrench, labelKey: 'nav.maintenance', statusKey: 'status.in_progress', tone: 'warning' },
])
</script>

<template>
  <div class="landing">
    <!-- Sticky header -->
    <header class="site-header">
      <div class="mx-auto flex h-18 w-full max-w-6xl items-center gap-6 px-5 md:px-8">
        <RouterLink :to="{ name: 'landing' }" class="brand" @click="mobileOpen = false">
          <span class="brand-mark"><span>Z</span></span>
          <span class="brand-text">
            <strong>zoniq</strong>
            <small>{{ t('shell.brandTagline') }}</small>
          </span>
        </RouterLink>

        <nav class="desktop-nav ml-auto flex items-center gap-1" :aria-label="t('landing.navAriaLabel')">
          <a
            v-for="item in [
              { id: 'features', key: 'landing.navFeatures' },
              { id: 'how-it-works', key: 'landing.navHowItWorks' },
              { id: 'pricing', key: 'landing.navPricing' },
              { id: 'faq', key: 'landing.navFaq' },
              { id: 'contact', key: 'landing.navContact' },
            ]"
            :key="item.id"
            :href="`#${item.id}`"
            class="nav-link"
            :class="{ active: activeSection === item.id }"
            @click.prevent="goToSection(item.id)"
          >{{ t(item.key) }}</a>
        </nav>

        <div class="header-actions ml-auto flex items-center gap-2 lg:ml-0">
          <div class="lang-switch" role="group" :aria-label="t('topbar.language')">
            <button
              v-for="lang in SUPPORTED_LOCALES"
              :key="lang.code"
              type="button"
              class="lang-btn"
              :class="{ active: locale === lang.code }"
              :aria-pressed="locale === lang.code"
              @click="setLocale(lang.code)"
            >
              {{ lang.short }}
            </button>
          </div>
          <RouterLink :to="{ name: 'login' }" class="btn btn-ghost sign-in-link">{{ t('landing.signIn') }}</RouterLink>
          <RouterLink :to="signupTo('free')" class="btn btn-primary header-cta">
            {{ t('landing.getStarted') }}
            <ArrowRight :size="15" />
          </RouterLink>
          <button
            type="button"
            class="btn btn-ghost btn-icon menu-toggle"
            :aria-label="mobileOpen ? t('common.closeMenu') : t('common.openMenu')"
            :aria-expanded="mobileOpen"
            @click="mobileOpen = !mobileOpen"
          >
            <X v-if="mobileOpen" :size="20" />
            <Menu v-else :size="20" />
          </button>
        </div>
      </div>

      <Transition name="mobile-menu">
        <div v-if="mobileOpen" class="mobile-nav">
          <a href="#features" class="mobile-link" @click.prevent="goToSection('features')">{{ t('landing.navFeatures') }}</a>
          <a href="#how-it-works" class="mobile-link" @click.prevent="goToSection('how-it-works')">{{ t('landing.navHowItWorks') }}</a>
          <a href="#pricing" class="mobile-link" @click.prevent="goToSection('pricing')">{{ t('landing.navPricing') }}</a>
          <a href="#faq" class="mobile-link" @click.prevent="goToSection('faq')">{{ t('landing.navFaq') }}</a>
          <a href="#contact" class="mobile-link" @click.prevent="goToSection('contact')">{{ t('landing.navContact') }}</a>
          <div class="mobile-nav-divider"></div>
          <RouterLink :to="{ name: 'login' }" class="mobile-link" @click="mobileOpen = false">{{ t('landing.signIn') }}</RouterLink>
          <RouterLink :to="signupTo('free')" class="btn btn-primary mobile-cta" @click="mobileOpen = false">
            {{ t('landing.getStarted') }}
          </RouterLink>
        </div>
      </Transition>
    </header>

    <main>
      <!-- Hero -->
      <section class="hero">
        <div class="hero-orb hero-orb-a" aria-hidden="true"></div>
        <div class="hero-orb hero-orb-b" aria-hidden="true"></div>
        <div class="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-24 md:px-8 lg:grid-cols-[1fr_1.15fr] lg:py-30">
          <div class="hero-copy">
            <span class="badge badge-primary hero-pill">
              <Sparkles :size="14" />
              {{ t('landing.heroBadge') }}
            </span>
            <h1 class="hero-title">
              {{ t('landing.heroTitle') }}
              <span class="hero-accent">{{ t('landing.heroTitleAccent') }}</span>
            </h1>
            <p class="hero-subtitle">{{ t('landing.heroSubtitle') }}</p>
            <div class="hero-actions">
              <RouterLink :to="signupTo('free')" class="btn btn-primary btn-lg hero-primary">
                {{ t('landing.heroStart') }}
                <ArrowRight :size="16" />
              </RouterLink>
              <a href="#pricing" class="btn btn-outline btn-lg" @click.prevent="goToSection('pricing')">{{ t('landing.heroSeePlans') }}</a>
            </div>
            <p class="hero-note">
              <Check :size="14" />
              {{ t('landing.heroNote') }}
            </p>
            <div class="hero-trust">
              <Check :size="15" />
              <span>{{ t('landing.trustBadge') }}</span>
            </div>
          </div>

          <!-- CSS-built product preview -->
          <div class="hero-visual" aria-hidden="true">
            <div class="float-card float-card-top">
              <span class="float-icon tone-primary"><Building2 :size="13" /></span>
              <span>
                <strong>{{ demoStats.properties }}</strong>
                <small>{{ t('landing.previewStatProperties') }}</small>
              </span>
            </div>
            <div class="float-card float-card-bottom">
              <span class="float-icon tone-warning"><Wrench :size="13" /></span>
              <span>
                <strong>{{ demoStats.requests }}</strong>
                <small>{{ t('landing.previewStatRequests') }}</small>
              </span>
            </div>
            <div class="preview-window">
              <div class="preview-window-bar">
                <span class="window-dots"><i></i><i></i><i></i></span>
                <span class="badge badge-neutral preview-window-badge">{{ t('landing.previewBadge') }}</span>
              </div>
              <div class="preview-body">
                <div class="preview-head">
                  <div>
                    <h3>{{ t('landing.previewTitle') }}</h3>
                    <p class="subtle">{{ t('shell.demoHint') }}</p>
                  </div>
                  <span class="badge badge-success"><span class="dot"></span>{{ t('status.active') }}</span>
                </div>

                <div class="preview-stats">
                  <div class="preview-stat">
                    <span class="preview-stat-label">{{ t('landing.previewStatProperties') }}</span>
                    <strong class="preview-stat-value">{{ demoStats.properties }}</strong>
                  </div>
                  <div class="preview-stat">
                    <span class="preview-stat-label">{{ t('landing.previewStatUnits') }}</span>
                    <strong class="preview-stat-value">{{ demoStats.units }}</strong>
                  </div>
                  <div class="preview-stat">
                    <span class="preview-stat-label">{{ t('landing.previewStatLeases') }}</span>
                    <strong class="preview-stat-value">{{ demoStats.leases }}</strong>
                  </div>
                </div>

                <div class="preview-lower">
                  <div class="preview-panel">
                    <div class="preview-panel-head">
                      <div class="col">
                        <strong>{{ t('landing.previewChartTitle') }}</strong>
                        <small class="subtle">{{ t('landing.previewChartSubtitle') }}</small>
                      </div>
                    </div>
                    <div class="demo-properties">
                      <div v-for="property in demoProperties" :key="property.name" class="demo-property">
                        <div class="demo-property-head">
                          <span>{{ property.name }}</span>
                          <span>{{ property.unitCount }}</span>
                        </div>
                        <div class="progress"><span :style="{ width: property.occupancy + '%' }"></span></div>
                      </div>
                    </div>
                  </div>

                  <div class="preview-panel">
                    <strong class="preview-list-title">{{ t('landing.previewListTitle') }}</strong>
                    <div v-for="row in previewRows" :key="row.labelKey" class="preview-list-row">
                      <span class="preview-row-icon" :class="`tone-${row.tone}`">
                        <component :is="row.icon" :size="13" />
                      </span>
                      <span class="preview-row-label">{{ t(row.labelKey) }}</span>
                      <span class="badge badge-sm" :class="`badge-${row.tone}`">{{ t(row.statusKey) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-fade" aria-hidden="true"></div>
      </section>

      <!-- Trust statement -->
      <section class="trust-section">
        <div class="mx-auto w-full max-w-6xl px-5 md:px-8">
          <p class="trust-eyebrow">{{ t('landing.trustEyebrow') }}</p>
          <p class="trust-statement">{{ t('landing.trustStatement') }}</p>
          <div class="trust-areas">
            <span v-for="area in trustAreas" :key="area.labelKey" class="trust-chip">
              <component :is="area.icon" :size="14" />
              {{ t(area.labelKey) }}
            </span>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="section features-section">
        <div class="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div class="section-head">
            <span class="eyebrow">{{ t('landing.featuresEyebrow') }}</span>
            <h2 class="section-heading">{{ t('landing.featuresTitle') }}</h2>
            <p class="section-copy">{{ t('landing.featuresSubtitle') }}</p>
          </div>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article v-for="(feature, index) in features" :key="feature.titleKey" class="card feature-card">
              <span class="feature-index">0{{ index + 1 }}</span>
              <span class="feature-icon" :class="`tone-${feature.tone}`">
                <component :is="feature.icon" :size="21" />
              </span>
              <h3>{{ t(feature.titleKey) }}</h3>
              <p>{{ t(feature.descKey) }}</p>
              <div class="feature-preview" aria-hidden="true">
                <div class="feature-preview-bar"><i></i><i></i><i></i></div>
                <div v-for="row in feature.rows" :key="row.labelKey" class="feature-preview-row">
                  <span class="feature-preview-dot" :class="`tone-${row.tone}`"></span>
                  <span class="feature-preview-label">{{ t(row.labelKey) }}</span>
                  <span class="badge badge-sm" :class="`badge-${row.tone}`">{{ t(row.statusKey) }}</span>
                </div>
              </div>
            </article>
          </div>
          <div class="roadmap-strip">
            <span class="roadmap-icon tone-violet"><BarChart3 :size="18" /></span>
            <div>
              <div class="roadmap-heading">
                <strong>{{ t('landing.roadmapTitle') }}</strong>
                <span class="badge badge-neutral">{{ t('landing.planned') }}</span>
              </div>
              <p>{{ t('landing.roadmapDesc') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section id="how-it-works" class="section how-section">
        <div class="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div class="section-head">
            <span class="eyebrow">{{ t('landing.howEyebrow') }}</span>
            <h2 class="section-heading">{{ t('landing.howTitle') }}</h2>
            <p class="section-copy">{{ t('landing.howSubtitle') }}</p>
          </div>
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <article v-for="(step, index) in howSteps" :key="step.titleKey" class="card step-card">
              <div class="step-top">
                <span class="step-number">0{{ index + 1 }}</span>
                <span class="step-icon" :class="index === 0 ? 'tone-primary' : index === 1 ? 'tone-violet' : index === 2 ? 'tone-success' : 'tone-warning'">
                  <component :is="step.icon" :size="18" />
                </span>
              </div>
              <h3>{{ t(step.titleKey) }}</h3>
              <p>{{ t(step.descKey) }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- Product interface preview -->
      <section id="product" class="section product-section">
        <div class="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div class="section-head">
            <span class="eyebrow">{{ t('landing.productEyebrow') }}</span>
            <h2 class="section-heading">{{ t('landing.productTitle') }}</h2>
            <p class="section-copy">{{ t('landing.productSubtitle') }}</p>
          </div>
          <div class="grid gap-6 md:grid-cols-2">
            <article v-for="card in productPreviews" :key="card.kind" class="card product-card">
              <div class="product-card-head">
                <span class="product-card-icon tone-primary"><component :is="card.icon" :size="18" /></span>
                <div>
                  <h3>{{ t(card.titleKey) }}</h3>
                  <p>{{ t(card.descKey) }}</p>
                </div>
              </div>
              <div class="mini-ui" aria-hidden="true">
                <div class="mini-ui-bar"><i></i><i></i><i></i></div>
                <div class="mini-ui-body">
                  <template v-if="card.kind === 'dashboard'">
                    <div class="mini-stats">
                      <span><small>{{ t('landing.previewStatProperties') }}</small><strong>{{ demoStats.properties }}</strong></span>
                      <span><small>{{ t('landing.previewStatUnits') }}</small><strong>{{ demoStats.units }}</strong></span>
                      <span><small>{{ t('landing.previewStatLeases') }}</small><strong>{{ demoStats.leases }}</strong></span>
                    </div>
                  </template>
                  <template v-else-if="card.kind === 'properties'">
                    <div v-for="property in demoProperties.slice(0, 2)" :key="property.name" class="mini-row">
                      <span>{{ property.name }}</span><span class="badge badge-sm badge-primary">{{ property.occupancy }}%</span>
                    </div>
                  </template>
                  <template v-else-if="card.kind === 'tenants'">
                    <div class="mini-row"><span>{{ t('nav.tenants') }}</span><span class="badge badge-sm badge-neutral">{{ t('status.active') }}</span></div>
                    <div class="mini-row"><span>{{ t('nav.leases') }}</span><span class="badge badge-sm badge-primary">{{ t('status.active') }}</span></div>
                  </template>
                  <template v-else>
                    <div class="mini-row"><span>{{ t('nav.payments') }}</span><span class="badge badge-sm badge-success">{{ t('status.paid') }}</span></div>
                    <div class="mini-row"><span>{{ t('nav.maintenance') }}</span><span class="badge badge-sm badge-warning">{{ t('status.in_progress') }}</span></div>
                  </template>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section id="testimonials" class="section testimonials-section">
        <div class="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div class="section-head centered">
            <span class="eyebrow">{{ t('landing.testimonialsEyebrow') }}</span>
            <h2 class="section-heading">{{ t('landing.testimonialsTitle') }}</h2>
            <p class="section-copy">{{ t('landing.testimonialsSubtitle') }}</p>
          </div>
          <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <article v-for="item in testimonials" :key="item.id" class="card testimonial-card">
              <span class="badge badge-neutral testimonial-sample">{{ t('landing.testimonialSample') }}</span>
              <span class="quote-mark" aria-hidden="true">&ldquo;</span>
              <p class="testimonial-quote">{{ t('landing.testimonialPlaceholderQuote') }}</p>
              <div class="testimonial-author">
                <span class="testimonial-avatar" :class="`tone-${item.tone}`">?</span>
                <div>
                  <strong>{{ t('landing.testimonialPlaceholderName') }}</strong>
                  <span>{{ t('landing.testimonialPlaceholderRole') }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- Pricing -->
      <section id="pricing" class="section pricing-section">
        <div class="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div class="section-head centered">
            <span class="eyebrow">{{ t('landing.pricingEyebrow') }}</span>
            <h2 class="section-heading">{{ t('landing.pricingTitle') }}</h2>
            <p class="section-copy">{{ t('landing.pricingSubtitle') }}</p>
          </div>

          <div class="billing-switch" role="group" :aria-label="t('landing.pricingBilling')">
            <button
              v-for="option in billingOptions"
              :key="option.id"
              type="button"
              class="billing-btn"
              :class="{ active: billingPeriod === option.id }"
              :aria-pressed="billingPeriod === option.id"
              @click="billingPeriod = option.id"
            >
              {{ t(option.key) }}
              <small v-if="option.soon">{{ t('landing.pricingAnnualSoon') }}</small>
            </button>
          </div>
          <p v-if="billingPeriod === 'annual'" class="billing-notice">{{ t('landing.pricingAnnualNotice') }}</p>

          <div class="mt-8 grid items-start gap-6 lg:grid-cols-3">
            <article
              v-for="plan in plans"
              :key="plan.id"
              class="card plan-card"
              :class="{ 'plan-featured': plan.featured }"
            >
              <span v-if="plan.featured" class="badge badge-primary plan-badge">{{ t('landing.popular') }}</span>
              <h3 class="plan-name">{{ t(plan.nameKey) }}</h3>
              <p class="plan-tagline">{{ t(plan.taglineKey) }}</p>
              <p class="plan-limit">
                <span>{{ t('landing.pricingLimitLabel') }}</span>
                <strong>{{ t(plan.limitKey) }}</strong>
              </p>
              <div class="plan-price">
                <template v-if="billingPeriod === 'monthly'">
                  <span class="plan-amount">${{ plan.price }}</span>
                  <span v-if="plan.price" class="plan-period">{{ t('landing.perMonth') }}</span>
                </template>
                <span v-else class="plan-amount plan-amount-text">{{ t('landing.priceAnnualOnRequest') }}</span>
              </div>
              <p class="plan-billing">
                {{ billingPeriod === 'annual'
                  ? t('landing.planBillingAnnual')
                  : t(plan.price ? 'landing.planBillingPaid' : 'landing.planBillingFree') }}
              </p>
              <RouterLink
                v-if="billingPeriod === 'monthly'"
                :to="signupTo(plan.id)"
                class="btn plan-cta"
                :class="plan.featured ? 'btn-primary' : ''"
              >
                {{ t('landing.getStarted') }}
                <ArrowRight :size="15" />
              </RouterLink>
              <a
                v-else
                href="#contact"
                class="btn plan-cta"
                :class="plan.featured ? 'btn-primary' : ''"
                @click.prevent="goToSection('contact')"
              >
                {{ t('landing.contactDemo') }}
                <ArrowRight :size="15" />
              </a>
              <ul class="plan-features">
                <li v-for="feature in plan.features" :key="feature">
                  <span class="plan-check"><Check :size="12" /></span>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </article>
          </div>

          <div class="pricing-notes">
            <p class="pricing-note">{{ t('landing.pricingBilling') }}</p>
            <p class="pricing-note">{{ t('landing.pricingCurrency') }} {{ t('landing.pricingBdt') }}</p>
            <p class="pricing-note">{{ t('landing.pricingExceed') }}</p>
            <p class="pricing-note">{{ t('landing.pricingUpgrade') }}</p>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="section faq-section">
        <div class="mx-auto w-full max-w-3xl px-5 md:px-8">
          <div class="section-head">
            <span class="eyebrow">{{ t('landing.faqEyebrow') }}</span>
            <h2 class="section-heading">{{ t('landing.faqTitle') }}</h2>
            <p class="section-copy">{{ t('landing.faqSubtitle') }}</p>
          </div>
          <div class="faq-list">
            <details v-for="faq in faqs" :key="faq.qKey" class="faq-item">
              <summary>{{ t(faq.qKey) }}</summary>
              <p>{{ t(faq.aKey) }}</p>
            </details>
          </div>
        </div>
      </section>

      <!-- Contact -->
      <section id="contact" class="section contact-section">
        <div class="mx-auto grid w-full max-w-6xl items-start gap-12 px-5 md:px-8 lg:grid-cols-2">
          <div class="contact-info">
            <div class="contact-panel">
              <span class="eyebrow">{{ t('landing.contactEyebrow') }}</span>
              <h2 class="section-heading">{{ t('landing.contactTitle') }}</h2>
              <p class="section-copy">{{ t('landing.contactSubtitle') }}</p>
            </div>
          </div>

          <form class="card contact-form" novalidate @submit.prevent="submitContact">
            <div class="field">
              <label class="field-label" for="contact-name">{{ t('landing.contactName') }}</label>
              <input
                id="contact-name"
                v-model="contactForm.name"
                class="input"
                type="text"
                :placeholder="t('landing.contactNamePlaceholder')"
                autocomplete="name"
                required
              />
            </div>
            <div class="field">
              <label class="field-label" for="contact-email">{{ t('landing.contactEmail') }}</label>
              <input
                id="contact-email"
                v-model="contactForm.email"
                class="input"
                type="email"
                :placeholder="t('landing.contactEmailPlaceholder')"
                autocomplete="email"
                required
              />
            </div>
            <div class="field">
              <label class="field-label" for="contact-company">{{ t('landing.contactCompany') }}</label>
              <input
                id="contact-company"
                v-model="contactForm.company"
                class="input"
                type="text"
                :placeholder="t('landing.contactCompanyPlaceholder')"
                autocomplete="organization"
              />
            </div>
            <div class="field">
              <label class="field-label" for="contact-message">{{ t('landing.contactMessage') }}</label>
              <textarea
                id="contact-message"
                v-model="contactForm.message"
                class="textarea"
                :placeholder="t('landing.contactMessagePlaceholder')"
                rows="5"
                required
              ></textarea>
            </div>
            <label class="demo-check">
              <input v-model="contactForm.requestDemo" type="checkbox" />
              <span>{{ t('landing.contactDemo') }}</span>
            </label>
            <button type="submit" class="btn btn-primary contact-submit" :disabled="submitting">
              {{ submitting ? t('landing.contactSubmitting') : t('landing.contactSend') }}
              <Send v-if="!submitting" :size="15" />
            </button>
            <p class="contact-note">{{ t('landing.contactNote') }}</p>
          </form>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div class="footer-grid">
          <div class="footer-brand-col">
            <RouterLink :to="{ name: 'landing' }" class="brand">
              <span class="brand-mark"><span>Z</span></span>
              <span class="brand-text"><strong>zoniq</strong></span>
            </RouterLink>
            <p class="footer-note">{{ t('landing.trustStatement') }}</p>
          </div>
          <nav class="footer-col" :aria-label="t('landing.footerProduct')">
            <h3>{{ t('landing.footerProduct') }}</h3>
            <a href="#features" @click.prevent="goToSection('features')">{{ t('landing.navFeatures') }}</a>
            <a href="#how-it-works" @click.prevent="goToSection('how-it-works')">{{ t('landing.navHowItWorks') }}</a>
            <a href="#pricing" @click.prevent="goToSection('pricing')">{{ t('landing.navPricing') }}</a>
          </nav>
          <nav class="footer-col" :aria-label="t('landing.footerResources')">
            <h3>{{ t('landing.footerResources') }}</h3>
            <a href="#faq" @click.prevent="goToSection('faq')">{{ t('landing.navFaq') }}</a>
            <a href="#contact" @click.prevent="goToSection('contact')">{{ t('landing.navContact') }}</a>
          </nav>
          <div class="footer-col">
            <h3>{{ t('landing.footerCompany') }}</h3>
            <span class="footer-placeholder">{{ t('landing.footerPrivacy') }} <small>{{ t('landing.footerComingSoon') }}</small></span>
            <span class="footer-placeholder">{{ t('landing.footerTerms') }} <small>{{ t('landing.footerComingSoon') }}</small></span>
          </div>
          <div class="footer-col">
            <h3>{{ t('landing.footerOther') }}</h3>
            <div class="lang-switch" role="group" :aria-label="t('topbar.language')">
              <button
                v-for="lang in SUPPORTED_LOCALES"
                :key="lang.code"
                type="button"
                class="lang-btn"
                :class="{ active: locale === lang.code }"
                :aria-pressed="locale === lang.code"
                @click="setLocale(lang.code)"
              >
                {{ lang.short }}
              </button>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© {{ year }} {{ t('landing.footerRights') }}</span>
        </div>
      </div>
    </footer>

    <!-- Back to top -->
    <Transition name="back-to-top">
      <button
        v-if="showBackToTop"
        type="button"
        class="back-to-top"
        :aria-label="t('landing.backToTop')"
        :title="t('landing.backToTop')"
        @click="scrollToTop"
      >
        <ArrowUp :size="18" />
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.landing {
  position: relative;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  overflow: clip;
}

/* Header */
.site-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex: none;
}

.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: var(--brand-gradient);
  box-shadow: 0 6px 16px var(--brand-glow);
}

.brand-mark span {
  color: var(--on-brand);
  font-weight: 800;
  font-size: 18px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand-text strong {
  font-size: 19px;
  letter-spacing: -0.045em;
  font-weight: 780;
}

.brand-text small {
  color: var(--text-subtle);
  font-size: 9px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.nav-link {
  position: relative;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-muted);
  transition: background 0.16s, color 0.16s;
}

.nav-link:hover {
  background: var(--surface-3);
  color: var(--text);
}

.nav-link.active {
  color: var(--primary-text);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 1px;
  height: 2px;
  border-radius: 2px;
  background: var(--primary);
}

.lang-switch {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-2);
}

.lang-btn {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.16s, color 0.16s;
}

.lang-btn:hover { color: var(--text); }
.lang-btn.active {
  background: var(--surface);
  color: var(--primary-text);
  box-shadow: var(--shadow-sm);
}

.menu-toggle { display: none; }
.mobile-nav { display: none; }

/* Hero */
.hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 18% 0%, var(--primary-soft), transparent 52%),
    radial-gradient(ellipse at 92% 8%, var(--violet-soft), transparent 46%),
    var(--bg);
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--border) 55%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--border) 55%, transparent) 1px, transparent 1px);
  background-size: 52px 52px;
  -webkit-mask-image: radial-gradient(ellipse at 50% 25%, var(--text), transparent 72%);
  mask-image: radial-gradient(ellipse at 50% 25%, var(--text), transparent 72%);
  opacity: 0.35;
  pointer-events: none;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}

.hero-orb-a {
  width: 360px;
  height: 360px;
  top: -140px;
  left: -120px;
  background: var(--primary-soft);
}

.hero-orb-b {
  width: 320px;
  height: 320px;
  right: -100px;
  bottom: -160px;
  background: var(--violet-soft);
}

.hero-copy,
.hero-visual { position: relative; z-index: 1; }

.hero-pill {
  padding: 7px 13px;
  font-size: 12px;
  font-weight: 650;
}

.hero-title {
  margin-top: 24px;
  font-size: clamp(3rem, 5.8vw, 4.9rem);
  line-height: 1.04;
  letter-spacing: -0.055em;
  font-weight: 800;
}

.hero-accent {
  display: block;
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-subtitle {
  margin-top: 22px;
  max-width: 580px;
  font-size: 18px;
  line-height: 1.7;
  color: color-mix(in srgb, var(--text-muted) 65%, var(--text));
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}

.btn-lg {
  height: 48px;
  padding: 0 22px;
  font-size: 14px;
  border-radius: 11px;
}

.hero-primary {
  box-shadow: 0 10px 26px var(--primary-glow);
  transition: transform 0.18s, box-shadow 0.18s;
}

.hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px var(--primary-glow);
}

.btn-outline {
  background: var(--surface);
  border-color: var(--border-strong);
  color: var(--text);
  transition: border-color 0.16s, color 0.16s, background 0.16s;
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary-text);
  background: var(--primary-soft);
}

.hero-note {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 18px;
  font-size: 13px;
  color: var(--text-muted);
}

.hero-note svg { color: var(--success); }

.hero-trust {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 26px;
  font-size: 13px;
  font-weight: 600;
  color: color-mix(in srgb, var(--text-muted) 70%, var(--text));
}

.hero-trust svg { color: var(--success); }

/* Product preview */
.hero-visual { max-width: 680px; width: 100%; margin-left: auto; }

.preview-window {
  position: relative;
  border: 1px solid var(--border-strong);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: var(--shadow-lg), 0 0 60px var(--primary-glow);
  overflow: hidden;
}

.preview-window-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}

.window-dots { display: inline-flex; gap: 6px; }
.window-dots i {
  width: 8px;
  height: 8px;
  border-radius: 99px;
  background: var(--border-strong);
}
.window-dots i:first-child { background: var(--danger); }
.window-dots i:nth-child(2) { background: var(--warning); }
.window-dots i:nth-child(3) { background: var(--success); }

.preview-window-badge { font-size: 10px; padding: 2px 8px; }
.preview-body { padding: 22px; }

.preview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.preview-head h3 { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; }
.preview-head p { font-size: 11px; margin-top: 3px; }

.preview-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 11px;
}

.preview-stat {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface-2);
}
.preview-stat-label { font-size: 10.5px; color: var(--text-muted); }
.preview-stat-value {
  font-size: 25px;
  font-weight: 750;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.preview-lower {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 11px;
  margin-top: 11px;
}

.preview-panel {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface-2);
}

.preview-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.preview-panel-head strong { font-size: 12px; }
.preview-panel-head small { font-size: 10px; }
.demo-properties { display: flex; flex-direction: column; gap: 12px; margin-top: 14px; }
.demo-property { display: flex; flex-direction: column; gap: 6px; }
.demo-property-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-muted);
}
.demo-property-head span:last-child { font-variant-numeric: tabular-nums; }

.preview-list-title { display: block; font-size: 12px; margin-bottom: 6px; }
.preview-list-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-top: 1px solid var(--border);
}
.preview-row-icon {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  flex: none;
}
.preview-row-label { font-size: 11px; font-weight: 600; flex: 1; min-width: 0; }
.badge-sm { font-size: 9px; padding: 2px 6px; }

.float-card {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 13px;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  animation: float 6s ease-in-out infinite;
}
.float-card-top { top: 44px; left: -34px; }
.float-card-bottom { right: -26px; bottom: 56px; animation-delay: -3s; }
.float-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex: none;
}
.float-card span:last-child { display: flex; flex-direction: column; line-height: 1.2; }
.float-card strong { font-size: 13px; font-weight: 750; }
.float-card small { font-size: 10px; color: var(--text-muted); }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.hero-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 80px;
  background: linear-gradient(to bottom, transparent, var(--bg));
  pointer-events: none;
}

/* Tone chips */
.tone-primary { background: var(--primary-soft); color: var(--primary-text); }
.tone-success { background: var(--success-soft); color: var(--success); }
.tone-warning { background: var(--warning-soft); color: var(--warning); }
.tone-violet { background: var(--violet-soft); color: var(--violet); }

/* Sections */
.section { padding: 104px 0; scroll-margin-top: 72px; }
.section-head { max-width: 660px; margin-bottom: 40px; }
.section-head.centered { margin-left: auto; margin-right: auto; text-align: center; }
.section-heading {
  margin-top: 14px;
  font-size: clamp(2rem, 3.6vw, 2.75rem);
  line-height: 1.12;
  letter-spacing: -0.045em;
  font-weight: 780;
}
.section-copy {
  margin-top: 16px;
  font-size: 15.5px;
  line-height: 1.75;
  color: var(--text-muted);
}

/* Trust statement */
.trust-section {
  padding: 40px 0 44px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.trust-eyebrow {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-subtle);
}
.trust-statement {
  max-width: 720px;
  margin: 12px auto 0;
  text-align: center;
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  line-height: 1.55;
  font-weight: 650;
  letter-spacing: -0.02em;
}
.trust-areas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 22px;
}
.trust-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: 99px;
  background: var(--surface-2);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}
.trust-chip svg { color: var(--primary-text); }

/* Features */
.features-section { background: var(--bg); }
.feature-card {
  position: relative;
  padding: 32px 28px 30px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.feature-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  background: var(--brand-gradient);
  opacity: 0;
  transition: opacity 0.2s;
}
.feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-lg);
}
.feature-card:hover::before { opacity: 1; }
.feature-index {
  position: absolute;
  top: 22px;
  right: 24px;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.12em;
  color: var(--text-subtle);
}
.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  margin-bottom: 22px;
}
.feature-card h3 { font-size: 18px; font-weight: 720; letter-spacing: -0.025em; }
.feature-card p {
  margin-top: 11px;
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--text-muted);
}
.feature-preview {
  margin-top: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
  overflow: hidden;
}
.feature-preview-bar {
  display: flex;
  gap: 5px;
  padding: 7px 9px;
  border-bottom: 1px solid var(--border);
}
.feature-preview-bar i { width: 5px; height: 5px; border-radius: 99px; background: var(--border-strong); }
.feature-preview-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-top: 1px solid var(--border);
}
.feature-preview-row:first-of-type { border-top: 0; }
.feature-preview-dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }
.feature-preview-label {
  flex: 1;
  min-width: 0;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.roadmap-strip {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-top: 24px;
  padding: 20px 22px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius);
  background: var(--surface-2);
}
.roadmap-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex: none;
}
.roadmap-heading { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.roadmap-heading strong { font-size: 14px; font-weight: 700; }
.roadmap-strip p { margin-top: 6px; font-size: 12.5px; line-height: 1.6; color: var(--text-muted); }

/* How it works */
.how-section { background: var(--bg-subtle); border-top: 1px solid var(--border); }
.step-card { padding: 24px 22px; }
.step-top { display: flex; align-items: center; justify-content: space-between; }
.step-number {
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.12em;
  color: var(--text-subtle);
}
.step-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
}
.step-card h3 { margin-top: 18px; font-size: 15.5px; font-weight: 700; letter-spacing: -0.02em; }
.step-card p { margin-top: 8px; font-size: 13px; line-height: 1.65; color: var(--text-muted); }

/* Product interface preview */
.product-section { background: var(--bg); border-bottom: 1px solid var(--border); }
.product-card { padding: 26px 24px; }
.product-card-head { display: flex; align-items: flex-start; gap: 13px; }
.product-card-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex: none;
}
.product-card h3 { font-size: 15.5px; font-weight: 700; letter-spacing: -0.02em; }
.product-card-head p { margin-top: 5px; font-size: 12.5px; line-height: 1.6; color: var(--text-muted); }
.mini-ui {
  margin-top: 20px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface-2);
  overflow: hidden;
}
.mini-ui-bar {
  display: flex;
  gap: 5px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
}
.mini-ui-bar i { width: 6px; height: 6px; border-radius: 99px; background: var(--border-strong); }
.mini-ui-body { padding: 12px; min-height: 96px; }
.mini-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.mini-stats span {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}
.mini-stats small { font-size: 10px; color: var(--text-muted); }
.mini-stats strong { font-size: 18px; font-weight: 750; font-variant-numeric: tabular-nums; }
.mini-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 2px;
  border-top: 1px solid var(--border);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-muted);
}
.mini-row:first-child { border-top: 0; }

/* FAQ */
.faq-section { background: var(--bg-subtle); border-top: 1px solid var(--border); }
.faq-list { display: flex; flex-direction: column; gap: 10px; }
.faq-item {
  padding: 0 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}
.faq-item summary {
  padding: 18px 0;
  font-size: 14.5px;
  font-weight: 650;
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after {
  content: '+';
  font-size: 18px;
  font-weight: 500;
  color: var(--primary-text);
}
.faq-item[open] summary::after { content: '\2212'; }
.faq-item p {
  padding: 0 0 18px;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text-muted);
}

/* Testimonials */
.testimonials-section {
  background: var(--bg-subtle);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.testimonial-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 30px 28px 26px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.testimonial-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.testimonial-sample { align-self: flex-start; font-size: 10px; padding: 3px 8px; }
.quote-mark {
  position: absolute;
  top: 6px;
  right: 22px;
  font-family: Georgia, serif;
  font-size: 74px;
  line-height: 1;
  color: var(--primary);
  opacity: 0.16;
  pointer-events: none;
}
.testimonial-quote {
  flex: 1;
  font-size: 14px;
  line-height: 1.75;
  color: var(--text);
}
.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}
.testimonial-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 750;
  flex: none;
}
.testimonial-author div { display: flex; flex-direction: column; min-width: 0; }
.testimonial-author strong { font-size: 13.5px; font-weight: 700; }
.testimonial-author span { margin-top: 2px; font-size: 12px; color: var(--text-muted); }

/* Pricing */
.pricing-section {
  background: var(--bg);
  background-image: radial-gradient(ellipse at 50% 0%, var(--primary-soft), transparent 52%);
}
.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 32px 28px;
  border-radius: var(--radius-lg);
}
.plan-featured {
  border-color: var(--primary);
  box-shadow: 0 22px 54px var(--primary-glow);
  transform: translateY(-8px);
}
.plan-badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}
.plan-name { font-size: 19px; font-weight: 750; letter-spacing: -0.025em; }
.plan-tagline { margin-top: 7px; font-size: 12.5px; color: var(--text-muted); }
.plan-limit {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 16px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-2);
}
.plan-limit span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-subtle); }
.plan-limit strong { font-size: 12.5px; font-weight: 650; color: var(--text); }
.plan-price { display: flex; align-items: baseline; gap: 5px; margin: 18px 0 0; }
.plan-amount {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.055em;
  font-variant-numeric: tabular-nums;
}
.plan-period { font-size: 13px; color: var(--text-muted); }
.plan-billing { margin-top: 4px; font-size: 11.5px; color: var(--text-subtle); }
.plan-cta { width: 100%; height: 44px; margin-top: 16px; }
.plan-features {
  list-style: none;
  margin: 24px 0 0;
  padding: 22px 0 0;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.plan-features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-muted);
}
.plan-check {
  width: 19px;
  height: 19px;
  margin-top: 1px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex: none;
  background: var(--success-soft);
  color: var(--success);
}
.billing-switch {
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 3px;
  margin: 0 auto;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface-2);
}
.billing-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 650;
  transition: background 0.16s, color 0.16s;
}
.billing-btn:hover { color: var(--text); }
.billing-btn.active {
  background: var(--surface);
  color: var(--primary-text);
  box-shadow: var(--shadow-sm);
}
.billing-btn small {
  padding: 2px 6px;
  border-radius: 99px;
  background: var(--warning-soft);
  color: var(--warning);
  font-size: 9px;
  font-weight: 700;
}
.billing-notice {
  max-width: 520px;
  margin: 14px auto 0;
  text-align: center;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-muted);
}
.plan-amount-text { font-size: 26px; letter-spacing: -0.03em; }

.pricing-notes {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 34px;
}
.pricing-note {
  text-align: center;
  font-size: 12.5px;
  color: var(--text-subtle);
}

/* Contact */
.contact-section { background: var(--surface); border-top: 1px solid var(--border); }
.contact-panel {
  padding: 36px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: linear-gradient(145deg, var(--primary-soft), var(--surface) 72%);
}
.contact-panel .section-heading { max-width: 440px; }

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 34px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.contact-form .field-label {
  font-size: 13px;
  font-weight: 650;
  color: var(--text);
}
.contact-form .input,
.contact-form .textarea { font-size: 13.5px; }
.contact-form .input::placeholder,
.contact-form .textarea::placeholder {
  color: color-mix(in srgb, var(--text-muted) 85%, var(--text));
  opacity: 1;
}
.demo-check {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
}
.demo-check input { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; flex: none; }
.contact-submit { align-self: flex-start; min-width: 158px; }
.contact-note { font-size: 12px; color: var(--text-muted); }

/* Footer */
.site-footer {
  padding: 48px 0 24px;
  background: var(--surface);
  border-top: 1px solid var(--border);
}
.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr repeat(4, 1fr);
  gap: 28px;
}
.footer-brand-col .footer-note {
  margin-top: 14px;
  max-width: 300px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-muted);
}
.footer-col { display: flex; flex-direction: column; align-items: flex-start; gap: 11px; }
.footer-col h3 {
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-subtle);
}
.footer-col a { font-size: 12.5px; font-weight: 600; color: var(--text-muted); transition: color 0.16s; }
.footer-col a:hover { color: var(--primary-text); }
.footer-placeholder {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: var(--text-subtle);
}
.footer-placeholder small { font-size: 10px; padding: 2px 6px; border-radius: 99px; background: var(--surface-2); }
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 36px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  font-size: 11.5px;
  color: var(--text-subtle);
}

/* Back to top */
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 50;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1px solid var(--primary);
  background: var(--primary);
  color: var(--on-brand);
  box-shadow: 0 10px 24px var(--primary-glow);
  transition: background 0.16s, transform 0.16s;
}
.back-to-top:hover { background: var(--primary-hover); transform: translateY(-3px); }
.back-to-top-enter-active,
.back-to-top-leave-active { transition: opacity 0.2s, transform 0.2s; }
.back-to-top-enter-from,
.back-to-top-leave-to { opacity: 0; transform: translateY(8px); }

.mobile-menu-enter-active,
.mobile-menu-leave-active { transition: opacity 0.18s, transform 0.18s; }
.mobile-menu-enter-from,
.mobile-menu-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 1024px) {
  .desktop-nav,
  .sign-in-link,
  .header-cta { display: none; }
  .menu-toggle { display: inline-flex; }

  .mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 20px 18px;
    border-top: 1px solid var(--border);
    background: var(--surface);
  }
  .mobile-link {
    padding: 11px 8px;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .mobile-link:hover { background: var(--surface-3); color: var(--text); }
  .mobile-nav-divider { height: 1px; background: var(--border); margin: 6px 0; }
  .mobile-cta { margin-top: 8px; width: 100%; }

  .footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .plan-featured { transform: none; }
}

@media (max-width: 640px) {
  .section { padding: 72px 0; scroll-margin-top: 64px; }
  .hero-title { font-size: clamp(2.55rem, 11.5vw, 3.4rem); }
  .hero-subtitle { font-size: 16.5px; }
  .hero-visual { margin-left: 0; }
  .float-card-top { left: 8px; top: 28px; }
  .float-card-bottom { right: 8px; bottom: 32px; }
  .preview-body { padding: 14px; }
  .preview-lower { grid-template-columns: 1fr; }
  .preview-stat { padding: 10px; }
  .preview-stat-value { font-size: 19px; }
  .contact-panel,
  .contact-form { padding: 24px; }
  .plan-card { padding: 28px 24px; }
  .footer-grid { grid-template-columns: 1fr; gap: 24px; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
  .trust-statement { font-size: 1.05rem; }
}

@media (prefers-reduced-motion: reduce) {
  .float-card { animation: none; }
  .back-to-top,
  .plan-featured { transition: none; }
}
</style>
