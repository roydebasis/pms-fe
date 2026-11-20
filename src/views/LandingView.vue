<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
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
  Landmark,
  KeyRound,
  Home,
  Hotel,
  Warehouse,
  Star,
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowUp,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
} from 'lucide-vue-next'
import { SUPPORTED_LOCALES, setLocale } from '@/i18n'
import { notify } from '@/composables/useUi'
import { initials } from '@/utils/format'

const { t, locale } = useI18n()

const mobileOpen = ref(false)
const activeSection = ref('')
const year = new Date().getFullYear()

const signupTo = (plan) => ({ name: 'signup', query: { plan } })

const partners = computed(() => [
  { name: 'Northwind Realty', icon: Building2, tone: 'primary' },
  { name: 'Horizon Estates', icon: Landmark, tone: 'violet' },
  { name: 'Cedar & Stone', icon: Home, tone: 'success' },
  { name: 'Maple Ridge', icon: KeyRound, tone: 'warning' },
  { name: 'Azure Living', icon: Hotel, tone: 'primary' },
  { name: 'Prime Holdings', icon: Warehouse, tone: 'violet' },
])

const testimonials = computed(() => [
  { name: 'Sarah Mitchell', roleKey: 'landing.role1', company: 'Northwind Realty', quoteKey: 'landing.quote1', tone: 'primary' },
  { name: 'David Okafor', roleKey: 'landing.role2', company: 'Horizon Estates', quoteKey: 'landing.quote2', tone: 'violet' },
  { name: 'Priya Sharma', roleKey: 'landing.role3', company: 'Cedar & Stone', quoteKey: 'landing.quote3', tone: 'success' },
])

const contactForm = ref({ name: '', email: '', message: '' })

function submitContact() {
  const { name, email, message } = contactForm.value
  if (!name || !email || !message) {
    notify(t('landing.contactError'), 'error')
    return
  }
  notify(t('landing.contactSent'), 'success')
  contactForm.value = { name: '', email: '', message: '' }
}

const socials = computed(() => [
  { name: 'X', icon: Twitter, href: 'https://x.com/zoniqapp' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/company/zoniqapp' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/zoniqapp' },
  { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/zoniqapp' },
])

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
  ;['features', 'testimonials', 'pricing', 'contact'].forEach((id) => {
    const el = document.getElementById(id)
    if (el) sectionObserver.observe(el)
  })

})

onUnmounted(() => {
  if (scrollTimer) clearInterval(scrollTimer)
  sectionObserver?.disconnect()
  window.removeEventListener('scroll', updateBackToTop)
  window.removeEventListener('resize', updateBackToTop)
})

const features = computed(() => [
  { icon: Building2, tone: 'violet', titleKey: 'landing.feature1Title', descKey: 'landing.feature1Desc' },
  { icon: CreditCard, tone: 'primary', titleKey: 'landing.feature2Title', descKey: 'landing.feature2Desc' },
  { icon: Wrench, tone: 'success', titleKey: 'landing.feature3Title', descKey: 'landing.feature3Desc' },
])

const plans = computed(() => [
  {
    id: 'free',
    nameKey: 'landing.planFree',
    taglineKey: 'landing.freeTagline',
    price: 0,
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
    price: 29,
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
    price: 79,
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

const previewBars = [42, 58, 50, 72, 64, 86, 100]

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
              { id: 'testimonials', key: 'landing.navTestimonials' },
              { id: 'pricing', key: 'landing.navPricing' },
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
          <a href="#testimonials" class="mobile-link" @click.prevent="goToSection('testimonials')">{{ t('landing.navTestimonials') }}</a>
          <a href="#pricing" class="mobile-link" @click.prevent="goToSection('pricing')">{{ t('landing.navPricing') }}</a>
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
        <div class="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-24 md:px-8 lg:grid-cols-[1fr_1.05fr] lg:py-30">
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
              <span class="trust-avatars" aria-hidden="true">
                <i class="tone-primary">SM</i>
                <i class="tone-violet">DO</i>
                <i class="tone-success">PS</i>
              </span>
              <span>{{ t('landing.trustBadge') }}</span>
            </div>
          </div>

          <!-- CSS-built product preview -->
          <div class="hero-visual" aria-hidden="true">
            <div class="float-card float-card-top">
              <span class="float-icon tone-success"><Check :size="13" /></span>
              <span>
                <strong>94%</strong>
                <small>{{ t('landing.previewStatOccupancy') }}</small>
              </span>
            </div>
            <div class="float-card float-card-bottom">
              <span class="float-icon tone-primary"><CreditCard :size="13" /></span>
              <span>
                <strong>$48.2k</strong>
                <small>{{ t('landing.previewStatCollected') }}</small>
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
                    <strong class="preview-stat-value">12</strong>
                  </div>
                  <div class="preview-stat">
                    <span class="preview-stat-label">{{ t('landing.previewStatOccupancy') }}</span>
                    <strong class="preview-stat-value">94%</strong>
                  </div>
                  <div class="preview-stat">
                    <span class="preview-stat-label">{{ t('landing.previewStatCollected') }}</span>
                    <strong class="preview-stat-value">$48.2k</strong>
                  </div>
                </div>

                <div class="preview-lower">
                  <div class="preview-panel">
                    <div class="preview-panel-head">
                      <div class="col">
                        <strong>{{ t('landing.previewChartTitle') }}</strong>
                        <small class="subtle">{{ t('landing.previewChartSubtitle') }}</small>
                      </div>
                      <strong class="chart-total">$48.2k</strong>
                    </div>
                    <div class="chart-bars">
                      <span
                        v-for="(height, index) in previewBars"
                        :key="index"
                        class="chart-bar"
                        :class="{ 'chart-bar-active': index === previewBars.length - 1 }"
                        :style="{ height: height + '%' }"
                      ></span>
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

      <!-- Partners / clients -->
      <section id="partners" class="partners-section">
        <div class="mx-auto w-full max-w-6xl px-5 md:px-8">
          <p class="partners-eyebrow">{{ t('landing.partnersEyebrow') }}</p>
          <div class="partner-grid">
            <div v-for="partner in partners" :key="partner.name" class="partner-item">
              <span class="partner-mark" :class="`tone-${partner.tone}`">
                <component :is="partner.icon" :size="19" />
              </span>
              <span class="partner-name">{{ partner.name }}</span>
            </div>
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
          <div class="grid gap-6 md:grid-cols-3">
            <article v-for="(feature, index) in features" :key="feature.titleKey" class="card feature-card">
              <span class="feature-index">0{{ index + 1 }}</span>
              <span class="feature-icon" :class="`tone-${feature.tone}`">
                <component :is="feature.icon" :size="21" />
              </span>
              <h3>{{ t(feature.titleKey) }}</h3>
              <p>{{ t(feature.descKey) }}</p>
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
            <article
              v-for="(item, index) in testimonials"
              :key="item.name"
              class="card testimonial-card"
              :class="{ 'testimonial-featured': index === 0 }"
            >
              <span class="quote-mark" aria-hidden="true">&ldquo;</span>
              <div class="testimonial-stars" :aria-label="t('landing.testimonialRating')">
                <Star v-for="n in 5" :key="n" :size="14" fill="currentColor" />
              </div>
              <p class="testimonial-quote">{{ t(item.quoteKey) }}</p>
              <div class="testimonial-author">
                <span class="testimonial-avatar" :class="`tone-${item.tone}`">{{ initials(item.name) }}</span>
                <div>
                  <strong>{{ item.name }}</strong>
                  <span>{{ t(item.roleKey) }} &middot; {{ item.company }}</span>
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

          <div class="grid items-start gap-6 lg:grid-cols-3">
            <article
              v-for="plan in plans"
              :key="plan.id"
              class="card plan-card"
              :class="{ 'plan-featured': plan.featured }"
            >
              <span v-if="plan.featured" class="badge badge-primary plan-badge">{{ t('landing.popular') }}</span>
              <h3 class="plan-name">{{ t(plan.nameKey) }}</h3>
              <p class="plan-tagline">{{ t(plan.taglineKey) }}</p>
              <div class="plan-price">
                <span class="plan-amount">${{ plan.price }}</span>
                <span v-if="plan.price" class="plan-period">{{ t('landing.perMonth') }}</span>
              </div>
              <RouterLink
                :to="signupTo(plan.id)"
                class="btn plan-cta"
                :class="plan.featured ? 'btn-primary' : ''"
              >
                {{ t('landing.getStarted') }}
                <ArrowRight :size="15" />
              </RouterLink>
              <ul class="plan-features">
                <li v-for="feature in plan.features" :key="feature">
                  <span class="plan-check"><Check :size="12" /></span>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </article>
          </div>

          <p class="pricing-note">{{ t('landing.pricingNote') }}</p>
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

              <div class="contact-details">
                <div class="contact-detail">
                  <span class="contact-detail-icon tone-primary"><Mail :size="18" /></span>
                  <div>
                    <span class="contact-detail-label">{{ t('landing.contactEmailLabel') }}</span>
                    <a href="mailto:hello@zoniq.app">hello@zoniq.app</a>
                  </div>
                </div>
                <div class="contact-detail">
                  <span class="contact-detail-icon tone-success"><Phone :size="18" /></span>
                  <div>
                    <span class="contact-detail-label">{{ t('landing.contactPhoneLabel') }}</span>
                    <a href="tel:+15550140280">+1 (555) 014-0280</a>
                  </div>
                </div>
                <div class="contact-detail">
                  <span class="contact-detail-icon tone-violet"><MapPin :size="18" /></span>
                  <div>
                    <span class="contact-detail-label">{{ t('landing.contactAddressLabel') }}</span>
                    <span class="contact-detail-value">210 Cedar Street, Suite 400, Portland, OR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form class="card contact-form" @submit.prevent="submitContact">
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
            <button type="submit" class="btn btn-primary contact-submit">
              {{ t('landing.contactSend') }}
              <Send :size="15" />
            </button>
            <p class="contact-note">{{ t('landing.contactNote') }}</p>
          </form>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-5 px-5 md:px-8">
        <RouterLink :to="{ name: 'landing' }" class="brand">
          <span class="brand-mark"><span>Z</span></span>
          <span class="brand-text"><strong>zoniq</strong></span>
        </RouterLink>
        <div class="footer-meta">
          <nav class="footer-socials" :aria-label="t('landing.socialAriaLabel')">
            <a
              v-for="social in socials"
              :key="social.name"
              :href="social.href"
              :aria-label="social.name"
              :title="social.name"
              target="_blank"
              rel="noopener noreferrer"
            >
              <component :is="social.icon" :size="16" />
            </a>
          </nav>
          <span class="footer-copyright">© {{ year }} {{ t('landing.footerRights') }}</span>
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
  font-size: clamp(2.75rem, 5.4vw, 4.5rem);
  line-height: 1.05;
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
  max-width: 560px;
  font-size: 17px;
  line-height: 1.75;
  color: var(--text-muted);
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
  font-size: 12.5px;
  color: var(--text-subtle);
}

.hero-note svg { color: var(--success); }

.hero-trust {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 26px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
}

.trust-avatars { display: inline-flex; }
.trust-avatars i {
  width: 28px;
  height: 28px;
  margin-right: -8px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 2px solid var(--bg);
  font-size: 9px;
  font-weight: 750;
  font-style: normal;
}

/* Product preview */
.hero-visual { max-width: 620px; width: 100%; margin-left: auto; }

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
.preview-body { padding: 20px; }

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
  font-size: 23px;
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
.chart-total { font-size: 14px; color: var(--primary-text); }

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 100px;
  margin-top: 14px;
}
.chart-bar {
  flex: 1;
  min-width: 0;
  border-radius: 5px 5px 2px 2px;
  background: var(--primary-soft);
  transition: background 0.2s;
}
.chart-bar-active { background: var(--primary); }

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

/* Partners */
.partners-section {
  padding: 38px 0 44px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.partners-eyebrow {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-subtle);
  margin-bottom: 26px;
}
.partner-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
}
.partner-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 12px 10px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--text-muted);
  transition: transform 0.18s, border-color 0.18s, background 0.18s, color 0.18s;
}
.partner-item:hover {
  transform: translateY(-2px);
  border-color: var(--border);
  background: var(--surface-2);
  color: var(--text);
}
.partner-mark {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  flex: none;
}
.partner-name {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

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
.testimonial-featured {
  border-color: var(--primary);
  box-shadow: var(--shadow-lg);
}
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
.testimonial-stars {
  display: inline-flex;
  gap: 2px;
  color: var(--warning);
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
.plan-price { display: flex; align-items: baseline; gap: 5px; margin: 22px 0; }
.plan-amount {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.055em;
  font-variant-numeric: tabular-nums;
}
.plan-period { font-size: 13px; color: var(--text-muted); }
.plan-cta { width: 100%; height: 44px; }
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
.pricing-note {
  margin-top: 34px;
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
.contact-details { display: flex; flex-direction: column; gap: 20px; margin-top: 32px; }
.contact-detail { display: flex; align-items: flex-start; gap: 13px; }
.contact-detail-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex: none;
}
.contact-detail div { display: flex; flex-direction: column; gap: 3px; }
.contact-detail-label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-subtle);
}
.contact-detail a,
.contact-detail-value { font-size: 13.5px; color: var(--text); line-height: 1.5; }
.contact-detail a:hover { color: var(--primary-text); }

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 34px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.contact-submit { align-self: flex-start; min-width: 158px; }
.contact-note { font-size: 12px; color: var(--text-subtle); }

/* Footer */
.site-footer {
  padding: 26px 0;
  background: var(--surface);
  border-top: 1px solid var(--border);
}
.footer-meta { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.footer-socials { display: flex; align-items: center; gap: 6px; }
.footer-socials a {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  transition: background 0.16s, color 0.16s;
}
.footer-socials a:hover { background: var(--primary-soft); color: var(--primary-text); }
.footer-copyright { font-size: 11.5px; color: var(--text-subtle); }

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

  .partner-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .plan-featured { transform: none; }
}

@media (max-width: 640px) {
  .section { padding: 72px 0; scroll-margin-top: 64px; }
  .hero-title { font-size: clamp(2.4rem, 11vw, 3.2rem); }
  .hero-subtitle { font-size: 15.5px; }
  .hero-visual { margin-left: 0; }
  .float-card-top { left: 8px; top: 28px; }
  .float-card-bottom { right: 8px; bottom: 32px; }
  .preview-body { padding: 14px; }
  .preview-lower { grid-template-columns: 1fr; }
  .preview-stat { padding: 10px; }
  .preview-stat-value { font-size: 18px; }
  .chart-bars { height: 78px; }
  .partner-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .contact-panel,
  .contact-form { padding: 24px; }
  .plan-card { padding: 28px 24px; }
  .footer-meta { gap: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .float-card { animation: none; }
  .back-to-top,
  .plan-featured { transition: none; }
}
</style>
