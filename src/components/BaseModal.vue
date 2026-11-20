<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { X } from 'lucide-vue-next'

const { t } = useI18n()
import { lockBody, unlockBody } from '@/composables/useUi'

const props = defineProps({
  open: Boolean,
  title: String,
  subtitle: String,
  wide: Boolean,
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
    <div v-if="open" class="overlay" @click.self="emit('close')">
      <div class="modal" :class="{ 'modal-wide': wide }" role="dialog" aria-modal="true" :aria-label="title">
        <div class="modal-header">
          <div>
            <h3 class="section-title" style="font-size: 16px">{{ title }}</h3>
            <p v-if="subtitle" class="muted" style="font-size: 12.5px; margin-top: 3px">{{ subtitle }}</p>
          </div>
          <button class="btn btn-ghost btn-icon btn-sm" :aria-label="t('common.close')" @click="emit('close')"><X :size="17" /></button>
        </div>
        <div class="modal-body"><slot /></div>
        <div v-if="$slots.footer" class="modal-footer"><slot name="footer" /></div>
      </div>
    </div>
  </Teleport>
</template>
