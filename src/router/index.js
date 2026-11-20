import { createRouter, createWebHistory } from 'vue-router'
import { i18n } from '@/i18n'
import { isAuthenticated } from '@/composables/useAuth'

const routes = [
  {
    path: '/',
    redirect: '/landing',
  },
  {
    path: '/landing',
    name: 'landing',
    component: () => import('@/views/LandingView.vue'),
    meta: { public: true, titleKey: 'route.landingTitle' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true, titleKey: 'route.loginTitle' },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/SignupView.vue'),
    meta: { public: true, titleKey: 'route.signupTitle' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { titleKey: 'route.dashboardTitle', subtitleKey: 'route.dashboardSubtitle', groupKey: 'nav.overview' },
  },
  {
    path: '/properties',
    name: 'properties',
    component: () => import('@/views/PropertiesView.vue'),
    meta: { titleKey: 'route.propertiesTitle', subtitleKey: 'route.propertiesSubtitle', groupKey: 'nav.portfolio' },
  },
  {
    path: '/units',
    name: 'units',
    component: () => import('@/views/UnitsView.vue'),
    meta: { titleKey: 'route.unitsTitle', subtitleKey: 'route.unitsSubtitle', groupKey: 'nav.portfolio' },
  },
  {
    path: '/leases',
    name: 'leases',
    component: () => import('@/views/LeasesView.vue'),
    meta: { titleKey: 'route.leasesTitle', subtitleKey: 'route.leasesSubtitle', groupKey: 'nav.portfolio' },
  },
  {
    path: '/tenants',
    name: 'tenants',
    component: () => import('@/views/TenantsView.vue'),
    meta: { titleKey: 'route.tenantsTitle', subtitleKey: 'route.tenantsSubtitle', groupKey: 'nav.portfolio' },
  },
  {
    path: '/rent-charges',
    name: 'rent-charges',
    component: () => import('@/views/RentChargesView.vue'),
    meta: { titleKey: 'route.rentChargesTitle', subtitleKey: 'route.rentChargesSubtitle', groupKey: 'nav.finance' },
  },
  {
    path: '/payments',
    name: 'payments',
    component: () => import('@/views/PaymentsView.vue'),
    meta: { titleKey: 'route.paymentsTitle', subtitleKey: 'route.paymentsSubtitle', groupKey: 'nav.finance' },
  },
  {
    path: '/proposals',
    name: 'proposals',
    component: () => import('@/views/ProposalsView.vue'),
    meta: { titleKey: 'route.proposalsTitle', subtitleKey: 'route.proposalsSubtitle', groupKey: 'nav.finance' },
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    component: () => import('@/views/MaintenanceView.vue'),
    meta: { titleKey: 'route.maintenanceTitle', subtitleKey: 'route.maintenanceSubtitle', groupKey: 'nav.operations' },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: { titleKey: 'route.usersTitle', subtitleKey: 'route.usersSubtitle', groupKey: 'nav.administration' },
  },
  {
    path: '/roles',
    name: 'roles',
    component: () => import('@/views/RolesView.vue'),
    meta: { titleKey: 'route.rolesTitle', subtitleKey: 'route.rolesSubtitle', groupKey: 'nav.administration' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { titleKey: 'route.settingsTitle', subtitleKey: 'route.settingsSubtitle', groupKey: 'nav.administration' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to) => {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (!to.meta.public && !isAuthenticated.value) return { name: 'login' }
  if ((to.name === 'login' || to.name === 'signup') && isAuthenticated.value) return { name: 'dashboard' }
  return true
})

router.afterEach((to) => {
  const title = to.meta.titleKey ? i18n.global.t(to.meta.titleKey) : 'Zoniq'
  document.title = `${title} — Zoniq`
})

export default router
