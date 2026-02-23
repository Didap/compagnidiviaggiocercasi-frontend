<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import { Mail, Trash2, Loader2, Download, Search } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const { token } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL
const toast = useToast()

const subscribers = ref<any[]>([])
const loading = ref(true)
const deleting = ref<number | null>(null)
const searchQuery = ref('')

// Confirm Modal State
const showConfirm = ref(false)
const confirmMessage = ref('')
const itemToDelete = ref<any>(null)

const fetchSubscribers = async () => {
    loading.value = true
    try {
        const res = await fetch(`${apiUrl}/api/newsletter-registrations?sort=createdAt:desc&pagination[pageSize]=100`, {
            headers: { Authorization: `Bearer ${token.value}` }
        })
        const data = await res.json()
        subscribers.value = data.data || []
    } catch (err) {
        console.error('Error fetching subscribers:', err)
        toast.error('Errore nel caricamento degli iscritti')
    } finally {
        loading.value = false
    }
}

const deleteSubscriber = (sub: any) => {
    itemToDelete.value = sub
    confirmMessage.value = `Sei sicuro di voler disiscrivere ${sub.attributes?.email || sub.email}?`
    showConfirm.value = true
}

const confirmDelete = async () => {
    if (!itemToDelete.value) return
    const sub = itemToDelete.value
    showConfirm.value = false
    const id = sub.id

    deleting.value = id
    try {
        const res = await fetch(`${apiUrl}/api/newsletter-registrations/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token.value}` }
        })

        if (!res.ok) throw new Error('Failed to delete')

        subscribers.value = subscribers.value.filter(s => s.id !== id)
        toast.success('Iscritto rimosso con successo')
    } catch (err) {
        console.error('Error deleting subscriber:', err)
        toast.error('Errore nella rimozione')
    } finally {
        deleting.value = null
        itemToDelete.value = null
    }
}

const exportCSV = () => {
    const headers = ['Email', 'Data Iscrizione']
    const rows = subscribers.value.map(s => [
        s.attributes?.email || s.email,
        new Date(s.attributes?.createdAt || s.createdAt).toLocaleDateString()
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(e => e.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'newsletter_subscribers.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

const filteredSubscribers = computed(() => {
    if (!searchQuery.value) return subscribers.value
    const q = searchQuery.value.toLowerCase()
    return subscribers.value.filter(s =>
        (s.attributes?.email || s.email).toLowerCase().includes(q)
    )
})

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

onMounted(fetchSubscribers)
</script>

<template>
    <div class="p-6 lg:p-10">
        <!-- Header -->
        <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-black text-slate-900">Newsletter</h1>
                <p class="text-slate-500 text-sm font-medium">Gestisci gli iscritti alla newsletter</p>
            </div>
            <button @click="exportCSV" :disabled="subscribers.length === 0"
                class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50">
                <Download class="w-4 h-4" />
                Esporta CSV
            </button>
        </div>

        <!-- Filters -->
        <Card class="mb-6 rounded-2xl border-none shadow-sm">
            <div class="p-4">
                <div class="relative">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input v-model="searchQuery" type="text" placeholder="Cerca per email..."
                        class="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
            </div>
        </Card>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-12">
            <Loader2 class="w-8 h-8 text-primary animate-spin" />
        </div>

        <!-- Empty -->
        <Card v-else-if="subscribers.length === 0" class="rounded-2xl border-none shadow-sm">
            <CardContent class="p-12 text-center">
                <Mail class="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p class="text-lg font-bold text-slate-600">Nessun iscritto</p>
                <p class="text-sm text-slate-400 mt-1">Gli utenti iscritti appariranno qui</p>
            </CardContent>
        </Card>

        <!-- List -->
        <Card v-else class="rounded-2xl border-none shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-slate-100 bg-slate-50/50">
                            <th class="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Email</th>
                            <th class="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Data Iscrizione</th>
                            <th class="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="sub in filteredSubscribers" :key="sub.id"
                            class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td class="py-4 px-6">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Mail class="w-4 h-4" />
                                    </div>
                                    <span class="font-bold text-slate-700">{{ sub.attributes?.email || sub.email
                                        }}</span>
                                </div>
                            </td>
                            <td class="py-4 px-6 text-sm text-slate-500">
                                {{ formatDate(sub.attributes?.createdAt || sub.createdAt) }}
                            </td>
                            <td class="py-4 px-6 text-right">
                                <button @click="deleteSubscriber(sub)" :disabled="deleting === sub.id"
                                    class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                                    <Loader2 v-if="deleting === sub.id" class="w-4 h-4 animate-spin" />
                                    <Trash2 v-else class="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>

    <ConfirmDialog :isOpen="showConfirm" title="Rimuovi Iscritto" :message="confirmMessage" confirmText="Rimuovi"
        variant="danger" @close="showConfirm = false" @confirm="confirmDelete" />
</template>
