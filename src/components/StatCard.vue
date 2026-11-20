<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: [String, Number],
  icon: [Object, Function],
  tone: { type: String, default: 'primary' },
  delta: String,
  deltaTone: { type: String, default: 'success' },
  hint: String,
  sparkline: { type: Array, default: () => [] },
  compact: Boolean,
})

const points = computed(() => {
  const data = props.sparkline
  if (data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  return data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 30 - ((value - min) / range) * 24 - 3
      return `${x},${y}`
    })
    .join(' ')
})
</script>

<template>
  <div class="card stat-card" :class="{ 'stat-compact': compact }">
    <template v-if="compact">
      <span class="stat-icon" :class="`tone-${tone}`"><component :is="icon" :size="16" /></span>
      <span class="stat-label">{{ label }}</span>
      <strong class="compact-value">{{ value }}</strong>
    </template>
    <template v-else>
      <div class="row justify-between">
        <span class="stat-label">{{ label }}</span>
        <span class="stat-icon" :class="`tone-${tone}`"><component :is="icon" :size="17" /></span>
      </div>
      <div class="stat-value">{{ value }}</div>
      <div class="row gap-8 stat-bottom">
        <span v-if="delta" class="stat-delta" :class="`delta-${deltaTone}`">{{ delta }}</span>
        <span v-if="hint" class="subtle" style="font-size: 11.5px">{{ hint }}</span>
      </div>
      <svg v-if="points" class="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
        <polyline :points="points" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </template>
  </div>
</template>

<style scoped>
.stat-card {
  position: relative;
  padding: 18px 20px 16px;
  overflow: hidden;
}
.stat-label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
.stat-icon {
  width: 33px; height: 33px; border-radius: 9px;
  display: grid; place-items: center; flex: none;
}
.tone-primary { background: var(--primary-soft); color: var(--primary-text); }
.tone-success { background: var(--success-soft); color: var(--success); }
.tone-warning { background: var(--warning-soft); color: var(--warning); }
.tone-danger { background: var(--danger-soft); color: var(--danger); }
.tone-info { background: var(--info-soft); color: var(--info); }
.tone-violet { background: var(--violet-soft); color: var(--violet); }
.stat-value { margin-top: 10px; }
.stat-bottom { margin-top: 5px; }
.stat-delta { font-size: 11.5px; font-weight: 700; }
.delta-success { color: var(--success); }
.delta-danger { color: var(--danger); }
.delta-info { color: var(--info); }
.stat-compact { display: flex; align-items: center; gap: 9px; padding: 13px 16px; }
.stat-compact .stat-icon { width: 28px; height: 28px; border-radius: 8px; }
.compact-value { margin-left: auto; font-size: 16px; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.sparkline {
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 96px;
  height: 42px;
  opacity: 0.28;
  color: var(--primary);
  pointer-events: none;
}
</style>
