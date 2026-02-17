<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { RouterLink } from 'vue-router'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { Plus, Pencil, Trash2, MapPin, Eye, Loader2, X, Search } from 'lucide-vue-next'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import { useBulkActions } from '@/composables/useBulkActions'
import { TableSkeleton } from '@/components/ui/skeleton'

const { token } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL
const toast = useToast()

const trips = ref<any[]>([])
const loading = ref(true)
const deleting = ref<string | null>(null)
const selectedTrip = ref<any>(null)
const loadingDetails = ref(false)

// Confirm Modal State
const showConfirm = ref(false)
const confirmMessage = ref('')
const itemToDelete = ref<any>(null)

// Bulk Actions
const { selectedIds, toggleSelect, selectAll, deselectAll, isAllSelected } = useBulkActions(trips)
const bulkDeleting = ref(false)
const searchQuery = ref('')

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

const deleteTrip = (trip: any) => {
    itemToDelete.value = trip
    confirmMessage.value = `Sei sicuro di voler eliminare il viaggio "${trip.title}"? Questa azione è irreversibile.`
    showConfirm.value = true
}

const confirmDelete = async () => {
    if (!itemToDelete.value) return
    const trip = itemToDelete.value
    showConfirm.value = false

    const docId = trip.documentId || trip.id
    deleting.value = docId
    try {
        const res = await fetch(`${apiUrl}/api/trips/${docId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token.value}` },
        })
        if (!res.ok) throw new Error('Errore nella cancellazione')
        trips.value = trips.value.filter((t: any) => (t.documentId || t.id) !== docId)

        // Remove from selection if selected
        if (selectedIds.value.includes(docId)) {
            toggleSelect(docId)
        }

        toast.success(`Viaggio "${trip.title}" eliminato con successo`)
    } catch (err) {
        console.error('Delete error:', err)
        toast.error('Errore nella cancellazione del viaggio')
    } finally {
        deleting.value = null
        itemToDelete.value = null
    }
}

const bulkDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.value.length} viaggi?`)) return

    bulkDeleting.value = true
    try {
        await Promise.all(selectedIds.value.map(id =>
            fetch(`${apiUrl}/api/trips/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token.value}` },
            })
        ))

        // Refresh local data
        trips.value = trips.value.filter(t => !selectedIds.value.includes(t.documentId || t.id))
        deselectAll()
        toast.success('Viaggi eliminati con successo')
    } catch (err) {
        console.error('Bulk delete error:', err)
        toast.error('Errore durante l\'eliminazione multipla')
    } finally {
        bulkDeleting.value = false
    }
}

const openDetails = async (trip: any) => {
    loadingDetails.value = true
    selectedTrip.value = trip // Show partial data immediately
    try {
        const docId = trip.documentId || trip.id
        const res = await fetch(`${apiUrl}/api/trips/${docId}?populate[image][fields]=url&populate[gallery][fields]=url&populate[itinerary]=*`, {
            headers: { Authorization: `Bearer ${token.value}` }
        })
        const data = await res.json()
        selectedTrip.value = data.data || data
    } catch (err) {
        console.error('Error fetching details:', err)
    } finally {
        loadingDetails.value = false
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

const filteredTrips = computed(() => {
    if (!searchQuery.value) return trips.value
    const q = searchQuery.value.toLowerCase()
    return trips.value.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q)
    )
})


const getTripDescription = (trip: any) => {
    return trip.description || trip.shortDescription || 'Nessuna descrizione disponibile.'
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

        <!-- Filters & Bulk Action Bar -->
        <Card class="mb-6 rounded-2xl border-none shadow-sm">
            <div class="p-4 flex gap-4">
                <div class="relative flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input v-model="searchQuery" type="text" placeholder="Cerca viaggio..."
                        class="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
            </div>

            <!-- Bulk Action Bar -->
            <div v-if="selectedIds.length > 0" class="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div
                    class="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between shadow-lg shadow-slate-900/10">
                    <span class="text-sm font-bold pl-2">{{ selectedIds.length }} selezionati</span>
                    <button @click="bulkDelete" :disabled="bulkDeleting"
                        class="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50">
                        <Loader2 v-if="bulkDeleting" class="w-3.5 h-3.5 animate-spin" />
                        <Trash2 v-else class="w-3.5 h-3.5" />
                        Elimina Selezionati
                    </button>
                </div>
            </div>
        </Card>

        <!-- Loading -->
        <TableSkeleton v-if="loading" :rows="5" :columns="5" />

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
                            <th class="w-10 py-4 pl-6 pr-2">
                                <input type="checkbox" :checked="isAllSelected"
                                    @change="selectAll(trips.map(t => t.documentId || t.id))"
                                    class="rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer">
                            </th>
                            <th class="text-left py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                        <tr v-for="trip in filteredTrips" :key="trip.documentId || trip.id"
                            class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                            :class="{ 'bg-primary/5': selectedIds.includes(trip.documentId || trip.id) }">
                            <td class="py-4 pl-6 pr-2">
                                <input type="checkbox" :checked="selectedIds.includes(trip.documentId || trip.id)"
                                    @change="toggleSelect(trip.documentId || trip.id)"
                                    class="rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer">
                            </td>
                            <td class="py-4 px-2">
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
                                    <button @click="openDetails(trip)"
                                        class="p-2 text-slate-400 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-colors"
                                        title="Visualizza Dettagli">
                                        <Eye class="w-4 h-4" />
                                    </button>
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

    <!-- Details Modal -->
    <Teleport to="body">
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="selectedTrip" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="selectedTrip = null"></div>
                <div
                    class="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    <!-- Modal Header (Sticky) -->
                    <div
                        class="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
                        <div>
                            <h2 class="text-xl font-black text-slate-900 line-clamp-1">{{ selectedTrip.title }}</h2>
                            <p class="text-sm text-slate-500 font-medium flex items-center gap-1">
                                <MapPin class="w-3.5 h-3.5" /> {{ selectedTrip.destination }}
                            </p>
                        </div>
                        <button @click="selectedTrip = null"
                            class="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Scrollable Content -->
                    <div class="overflow-y-auto p-6 space-y-8">
                        <!-- Loading State -->
                        <div v-if="loadingDetails" class="flex justify-center py-20">
                            <Loader2 class="w-10 h-10 text-primary animate-spin" />
                        </div>

                        <template v-else>
                            <!-- Cover & Description -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div class="space-y-4">
                                    <div
                                        class="aspect-video rounded-2xl overflow-hidden bg-slate-100 shadow-sm relative">
                                        <img v-if="getTripImage(selectedTrip)" :src="getTripImage(selectedTrip)"
                                            class="w-full h-full object-cover" />
                                        <div v-else
                                            class="absolute inset-0 flex items-center justify-center text-slate-300">
                                            <MapPin class="w-12 h-12" />
                                        </div>
                                    </div>
                                    <!-- Gallery Preview (First 4) -->
                                    <div v-if="selectedTrip.gallery && selectedTrip.gallery.length > 0"
                                        class="grid grid-cols-4 gap-2">
                                        <div v-for="(img, i) in selectedTrip.gallery.slice(0, 4)" :key="i"
                                            class="aspect-square rounded-lg overflow-hidden bg-slate-50 cursor-pointer hover:opacity-80 transition-opacity">
                                            <img :src="`${apiUrl}${img.url}`" class="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        Descrizione</h3>
                                    <p class="text-slate-600 leading-relaxed whitespace-pre-line text-sm">
                                        {{ getTripDescription(selectedTrip) }}
                                    </p>
                                </div>
                            </div>

                            <!-- Itinerary -->
                            <div v-if="selectedTrip.itinerary && selectedTrip.itinerary.length > 0">
                                <div class="flex items-center gap-3 mb-6">
                                    <div class="h-px flex-1 bg-slate-100"></div>
                                    <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Itinerario di
                                        Viaggio</h3>
                                    <div class="h-px flex-1 bg-slate-100"></div>
                                </div>
                                <div
                                    class="space-y-0 relative border-l-2 border-slate-100 ml-3 md:ml-6 my-4 pl-6 md:pl-8 pb-2">
                                    <div v-for="(day, i) in selectedTrip.itinerary" :key="i" class="mb-8 relative">
                                        <!-- Dot -->
                                        <div
                                            class="absolute -left-[31px] md:-left-[39px] top-0 w-4 h-4 rounded-full bg-white border-4 border-primary shadow-sm">
                                        </div>

                                        <h4 class="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                                            <span
                                                class="text-xs font-black text-white bg-primary px-2 py-0.5 rounded">Giorno
                                                {{ Number(i) + 1 }}</span>
                                            {{ day.title }}
                                        </h4>
                                        <p class="text-slate-500 text-sm leading-relaxed">{{ day.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- Modal Footer -->
                    <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <RouterLink :to="`/dashboard/viaggi/${selectedTrip.documentId || selectedTrip.id}/modifica`">
                            <Button class="rounded-xl px-6 h-11 font-bold shadow-sm hover:shadow-primary/20 gap-2">
                                <Pencil class="w-4 h-4" /> Modifica Viaggio
                            </Button>
                        </RouterLink>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- Confirm Dialog -->
    <ConfirmDialog :isOpen="showConfirm" title="Elimina Viaggio" :message="confirmMessage"
        confirmText="Elimina definitivamente" variant="danger" @close="showConfirm = false" @confirm="confirmDelete" />
</template>
