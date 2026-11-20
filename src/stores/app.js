import { defineStore } from 'pinia'
import { i18n } from '@/i18n'
import { createSeedState } from '@/data/seed'
import { todayISO, dateLocale } from '@/utils/format'

const STORAGE_KEY = 'zoniq-ui-state-v1'

function loadState() {
  const fallback = createSeedState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return fallback
    const valid = Object.keys(fallback).every((key) =>
      Array.isArray(fallback[key]) ? Array.isArray(parsed[key]) : parsed[key] !== undefined,
    )
    if (!valid) return fallback
    if (!parsed.organizations.some((org) => org.id === parsed.activeOrganizationId)) return fallback
    return { ...fallback, ...parsed }
  } catch (err) {
    console.warn('Could not restore saved Zoniq state:', err)
    return fallback
  }
}

const nextId = (items) => (items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1)

export const useAppStore = defineStore('app', {
  state: () => loadState(),

  getters: {
    currentOrganization(state) {
      return state.organizations.find((o) => o.id === state.activeOrganizationId) || state.organizations[0]
    },
    organizationsList(state) {
      return state.organizations
    },
    orgUsers(state) {
      return state.users.filter((u) => u.organization_id === state.activeOrganizationId)
    },
    orgProperties(state) {
      return state.properties.filter((p) => p.organization_id === state.activeOrganizationId)
    },
    orgPropertyIds() {
      return this.orgProperties.map((p) => p.id)
    },
    orgUnits() {
      return this.units.filter((u) => this.orgPropertyIds.includes(u.property_id))
    },
    orgUnitIds() {
      return this.orgUnits.map((u) => u.id)
    },
    orgLeases() {
      return this.leases.filter((l) => this.orgUnitIds.includes(l.unit_id))
    },
    orgLeaseIds() {
      return this.orgLeases.map((l) => l.id)
    },
    orgCharges() {
      return this.rent_charges.filter((c) => this.orgLeaseIds.includes(c.lease_id))
    },

    userById: (state) => (id) => state.users.find((u) => u.id === id),
    propertyById: (state) => (id) => state.properties.find((p) => p.id === id),
    unitById: (state) => (id) => state.units.find((u) => u.id === id),
    leaseById: (state) => (id) => state.leases.find((l) => l.id === id),

    unitActiveLease: (state) => (unitId) =>
      state.leases.find((l) => l.unit_id === unitId && l.status === 'active'),

    leaseTenants: (state) => (leaseId) => {
      const ids = state.lease_tenants.filter((lt) => lt.lease_id === leaseId)
      return ids.map((lt) => ({
        ...lt,
        user: state.users.find((u) => u.id === lt.user_id),
      }))
    },
    primaryTenant() {
      return (leaseId) => this.leaseTenants(leaseId).find((lt) => lt.is_primary) || this.leaseTenants(leaseId)[0]
    },

    propertiesWithStats() {
      return this.orgProperties.map((property) => {
        const units = this.orgUnits.filter((u) => u.property_id === property.id)
        const occupied = units.filter((u) => u.status === 'occupied')
        const unitIds = units.map((u) => u.id)
        const leases = this.orgLeases.filter((l) => unitIds.includes(l.unit_id) && l.status === 'active')
        const monthlyRent = leases.reduce((sum, l) => sum + l.monthly_rent, 0)
        return {
          ...property,
          units,
          unitCount: units.length,
          occupiedCount: occupied.length,
          vacantCount: units.filter((u) => u.status === 'vacant').length,
          occupancy: units.length ? Math.round((occupied.length / units.length) * 100) : 0,
          monthlyRent,
        }
      })
    },

    unitsDetailed() {
      return this.orgUnits.map((unit) => {
        const property = this.propertyById(unit.property_id)
        const lease = this.unitActiveLease(unit.id)
        const tenant = lease ? this.primaryTenant(lease.id)?.user : null
        const openRequests = this.maintenance_requests.filter(
          (r) => r.unit_id === unit.id && r.status !== 'completed',
        ).length
        return {
          ...unit,
          property,
          lease,
          tenant,
          openRequests,
        }
      })
    },

    leasesDetailed() {
      return this.orgLeases.map((lease) => {
        const unit = this.unitById(lease.unit_id)
        const tenant = this.primaryTenant(lease.id)?.user
        const revisionCount = this.lease_rent_revisions.filter((r) => r.lease_id === lease.id).length
        return {
          ...lease,
          unit,
          property: unit ? this.propertyById(unit.property_id) : null,
          tenant,
          revisionCount,
          outstanding: this.rent_charges.some(
            (c) => c.lease_id === lease.id && c.status !== 'paid',
          ),
        }
      })
    },

    tenantsDetailed() {
      return this.orgUsers
        .filter((u) => this.lease_tenants.some((lt) => lt.user_id === u.id))
        .map((user) => {
          const links = this.lease_tenants.filter((lt) => lt.user_id === user.id)
          const leases = links.map((lt) => this.leaseById(lt.lease_id)).filter(Boolean)
          const primaryLease = links.find((lt) => lt.is_primary)
          const lease = primaryLease ? this.leaseById(primaryLease.lease_id) : leases[0]
          const unit = lease ? this.unitById(lease.unit_id) : null
          const balance = this.orgCharges
            .filter((c) => leases.some((l) => l.id === c.lease_id) && c.status !== 'paid')
            .reduce((sum, c) => sum + c.amount_due, 0)
          return {
            ...user,
            leases,
            lease,
            unit,
            property: unit ? this.propertyById(unit.property_id) : null,
            isPrimary: Boolean(primaryLease),
            balance,
          }
        })
    },

    chargesDetailed() {
      return this.orgCharges
        .map((charge) => {
          const lease = this.leaseById(charge.lease_id)
          const unit = lease ? this.unitById(lease.unit_id) : null
          const tenant = lease ? this.primaryTenant(lease.id)?.user : null
          const payment = this.payments.find((p) => p.rent_charge_id === charge.id)
          return {
            ...charge,
            lease,
            unit,
            property: unit ? this.propertyById(unit.property_id) : null,
            tenant,
            payment,
          }
        })
        .sort((a, b) => b.due_date.localeCompare(a.due_date))
    },

    paymentsDetailed() {
      const chargeMap = new Map(this.orgCharges.map((c) => [c.id, c]))
      return this.payments
        .filter((p) => chargeMap.has(p.rent_charge_id))
        .map((payment) => {
          const charge = chargeMap.get(payment.rent_charge_id)
          const lease = this.leaseById(charge.lease_id)
          const tenant = lease ? this.primaryTenant(lease.id)?.user : null
          return {
            ...payment,
            charge,
            lease,
            tenant,
            payer: this.userById(payment.paid_by_user_id),
          }
        })
        .sort((a, b) => b.paid_at.localeCompare(a.paid_at))
    },

    maintenanceDetailed() {
      return this.maintenance_requests
        .filter((r) => this.orgUnitIds.includes(r.unit_id))
        .map((request) => {
          const unit = this.unitById(request.unit_id)
          return {
            ...request,
            unit,
            property: unit ? this.propertyById(unit.property_id) : null,
            reporter: this.userById(request.created_by),
            assignee: this.userById(request.assigned_to),
            comments: this.maintenance_request_comments
              .filter((c) => c.maintenance_request_id === request.id)
              .map((c) => ({ ...c, author: this.userById(c.author_id) })),
          }
        })
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
    },

    proposalsDetailed() {
      return this.rent_increment_proposals
        .filter((p) => this.orgLeaseIds.includes(p.lease_id))
        .map((proposal) => {
          const lease = this.leaseById(proposal.lease_id)
          const unit = lease ? this.unitById(lease.unit_id) : null
          return {
            ...proposal,
            lease,
            unit,
            property: unit ? this.propertyById(unit.property_id) : null,
            tenant: lease ? this.primaryTenant(lease.id)?.user : null,
            increasePercent: lease?.monthly_rent
              ? Math.round(((proposal.proposed_rent - lease.monthly_rent) / lease.monthly_rent) * 1000) / 10
              : 0,
          }
        })
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
    },

    rolesDetailed(state) {
      return state.roles
        .filter((r) => r.organization_id === state.activeOrganizationId)
        .map((role) => ({
          ...role,
          permissionIds: state.role_has_permission
            .filter((rp) => rp.role_id === role.id)
            .map((rp) => rp.permission_id),
          memberCount: state.model_has_role.filter(
            (mr) => mr.role_id === role.id && this.orgUsers.some((u) => u.id === mr.model_id),
          ).length,
        }))
    },

    dashboardStats() {
      const properties = this.propertiesWithStats
      const units = this.orgUnits
      const occupied = units.filter((u) => u.status === 'occupied').length
      const occupancy = units.length ? Math.round((occupied / units.length) * 100) : 0

      const currentPeriod = '2026-11-01'
      const currentCharges = this.orgCharges.filter((c) => c.due_date === currentPeriod)
      const billed = currentCharges.reduce((sum, c) => sum + c.amount_due, 0)
      const collected = currentCharges
        .filter((c) => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount_due, 0)
      const outstanding = currentCharges
        .filter((c) => c.status !== 'paid')
        .reduce((sum, c) => sum + c.amount_due, 0)

      const openMaintenance = this.maintenanceDetailed.filter((r) => r.status !== 'completed')
      const highPriority = openMaintenance.filter((r) => r.priority === 'high').length
      const pendingApprovals = this.proposalsDetailed.filter((p) => p.status === 'pending').length
      const activeLeases = this.orgLeases.filter((l) => l.status === 'active').length

      const monthFormatter = new Intl.DateTimeFormat(dateLocale(), { month: 'short', timeZone: 'UTC' })
      const months = Array.from({ length: 6 }, (_, index) =>
        monthFormatter.format(new Date(Date.UTC(2026, 5 + index, 1))),
      )
      const revenue = [68400, 71200, 70500, 73800, 76100, collected + 2200]

      return {
        propertyCount: properties.length,
        unitCount: units.length,
        occupied,
        occupancy,
        billed,
        collected,
        outstanding,
        collectionRate: billed ? Math.round((collected / billed) * 100) : 0,
        openMaintenance: openMaintenance.length,
        highPriority,
        pendingApprovals,
        activeLeases,
        tenantCount: this.tenantsDetailed.length,
        months,
        revenue,
        upcomingIncrements: this.proposalsDetailed
          .filter((p) => p.status === 'pending')
          .slice(0, 4),
        recentPayments: this.paymentsDetailed.slice(0, 5),
        maintenancePreview: openMaintenance
          .slice()
          .sort((a, b) => (a.priority === 'high' ? -1 : 1) - (b.priority === 'high' ? -1 : 1))
          .slice(0, 4),
        properties,
      }
    },

    activityFeed() {
      const items = [
        ...this.paymentsDetailed.slice(0, 4).map((p) => ({
          id: `pay-${p.id}`,
          type: 'payment',
          title: i18n.global.t('activity.paymentReceived', { name: p.tenant?.name || p.payer?.name }),
          meta: `${p.property?.name || ''} · ${p.unit?.unit_number || ''}`,
          amount: p.amount,
          date: p.paid_at,
        })),
        ...this.maintenanceDetailed.slice(0, 3).map((r) => ({
          id: `maint-${r.id}`,
          type: 'maintenance',
          title: r.title,
          meta: `${r.property?.name} · ${i18n.global.t('activity.unit', { number: r.unit?.unit_number })}`,
          date: r.created_at,
        })),
        ...this.proposalsDetailed.slice(0, 3).map((p) => ({
          id: `prop-${p.id}`,
          type: 'proposal',
          title: i18n.global.t('activity.rentProposal', {
            name: p.tenant?.name || i18n.global.t('activity.someTenant'),
          }),
          meta: `${p.property?.name} · ${i18n.global.t('activity.unit', { number: p.unit?.unit_number })}`,
          date: p.created_at,
        })),
      ]
      return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7)
    },
  },

  actions: {
    setOrganization(id) {
      if (this.organizations.some((o) => o.id === id)) this.activeOrganizationId = id
    },

    createWorkspace(name) {
      const organization = {
        id: nextId(this.organizations),
        name: name.trim(),
        subscription_status: 'trialing',
        plan: 'Starter',
        created_at: todayISO(),
      }
      this.organizations.push(organization)

      // Give the new workspace the same system roles and permissions as the
      // first seeded organization so role management works immediately.
      const templates = [
        ['Admin', 'Full access to the organization'],
        ['Property manager', 'Manages properties, units and leases'],
        ['Maintenance', 'Handles maintenance requests'],
        ['Accountant', 'Handles rent charges and payments'],
        ['Viewer', 'Read-only access'],
      ]
      let adminRoleId = null
      templates.forEach(([roleName, description]) => {
        const roleId = nextId(this.roles)
        this.roles.push({ id: roleId, organization_id: organization.id, name: roleName, is_system: true, description })
        if (roleName === 'Admin') adminRoleId = roleId
        const source = this.roles.find((r) => r.organization_id === 1 && r.name === roleName)
        if (source) {
          this.role_has_permission
            .filter((rp) => rp.role_id === source.id)
            .forEach((rp) => this.role_has_permission.push({ role_id: roleId, permission_id: rp.permission_id }))
        }
      })

      // The current user becomes the owner/admin of the new workspace. The
      // ERD models a USER as belonging to one organization, so we add a
      // membership row for them in the new organization.
      const creator = this.userById(1)
      if (creator) {
        const memberId = nextId(this.users)
        this.users.push({
          ...creator,
          id: memberId,
          organization_id: organization.id,
          role: 'admin',
        })
        if (adminRoleId) this.model_has_role.push({ role_id: adminRoleId, model_id: memberId })
      }

      this.activeOrganizationId = organization.id
      return organization
    },

    approveProposal(id) {
      const proposal = this.rent_increment_proposals.find((p) => p.id === id)
      if (!proposal || proposal.status !== 'pending') return
      const rent = proposal.approved_rent || proposal.proposed_rent
      proposal.approved_rent = rent
      proposal.status = 'approved'
      proposal.decided_at = todayISO()
      const lease = this.leaseById(proposal.lease_id)
      if (lease) {
        this.lease_rent_revisions.push({
          id: nextId(this.lease_rent_revisions),
          lease_id: lease.id,
          monthly_rent: lease.monthly_rent,
          effective_from: lease.start_date,
          effective_to: todayISO(),
        })
        lease.monthly_rent = rent
        const charge = this.rent_charges.find(
          (c) => c.lease_id === lease.id && c.status === 'pending',
        )
        if (charge) charge.amount_due = rent
      }
    },

    rejectProposal(id) {
      const proposal = this.rent_increment_proposals.find((p) => p.id === id)
      if (!proposal || proposal.status !== 'pending') return
      proposal.status = 'rejected'
      proposal.decided_at = todayISO()
    },

    recordPayment(chargeId, amount, method = 'Bank transfer') {
      const charge = this.rent_charges.find((c) => c.id === chargeId)
      if (!charge) return
      const lease = this.leaseById(charge.lease_id)
      const tenant = lease ? this.primaryTenant(lease.id) : null
      this.payments.push({
        id: nextId(this.payments),
        rent_charge_id: charge.id,
        paid_by_user_id: tenant?.user_id || 1,
        amount: Number(amount) || charge.amount_due,
        status: 'completed',
        paid_at: todayISO(),
        method,
      })
      charge.status = 'paid'
    },

    updateMaintenanceStatus(id, status) {
      const request = this.maintenance_requests.find((r) => r.id === id)
      if (!request) return
      request.status = status
      if (status === 'in_progress' && !request.assigned_to) request.assigned_to = 3
    },

    addMaintenanceRequest({ unit_id, title, description, priority }) {
      this.maintenance_requests.push({
        id: nextId(this.maintenance_requests),
        unit_id: Number(unit_id),
        title,
        description,
        priority,
        status: 'open',
        created_by: 1,
        created_at: todayISO(),
        assigned_to: null,
      })
    },

    addComment(requestId, body) {
      if (!body?.trim()) return
      this.maintenance_request_comments.push({
        id: nextId(this.maintenance_request_comments),
        maintenance_request_id: requestId,
        author_id: 1,
        body: body.trim(),
        created_at: todayISO(),
      })
    },

    createProperty({ name, city, address, type }) {
      this.properties.push({
        id: nextId(this.properties),
        organization_id: this.activeOrganizationId,
        name,
        city,
        address,
        type: type || 'Apartment',
        acquired_at: todayISO(),
      })
    },

    createUnit({ property_id, unit_number, base_rent, bedrooms, bathrooms, sqft }) {
      this.units.push({
        id: nextId(this.units),
        property_id: Number(property_id),
        unit_number,
        base_rent: Number(base_rent),
        bedrooms: Number(bedrooms) || 1,
        bathrooms: Number(bathrooms) || 1,
        sqft: Number(sqft) || 0,
        status: 'vacant',
      })
    },

    createUser({ name, email, role }) {
      this.users.push({
        id: nextId(this.users),
        organization_id: this.activeOrganizationId,
        name,
        email,
        phone: '',
        is_platform_admin: false,
        role: role || 'viewer',
        status: 'active',
        avatar_color: '#6366f1',
      })
    },

    updateUserStatus(id, status) {
      const user = this.users.find((u) => u.id === id)
      if (user) user.status = status
    },

    toggleRolePermission(roleId, permissionId) {
      const index = this.role_has_permission.findIndex(
        (rp) => rp.role_id === roleId && rp.permission_id === permissionId,
      )
      if (index >= 0) this.role_has_permission.splice(index, 1)
      else this.role_has_permission.push({ role_id: roleId, permission_id: permissionId })
    },

    createToken(name) {
      this.personal_access_tokens.push({
        id: nextId(this.personal_access_tokens),
        tokenable_id: 1,
        name,
        token: `zq_live_•••••••••••••${Math.random().toString(16).slice(2, 6)}`,
        created_at: todayISO(),
        last_used_at: null,
      })
    },

    revokeToken(id) {
      this.personal_access_tokens = this.personal_access_tokens.filter((t) => t.id !== id)
    },

    resetDemoData() {
      this.$state = createSeedState()
    },
  },
})
