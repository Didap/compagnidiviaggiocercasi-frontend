<script setup lang="ts">
import { onMounted } from 'vue'
import TripCard from '@/components/Trips/TripCard.vue'
import { useTrips } from '@/composables/useTrips'

const { trips, loading, error, fetchTrips } = useTrips()

onMounted(() => {
    fetchTrips()
})
</script>

<template>
    <section class="py-20 bg-white">
        <div class="container mx-auto px-6">
            <h2 class="text-3xl font-bold text-primary mb-10">I Nostri Viaggi</h2>

            <div v-if="loading" class="text-center py-10">
                <p class="text-lg text-gray-500">Caricamento viaggi...</p>
            </div>

            <div v-else-if="error" class="text-center py-10">
                <p class="text-lg text-red-500">Impossibile caricare i viaggi al momento.</p>
                <p class="text-sm text-gray-400 mt-2">{{ error }}</p>
            </div>

            <div v-else-if="trips.length === 0" class="text-center py-10">
                <p class="text-lg text-gray-500">Nessun viaggio disponibile al momento.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <TripCard v-for="trip in trips" :key="trip.id" :trip="trip" />
            </div>
        </div>
    </section>
</template>