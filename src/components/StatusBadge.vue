<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { titleCase } from '@/utils/format'

const { t } = useI18n()

const props = defineProps({
  status: { type: String, default: '' },
  dot: { type: Boolean, default: true },
})

const tones = {
  active: 'success', occupied: 'success', paid: 'success', completed: 'success',
  approved: 'success', available: 'success',
  vacant: 'info', in_progress: 'info', open: 'warning', pending: 'warning',
  trialing: 'warning', draft: 'neutral',
  overdue: 'danger', rejected: 'danger', maintenance: 'danger', suspended: 'danger',
  cancelled: 'neutral', expired: 'neutral', inactive: 'neutral',
}

const tone = computed(() => tones[props.status] || 'neutral')
const label = computed(() => {
  const key = `status.${props.status}`
  const translated = t(key)
  return translated === key ? titleCase(props.status) : translated
})
</script>

<template>
  <span class="badge" :class="`badge-${tone}`">
    <span v-if="dot" class="dot"></span>
    {{ label }}
  </span>
</template>
