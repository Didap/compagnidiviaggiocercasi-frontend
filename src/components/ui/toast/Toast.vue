<script setup lang="ts">

import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import type { Toast } from '@/composables/useToast'

const props = defineProps<{
    toast: Toast
}>()

const emit = defineEmits(['close'])

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
}

const styles = {
    success: 'bg-white border-l-4 border-emerald-500 shadow-lg shadow-emerald-500/10',
    error: 'bg-white border-l-4 border-red-500 shadow-lg shadow-red-500/10',
    info: 'bg-white border-l-4 border-blue-500 shadow-lg shadow-blue-500/10',
    warning: 'bg-white border-l-4 border-amber-500 shadow-lg shadow-amber-500/10'
}

const iconColors = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    warning: 'text-amber-500'
}
</script>

<template>
    <div :class="[
        'w-full max-w-sm rounded-xl p-4 flex items-start gap-4 pointer-events-auto transition-all duration-300 relative overflow-hidden',
        styles[toast.type || 'info']
    ]" role="alert">

        <!-- Icon -->
        <div :class="['flex-shrink-0 mt-0.5', iconColors[toast.type || 'info']]">
            <component :is="icons[toast.type || 'info']" class="w-5 h-5" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
            <h4 v-if="toast.title" class="text-sm font-bold text-slate-900 mb-0.5 leading-tight">
                {{ toast.title }}
            </h4>
            <p :class="['text-sm text-slate-600 leading-snug', { 'font-medium': !toast.title }]">
                {{ toast.message }}
            </p>
        </div>

        <!-- Close Button -->
        <button @click="$emit('close')"
            class="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors -mt-1 -mr-1">
            <X class="w-4 h-4" />
        </button>
    </div>
</template>
