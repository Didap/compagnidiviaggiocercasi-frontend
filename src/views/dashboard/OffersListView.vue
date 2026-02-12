<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import {
    Plus, Pencil, Trash2, Tag, Loader2, X, Save, Calendar, Users as UsersIcon,
} from 'lucide-vue-next'

const { token } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL

const offers = ref<any[]>([])
const trips = ref<any[]>([])
const loading = ref(true)
const deleting = ref<string | null>(null)

// Form
const showForm = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref<string | null>(null)
const form = ref({
    trip: '',
    price: '',
    depositPrice: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
})

const resetForm = () => {
    form.value = { trip: '', price: '', depositPrice: '', startDate: '', endDate: '', maxParticipants: '' }
    editingId.value = null
    formError.value = null
}

const openCreate = () => {
    resetForm()
    showForm.value = true
}

const openEdit = (offer: any) => {
    editingId.value = offer.documentId || offer.id
    form.value = {
        trip: offer.trip?.documentId || offer.trip?.id || offer.trip?.data?.id || '',
        price: String(offer.price || ''),
        depositPrice: String(offer.depositPrice || ''),
        startDate: offer.startDate || '',
        endDate: offer.endDate || '',
        maxParticipants: String(offer.maxParticipants || ''),
    }
    formError.value = null
    showForm.value = true
}

const fetchData = async () => {
    loading.value = true
    try {
        const [offersRes, tripsRes] = await Promise.all([
            fetch(`${apiUrl}/api/offers?populate[trip][fields]=title,documentId&populate[participants][fields]=id&sort=createdAt:desc`, {
                headers: { Authorization: `Bearer ${token.value}` },
            }),
            fetch(`${apiUrl}/api/trips?fields=title,documentId&sort=title:asc`, {
                headers: { Authorization: `Bearer ${token.value}` },
            }),
        ])
        const offersData = await offersRes.json()
        const tripsData = await tripsRes.json()
        offers.value = offersData.data || []
        trips.value = tripsData.data || []
    } catch (err) {
        console.error('Error:', err)
    } finally {
        loading.value = false
    }
}

const saveOffer = async () => {
    saving.value = true
    formError.value = null
    try {
        if (!form.value.trip) throw new Error('Seleziona un viaggio')
        if (!form.value.price) throw new Error('Il prezzo è obbligatorio')
        if (!form.value.startDate || !form.value.endDate) throw new Error('Le date sono obbligatorie')
        if (!form.value.maxParticipants) throw new Error('I partecipanti max sono obbligatori')

        const payload = {
            data: {
                trip: form.value.trip,
                price: parseFloat(form.value.price),
                depositPrice: parseFloat(form.value.depositPrice) || 0,
                startDate: form.value.startDate,
                endDate: form.value.endDate,
                maxParticipants: parseInt(form.value.maxParticipants),
            },
        }

        const url = editingId.value
            ? `${apiUrl}/api/offers/${editingId.value}`
            : `${apiUrl}/api/offers`

        const res = await fetch(url, {
            method: editingId.value ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify(payload),
        })
        if (!res.ok) {
            const data = await res.json()
            throw new Error(data?.error?.message || 'Errore nel salvataggio')
        }
        showForm.value = false
        resetForm()
        await fetchData()
    } catch (err: any) {
        formError.value = err.message
    } finally {
        saving.value = false
    }
}

const deleteOffer = async (offer: any) => {
    if (!confirm('Eliminare questa offerta?')) return
    const docId = offer.documentId || offer.id
    deleting.value = docId
    try {
        await fetch(`${apiUrl}/api/offers/${docId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token.value}` },
        })
        offers.value = offers.value.filter((o: any) => (o.documentId || o.id) !== docId)
    } catch (err) {
        console.error('Delete error:', err)
    } finally {
        deleting.value = null
    }
}

const getTripTitle = (offer: any) => {
    return offer.trip?.title || offer.trip?.data?.attributes?.title || '—'
}

const getParticipantsCount = (offer: any) => {
    const p = offer.participants
    if (!p) return 0
    if (Array.isArray(p)) return p.length
    return p?.data?.length || 0
}

const formatDate = (d: string) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(fetchData)
</script>

<template>
    <div class="p-6 lg:p-10">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 class="text-2xl font-black text-slate-900">Offerte</h1>
                <p class="text-slate-500 text-sm font-medium">Gestisci offerte con date e prezzi per ogni viaggio</p>
            </div>
            <Button @click="openCreate"
                class="rounded-2xl px-6 h-11 font-bold shadow-md hover:shadow-primary/30 transition-all gap-2">
                <Plus class="w-4 h-4" /> Nuova Offerta
            </Button>
        </div>

        <!-- Form Modal -->
        <Teleport to="body">
            <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
                enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="showForm" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false"></div>
                    <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div class="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 class="text-xl font-bold text-slate-900">
                                {{ editingId ? 'Modifica Offerta' : 'Nuova Offerta' }}
                            </h2>
                            <button @click="showForm = false"
                                class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50">
                                <X class="w-5 h-5" />
                            </button>
                        </div>
                        <div class="p-6 space-y-4">
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Viaggio *</label>
                                <select v-model="form.trip"
                                    class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                                    <option value="">Seleziona viaggio...</option>
                                    <option v-for="t in trips" :key="t.documentId || t.id"
                                        :value="t.documentId || t.id">
                                        {{ t.title }}
                                    </option>
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Prezzo (€)
                                        *</label>
                                    <input v-model="form.price" type="number" step="0.01"
                                        class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="0.00" />
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Acconto
                                        (€)</label>
                                    <input v-model="form.depositPrice" type="number" step="0.01"
                                        class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="0.00" />
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Data Inizio
                                        *</label>
                                    <input v-model="form.startDate" type="date"
                                        class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Data Fine
                                        *</label>
                                    <input v-model="form.endDate" type="date"
                                        class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                </div>
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Max Partecipanti
                                    *</label>
                                <input v-model="form.maxParticipants" type="number"
                                    class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="20" />
                            </div>
                            <p v-if="formError" class="text-sm text-red-500 font-medium bg-red-50 px-4 py-2 rounded-xl">
                                {{ formError }}</p>
                        </div>
                        <div class="p-6 pt-0 flex items-center gap-3">
                            <Button @click="showForm = false" variant="outline"
                                class="flex-1 rounded-2xl h-12 font-bold border-slate-200">
                                Annulla
                            </Button>
                            <Button @click="saveOffer" :disabled="saving"
                                class="flex-1 rounded-2xl h-12 font-bold shadow-lg hover:shadow-primary/30 transition-all gap-2">
                                <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                                <Save v-else class="w-4 h-4" />
                                Salva
                            </Button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>

        <!-- Empty -->
        <Card v-else-if="offers.length === 0" class="rounded-2xl border-none shadow-sm">
            <CardContent class="p-12 text-center">
                <Tag class="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p class="text-lg font-bold text-slate-600 mb-2">Nessuna offerta</p>
                <p class="text-sm text-slate-400 mb-6">Crea la prima offerta per un viaggio</p>
                <Button @click="openCreate" class="rounded-2xl px-6 h-11 font-bold gap-2">
                    <Plus class="w-4 h-4" /> Crea Offerta
                </Button>
            </CardContent>
        </Card>

        <!-- Table -->
        <Card v-else class="rounded-2xl border-none shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-slate-100">
                            <th class="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Viaggio</th>
                            <th
                                class="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                                Date</th>
                            <th class="text-right py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Prezzo</th>
                            <th
                                class="text-center py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                                Posti</th>
                            <th class="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="offer in offers" :key="offer.documentId || offer.id"
                            class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td class="py-4 px-6">
                                <p class="font-bold text-slate-800">{{ getTripTitle(offer) }}</p>
                            </td>
                            <td class="py-4 px-4 hidden md:table-cell">
                                <div class="flex items-center gap-1.5 text-sm text-slate-500">
                                    <Calendar class="w-3.5 h-3.5" />
                                    {{ formatDate(offer.startDate) }} – {{ formatDate(offer.endDate) }}
                                </div>
                            </td>
                            <td class="py-4 px-4 text-right">
                                <span class="font-bold text-slate-800">€{{ offer.price }}</span>
                            </td>
                            <td class="py-4 px-4 text-center hidden sm:table-cell">
                                <Badge
                                    class="bg-secondary/10 text-secondary border-none font-bold hover:bg-secondary/10 cursor-default">
                                    {{ getParticipantsCount(offer) }}/{{ offer.maxParticipants }}
                                </Badge>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="openEdit(offer)"
                                        class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors">
                                        <Pencil class="w-4 h-4" />
                                    </button>
                                    <button @click="deleteOffer(offer)"
                                        :disabled="deleting === (offer.documentId || offer.id)"
                                        class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50">
                                        <Loader2 v-if="deleting === (offer.documentId || offer.id)"
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
