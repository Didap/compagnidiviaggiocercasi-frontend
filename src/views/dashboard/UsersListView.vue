<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import { Users, Trash2, Loader2, Mail, Eye, X, Search } from 'lucide-vue-next'
import Badge from '@/components/ui/badge/Badge.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import { useBulkActions } from '@/composables/useBulkActions'
import { TableSkeleton } from '@/components/ui/skeleton'

const { token, user: currentUser } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL
const toast = useToast()

const users = ref<any[]>([])
const roles = ref<any[]>([])
const loading = ref(true)
const deleting = ref<number | null>(null)
const updatingRole = ref<number | null>(null)
const selectedUser = ref<any>(null)
const userBookings = ref<any[]>([])
const loadingDetails = ref(false)

// Confirm Modal State
const showConfirm = ref(false)
const confirmMessage = ref('')
const itemToDelete = ref<any>(null)

// Bulk Actions
const { selectedIds, toggleSelect, selectAll, deselectAll, isAllSelected } = useBulkActions(users)
const bulkDeleting = ref(false)
const searchQuery = ref('')

const fetchData = async () => {
    loading.value = true
    try {
        const [usersRes, rolesRes] = await Promise.all([
            fetch(`${apiUrl}/api/users?populate=role`, {
                headers: { Authorization: `Bearer ${token.value}` },
            }),
            fetch(`${apiUrl}/api/users-permissions/roles`, {
                headers: { Authorization: `Bearer ${token.value}` },
            }),
        ])
        const usersData = await usersRes.json()
        const rolesData = await rolesRes.json()
        users.value = Array.isArray(usersData) ? usersData : usersData.data || []
        roles.value = rolesData.roles || rolesData.data || []
    } catch (err) {
        console.error('Error:', err)
    } finally {
        loading.value = false
    }
}

const changeRole = async (userId: number, roleId: number) => {
    updatingRole.value = userId
    try {
        const res = await fetch(`${apiUrl}/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({ role: roleId }),
        })
        if (!res.ok) throw new Error('Errore nel cambio ruolo')
        await fetchData()
        toast.success('Ruolo aggiornato con successo')
    } catch (err) {
        console.error('Role change error:', err)
        toast.error('Errore nel cambio ruolo')
    } finally {
        updatingRole.value = null
    }
}

const deleteUser = (user: any) => {
    if (user.id === currentUser.value?.id) {
        toast.warning('Non puoi eliminare il tuo stesso account!')
        return
    }
    itemToDelete.value = user
    confirmMessage.value = `Sei sicuro di voler eliminare l'utente "${user.username}"? Questa azione è irreversibile.`
    showConfirm.value = true
}

const confirmDelete = async () => {
    if (!itemToDelete.value) return
    const user = itemToDelete.value
    showConfirm.value = false

    deleting.value = user.id
    try {
        const res = await fetch(`${apiUrl}/api/users/${user.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token.value}` },
        })
        if (!res.ok) throw new Error('Errore nella cancellazione')
        users.value = users.value.filter((u: any) => u.id !== user.id)

        // Remove from selection if selected
        if (selectedIds.value.includes(user.id)) {
            toggleSelect(user.id)
        }

        toast.success(`Utente "${user.username}" eliminato con successo`)
    } catch (err) {
        console.error('Delete error:', err)
        toast.error('Errore nella cancellazione')
    } finally {
        deleting.value = null
        itemToDelete.value = null
    }
}

const bulkDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.value.length} utenti?`)) return

    // Check if trying to delete self
    if (selectedIds.value.includes(currentUser.value?.id)) {
        toast.warning('Non puoi eliminare il tuo stesso account nella selezione multipla!')
        return
    }

    bulkDeleting.value = true
    try {
        await Promise.all(selectedIds.value.map(id =>
            fetch(`${apiUrl}/api/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token.value}` },
            })
        ))

        // Refresh local data
        users.value = users.value.filter(u => !selectedIds.value.includes(u.id))
        deselectAll()
        toast.success('Utenti eliminati con successo')
    } catch (err) {
        console.error('Bulk delete error:', err)
        toast.error('Errore durante l\'eliminazione multipla')
    } finally {
        bulkDeleting.value = false
    }
}

const getRoleId = (user: any) => {
    return user.role?.id || user.role?.data?.id || null
}

const openUserDetails = async (user: any) => {
    selectedUser.value = user
    loadingDetails.value = true
    userBookings.value = []
    try {
        const res = await fetch(`${apiUrl}/api/bookings?filters[user][id]=${user.id}&populate[offer][populate]=trip&sort=createdAt:desc`, {
            headers: { Authorization: `Bearer ${token.value}` }
        })
        const data = await res.json()
        userBookings.value = data.data || []
    } catch (err) {
        console.error('Error fetching user bookings:', err)
    } finally {
        loadingDetails.value = false
    }
}

const getTotalSpent = () => {
    return userBookings.value.reduce((sum, b) => {
        if (b.status === 'cancelled') return sum
        const price = b.offer?.depositPrice || 0
        const count = (b.participants && b.participants.length > 0) ? b.participants.length : 1
        return sum + (price * count)
    }, 0)
}

const statusBadge = (status: string) => {
    switch (status) {
        case 'confirmed': return { label: 'Confermata', class: 'bg-green-100 text-green-700' }
        case 'pending': return { label: 'In Attesa', class: 'bg-amber-100 text-amber-700' }
        case 'cancelled': return { label: 'Cancellata', class: 'bg-red-100 text-red-700' }
        default: return { label: status, class: 'bg-slate-100 text-slate-700' }
    }
}

const formatDate = (d: string) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value
    const q = searchQuery.value.toLowerCase()
    return users.value.filter(u =>
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.firstName && u.firstName.toLowerCase().includes(q)) ||
        (u.lastName && u.lastName.toLowerCase().includes(q))
    )
})


const getTripName = (booking: any) => {
    return booking.offer?.trip?.title || 'Viaggio sconosciuto'
}

onMounted(fetchData)
</script>

<template>
    <div class="p-6 lg:p-10">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-2xl font-black text-slate-900">Utenti</h1>
            <p class="text-slate-500 text-sm font-medium">Gestisci gli utenti e i loro ruoli</p>
        </div>

        <!-- Filters & Bulk Action Bar -->
        <Card class="mb-6 rounded-2xl border-none shadow-sm">
            <div class="p-4 flex gap-4">
                <div class="relative flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input v-model="searchQuery" type="text" placeholder="Cerca utente per nome o email..."
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
        <TableSkeleton v-if="loading" :rows="5" :columns="6" />

        <!-- Empty -->
        <Card v-else-if="users.length === 0" class="rounded-2xl border-none shadow-sm">
            <CardContent class="p-12 text-center">
                <Users class="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p class="text-lg font-bold text-slate-600">Nessun utente trovato</p>
            </CardContent>
        </Card>

        <!-- Table -->
        <Card v-else class="rounded-2xl border-none shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-slate-100">
                            <th class="w-10 py-4 pl-6 pr-2">
                                <input type="checkbox" :checked="isAllSelected"
                                    @change="selectAll(users.map(u => u.id))"
                                    class="rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer">
                            </th>
                            <th class="text-left py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Utente</th>
                            <th
                                class="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                                Email</th>
                            <th class="text-center py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Ruolo</th>
                            <th
                                class="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                                Registrato</th>
                            <th class="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="u in filteredUsers" :key="u.id"
                            class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                            :class="{ 'bg-primary/5': selectedIds.includes(u.id) }">
                            <td class="py-4 pl-6 pr-2">
                                <input type="checkbox" :checked="selectedIds.includes(u.id)"
                                    @change="toggleSelect(u.id)"
                                    class="rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer">
                            </td>
                            <td class="py-4 px-2">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                                        <span class="text-xs font-black text-white">
                                            {{ u.firstName?.charAt(0)?.toUpperCase() ||
                                                u.username?.charAt(0)?.toUpperCase() || '?' }}
                                        </span>
                                    </div>
                                    <div class="min-w-0">
                                        <p class="font-bold text-slate-800 truncate">
                                            {{ u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username
                                            }}
                                        </p>
                                        <p class="text-xs text-slate-400 truncate md:hidden">{{ u.email }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-4 hidden md:table-cell">
                                <div class="flex items-center gap-1.5 text-sm text-slate-500">
                                    <Mail class="w-3.5 h-3.5 flex-shrink-0" />
                                    <span class="truncate">{{ u.email }}</span>
                                </div>
                            </td>
                            <td class="py-4 px-4 text-center">
                                <div class="inline-flex items-center gap-2">
                                    <Loader2 v-if="updatingRole === u.id" class="w-4 h-4 animate-spin text-primary" />
                                    <select v-else :value="getRoleId(u)"
                                        @change="changeRole(u.id, Number(($event.target as HTMLSelectElement).value))"
                                        :disabled="u.id === currentUser?.id"
                                        class="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                        <option v-for="r in roles" :key="r.id" :value="r.id">
                                            {{ r.name }}
                                        </option>
                                    </select>
                                </div>
                            </td>
                            <td class="py-4 px-4 hidden lg:table-cell">
                                <span class="text-sm text-slate-500">{{ formatDate(u.createdAt) }}</span>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center justify-end">
                                    <button @click="openUserDetails(u)"
                                        class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors">
                                        <Eye class="w-4 h-4" />
                                    </button>
                                    <button @click="deleteUser(u)"
                                        :disabled="deleting === u.id || u.id === currentUser?.id"
                                        class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                        <Loader2 v-if="deleting === u.id" class="w-4 h-4 animate-spin" />
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

    <!-- User Details Modal -->
    <Teleport to="body">
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="selectedUser" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="selectedUser = null"></div>
                <div
                    class="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    <!-- Header -->
                    <div
                        class="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
                        <div>
                            <h2 class="text-xl font-black text-slate-900">Dettagli Utente</h2>
                            <p class="text-sm text-slate-500 font-medium">Informazioni e storico prenotazioni</p>
                        </div>
                        <button @click="selectedUser = null"
                            class="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="overflow-y-auto p-6 space-y-6">
                        <!-- Profile Card -->
                        <div class="bg-slate-50 p-6 rounded-2xl flex items-center gap-4">
                            <div
                                class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-2xl">
                                {{ selectedUser.firstName?.charAt(0)?.toUpperCase() ||
                                    selectedUser.username?.charAt(0)?.toUpperCase() }}
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-slate-900">
                                    {{ selectedUser.firstName && selectedUser.lastName ? `${selectedUser.firstName}
                                    ${selectedUser.lastName}` : selectedUser.username }}
                                </h3>
                                <div class="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                    <span class="flex items-center gap-1">
                                        <Mail class="w-3.5 h-3.5" /> {{ selectedUser.email }}
                                    </span>
                                    <span>•</span>
                                    <span>Iscritto il {{ formatDate(selectedUser.createdAt) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Stats -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-4 rounded-xl border border-slate-100 bg-white">
                                <p class="text-xs font-bold text-slate-400 uppercase mb-1">Prenotazioni Totali</p>
                                <p class="text-2xl font-black text-slate-900">{{ userBookings.length }}</p>
                            </div>
                            <div class="p-4 rounded-xl border border-slate-100 bg-white">
                                <p class="text-xs font-bold text-slate-400 uppercase mb-1">Spesa Complessiva</p>
                                <div v-if="loadingDetails" class="h-8 w-24 bg-slate-100 rounded animate-pulse"></div>
                                <p v-else class="text-2xl font-black text-emerald-600">€{{
                                    getTotalSpent().toLocaleString('it-IT') }}</p>
                            </div>
                        </div>

                        <!-- Bookings History -->
                        <div>
                            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Storico Viaggi
                            </h3>

                            <div v-if="loadingDetails" class="flex justify-center py-8">
                                <Loader2 class="w-8 h-8 text-primary animate-spin" />
                            </div>

                            <div v-else-if="userBookings.length === 0" class="text-center py-8 text-slate-400">
                                <p>Nessuna prenotazione trovata.</p>
                            </div>

                            <div v-else class="space-y-3">
                                <div v-for="b in userBookings" :key="b.id"
                                    class="p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/20 transition-colors flex items-center justify-between group">
                                    <div>
                                        <p class="font-bold text-slate-800 text-sm">{{ getTripName(b) }}</p>
                                        <p class="text-xs text-slate-400 mt-0.5">{{ formatDate(b.createdAt) }}</p>
                                    </div>
                                    <div class="text-right">
                                        <Badge
                                            :class="[statusBadge(b.status).class, 'border-none font-bold text-[10px] uppercase mb-1']">
                                            {{ statusBadge(b.status).label }}
                                        </Badge>
                                        <p class="text-xs font-bold text-slate-600">
                                            €{{ (b.offer?.depositPrice || 0) * (b.participants?.length || 1) }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- Confirm Dialog -->
    <ConfirmDialog :isOpen="showConfirm" title="Elimina Utente" :message="confirmMessage"
        confirmText="Elimina definitivamente" variant="danger" @close="showConfirm = false" @confirm="confirmDelete" />
</template>
