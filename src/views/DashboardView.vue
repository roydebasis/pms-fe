<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Building2, Home, Wallet, Wrench, ArrowUpRight, ArrowDownRight, Check, X,
  CalendarClock, Clock, Receipt, TrendingUp, CircleDollarSign, AlertTriangle,
} from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import StatCard from '@/components/StatCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { currency, compactCurrency, relativeDate, formatShortDate, formatTodayLong, initials } from '@/utils/format'
import { notify } from '@/composables/useUi'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const store = useAppStore()
const stats = computed(() => store.dashboardStats)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return t('dashboard.greetingMorning')
  if (hour < 18) return t('dashboard.greetingAfternoon')
  return t('dashboard.greetingEvening')
})
const today = computed(() => formatTodayLong())

const maxRevenue = computed(() => Math.max(...stats.value.revenue) * 1.1)
const activityIcons = { payment: CircleDollarSign, maintenance: Wrench, proposal: TrendingUp }
const activityTones = { payment: 'success', maintenance: 'warning', proposal: 'info' }

function approve(id) {
  store.approveProposal(id)
  notify(t('dashboard.proposalApproved'))
}
function reject(id) {
  store.rejectProposal(id)
  notify(t('dashboard.proposalRejected'), 'error')
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <p class="eyebrow" style="margin-bottom: 6px">{{ today }}</p>
        <h1 class="page-title">{{ greeting }}, Alex 👋</h1>
        <p class="page-subtitle">{{ t('dashboard.subtitle', { name: store.currentOrganization.name }) }}</p>
      </div>
      <div class="row gap-8">
        <button class="btn" @click="router.push('/maintenance')"><Wrench :size="16" /> {{ t('dashboard.maintenance') }}</button>
        <button class="btn btn-primary" @click="router.push('/proposals')"><TrendingUp :size="16" /> {{ t('dashboard.reviewProposals') }}</button>
      </div>
    </div>

    <div class="grid grid-4" style="margin-bottom: 18px">
      <StatCard
        :label="t('dashboard.statProperties')"
        :value="stats.propertyCount"
        :icon="Building2"
        tone="primary"
        :delta="t('dashboard.statPropertiesDelta')"
        :hint="t('dashboard.totalUnits', { count: stats.unitCount })"
        :sparkline="[3, 3, 4, 4, 4, stats.propertyCount]"
      />
      <StatCard
        :label="t('dashboard.statOccupancy')"
        :value="`${stats.occupancy}%`"
        :icon="Home"
        tone="success"
        :delta="t('dashboard.statOccupancyDelta')"
        delta-tone="success"
        :hint="t('dashboard.occupiedOf', { occupied: stats.occupied, total: stats.unitCount })"
        :sparkline="[72, 74, 75, 73, 77, stats.occupancy]"
      />
      <StatCard
        :label="t('dashboard.statCollected')"
        :value="compactCurrency(stats.collected)"
        :icon="Wallet"
        tone="violet"
        :delta="t('dashboard.percentOfBilled', { percent: stats.collectionRate })"
        delta-tone="info"
        :hint="t('dashboard.outstanding', { amount: currency(stats.outstanding) })"
        :sparkline="stats.revenue"
      />
      <StatCard
        :label="t('dashboard.statOpenRequests')"
        :value="stats.openMaintenance"
        :icon="Wrench"
        tone="warning"
        :delta="t('dashboard.highPriority', { count: stats.highPriority })"
        :delta-tone="stats.highPriority ? 'danger' : 'success'"
        :hint="t('dashboard.needsAttention')"
        :sparkline="[3, 5, 4, 6, 5, stats.openMaintenance]"
      />
    </div>

    <div class="dash-grid" style="margin-bottom: 18px">
      <section class="card card-pad">
        <div class="row justify-between" style="margin-bottom: 18px">
          <div>
            <h2 class="section-title">{{ t('dashboard.revenueCollected') }}</h2>
            <p class="muted" style="font-size: 12px; margin-top: 2px">{{ t('dashboard.revenueSubtitle') }}</p>
          </div>
          <div class="row gap-16">
            <div class="legend"><span class="legend-dot primary"></span> {{ t('dashboard.collected') }}</div>
            <strong style="font-size: 18px; letter-spacing: -0.03em">{{ compactCurrency(stats.collected) }}</strong>
          </div>
        </div>
        <div class="chart">
          <div class="chart-grid"></div>
          <div v-for="(value, index) in stats.revenue" :key="index" class="chart-col">
            <div class="chart-bar-wrap">
              <div
                class="chart-bar"
                :class="{ 'chart-bar-current': index === stats.revenue.length - 1 }"
                :style="{ height: `${Math.max(8, (value / maxRevenue) * 100)}%` }"
                :title="currency(value)"
              >
                <span class="chart-tooltip">{{ currency(value) }}</span>
              </div>
            </div>
            <span class="chart-label" :class="{ 'chart-label-current': index === stats.revenue.length - 1 }">
              {{ stats.months[index] }}
            </span>
          </div>
        </div>
      </section>

      <section class="card card-pad">
        <div class="row justify-between" style="margin-bottom: 16px">
          <h2 class="section-title">{{ t('dashboard.occupancyByProperty') }}</h2>
          <button class="link-button" @click="router.push('/properties')">{{ t('common.viewAll') }} <ArrowUpRight :size="13" /></button>
        </div>
        <div class="occupancy-list">
          <button
            v-for="property in stats.properties"
            :key="property.id"
            class="occupancy-item"
            @click="router.push({ path: '/properties', query: { q: property.name } })"
          >
            <div class="row justify-between" style="margin-bottom: 7px">
              <div class="col" style="text-align: left; min-width: 0">
                <strong>{{ property.name }}</strong>
                <small class="subtle">{{ property.city }}</small>
              </div>
              <strong style="font-size: 13px">{{ property.occupancy }}%</strong>
            </div>
            <div class="progress"><span :style="{ width: `${property.occupancy}%` }"></span></div>
            <div class="row justify-between" style="margin-top: 5px">
              <small class="subtle">{{ t('dashboard.unitsOccupiedOf', { occupied: property.occupiedCount, total: property.unitCount }) }}</small>
              <small class="muted">{{ t('dashboard.perMonth', { amount: currency(property.monthlyRent) }) }}</small>
            </div>
          </button>
        </div>
      </section>
    </div>

    <div class="dash-grid" style="margin-bottom: 18px">
      <section class="card">
        <div class="row justify-between" style="padding: 16px 20px; border-bottom: 1px solid var(--border)">
          <div>
            <h2 class="section-title">{{ t('dashboard.recentPayments') }}</h2>
            <p class="muted" style="font-size: 12px; margin-top: 2px">{{ t('dashboard.latestRentReceived') }}</p>
          </div>
          <button class="link-button" @click="router.push('/payments')">{{ t('dashboard.allPayments') }} <ArrowUpRight :size="13" /></button>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>{{ t('dashboard.resident') }}</th><th>{{ t('dashboard.property') }}</th><th class="num">{{ t('common.amount') }}</th><th>{{ t('common.date') }}</th><th>{{ t('common.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in stats.recentPayments" :key="payment.id">
                <td>
                  <div class="row gap-8">
                    <span class="avatar avatar-sm" :style="{ background: payment.tenant?.avatar_color || 'var(--avatar-fallback)' }">
                      {{ initials(payment.tenant?.name || payment.payer?.name || '?') }}
                    </span>
                    <strong style="font-weight: 600">{{ payment.tenant?.name || payment.payer?.name }}</strong>
                  </div>
                </td>
                <td class="muted">{{ payment.property?.name }} · {{ payment.unit?.unit_number }}</td>
                <td class="num"><strong>{{ currency(payment.amount) }}</strong></td>
                <td class="muted">{{ formatShortDate(payment.paid_at) }}</td>
                <td><StatusBadge :status="payment.status" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <div class="row justify-between" style="padding: 16px 20px; border-bottom: 1px solid var(--border)">
          <div>
            <h2 class="section-title">{{ t('dashboard.needsApproval') }}</h2>
            <p class="muted" style="font-size: 12px; margin-top: 2px">{{ t('dashboard.pendingProposals', { count: stats.pendingApprovals }) }}</p>
          </div>
          <span class="badge badge-warning"><span class="dot"></span>{{ t('dashboard.pending', { count: stats.pendingApprovals }) }}</span>
        </div>
        <div class="proposal-list">
          <div v-for="proposal in stats.upcomingIncrements" :key="proposal.id" class="proposal-item">
            <div class="row gap-10">
              <span class="proposal-icon"><TrendingUp :size="16" /></span>
              <div class="col" style="min-width: 0; flex: 1">
                <strong>{{ proposal.tenant?.name || t('dashboard.tenant') }}</strong>
                <small class="subtle">{{ proposal.property?.name }} · {{ t('dashboard.unitLabel', { number: proposal.unit?.unit_number }) }}</small>
              </div>
              <div class="col" style="text-align: right">
                <strong style="color: var(--primary-text)">+{{ proposal.increasePercent }}%</strong>
                <small class="subtle">{{ t('dashboard.perMonth', { amount: currency(proposal.proposed_rent) }) }}</small>
              </div>
            </div>
            <div class="row gap-6 proposal-actions">
              <button class="btn btn-sm btn-primary" @click="approve(proposal.id)"><Check :size="13" /> {{ t('dashboard.approve') }}</button>
              <button class="btn btn-sm" @click="reject(proposal.id)"><X :size="13" /> {{ t('dashboard.decline') }}</button>
            </div>
          </div>
          <div v-if="!stats.upcomingIncrements.length" class="empty-state" style="padding: 30px">
            <Check :size="20" /> {{ t('dashboard.allCaughtUp') }}
          </div>
        </div>
      </section>
    </div>

    <div class="dash-grid">
      <section class="card card-pad">
        <div class="row justify-between" style="margin-bottom: 8px">
          <h2 class="section-title">{{ t('dashboard.activityFeed') }}</h2>
          <Clock :size="16" class="subtle" />
        </div>
        <div class="timeline">
          <div v-for="item in store.activityFeed" :key="item.id" class="timeline-item">
            <span class="timeline-icon" :class="`tone-${activityTones[item.type]}`">
              <component :is="activityIcons[item.type]" :size="14" />
            </span>
            <div class="col" style="flex: 1; min-width: 0">
              <strong>{{ item.title }}</strong>
              <small class="subtle">{{ item.meta }}</small>
            </div>
            <div class="col" style="text-align: right">
              <strong v-if="item.amount" style="font-size: 12.5px">{{ currency(item.amount) }}</strong>
              <small class="subtle">{{ relativeDate(item.date) }}</small>
            </div>
          </div>
        </div>
      </section>

      <section class="card card-pad">
        <div class="row justify-between" style="margin-bottom: 12px">
          <h2 class="section-title">{{ t('dashboard.maintenanceWatchlist') }}</h2>
          <button class="link-button" @click="router.push('/maintenance')">{{ t('dashboard.openBoard') }} <ArrowUpRight :size="13" /></button>
        </div>
        <div class="watchlist">
          <button
            v-for="request in stats.maintenancePreview"
            :key="request.id"
            class="watch-item"
            @click="router.push({ path: '/maintenance', query: { q: request.title } })"
          >
            <span class="watch-icon" :class="request.priority === 'high' ? 'high' : request.priority === 'medium' ? 'medium' : 'low'">
              <AlertTriangle v-if="request.priority === 'high'" :size="15" />
              <Wrench v-else :size="15" />
            </span>
            <div class="col" style="flex: 1; min-width: 0; text-align: left">
              <strong>{{ request.title }}</strong>
              <small class="subtle">{{ request.property?.name }} · {{ t('dashboard.unitLabel', { number: request.unit?.unit_number }) }} · {{ relativeDate(request.created_at) }}</small>
            </div>
            <StatusBadge :status="request.status" />
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dash-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr);
  gap: 18px;
}
@media (max-width: 1100px) { .dash-grid { grid-template-columns: 1fr; } }

.link-button {
  display: inline-flex; align-items: center; gap: 4px;
  border: 0; background: transparent; color: var(--primary-text);
  font-size: 12px; font-weight: 650;
}
.link-button:hover { text-decoration: underline; }
.legend { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--text-muted); }
.legend-dot { width: 8px; height: 8px; border-radius: 3px; }
.legend-dot.primary { background: var(--primary); }

.chart {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 200px;
  padding-top: 10px;
}
.chart-grid {
  position: absolute;
  inset: 10px 0 26px;
  background: repeating-linear-gradient(to bottom, transparent 0, transparent 48px, var(--border) 49px);
  opacity: 0.7;
}
.chart-col { position: relative; flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; }
.chart-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
.chart-bar {
  position: relative;
  width: min(46px, 70%);
  border-radius: 7px 7px 3px 3px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--primary) 55%, white), var(--primary));
  transition: height 0.4s ease, filter 0.16s;
  cursor: default;
}
.chart-bar:hover { filter: brightness(1.08); }
.chart-bar-current { background: linear-gradient(180deg, var(--violet), var(--primary)); box-shadow: 0 5px 14px var(--primary-glow); }
.chart-tooltip {
  position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
  background: var(--text); color: var(--surface); padding: 3px 7px; border-radius: 5px;
  font-size: 10px; white-space: nowrap; opacity: 0; transition: opacity 0.15s;
}
.chart-bar:hover .chart-tooltip { opacity: 1; }
.chart-label { font-size: 11px; color: var(--text-subtle); margin-top: 8px; }
.chart-label-current { color: var(--primary-text); font-weight: 700; }

.occupancy-list { display: flex; flex-direction: column; max-height: 260px; overflow: auto; }
.occupancy-item { border: 0; background: transparent; padding: 9px 6px; border-radius: 8px; }
.occupancy-item:hover { background: var(--surface-2); }
.occupancy-item strong { font-size: 12.5px; }
.occupancy-item small { font-size: 11px; }
.occupancy-item .progress span { background: linear-gradient(90deg, var(--primary), var(--violet)); }

.proposal-list { padding: 6px 10px 10px; }
.proposal-item { padding: 12px 10px; border-bottom: 1px solid var(--border); }
.proposal-item:last-child { border-bottom: 0; }
.proposal-item strong { font-size: 12.5px; }
.proposal-item small { font-size: 11px; }
.proposal-icon { width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-text); flex: none; }
.proposal-actions { margin-top: 10px; }

.timeline { display: flex; flex-direction: column; }
.timeline-item { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--border); }
.timeline-item:last-child { border-bottom: 0; }
.timeline-item strong { font-size: 12.5px; font-weight: 600; }
.timeline-item small { font-size: 11px; }
.timeline-icon { width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; flex: none; }
.tone-success { background: var(--success-soft); color: var(--success); }
.tone-warning { background: var(--warning-soft); color: var(--warning); }
.tone-info { background: var(--info-soft); color: var(--info); }

.watchlist { display: flex; flex-direction: column; }
.watch-item {
  display: flex; align-items: center; gap: 11px;
  width: 100%; padding: 10px 8px; border: 0; border-radius: 8px;
  background: transparent; text-align: left;
}
.watch-item:hover { background: var(--surface-2); }
.watch-item strong { font-size: 12.5px; }
.watch-item small { font-size: 11px; }
.watch-icon { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center; flex: none; }
.watch-icon.high { background: var(--danger-soft); color: var(--danger); }
.watch-icon.medium { background: var(--warning-soft); color: var(--warning); }
.watch-icon.low { background: var(--info-soft); color: var(--info); }
</style>
