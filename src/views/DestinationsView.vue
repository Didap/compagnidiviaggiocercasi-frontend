<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Navbar from '@/components/Navbar.vue'
import TripCard from '@/components/Trips/TripCard.vue'
import Input from '@/components/ui/input/Input.vue'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { DateRangePicker } from '@/components/ui/date-picker'
import { Search, X, SlidersHorizontal } from 'lucide-vue-next'
import type { DateRange } from 'radix-vue'
import { cn } from '@/lib/utils'
import { useTrips } from '@/composables/useTrips'

const { trips, loading, error, fetchTrips } = useTrips()

// Filter State
const searchQuery = ref('')
const dateRange = ref<DateRange | undefined>()
const minTripPrice = ref(0)
const maxTripPrice = ref(5000)
const priceRange = ref<[number, number]>([0, 5000])

// UI State
const isFiltersOpen = ref(false)

// Computed Filter Logic
const filteredTrips = computed(() => {
    return trips.value.filter(trip => {
        // Handle both v4 (attributes) and v5 (flat) structures
        const t = trip.attributes || trip
        const offersRaw = t.offers
        const offers = Array.isArray(offersRaw?.data) ? offersRaw.data : (Array.isArray(offersRaw) ? offersRaw : [])

        // 1. Search Query (Title or Destination)
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            const matchTitle = t.title?.toLowerCase().includes(query)
            const matchDest = t.destination?.toLowerCase().includes(query)
            if (!matchTitle && !matchDest) return false
        }

        // 2. Price Range (check "Effective Price" - cheapest available)
        if (priceRange.value[0] > minTripPrice.value || priceRange.value[1] < maxTripPrice.value) {
            const [filterMin, filterMax] = priceRange.value

            // Calculate effective price for filtering
            // Logic must match TripCard: Cheapest AVAILABLE offer, or cheapest absolute if all sold out.
            let effectivePrice = Infinity
            const sortedOffers = [...offers].sort((a: any, b: any) => {
                const aData = a.attributes || a
                const bData = b.attributes || b
                const aSeats = Math.max(0, (aData.maxParticipants || 0) - (aData.occupiedSeats || 0))
                const bSeats = Math.max(0, (bData.maxParticipants || 0) - (bData.occupiedSeats || 0))
                const aAvailable = aSeats > 0
                const bAvailable = bSeats > 0

                if (aAvailable && !bAvailable) return -1
                if (!aAvailable && bAvailable) return 1
                return (aData.price ?? Infinity) - (bData.price ?? Infinity)
            })

            if (sortedOffers.length > 0) {
                const bestOffer = sortedOffers[0]
                const bestData = bestOffer.attributes || bestOffer
                effectivePrice = bestData.price ?? Infinity
            }

            // If effective price is within range, keep the trip
            return effectivePrice >= filterMin && effectivePrice <= filterMax
        }

        // 3. Date Range
        if (dateRange.value?.start) {
            // Convert start date to YYYY-MM-DD string for comparison
            const startVal = dateRange.value.start.toString()
            const endVal = dateRange.value.end ? dateRange.value.end.toString() : startVal

            const hasDateOffer = offers.some((o: any) => {
                const oData = o.attributes || o
                const dateStr = oData.startDate // Assuming YYYY-MM-DD from API
                if (!dateStr) return false

                // Simple string comparison works for ISO dates YYYY-MM-DD
                return dateStr >= startVal && dateStr <= endVal
            })
            if (!hasDateOffer) return false
        }

        return true
    })
})

const calculatePriceBounds = () => {
    let min = Infinity
    let max = 0
    let hasOffers = false

    trips.value.forEach(trip => {
        const t = trip.attributes || trip
        const offersRaw = t.offers
        const offers = Array.isArray(offersRaw?.data) ? offersRaw.data : (Array.isArray(offersRaw) ? offersRaw : [])

        if (offers.length > 0) {
            hasOffers = true

            // Calculate effective price (Cheapest AVAILABLE or Cheapest Absolute)
            const sortedOffers = [...offers].sort((a: any, b: any) => {
                const aData = a.attributes || a
                const bData = b.attributes || b
                const aSeats = Math.max(0, (aData.maxParticipants || 0) - (aData.occupiedSeats || 0))
                const bSeats = Math.max(0, (bData.maxParticipants || 0) - (bData.occupiedSeats || 0))
                const aAvailable = aSeats > 0
                const bAvailable = bSeats > 0

                if (aAvailable && !bAvailable) return -1
                if (!aAvailable && bAvailable) return 1
                return (aData.price ?? Infinity) - (bData.price ?? Infinity)
            })

            const bestOffer = sortedOffers[0]
            const bestData = bestOffer.attributes || bestOffer
            const price = bestData.price ?? Infinity

            if (price < min) min = price
            if (price > max) max = price
        }
    })

    if (hasOffers) {
        minTripPrice.value = min
        maxTripPrice.value = max
        // Reset range to full bounds
        priceRange.value = [min, max]
    } else {
        // Default fallbacks if no data
        minTripPrice.value = 0
        maxTripPrice.value = 5000
        priceRange.value = [0, 5000]
    }
}

const resetFilters = () => {
    searchQuery.value = ''
    priceRange.value = [minTripPrice.value, maxTripPrice.value]
    dateRange.value = undefined
}

const activeFiltersCount = computed(() => {
    let count = 0
    if (searchQuery.value) count++
    // Check if price range is different from min/max bounds
    if (priceRange.value[0] > minTripPrice.value || priceRange.value[1] < maxTripPrice.value) count++
    if (dateRange.value) count++
    return count
})

onMounted(async () => {
    await fetchTrips()
    calculatePriceBounds()
})
</script>

<template>
    <main class="min-h-screen bg-white overflow-x-hidden">
        <Navbar />

        <!-- HERO SECTION: IDENTICAL TO HOME -->
        <section class="relative w-full min-h-[60dvh] overflow-hidden bg-bg-primary flex items-center justify-center">
            <!-- Background Animated Elements -->
            <div class="absolute inset-0 pointer-events-none select-none overflow-hidden z-1">
                <img src="@/assets/macchia.png" alt=""
                    class="absolute -top-32 -left-32 w-[600px] h-auto opacity-40 mix-blend-multiply animate-pulse-slow" />
                <img src="@/assets/macchia.png" alt="" style="rotate: 180deg"
                    class="absolute -bottom-32 -right-32 w-[700px] h-auto opacity-40 mix-blend-multiply animate-pulse-slow -scale-x-100 rotate-180" />
                <img src="@/assets/line.png" alt=""
                    class="absolute bottom-0 left-0 w-[25%] max-w-[300px] h-auto object-contain opacity-25 animate-fade-in-path md:block hidden" />
                <img src="@/assets/line.png" alt=""
                    class="absolute top-0 right-0 w-[25%] max-w-[300px] h-auto object-contain opacity-25 transform rotate-180 animate-fade-in-path md:block hidden" />
            </div>

            <!-- Foreground Elements -->
            <div class="absolute inset-0 pointer-events-none select-none overflow-hidden z-20">
                <img src="@/assets/globe.png" alt=""
                    class="absolute top-20 left-[10%] w-20 sm:w-28 h-auto opacity-60 mix-blend-multiply animate-rotate-slow" />
                <img src="@/assets/airplane-passport.png" alt="" style="rotate: 45deg"
                    class="absolute top-40 right-[15%] w-32 sm:w-40 h-auto animate-float drop-shadow-xl opacity-90" />
            </div>

            <div class="container mx-auto px-6 relative z-30 text-center py-20">
                <div class="max-w-4xl mx-auto space-y-6">
                    <span
                        class="inline-block py-1 px-3 rounded-full bg-secondary/10 text-secondary font-semibold text-sm tracking-widest uppercase mb-4">
                        Esplora il Mondo
                    </span>
                    <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-primary leading-[0.9] tracking-tight">
                        Tutte le <br />
                        <span class="text-secondary/80">Destinazioni</span>
                    </h1>
                    <p class="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
                        Scegli la tua prossima avventura e trova i compagni di viaggio ideali.
                    </p>
                </div>
            </div>

            <!-- Bottom Divider -->
            <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-40 transform translate-y-px">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none"
                    class="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[120px]">
                    <path d="M1200 120L0 120 0 0z" class="fill-white"></path>
                </svg>
            </div>
        </section>

        <!-- FILTERS & GRID -->
        <section class="py-12 bg-white min-h-[40vh]">
            <div class="container mx-auto px-6">

                <!-- FILTER BAR -->
                <div class="relative z-50 -mt-24 mb-16 bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
                    <div class="flex flex-col gap-6">
                        <!-- Top Row: Search & Toggle -->
                        <div class="flex items-end gap-4">
                            <!-- Search -->
                            <div class="flex-grow relative space-y-2">
                                <label
                                    class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cerca</label>
                                <div class="relative">
                                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input v-model="searchQuery" placeholder="Destinazione..."
                                        class="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all w-full" />
                                </div>
                            </div>

                            <!-- Filter Toggle Button -->
                            <Button @click="isFiltersOpen = !isFiltersOpen" variant="outline" size="icon"
                                :class="cn('relative h-10 w-10 rounded-xl transition-all border-slate-200', isFiltersOpen ? 'bg-primary text-white border-primary hover:bg-primary/90 hover:text-white' : 'bg-white hover:bg-slate-50 text-slate-500')"
                                title="Filtri">
                                <SlidersHorizontal class="w-5 h-5" />
                                <span v-if="activeFiltersCount > 0 && !isFiltersOpen"
                                    class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                            </Button>
                        </div>

                        <!-- Collapsible Filters -->
                        <div v-show="isFiltersOpen"
                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 animate-in slide-in-from-top-2 duration-200">
                            <!-- Date Range -->
                            <div class="md:col-span-1 lg:col-span-3 space-y-2">
                                <label
                                    class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date</label>
                                <DateRangePicker v-model="dateRange" class="w-full" />
                            </div>

                            <!-- Price -->
                            <div class="md:col-span-1 lg:col-span-4 space-y-2 px-2">
                                <div class="flex justify-between items-center">
                                    <label
                                        class="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget</label>
                                    <span class="text-xs font-bold text-primary">{{ priceRange[0] }}€ - {{ priceRange[1]
                                        >=
                                        maxTripPrice ? maxTripPrice + '€+' : priceRange[1] + '€' }}</span>
                                </div>
                                <div class="h-10 flex items-center">
                                    <Slider v-model="priceRange" :min="minTripPrice" :max="maxTripPrice" :step="100"
                                        :min-steps-between-thumbs="1" class="w-full" />
                                </div>
                            </div>

                            <!-- Internal Reset -->
                            <div class="md:col-span-2 lg:col-span-7 flex justify-end border-t border-slate-100 pt-4"
                                v-if="activeFiltersCount > 0">
                                <Button @click="resetFilters" variant="ghost"
                                    class="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm h-9 px-4 rounded-lg">
                                    <X class="w-4 h-4 mr-2" />
                                    Resetta tutto
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>


                <div v-if="loading" class="text-center py-20">
                    <div
                        class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4">
                    </div>
                    <p class="text-lg text-gray-500 font-medium">Caricamento viaggi straordinari...</p>
                </div>

                <div v-else-if="error" class="text-center py-20">
                    <p class="text-xl text-red-500 font-black mb-4">Ops! Qualcosa è andato storto.</p>
                    <p class="text-gray-500 mb-8">{{ error }}</p>
                    <button @click="fetchTrips"
                        class="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg hover:bg-primary/90 transition-all">Riprova</button>
                </div>

                <div v-else-if="filteredTrips.length === 0"
                    class="text-center py-20 px-6 bg-bg-primary rounded-[3rem] border-2 border-dashed border-primary/20">
                    <p class="text-2xl font-black text-primary mb-4">Nessun viaggio trovato</p>
                    <p class="text-gray-500 max-w-sm mx-auto mb-6">Non ci sono viaggi che corrispondono ai tuoi criteri
                        di ricerca.</p>
                    <Button @click="resetFilters" variant="outline" class="rounded-full">Resetta filtri</Button>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" />
                </div>
            </div>
        </section>

        <!-- CALL TO ACTION -->
        <section class="py-24 px-6 bg-bg-primary text-center relative overflow-hidden">
            <!-- Decor -->
            <img src="@/assets/macchia.png" alt=""
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] opacity-10 mix-blend-multiply pointer-events-none" />

            <div class="container mx-auto max-w-4xl relative z-10">
                <h2 class="text-4xl md:text-6xl font-black text-primary leading-tight mb-8">Non trovi quello che cerchi?
                </h2>
                <p class="text-xl text-gray-600 font-medium mb-12">Proponi tu la tua prossima meta e diventa un
                    Coordinatore!</p>
                <RouterLink to="/proponi-viaggio">
                    <button
                        class="h-16 px-12 text-xl rounded-full bg-secondary text-white font-black shadow-2xl hover:bg-secondary/90 transition-all transform hover:scale-105">
                        Proponi un Viaggio
                    </button>
                </RouterLink>
            </div>
        </section>
    </main>
</template>

<style scoped>
h1,
h2 {
    font-feature-settings: "ss01", "ss02", "salt";
}
</style>
