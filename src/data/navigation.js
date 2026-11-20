import {
  LayoutDashboard,
  Building2,
  Home,
  FileText,
  Users,
  Receipt,
  CreditCard,
  TrendingUp,
  Wrench,
  ShieldCheck,
  Settings,
} from 'lucide-vue-next'

export const navGroups = [
  {
    labelKey: 'nav.overview',
    items: [{ labelKey: 'nav.dashboard', to: '/dashboard', icon: LayoutDashboard }],
  },
  {
    labelKey: 'nav.portfolio',
    items: [
      { labelKey: 'nav.properties', to: '/properties', icon: Building2 },
      { labelKey: 'nav.units', to: '/units', icon: Home },
      { labelKey: 'nav.leases', to: '/leases', icon: FileText },
      { labelKey: 'nav.tenants', to: '/tenants', icon: Users },
    ],
  },
  {
    labelKey: 'nav.finance',
    items: [
      { labelKey: 'nav.rentCharges', to: '/rent-charges', icon: Receipt },
      { labelKey: 'nav.payments', to: '/payments', icon: CreditCard },
      { labelKey: 'nav.proposals', to: '/proposals', icon: TrendingUp },
    ],
  },
  {
    labelKey: 'nav.operations',
    items: [{ labelKey: 'nav.maintenance', to: '/maintenance', icon: Wrench }],
  },
  {
    labelKey: 'nav.administration',
    items: [
      { labelKey: 'nav.users', to: '/users', icon: Users },
      { labelKey: 'nav.roles', to: '/roles', icon: ShieldCheck },
      { labelKey: 'nav.settings', to: '/settings', icon: Settings },
    ],
  },
]
