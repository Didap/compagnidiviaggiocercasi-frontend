<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Star, Loader2 } from 'lucide-vue-next'
import { useReviews } from '@/composables/useReviews'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{
    isOpen: boolean
    booking: any
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'submitted'): void
}>()

// Composables
const { createReview, loading } = useReviews()
const { user } = useAuth()

// State
const rating = ref<number>(0)
const content = ref<string>('')
const hoverRating = ref<number>(0)

// Computeds
const trip = computed(() => {
    if (!props.booking) return null
    const b = props.booking.attributes || props.booking
    const offer = b.offer?.data?.attributes || b.offer?.data || b.offer?.attributes || b.offer
    return offer?.trip?.data?.attributes || offer?.trip?.data || offer?.trip?.attributes || offer?.trip
})

// Actions
    const submitReview = async () => {
        if (!trip.value || !user.value) return

        console.log('ReviewDialog Submit. Trip:', trip.value)
        console.log('ReviewDialog Submit. ID to send:', trip.value.id || trip.value.documentId)

        const authorName = `${user.value.firstName} ${user.value.lastName}`.trim() || user.value.username

        const success = await createReview(
            trip.value.id || trip.value.documentId, 
            rating.value,
            content.value,
            authorName
        )

    if (success) {
        emit('submitted')
        close()
    }
}

const close = () => {
    emit('close')
    // Reset form after delay
    setTimeout(() => {
        rating.value = 0
        content.value = ''
        hoverRating.value = 0
    }, 300)
}

</script>

<template>
    <Teleport to="body">
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isOpen && booking" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="close"></div>

                <!-- Modal Window -->
                <div class="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100">
                    
                    <!-- Header -->
                    <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h2 class="text-xl font-bold text-slate-900">Lascia una Recensione</h2>
                        <button @click="close" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="p-8 space-y-6">
                        <!-- Trip Info -->
                        <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                                🌍
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Viaggio</p>
                                <h3 class="font-bold text-slate-900 leading-tight">{{ trip?.title }}</h3>
                            </div>
                        </div>

                        <!-- Rating -->
                        <div class="space-y-2 text-center">
                            <p class="text-sm font-bold text-slate-600 mb-2">Come valuti questa esperienza?</p>
                            <div class="flex items-center justify-center gap-2">
                                <button v-for="star in 5" :key="star" 
                                        @mouseenter="hoverRating = star"
                                        @mouseleave="hoverRating = 0"
                                        @click="rating = star"
                                        class="transition-transform hover:scale-110 focus:outline-none p-1">
                                    <Star 
                                        class="w-8 h-8 transition-colors"
                                        :class="(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'"
                                        stroke-width="2"
                                    />
                                </button>
                            </div>
                            <p class="text-sm text-slate-400 h-5 font-medium transition-all">
                                <span v-if="rating === 1">Pessima</span>
                                <span v-else-if="rating === 2">Mediocre</span>
                                <span v-else-if="rating === 3">Buona</span>
                                <span v-else-if="rating === 4">Ottima</span>
                                <span v-else-if="rating === 5">Indimenticabile!</span>
                            </p>
                        </div>

                        <!-- Comment -->
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-slate-700">La tua opinione</label>
                            <textarea 
                                v-model="content"
                                rows="4"
                                class="w-full p-4 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                placeholder="Raccontaci cosa ti è piaciuto di più..."
                            ></textarea>
                            <p class="text-xs text-slate-400 text-right">
                                {{ content.length }} caratteri
                            </p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                        <button @click="close" class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                            Annulla
                        </button>
                        <button 
                            @click="submitReview" 
                            :disabled="loading || rating === 0"
                            class="px-8 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
                            <span v-else>Invia Recensione</span>
                        </button>
                    </div>

                </div>
            </div>
        </Transition>
    </Teleport>
</template>
