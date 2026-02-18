<script setup lang="ts">
import { X, Calendar, MapPin, Check, XCircle, Clock, Users, CreditCard } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
    isOpen: boolean
    booking: any
}>()

const emit = defineEmits(['close'])

const trip = computed(() => {
    if (!props.booking) return null
    const b = props.booking.attributes || props.booking
    const offer = b.offer?.data?.attributes || b.offer?.data || b.offer?.attributes || b.offer
    return offer?.trip?.data?.attributes || offer?.trip?.data || offer?.trip?.attributes || offer?.trip
})

const offer = computed(() => {
    if (!props.booking) return null
    const b = props.booking.attributes || props.booking
    return b.offer?.data?.attributes || b.offer?.data || b.offer?.attributes || b.offer
})

const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

// Helper to get image URL (same as ProfileView)
const getImageUrl = (img: any) => {
    if (!img) return ''
    const firstImage = Array.isArray(img) ? img[0] : img
    const url = firstImage?.url || firstImage?.attributes?.url || firstImage?.data?.attributes?.url || firstImage?.data?.url
    return url ? `${import.meta.env.VITE_API_URL}${url}` : ''
}

const coverImage = computed(() => {
    if (!trip.value) return ''
    return getImageUrl(trip.value.image)
})

// Scroll Lock
import { watch, onUnmounted } from 'vue'

watch(() => props.isOpen, (val) => {
    if (val) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
    }
})

onUnmounted(() => {
    document.body.style.overflow = ''
})

</script>

<template>
    <Teleport to="body">
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isOpen && booking" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>

                <!-- Modal Window -->
                <div class="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100">
                    
                    <!-- Close Button -->
                    <button @click="$emit('close')" class="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md">
                        <X class="w-6 h-6" />
                    </button>

                    <!-- Header Image -->
                    <div class="h-48 sm:h-64 bg-slate-200 flex-shrink-0 relative">
                        <img v-if="coverImage" :src="coverImage" :alt="trip?.title" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                            <span class="text-4xl">🌍</span>
                        </div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div class="absolute bottom-0 left-0 p-6 text-white w-full">
                            <div class="flex items-center gap-2 text-sm font-medium mb-2 text-white/90">
                                <MapPin class="w-4 h-4" />
                                {{ trip?.destination || 'Destinazione' }}
                            </div>
                            <h2 class="text-2xl sm:text-3xl font-bold leading-tight">{{ trip?.title }}</h2>
                        </div>
                    </div>

                    <!-- Scrollable Content -->
                    <div class="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
                        <div class="p-6 sm:p-8 space-y-8">
                            
                            <!-- Key Info Grid -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Calendar class="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Partenza</p>
                                        <p class="font-bold text-slate-900">{{ formatDate(offer?.startDate) }}</p>
                                    </div>
                                </div>
                                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Calendar class="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Ritorno</p>
                                        <p class="font-bold text-slate-900">{{ formatDate(offer?.endDate) }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Booking & Financial Info -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <!-- Participants -->
                                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Users class="w-5 h-5 text-primary" />
                                        Partecipanti ({{ booking.participants?.length || 0 }})
                                    </h3>
                                    <div v-if="booking.participants?.length" class="space-y-3">
                                        <div v-for="(p, idx) in booking.participants" :key="idx" 
                                             class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 text-xs font-bold shadow-sm border border-slate-200">
                                                {{ p.firstName?.charAt(0) }}{{ p.lastName?.charAt(0) }}
                                            </div>
                                            <div>
                                                <p class="font-bold text-slate-800 text-sm">{{ p.firstName }} {{ p.lastName }}</p>
                                                <p class="text-xs text-slate-500" v-if="p.birthDate">Nato/a il {{ formatDate(p.birthDate) }}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p v-else class="text-slate-500 text-sm italic">Nessun partecipante registrato.</p>
                                </div>

                                <!-- Financials -->
                                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <CreditCard class="w-5 h-5 text-primary" />
                                        Riepilogo Costi
                                    </h3>
                                    <div class="space-y-4">
                                        <div class="flex justify-between items-center pb-3 border-b border-slate-50">
                                            <span class="text-slate-600 text-sm">Stato Prenotazione</span>
                                            <span class="px-3 py-1 rounded-full text-xs font-bold capitalize"
                                                  :class="{
                                                    'bg-green-100 text-green-700': booking.status === 'confirmed',
                                                    'bg-amber-100 text-amber-700': booking.status === 'pending',
                                                    'bg-red-100 text-red-700': booking.status === 'cancelled'
                                                  }">
                                                {{ booking.status === 'confirmed' ? 'Confermata' : (booking.status === 'cancelled' ? 'Cancellata' : 'In attesa') }}
                                            </span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <span class="text-slate-600 text-sm">Acconto Versato</span>
                                            <span class="font-bold text-slate-900">€ {{ booking.depositPrice }}</span>
                                        </div>
                                        <div class="pt-3 border-t border-slate-100 flex justify-between items-center mt-2">
                                            <span class="text-slate-800 font-bold">Residuo da Saldare</span>
                                            <span class="font-black text-primary text-lg">
                                                € {{ booking.totalPrice }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Itinerary Section -->
                            <div v-if="offer?.itinerary?.length">
                                <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Clock class="w-5 h-5 text-primary" />
                                    Itinerario del Viaggio
                                </h3>
                                <div class="space-y-4 relative pl-4 border-l-2 border-slate-200 ml-2">
                                    <div v-for="(day, idx) in offer.itinerary" :key="idx" class="relative pl-6 pb-6 last:pb-0">
                                        <div class="absolute -left-[21px] top-0 w-8 h-8 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center text-xs font-bold shadow-sm">
                                            {{ Number(idx) + 1 }}
                                        </div>
                                        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                                            <h4 class="font-bold text-slate-900 mb-2">{{ day.title }}</h4>
                                            <div class="text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none">
                                                 <template v-if="Array.isArray(day.description)">
                                                    <p v-for="(block, bIdx) in day.description" :key="bIdx">
                                                        {{ block.children?.map((c: any) => c.text).join('') }}
                                                    </p>
                                                </template>
                                                <span v-else>{{ day.description }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Included/Excluded (if available in trip data) -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8" v-if="trip?.included || trip?.excluded">
                                <div v-if="trip?.included">
                                    <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Check class="w-5 h-5 text-green-600" />
                                        Cosa è incluso
                                    </h3>
                                    <ul class="space-y-2">
                                         <!-- Assuming simple text list or rich text -->
                                        <li class="flex items-start gap-2 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                            <Check class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Mostra dettagli inclusi nel prossimo aggiornamento (richiede parsing)</span>
                                        </li>
                                    </ul>
                                </div>
                                <div v-if="trip?.excluded">
                                    <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <XCircle class="w-5 h-5 text-red-500" />
                                        Cosa non è incluso
                                    </h3>
                                    <!-- Placeholder until we parse rich text correctly or have simple list -->
                                     <div class="text-sm text-slate-500 bg-white p-4 rounded-xl border border-slate-100">
                                        Vedi dettagli nella pagina del viaggio.
                                     </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    
                    <!-- Footer Actions -->
                    <div class="p-4 bg-white border-t border-slate-100 flex justify-end">
                        <button @click="$emit('close')" class="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                            Chiudi
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
