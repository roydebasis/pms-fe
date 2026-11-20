<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-vue-next'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import { useAppStore } from '@/stores/app'
import { i18n } from '@/i18n'
import { applyTheme, toastStack } from '@/composables/useUi'

const store = useAppStore()
const route = useRoute()
const { t: translate } = useI18n()
const isPublicPage = computed(() => route.meta.public === true)
const mobileOpen = ref(false)

watch(
  () => store.$state,
  (state) => {
    try {
      localStorage.setItem('zoniq-ui-state-v1', JSON.stringify(state))
    } catch (err) {
      console.warn('Could not save Zoniq state:', err)
    }
  },
  { deep: true },
)

watch(
  () => i18n.global.locale.value,
  () => {
    const title = route.meta.titleKey ? translate(route.meta.titleKey) : 'Zoniq'
    document.title = `${title} — Zoniq`
  },
)

onMounted(applyTheme)

const toastIcon = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
}
</script>

<template>
  <div :class="isPublicPage ? 'public-shell' : 'app-shell'">
    <template v-if="!isPublicPage">
      <AppSidebar :mobile-open="mobileOpen" @close="mobileOpen = false" />

      <div class="main-column">
        <AppTopbar @menu="mobileOpen = true" />
        <main class="main-content">
          <RouterView />
        </main>
      </div>
    </template>

    <RouterView v-else />

    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div v-for="toast in toastStack" :key="toast.id" class="toast">
          <span
            class="toast-icon"
            :style="{
              background: `var(--${toast.type === 'error' ? 'danger' : toast.type === 'info' ? 'info' : 'success'}-soft)`,
              color: `var(--${toast.type === 'error' ? 'danger' : toast.type === 'info' ? 'info' : 'success'})`,
            }"
          >
            <component :is="toastIcon[toast.type]" :size="15" />
          </span>
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
