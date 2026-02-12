<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { RouterLink } from 'vue-router'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { Plus, Pencil, Trash2, MapPin, Eye, Loader2 } from 'lucide-vue-next'

const { token } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL

const trips = ref<any[]>([])
const loading = ref(true)
const deleting = ref<string | null>(null)

const fetchTrips = async () => {
    loading.value = true
    try {
        const res = await fetch(
            `${apiUrl}/api/trips?populate[image][fields]=url&populate[offers][fields]=id&sort=createdAt:desc`,
            { headers: { Authorization: `Bearer ${token.value}` } }
        )
        const data = await res.json()
        trips.value = data.data || []
    } catch (err) {
        console.error('Error fetching trips:', err)
    } finally {
        loading.value = false
    }
}

const deleteTrip = async (trip: any) => {
    if (!confirm(`Sei sicuro di voler eliminare "${trip.title}"?`)) return
    const docId = trip.documentId || trip.id
    deleting.value = docId
    try {
        const res = await fetch(`${apiUrl}/api/trips/${docId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token.value}` },
        })
        if (!res.ok) throw new Error('Errore nella cancellazione')
        trips.value = trips.value.filter((t: any) => (t.documentId || t.id) !== docId)
    } catch (err) {
        console.error('Delete error:', err)
        alert('Errore nella cancellazione del viaggio')
    } finally {
        deleting.value = null
    }
}

const getTripImage = (trip: any) => {
    const img = trip.image
    if (!img) return ''
    const url = img?.url || img?.data?.attributes?.url || img?.attributes?.url
    return url ? `${apiUrl}${url}` : ''
}

const getOffersCount = (trip: any) => {
    const offers = trip.offers
    if (!offers) return 0
    if (Array.isArray(offers)) return offers.length
    return offers?.data?.length || 0
}

onMounted(fetchTrips)
</script>

<template>
    <div class="p-6 lg:p-10">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 class="text-2xl font-black text-slate-900">Viaggi</h1>
                <p class="text-slate-500 text-sm font-medium">Gestisci tutti i viaggi della piattaforma</p>
            </div>
            <RouterLink to="/dashboard/viaggi/nuovo">
                <Button class="rounded-2xl px-6 h-11 font-bold shadow-md hover:shadow-primary/30 transition-all gap-2">
                    <Plus class="w-4 h-4" /> Nuovo Viaggio
                </Button>
            </RouterLink>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>

        <!-- Empty -->
        <Card v-else-if="trips.length === 0" class="rounded-2xl border-none shadow-sm">
            <CardContent class="p-12 text-center">
                <MapPin class="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p class="text-lg font-bold text-slate-600 mb-2">Nessun viaggio trovato</p>
                <p class="text-sm text-slate-400 mb-6">Crea il primo viaggio per iniziare</p>
                <RouterLink to="/dashboard/viaggi/nuovo">
                    <Button class="rounded-2xl px-6 h-11 font-bold gap-2">
                        <Plus class="w-4 h-4" /> Crea Viaggio
                    </Button>
                </RouterLink>
            </CardContent>
        </Card>

        <!-- Trips Table -->
        <Card v-else class="rounded-2xl border-none shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-slate-100">
                            <th class="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Viaggio</th>
                            <th
                                class="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                                Destinazione</th>
                            <th
                                class="text-center py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                                Offerte</th>
                            <th class="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="trip in trips" :key="trip.documentId || trip.id"
                            class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td class="py-4 px-6">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                        <img v-if="getTripImage(trip)" :src="getTripImage(trip)" :alt="trip.title"
                                            class="w-full h-full object-cover" />
                                    </div>
                                    <div class="min-w-0">
                                        <p class="font-bold text-slate-800 truncate">{{ trip.title }}</p>
                                        <p class="text-xs text-slate-400 truncate md:hidden">{{ trip.destination }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-4 hidden md:table-cell">
                                <div class="flex items-center gap-1.5">
                                    <MapPin class="w-3.5 h-3.5 text-slate-400" />
                                    <span class="text-sm font-medium text-slate-600">{{ trip.destination }}</span>
                                </div>
                            </td>
                            <td class="py-4 px-4 text-center hidden sm:table-cell">
                                <Badge
                                    class="bg-primary/10 text-primary border-none font-bold hover:bg-primary/10 cursor-default">
                                    {{ getOffersCount(trip) }}
                                </Badge>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center justify-end gap-2">
                                    <RouterLink :to="`/viaggio/${trip.slug}`" target="_blank">
                                        <button
                                            class="p-2 text-slate-400 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-colors"
                                            title="Visualizza">
                                            <Eye class="w-4 h-4" />
                                        </button>
                                    </RouterLink>
                                    <RouterLink :to="`/dashboard/viaggi/${trip.documentId || trip.id}/modifica`">
                                        <button
                                            class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                            title="Modifica">
                                            <Pencil class="w-4 h-4" />
                                        </button>
                                    </RouterLink>
                                    <button @click="deleteTrip(trip)"
                                        :disabled="deleting === (trip.documentId || trip.id)"
                                        class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                        title="Elimina">
                                        <Loader2 v-if="deleting === (trip.documentId || trip.id)"
                                            class="w-4 h-4 animate-spin" />
                                        <Trash2 v-else class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
</template>
