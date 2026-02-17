<script setup lang="ts">
import { X, AlertTriangle } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'

defineProps<{
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'primary'
}>()

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
    <Teleport to="body">
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

                <!-- Modal -->
                <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                    <!-- Icon Header -->
                    <div class="p-6 flex flex-col items-center text-center pb-2">
                        <div v-if="variant === 'danger'" class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <AlertTriangle class="w-6 h-6 text-red-600" />
                        </div>
                        <h3 class="text-xl font-black text-slate-900">{{ title }}</h3>
                        <p class="text-slate-500 mt-2 text-sm leading-relaxed">{{ message }}</p>
                    </div>

                    <!-- Actions -->
                    <div class="p-6 pt-4 flex gap-3">
                        <Button @click="$emit('close')" variant="outline" class="flex-1 rounded-xl h-11 font-bold border-slate-200">
                            {{ cancelText || 'Annulla' }}
                        </Button>
                        <Button @click="$emit('confirm')" 
                            :class="[
                                'flex-1 rounded-xl h-11 font-bold shadow-lg transition-all',
                                variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-primary hover:bg-primary/90 shadow-primary/30'
                            ]">
                            {{ confirmText || 'Conferma' }}
                        </Button>
                    </div>

                    <!-- Close X -->
                    <button @click="$emit('close')" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <X class="w-5 h-5" />
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
