<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { X } from 'lucide-vue-next'

const { t } = useI18n()
import { lockBody, unlockBody } from '@/composables/useUi'

const props = defineProps({
  open: Boolean,
  eyebrow: String,
  title: String,
  subtitle: String,
  fields: { type: Array, default: () => [] },
})
const emit = defineEmits(['close'])

function onKey(event) {
  if (event.key === 'Escape' && props.open) emit('close')
}
watch(
  () => props.open,
  (value) => {
    if (value) {
      lockBody()
      document.addEventListener('keydown', onKey)
    } else {
      unlockBody()
      document.removeEventListener('keydown', onKey)
    }
  },
)
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  if (props.open) unlockBody()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="drawer-overlay" @click.self="emit('close')">
      <aside class="drawer" role="dialog" aria-modal="true" :aria-label="title">
        <div class="drawer-header">
          <div class="row justify-between">
            <div>
              <div v-if="eyebrow" class="eyebrow" style="margin-bottom: 6px">{{ eyebrow }}</div>
              <h3 class="section-title" style="font-size: 18px">{{ title }}</h3>
              <p v-if="subtitle" class="muted" style="font-size: 12.5px; margin-top: 3px">{{ subtitle }}</p>
            </div>
            <button class="btn btn-ghost btn-icon btn-sm" :aria-label="t('common.close')" @click="emit('close')"><X :size="18" /></button>
          </div>
        </div>
        <div class="drawer-body">
          <slot>
            <div v-if="fields.length" class="detail-list">
              <div v-for="field in fields" :key="field.label" class="detail-row">
                <span class="detail-key">{{ field.label }}</span>
                <span class="detail-val" :style="field.tone ? { color: `var(--${field.tone})` } : null">
                  {{ field.value }}
                </span>
              </div>
            </div>
          </slot>
        </div>
        <div v-if="$slots.footer" class="drawer-footer"><slot name="footer" /></div>
      </aside>
    </div>
  </Teleport>
</template>
