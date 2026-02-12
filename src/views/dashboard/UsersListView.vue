<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import { Users, Trash2, Loader2, Mail } from 'lucide-vue-next'

const { token, user: currentUser } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL

const users = ref<any[]>([])
const roles = ref<any[]>([])
const loading = ref(true)
const deleting = ref<number | null>(null)
const updatingRole = ref<number | null>(null)

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
    } catch (err) {
        console.error('Role change error:', err)
        alert('Errore nel cambio ruolo')
    } finally {
        updatingRole.value = null
    }
}

const deleteUser = async (user: any) => {
    if (user.id === currentUser.value?.id) {
        alert('Non puoi eliminare il tuo stesso account!')
        return
    }
    if (!confirm(`Eliminare l'utente "${user.username}"?`)) return
    deleting.value = user.id
    try {
        const res = await fetch(`${apiUrl}/api/users/${user.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token.value}` },
        })
        if (!res.ok) throw new Error('Errore nella cancellazione')
        users.value = users.value.filter((u: any) => u.id !== user.id)
    } catch (err) {
        console.error('Delete error:', err)
        alert('Errore nella cancellazione')
    } finally {
        deleting.value = null
    }
}

const getRoleId = (user: any) => {
    return user.role?.id || user.role?.data?.id || null
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
        <div class="mb-8">
            <h1 class="text-2xl font-black text-slate-900">Utenti</h1>
            <p class="text-slate-500 text-sm font-medium">Gestisci gli utenti e i loro ruoli</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>

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
                            <th class="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                        <tr v-for="u in users" :key="u.id"
                            class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td class="py-4 px-6">
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
</template>
