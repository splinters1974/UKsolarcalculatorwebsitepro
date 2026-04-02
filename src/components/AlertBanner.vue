<template>
  <div
    v-if="messages.length"
    class="rounded-lg border p-4 space-y-1.5"
    :class="variantClasses"
  >
    <div v-for="(msg, i) in messages" :key="i" class="flex items-start gap-2 text-sm">
      <span class="flex-shrink-0 mt-0.5">{{ icon }}</span>
      <span>{{ msg }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  variant:  { type: String, default: 'warning' } // 'warning' | 'error' | 'info'
})

const variantClasses = computed(() => ({
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800'
}[props.variant]))

const icon = computed(() => ({
  warning: '⚠️',
  error:   '❌',
  info:    'ℹ️'
}[props.variant]))
</script>
