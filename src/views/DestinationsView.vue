<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import TripCard from '@/components/Trips/TripCard.vue'

interface Trip {
    id: number
    attributes: any
}

const trips = ref<Trip[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchTrips = async () => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL
        const response = await fetch(`${apiUrl}/api/trips?populate[image][fields]=url&populate[reviews][populate]=*&populate[offers][populate]=*`)

        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`)
        }

        const data = await response.json()
        trips.value = data.data
    } catch (err: any) {
        error.value = err.message
        console.error('Error fetching trips:', err)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchTrips()
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

        <!-- TRIPS GRID -->
        <section class="py-20 bg-white min-h-[40vh]">
            <div class="container mx-auto px-6">
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

                <div v-else-if="trips.length === 0"
                    class="text-center py-20 px-6 bg-bg-primary rounded-[3rem] border-2 border-dashed border-primary/20">
                    <p class="text-2xl font-black text-primary mb-4">Nessun viaggio trovato</p>
                    <p class="text-gray-500 max-w-sm mx-auto">Al momento non ci sono viaggi disponibili. Torna a
                        trovarci presto!</p>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <TripCard v-for="trip in trips" :key="trip.id" :trip="trip" />
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
                <button
                    class="h-16 px-12 text-xl rounded-full bg-secondary text-white font-black shadow-2xl hover:bg-secondary/90 transition-all transform hover:scale-105">
                    Proponi un Viaggio
                </button>
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
