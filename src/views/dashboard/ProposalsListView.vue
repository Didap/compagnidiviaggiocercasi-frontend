<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { Map, Loader2, Eye, X, Check, XCircle, Search, Clock } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { token } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL
const toast = useToast()

const proposals = ref<any[]>([])
const loading = ref(true)
const updating = ref<number | null>(null)
const selectedProposal = ref<any>(null)
const searchQuery = ref('')
const filterStatus = ref('all')

const fetchProposals = async () => {
    loading.value = true
    try {
        const res = await fetch(`${apiUrl}/api/trip-proposals?populate[user][fields]=username,email&sort=createdAt:desc&pagination[pageSize]=50`, {
            headers: { Authorization: `Bearer ${token.value}` }
        })
        const data = await res.json()
        proposals.value = data.data || []
    } catch (err) {
        console.error('Error fetching proposals:', err)
        toast.error('Errore nel caricamento delle proposte')
    } finally {
        loading.value = false
    }
}

const updateStatus = async (proposalId: number, status: string) => {
    updating.value = proposalId
    try {
        const res = await fetch(`${apiUrl}/api/trip-proposals/${proposalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.value}`
            },
            body: JSON.stringify({ data: { status } })
        })

        if (!res.ok) throw new Error('Failed to update status')

        // Update local state
        const index = proposals.value.findIndex(p => p.id === proposalId)
        if (index !== -1) {
            proposals.value[index].attributes.status = status
            // Update selected proposal if open
            if (selectedProposal.value?.id === proposalId) {
                selectedProposal.value.attributes.status = status
            }
        }

        toast.success(`Stato aggiornato a "${status}"`)
    } catch (err) {
        console.error('Error updating status:', err)
        toast.error('Errore nell\'aggiornamento dello stato')
    } finally {
        updating.value = null
    }
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'pending': return { label: 'In Attesa', class: 'bg-amber-100 text-amber-700' }
        case 'reviewed': return { label: 'In Revisione', class: 'bg-blue-100 text-blue-700' }
        case 'accepted': return { label: 'Accettata', class: 'bg-green-100 text-green-700' }
        case 'rejected': return { label: 'Rifiutata', class: 'bg-red-100 text-red-700' }
        default: return { label: status, class: 'bg-slate-100 text-slate-700' }
    }
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

const getCoordinationText = (proposal: any) => {
    return proposal.attributes.wantsToCoordinate
        ? 'Disponibile a coordinare il viaggio'
        : 'Partecipante semplice'
}

const getUsername = (proposal: any) => {
    return proposal.attributes.user?.data?.attributes?.username || 'Utente sconosciuto'
}

const getUserInitial = (proposal: any) => {
    return proposal.attributes.user?.data?.attributes?.username?.charAt(0).toUpperCase() || 'U'
}

const filteredProposals = computed(() => {
    let result = proposals.value

    if (filterStatus.value !== 'all') {
        result = result.filter(p => p.attributes.status === filterStatus.value)
    }

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(p =>
            p.attributes.destination.toLowerCase().includes(q) ||
            p.attributes.user?.data?.attributes?.username.toLowerCase().includes(q)
        )
    }

    return result
})

onMounted(fetchProposals)
</script>

<template>
    <div class="p-6 lg:p-10">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-2xl font-black text-slate-900">Proposte di Viaggio</h1>
            <p class="text-slate-500 text-sm font-medium">Gestisci le richieste di nuovi viaggi dagli utenti</p>
        </div>

        <!-- Filters -->
        <Card class="mb-6 rounded-2xl border-none shadow-sm">
            <div class="p-4 flex flex-col sm:flex-row gap-4">
                <div class="relative flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input v-model="searchQuery" type="text" placeholder="Cerca destinazione o utente..."
                        class="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div class="sm:w-48">
                    <select v-model="filterStatus"
                        class="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                        <option value="all">Tutti gli stati</option>
                        <option value="pending">In Attesa</option>
                        <option value="reviewed">In Revisione</option>
                        <option value="accepted">Accettate</option>
                        <option value="rejected">Rifiutate</option>
                    </select>
                </div>
            </div>
        </Card>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-12">
            <Loader2 class="w-8 h-8 text-primary animate-spin" />
        </div>

        <!-- Empty -->
        <Card v-else-if="proposals.length === 0" class="rounded-2xl border-none shadow-sm">
            <CardContent class="p-12 text-center">
                <Map class="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p class="text-lg font-bold text-slate-600">Nessuna proposta</p>
                <p class="text-sm text-slate-400 mt-1">Le proposte degli utenti appariranno qui</p>
            </CardContent>
        </Card>

        <!-- List -->
        <div v-else class="grid gap-4">
            <Card v-for="proposal in filteredProposals" :key="proposal.id"
                class="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                @click="selectedProposal = proposal">
                <CardContent class="p-6">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-3 mb-2">
                                <h3 class="font-bold text-lg text-slate-800 truncate">{{ proposal.attributes.destination
                                }}</h3>
                                <Badge
                                    :class="[getStatusBadge(proposal.attributes.status).class, 'border-none font-bold text-[10px] uppercase']">
                                    {{ getStatusBadge(proposal.attributes.status).label }}
                                </Badge>
                            </div>
                            <div class="flex items-center gap-4 text-sm text-slate-500 mb-3">
                                <span class="flex items-center gap-1.5">
                                    <Clock class="w-3.5 h-3.5" />
                                    {{ proposal.attributes.preferredPeriod || 'Periodo flessibile' }}
                                </span>
                                <span v-if="proposal.attributes.budget">
                                    Budget: €{{ proposal.attributes.budget }}
                                </span>
                            </div>
                            <p class="text-sm text-slate-600 line-clamp-2">{{ proposal.attributes.description }}</p>

                            <div class="mt-4 flex items-center gap-2 text-xs text-slate-400">
                                <span class="font-bold text-slate-600">{{
                                    getUsername(proposal)
                                    }}</span>
                                <span>•</span>
                                <span>{{ formatDate(proposal.attributes.createdAt) }}</span>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                class="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
                                <Eye class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="selectedProposal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="selectedProposal = null"></div>
                <div
                    class="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    <!-- Modal Header -->
                    <div
                        class="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
                        <div>
                            <h2 class="text-xl font-black text-slate-900">Dettagli Proposta</h2>
                            <p class="text-sm text-slate-500 font-medium">ID: #{{ selectedProposal.id }}</p>
                        </div>
                        <button @click="selectedProposal = null"
                            class="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Modal Content -->
                    <div class="overflow-y-auto p-6 space-y-6">
                        <!-- Status Bar -->
                        <div class="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                            <Badge
                                :class="[getStatusBadge(selectedProposal.attributes.status).class, 'border-none font-bold']">
                                {{ getStatusBadge(selectedProposal.attributes.status).label }}
                            </Badge>

                            <div class="flex items-center gap-2">
                                <button v-if="selectedProposal.attributes.status === 'pending'"
                                    @click="updateStatus(selectedProposal.id, 'reviewed')"
                                    :disabled="updating === selectedProposal.id"
                                    class="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-bold transition-colors">
                                    Segna come letto
                                </button>
                                <button v-if="selectedProposal.attributes.status !== 'accepted'"
                                    @click="updateStatus(selectedProposal.id, 'accepted')"
                                    :disabled="updating === selectedProposal.id"
                                    class="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                                    <Check class="w-3.5 h-3.5" /> Accetta
                                </button>
                                <button v-if="selectedProposal.attributes.status !== 'rejected'"
                                    @click="updateStatus(selectedProposal.id, 'rejected')"
                                    :disabled="updating === selectedProposal.id"
                                    class="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                                    <XCircle class="w-3.5 h-3.5" /> Rifiuta
                                </button>
                            </div>
                        </div>

                        <!-- Main Info -->
                        <div class="space-y-4">
                            <div>
                                <h3 class="text-xs font-bold text-slate-400 uppercase mb-1">Destinazione</h3>
                                <p class="text-xl font-bold text-slate-900">{{ selectedProposal.attributes.destination
                                }}</p>
                            </div>

                            <div class="p-4 bg-slate-50 rounded-xl space-y-3">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <p class="text-xs font-bold text-slate-400 uppercase mb-1">Periodo Preferito</p>
                                        <p class="font-medium text-slate-800">{{
                                            selectedProposal.attributes.preferredPeriod || 'Non specificato' }}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold text-slate-400 uppercase mb-1">Budget Stimato</p>
                                        <p class="font-medium text-slate-800">
                                            {{ selectedProposal.attributes.budget ?
                                                `€${selectedProposal.attributes.budget}` : 'Non specificato' }}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-400 uppercase mb-1">Coordinamento</p>
                                    <p class="font-medium text-slate-800">
                                        {{ getCoordinationText(selectedProposal) }}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 class="text-xs font-bold text-slate-400 uppercase mb-2">Descrizione idea</h3>
                                <div
                                    class="p-4 border border-slate-100 rounded-xl bg-white text-slate-600 leading-relaxed text-sm">
                                    {{ selectedProposal.attributes.description }}
                                </div>
                            </div>

                            <!-- User Info -->
                            <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <div
                                    class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                    {{ getUserInitial(selectedProposal) }}
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-slate-900">
                                        {{ getUsername(selectedProposal) }}
                                    </p>
                                    <p class="text-xs text-slate-400">
                                        {{ selectedProposal.attributes.user?.data?.attributes?.email }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
