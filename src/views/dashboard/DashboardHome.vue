<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Button from '@/components/ui/button/Button.vue'
import { RouterLink } from 'vue-router'
import { Map, Tag, Star, Users, Plus, ArrowRight } from 'lucide-vue-next'

const { token, fullName } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL

const stats = ref({ trips: 0, offers: 0, reviews: 0, users: 0 })
const loading = ref(true)

const fetchStats = async () => {
    loading.value = true
    const headers = { Authorization: `Bearer ${token.value}` }
    try {
        const [tripsRes, offersRes, reviewsRes, usersRes] = await Promise.all([
            fetch(`${apiUrl}/api/trips?pagination[pageSize]=1`, { headers }),
            fetch(`${apiUrl}/api/offers?pagination[pageSize]=1`, { headers }),
            fetch(`${apiUrl}/api/reviews?pagination[pageSize]=1`, { headers }),
            fetch(`${apiUrl}/api/users?pagination[pageSize]=1`, { headers }),
        ])
        const [tripsData, offersData, reviewsData, usersData] = await Promise.all([
            tripsRes.json(), offersRes.json(), reviewsRes.json(), usersRes.json(),
        ])
        stats.value = {
            trips: tripsData.meta?.pagination?.total || tripsData.data?.length || 0,
            offers: offersData.meta?.pagination?.total || offersData.data?.length || 0,
            reviews: reviewsData.meta?.pagination?.total || reviewsData.data?.length || 0,
            users: Array.isArray(usersData) ? usersData.length : (usersData.meta?.pagination?.total || 0),
        }
    } catch (err) {
        console.error('Stats error:', err)
    } finally {
        loading.value = false
    }
}

onMounted(fetchStats)

const statCards = [
    { key: 'trips', label: 'Viaggi', icon: Map, color: 'primary', link: '/dashboard/viaggi' },
    { key: 'offers', label: 'Offerte', icon: Tag, color: 'secondary', link: '/dashboard/offerte' },
    { key: 'reviews', label: 'Recensioni', icon: Star, color: 'amber-500', link: '/dashboard/recensioni' },
    { key: 'users', label: 'Utenti', icon: Users, color: 'violet-500', link: '/dashboard/utenti' },
]
</script>

<template>
    <div class="p-6 lg:p-10">
        <!-- Header -->
        <div class="mb-10">
            <h1 class="text-3xl font-black text-slate-900 mb-1">Benvenuto, {{ fullName }}</h1>
            <p class="text-slate-500 font-medium">Panoramica della piattaforma</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
            <RouterLink v-for="card in statCards" :key="card.key" :to="card.link" class="group block">
                <Card
                    class="rounded-2xl border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <CardContent class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <div :class="`w-12 h-12 rounded-2xl bg-${card.color}/10 flex items-center justify-center`">
                                <component :is="card.icon" :class="`w-6 h-6 text-${card.color}`" />
                            </div>
                            <ArrowRight
                                class="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <div v-if="loading" class="h-9 w-16 bg-slate-100 rounded-lg animate-pulse mb-1"></div>
                        <p v-else class="text-3xl font-black text-slate-900 mb-1">
                            {{ (stats as any)[card.key] }}
                        </p>
                        <p class="text-sm font-semibold text-slate-400">{{ card.label }}</p>
                    </CardContent>
                </Card>
            </RouterLink>
        </div>

        <!-- Quick Actions -->
        <h2 class="text-lg font-bold text-slate-800 mb-4">Azioni Rapide</h2>
        <div class="flex flex-wrap gap-3">
            <RouterLink to="/dashboard/viaggi/nuovo">
                <Button class="rounded-2xl px-6 h-11 font-bold shadow-md hover:shadow-primary/30 transition-all gap-2">
                    <Plus class="w-4 h-4" /> Nuovo Viaggio
                </Button>
            </RouterLink>
            <RouterLink to="/dashboard/offerte">
                <Button variant="outline" class="rounded-2xl px-6 h-11 font-bold border-slate-200 gap-2">
                    <Tag class="w-4 h-4" /> Gestisci Offerte
                </Button>
            </RouterLink>
            <RouterLink to="/dashboard/utenti">
                <Button variant="outline" class="rounded-2xl px-6 h-11 font-bold border-slate-200 gap-2">
                    <Users class="w-4 h-4" /> Gestisci Utenti
                </Button>
            </RouterLink>
        </div>
    </div>
</template>
