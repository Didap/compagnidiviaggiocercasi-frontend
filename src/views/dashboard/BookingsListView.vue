<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import {
    Ticket, Search, User, CheckCircle, XCircle, Clock, Loader2, Eye, MapPin, Calendar, CreditCard, Mail, X, FileDown, Users, Trash2
} from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { useBulkActions } from '@/composables/useBulkActions'
import { TableSkeleton } from '@/components/ui/skeleton'

const { token } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL
const toast = useToast()

const bookings = ref<any[]>([])
const loading = ref(true)
const processingId = ref<string | null>(null)
const searchQuery = ref('')
const statusFilter = ref('all')
const selectedBooking = ref<any>(null)

const fetchData = async () => {
    loading.value = true
    try {
        const res = await fetch(`${apiUrl}/api/bookings?populate[offer][populate]=trip&populate[user][fields][0]=username&populate[user][fields][1]=email&populate[user][fields][2]=firstName&populate[user][fields][3]=lastName&populate[participants]=*&sort=createdAt:desc`, {
            headers: { Authorization: `Bearer ${token.value}` },
        })
        const data = await res.json()
        bookings.value = data.data || []
    } catch (err) {
        console.error('Error fetching bookings:', err)
    } finally {
        loading.value = false
    }
}

const updateStatus = async (booking: any, newStatus: string) => {
    if (!confirm(`Vuoi modificare lo stato della prenotazione in "${newStatus}"?`)) return

    const docId = booking.documentId || booking.id
    processingId.value = docId

    try {
        const res = await fetch(`${apiUrl}/api/bookings/${docId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({ data: { status: newStatus } }),
        })

        if (!res.ok) throw new Error('Errore aggiornamento')

        // Update local state
        const idx = bookings.value.findIndex(b => (b.documentId || b.id) === docId)
        if (idx !== -1) {
            bookings.value[idx].status = newStatus
        }

        // Also update selected booking if open
        if (selectedBooking.value && (selectedBooking.value.documentId || selectedBooking.value.id) === docId) {
            selectedBooking.value.status = newStatus
        }

        toast.success(`Stato aggiornato a "${statusBadge(newStatus).label}"`)
    } catch (err) {
        console.error('Update error:', err)
        toast.error('Errore durante l\'aggiornamento dello stato')
    } finally {
        processingId.value = null
    }
}

const openDetails = (booking: any) => {
    selectedBooking.value = booking
}

// Helpers
const getTripTitle = (b: any) => b.offer?.trip?.title || b.offer?.trip?.data?.attributes?.title || '—'
const getTripDestination = (b: any) => b.offer?.trip?.destination || b.offer?.trip?.data?.attributes?.destination || '—'
const getUserName = (b: any) => {
    const u = b.user
    if (!u) return 'Utente sconosciuto'
    return u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username || u.email
}
const getUserEmail = (b: any) => b.user?.email || '—'
const getAmount = (b: any) => {
    const price = b.offer?.depositPrice || 0
    const count = (b.participants && b.participants.length > 0) ? b.participants.length : 1
    return price * count
}

const formatDate = (d: string) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('it-IT', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

const formatSimpleDate = (d: string) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}


const statusBadge = (status: string) => {
    switch (status) {
        case 'confirmed': return { label: 'Confermata', class: 'bg-green-100 text-green-700' }
        case 'pending': return { label: 'In Attesa', class: 'bg-amber-100 text-amber-700' }
        case 'cancelled': return { label: 'Cancellata', class: 'bg-red-100 text-red-700' }
        default: return { label: status, class: 'bg-slate-100 text-slate-700' }
    }
}

// Filtered Bookings
const filteredBookings = computed(() => {
    return bookings.value.filter(b => {
        const matchesSearch =
            getTripTitle(b).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            getUserName(b).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (b.documentId || b.id).toLowerCase().includes(searchQuery.value.toLowerCase())

        const matchesStatus = statusFilter.value === 'all' || b.status === statusFilter.value

        return matchesSearch && matchesStatus
    })
})

const stats = computed(() => {
    const total = bookings.value.length
    const confirmed = bookings.value.filter(b => b.status === 'confirmed').length
    const pending = bookings.value.filter(b => b.status === 'pending').length
    const revenue = bookings.value
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + Number(getAmount(b)), 0)

    return { total, confirmed, pending, revenue }
})

// Bulk Actions
const { selectedIds, toggleSelect, selectAll, deselectAll, isAllSelected } = useBulkActions(filteredBookings)
const bulkDeleting = ref(false)

const bulkDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.value.length} prenotazioni?`)) return

    bulkDeleting.value = true
    try {
        await Promise.all(selectedIds.value.map(id =>
            fetch(`${apiUrl}/api/bookings/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token.value}` },
            })
        ))

        // Refresh local data
        bookings.value = bookings.value.filter(b => !selectedIds.value.includes(b.documentId || b.id))
        deselectAll()
        toast.success('Prenotazioni eliminate con successo')
    } catch (err) {
        console.error('Bulk delete error:', err)
        toast.error('Errore durante l\'eliminazione multipla')
    } finally {
        bulkDeleting.value = false
    }
}

const downloadCSV = () => {
    const headers = ['ID', 'Viaggio', 'Utente', 'Email', 'Data', 'Stato', 'Importo', 'Partecipanti']
    const rows = filteredBookings.value.map(b => [
        b.documentId || b.id,
        `"${getTripTitle(b).replace(/"/g, '""')}"`, // Quote strings
        `"${getUserName(b).replace(/"/g, '""')}"`,
        `"${getUserEmail(b)}"`,
        formatDate(b.createdAt),
        statusBadge(b.status).label,
        getAmount(b),
        (b.participants || []).length
    ])

    const csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prenotazioni_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

onMounted(fetchData)
</script>

<template>
    <div class="p-6 lg:p-10 relative">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 class="text-2xl font-black text-slate-900">Prenotazioni</h1>
                <p class="text-slate-500 text-sm font-medium">Gestisci le prenotazioni e i pagamenti</p>
            </div>
            <div class="flex items-center gap-3">
                <div class="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ricavi Totali</span>
                        <span class="text-lg font-black text-slate-900">€{{ stats.revenue.toLocaleString('it-IT')
                            }}</span>
                    </div>
                </div>
                <button @click="downloadCSV"
                    class="bg-white p-3 rounded-2xl border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-slate-50 transition-all shadow-sm"
                    title="Esporta CSV">
                    <FileDown class="w-5 h-5" />
                </button>
            </div>
        </div>

        <!-- Filters -->
        <Card class="mb-6 rounded-2xl border-none shadow-sm">
            <div class="p-4 flex flex-col sm:flex-row gap-4">
                <div class="relative flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input v-model="searchQuery" type="text" placeholder="Cerca per viaggio, utente o ID..."
                        class="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <select v-model="statusFilter"
                    class="h-10 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white cursor-pointer">
                    <option value="all">Tutti gli stati</option>
                    <option value="confirmed">Confermate</option>
                    <option value="pending">In Attesa</option>
                    <option value="cancelled">Cancellate</option>
                </select>
            </div>
        </Card>

        <!-- Bulk Action Bar -->
        <div v-if="selectedIds.length > 0" class="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
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

        <!-- Loading -->
        <TableSkeleton v-if="loading" :rows="5" :columns="6" />

        <!-- Empty -->
        <Card v-else-if="filteredBookings.length === 0" class="rounded-2xl border-none shadow-sm">
            <CardContent class="p-12 text-center">
                <Ticket class="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p class="text-lg font-bold text-slate-600">Nessuna prenotazione trovata</p>
                <p class="text-sm text-slate-400 mt-1">Prova a modificare i filtri di ricerca</p>
            </CardContent>
        </Card>

        <!-- Table -->
        <Card v-else class="rounded-2xl border-none shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-slate-100 bg-slate-50/50">
                            <th class="w-10 py-4 pl-6 pr-2">
                                <input type="checkbox" :checked="isAllSelected"
                                    @change="selectAll(filteredBookings.map(b => b.documentId || b.id))"
                                    class="rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer">
                            </th>
                            <th class="text-left py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Viaggio / Utente</th>
                            <th class="text-center py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Stato</th>
                            <th
                                class="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                                Data</th>
                            <th class="text-right py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Importo</th>
                            <th class="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="booking in filteredBookings" :key="booking.documentId || booking.id"
                            class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                            :class="{ 'bg-primary/5': selectedIds.includes(booking.documentId || booking.id) }">
                            <td class="py-4 pl-6 pr-2">
                                <input type="checkbox" :checked="selectedIds.includes(booking.documentId || booking.id)"
                                    @change="toggleSelect(booking.documentId || booking.id)"
                                    class="rounded border-slate-300 text-primary focus:ring-primary/20">
                            </td>
                            <td class="py-4 px-2">
                                <div class="flex flex-col">
                                    <span class="font-bold text-slate-800">{{ getTripTitle(booking) }}</span>
                                    <div class="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                        <User class="w-3 h-3" />
                                        {{ getUserName(booking) }}
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-4 text-center">
                                <Badge :class="[statusBadge(booking.status).class, 'border-none font-bold']">
                                    {{ statusBadge(booking.status).label }}
                                </Badge>
                            </td>
                            <td class="py-4 px-4 hidden md:table-cell">
                                <div class="flex items-center gap-1.5 text-sm text-slate-500">
                                    <Clock class="w-3.5 h-3.5" />
                                    {{ formatDate(booking.createdAt) }}
                                </div>
                            </td>
                            <td class="py-4 px-4 text-right">
                                <span class="font-bold text-slate-800">€{{ getAmount(booking) }}</span>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="openDetails(booking)"
                                        class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                        title="Vedi Dettagli">
                                        <Eye class="w-4 h-4" />
                                    </button>

                                    <!-- Actions based on status -->
                                    <template v-if="booking.status === 'pending'">
                                        <button @click="updateStatus(booking, 'confirmed')"
                                            :disabled="processingId === (booking.documentId || booking.id)"
                                            class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                                            title="Conferma Manualmente">
                                            <Loader2 v-if="processingId === (booking.documentId || booking.id)"
                                                class="w-4 h-4 animate-spin" />
                                            <CheckCircle v-else class="w-4 h-4" />
                                        </button>
                                    </template>

                                    <button v-if="booking.status !== 'cancelled'"
                                        @click="updateStatus(booking, 'cancelled')"
                                        :disabled="processingId === (booking.documentId || booking.id)"
                                        class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                        title="Annulla Prenotazione">
                                        <Loader2 v-if="processingId === (booking.documentId || booking.id)"
                                            class="w-4 h-4 animate-spin" />
                                        <XCircle v-else class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>

        <!-- Details Modal -->
        <Teleport to="body">
            <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
                enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="selectedBooking" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="selectedBooking = null"></div>
                    <div class="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <!-- Modal Header -->
                        <div
                            class="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex items-center justify-between z-10">
                            <div>
                                <h2 class="text-xl font-black text-slate-900">Dettagli Prenotazione</h2>
                                <p class="text-sm text-slate-500 font-medium">ID: {{ selectedBooking.id }}</p>
                            </div>
                            <button @click="selectedBooking = null"
                                class="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                                <X class="w-5 h-5" />
                            </button>
                        </div>

                        <div class="p-6 space-y-8">
                            <!-- Status & Main Info -->
                            <div
                                class="bg-slate-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                                        <Ticket class="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold text-slate-400 uppercase mb-1">Stato Attuale</p>
                                        <Badge
                                            :class="[statusBadge(selectedBooking.status).class, 'border-none font-bold text-base px-3 py-1']">
                                            {{ statusBadge(selectedBooking.status).label }}
                                        </Badge>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-xs font-bold text-slate-400 uppercase mb-1">Importo Versato</p>
                                    <p class="text-2xl font-black text-slate-900">€{{ getAmount(selectedBooking) }}</p>
                                    <p class="text-xs text-slate-400 font-medium">Il {{
                                        formatDate(selectedBooking.createdAt) }}
                                    </p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <!-- Trip Info -->
                                <div>
                                    <h3
                                        class="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                                        <MapPin class="w-4 h-4 text-primary" /> Info Viaggio
                                    </h3>
                                    <div class="space-y-3">
                                        <div class="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                            <p class="text-xs text-slate-400 font-bold uppercase mb-1">Titolo</p>
                                            <p class="font-bold text-slate-800">{{ getTripTitle(selectedBooking) }}</p>
                                        </div>
                                        <div class="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                            <p class="text-xs text-slate-400 font-bold uppercase mb-1">Destinazione</p>
                                            <p class="font-bold text-slate-800">{{ getTripDestination(selectedBooking)
                                                }}</p>
                                        </div>
                                        <div
                                            class="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex gap-4">
                                            <div>
                                                <p class="text-xs text-slate-400 font-bold uppercase mb-1">Partenza</p>
                                                <p class="font-bold text-slate-800 flex items-center gap-2">
                                                    <Calendar class="w-3.5 h-3.5 text-slate-400" />
                                                    {{ formatSimpleDate(selectedBooking.offer?.startDate) || '—' }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="text-xs text-slate-400 font-bold uppercase mb-1">Ritorno</p>
                                                <p class="font-bold text-slate-800 flex items-center gap-2">
                                                    <Calendar class="w-3.5 h-3.5 text-slate-400" />
                                                    {{ formatSimpleDate(selectedBooking.offer?.endDate) || '—' }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- User Info -->
                                <div>
                                    <h3
                                        class="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                                        <User class="w-4 h-4 text-primary" /> Info Cliente
                                    </h3>
                                    <div class="space-y-3">
                                        <div class="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                            <p class="text-xs text-slate-400 font-bold uppercase mb-1">Prenotato da</p>
                                            <p class="font-bold text-slate-800">{{ getUserName(selectedBooking) }}</p>
                                        </div>
                                        <div class="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                            <p class="text-xs text-slate-400 font-bold uppercase mb-1">Email</p>
                                            <p class="font-bold text-slate-800 flex items-center gap-2">
                                                <Mail class="w-3.5 h-3.5 text-slate-400" />
                                                {{ getUserEmail(selectedBooking) }}
                                            </p>
                                        </div>
                                        <div class="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                            <p class="text-xs text-slate-400 font-bold uppercase mb-1">Metodo Pagamento
                                            </p>
                                            <p class="font-bold text-slate-800 flex items-center gap-2">
                                                <CreditCard class="w-3.5 h-3.5 text-slate-400" />
                                                Stripe (Carta di Credito)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Participants List -->
                            <div v-if="selectedBooking.participants && selectedBooking.participants.length > 0">
                                <h3
                                    class="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                                    <Users class="w-4 h-4 text-primary" /> Partecipanti ({{
                                        selectedBooking.participants.length
                                    }})
                                </h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div v-for="(p, i) in selectedBooking.participants" :key="i"
                                        class="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <div class="flex items-center gap-3 mb-2">
                                            <div
                                                class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {{ Number(i) + 1 }}
                                            </div>
                                            <p class="font-bold text-slate-800">{{ p.firstName }} {{ p.lastName }}</p>
                                        </div>
                                        <div class="text-xs text-slate-500 space-y-1 ml-11">
                                            <p v-if="p.email">Email: {{ p.email }}</p>
                                            <p v-if="p.phone">Tel: {{ p.phone }}</p>
                                            <p v-if="p.fiscalCode">CF: {{ p.fiscalCode }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Modal Footer -->
                        <div class="bg-slate-50 p-6 flex justify-end gap-3 rounded-b-3xl">
                            <template v-if="selectedBooking.status === 'pending'">
                                <button @click="updateStatus(selectedBooking, 'confirmed')"
                                    class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20">
                                    Conferma Prenotazione
                                </button>
                            </template>
                            <button v-if="selectedBooking.status !== 'cancelled'"
                                @click="updateStatus(selectedBooking, 'cancelled')"
                                class="px-6 py-3 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-slate-600 font-bold rounded-xl transition-all">
                                Annulla Prenotazione
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>
