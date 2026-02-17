<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { RouterLink } from 'vue-router'
import { Map as MapIcon, Tag, Star, Users, Plus, ArrowRight, Ticket, TrendingUp, Clock } from 'lucide-vue-next'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
)

const { token, fullName } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL

const stats = ref({ trips: 0, offers: 0, reviews: 0, users: 0, revenue: 0, pendingRevenue: 0 })
const recentBookings = ref<any[]>([])
const loading = ref(true)
const revenueHistory = ref<any[]>([])

const fetchStats = async () => {
    loading.value = true
    const headers = { Authorization: `Bearer ${token.value}` }
    try {
        const [tripsRes, offersRes, reviewsRes, usersRes, bookingsRes] = await Promise.all([
            fetch(`${apiUrl}/api/trips?pagination[pageSize]=1`, { headers }),
            fetch(`${apiUrl}/api/offers?pagination[pageSize]=1`, { headers }),
            fetch(`${apiUrl}/api/reviews?pagination[pageSize]=1`, { headers }),
            fetch(`${apiUrl}/api/users?pagination[pageSize]=1`, { headers }),
            fetch(`${apiUrl}/api/bookings?populate[offer][fields][0]=depositPrice&populate[offer][populate][0]=trip&populate[user][fields][0]=username&populate[user][fields][1]=firstName&populate[user][fields][2]=lastName&populate[participants]=*&sort=createdAt:desc&pagination[limit]=5`, { headers }),
        ])

        const [tripsData, offersData, reviewsData, usersData, bookingsData] = await Promise.all([
            tripsRes.json(), offersRes.json(), reviewsRes.json(), usersRes.json(), bookingsRes.json()
        ])

        // Fetch all confirmed bookings for revenue & chart
        const allBookingsRes = await fetch(`${apiUrl}/api/bookings?filters[status]=confirmed&populate[offer][fields][0]=depositPrice&populate[participants]=*&pagination[pageSize]=1000&sort=createdAt:asc`, { headers })
        const allBookings = await allBookingsRes.json()

        // Calculate Total Revenue
        const revenue = (allBookings.data || []).reduce((sum: number, b: any) => {
            const price = b.offer?.depositPrice || 0
            const count = (b.participants && b.participants.length > 0) ? b.participants.length : 1
            return sum + (price * count)
        }, 0)

        // Calculate Revenue History (Group by Date)
        const historyMap = new Map<string, number>()
            ; (allBookings.data || []).forEach((b: any) => {
                const date = new Date(b.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
                const price = b.offer?.depositPrice || 0
                const count = (b.participants && b.participants.length > 0) ? b.participants.length : 1
                const amount = price * count
                historyMap.set(date, (historyMap.get(date) || 0) + amount)
            })

        // Fill in missing days if needed, but for now just show active days
        revenueHistory.value = Array.from(historyMap.entries()).map(([date, amount]) => ({ date, amount }))

        // Pending revenue
        const pendingBookingsRes = await fetch(`${apiUrl}/api/bookings?filters[status]=pending&populate[offer][fields][0]=depositPrice&populate[participants]=*&pagination[pageSize]=1000`, { headers })
        const pendingBookings = await pendingBookingsRes.json()
        const pendingRevenue = (pendingBookings.data || []).reduce((sum: number, b: any) => {
            const price = b.offer?.depositPrice || 0
            const count = (b.participants && b.participants.length > 0) ? b.participants.length : 1
            return sum + (price * count)
        }, 0)

        // Cancelled bookings count
        const cancelledBookingsRes = await fetch(`${apiUrl}/api/bookings?filters[status]=cancelled&pagination[pageSize]=1`, { headers })
        const cancelledBookingsData = await cancelledBookingsRes.json()
        const cancelledCount = cancelledBookingsData.meta?.pagination?.total || 0

        bookingCounts.value = {
            confirmed: allBookings.data?.length || 0,
            pending: pendingBookings.data?.length || 0,
            cancelled: cancelledCount
        }

        if (bookingsData.data) {
            recentBookings.value = bookingsData.data
        }

        stats.value = {
            trips: tripsData.meta?.pagination?.total || tripsData.data?.length || 0,
            offers: offersData.meta?.pagination?.total || offersData.data?.length || 0,
            reviews: reviewsData.meta?.pagination?.total || reviewsData.data?.length || 0,
            users: Array.isArray(usersData) ? usersData.length : (usersData.meta?.pagination?.total || 0),
            revenue,
            pendingRevenue
        }

        // Fetch Recent Users
        const recentUsersRes = await fetch(`${apiUrl}/api/users?sort=createdAt:desc&pagination[limit]=5`, { headers })
        const recentUsersData = await recentUsersRes.json()
        recentUsers.value = recentUsersData
    } catch (err) {
        console.error('Stats error:', err)
    } finally {
        loading.value = false
    }
}

const recentUsers = ref<any[]>([])

onMounted(fetchStats)

const statCards = [
    { key: 'trips', label: 'Viaggi', icon: MapIcon, color: 'blue-500', link: '/dashboard/viaggi' },
    { key: 'offers', label: 'Offerte', icon: Tag, color: 'emerald-500', link: '/dashboard/offerte' },
    { key: 'reviews', label: 'Recensioni', icon: Star, color: 'amber-500', link: '/dashboard/recensioni' },
    { key: 'users', label: 'Utenti', icon: Users, color: 'violet-500', link: '/dashboard/utenti' },
]

const financialCards = computed(() => [
    { label: 'Ricavi Totali', value: `€${stats.value.revenue.toLocaleString('it-IT')}`, icon: TrendingUp, color: 'emerald-600', bg: 'emerald-50' },
    { label: 'In Attesa', value: `€${stats.value.pendingRevenue.toLocaleString('it-IT')}`, icon: Clock, color: 'amber-600', bg: 'amber-50' },
])

const chartData = computed(() => ({
    labels: revenueHistory.value.map(h => h.date),
    datasets: [
        {
            label: 'Ricavi (€)',
            backgroundColor: (context: any) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                return gradient;
            },
            borderColor: '#10b981',
            data: revenueHistory.value.map(h => h.amount),
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }
    ]
}))

const doughnutData = computed(() => {
    // We don't have exact counts of all bookings by status from the initial stats call easily without fetching all
    // But we fetched 'allBookings' (confirmed) and 'pendingBookings' (pending) for revenue calc.
    // We can use the counts from stats object if we had them or approximate/fetch properly.
    // For now, let's just use the Recent Bookings or fetch a count summary if possible.
    // Actually in a real dashboard we'd want a dedicated endpoint for stats.
    // Let's rely on what we have:
    // We didn't keep the full counts in `stats`. Let's add them to `stats`.
    // Re-using the logic from fetchStats:
    // We have allBookings (confirmed) array.
    // We have pendingBookings array.
    // We can simulate 'cancelled' count or fetch it.
    // Let's add a separate fetch for counts in fetchStats or just use what we have.
    // For better data, let's fetch counts by status in fetchStats.
    return {
        labels: ['Confermate', 'In Attesa', 'Cancellate'],
        datasets: [{
            data: [
                bookingCounts.value.confirmed,
                bookingCounts.value.pending,
                bookingCounts.value.cancelled
            ],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    }
})

const bookingCounts = ref({ confirmed: 0, pending: 0, cancelled: 0 })

// Update fetchStats to get counts
// ... (I will need to update fetchStats to populate bookingCounts)
// Actually, let's just do it in the same large replacement to avoid multiple complex edits.

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#1f2937',
            padding: 12,
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            cornerRadius: 10,
            displayColors: false,
            callbacks: {
                label: (context: any) => `€ ${context.raw.toLocaleString('it-IT')}`
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { display: true, color: '#f3f4f6', borderDash: [4, 4] },
            ticks: { font: { size: 11 }, color: '#9ca3af', callback: (value: any) => '€' + value }
        },
        x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#9ca3af' }
        }
    }
}

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: { usePointStyle: true, padding: 20, font: { size: 11 } }
        }
    }
}

const getUserName = (b: any) => {
    const u = b.user
    if (!u) return 'Utente sconosciuto'
    return u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username
}

const getAmount = (b: any) => {
    const price = b.offer?.depositPrice || 0
    const count = (b.participants && b.participants.length > 0) ? b.participants.length : 1
    return price * count
}

const formatDate = (d: string) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
}

const statusBadge = (status: string) => {
    switch (status) {
        case 'confirmed': return { label: 'Confermata', class: 'bg-green-100 text-green-700' }
        case 'pending': return { label: 'In Attesa', class: 'bg-amber-100 text-amber-700' }
        case 'cancelled': return { label: 'Cancellata', class: 'bg-red-100 text-red-700' }
        default: return { label: status, class: 'bg-slate-100 text-slate-700' }
    }
}
</script>

<template>
    <div class="p-6 lg:p-10">
        <!-- Header -->
        <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 class="text-3xl font-black text-slate-900 mb-1">Benvenuto, {{ fullName }}</h1>
                <p class="text-slate-500 font-medium">Ecco una panoramica della tua attività oggi.</p>
            </div>
            <div class="flex gap-2">
                <RouterLink to="/dashboard/prenotazioni">
                    <Button class="rounded-2xl px-6 h-11 font-bold shadow-lg shadow-primary/20 gap-2">
                        <Ticket class="w-4 h-4" /> Gestisci Prenotazioni
                    </Button>
                </RouterLink>
            </div>
        </div>

        <!-- Financial Stats & Chart Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- Stats Cards -->
            <div class="flex flex-col gap-6">
                <Card v-for="(card, i) in financialCards" :key="i"
                    class="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
                    <CardContent class="p-6 flex items-center justify-between">
                        <div>
                            <p class="text-sm font-bold text-slate-400 uppercase mb-1">{{ card.label }}</p>
                            <div v-if="loading" class="h-8 w-24 bg-slate-100 rounded animate-pulse"></div>
                            <p v-else class="text-2xl font-black text-slate-900">{{ card.value }}</p>
                        </div>
                        <div :class="`w-14 h-14 rounded-2xl bg-${card.bg} flex items-center justify-center`">
                            <component :is="card.icon" :class="`w-7 h-7 text-${card.color}`" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <!-- Chart -->
            <div class="lg:col-span-2">
                <Card class="rounded-2xl border-none shadow-sm h-full max-h-[400px]">
                    <CardContent class="p-6 h-full flex flex-col">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp class="w-5 h-5 text-emerald-500" /> Andamento Ricavi
                            </h2>
                            <span
                                class="text-xs font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-lg">Ultimi
                                30gg</span>
                        </div>
                        <div class="flex-1 min-h-0 relative">
                            <div v-if="loading" class="absolute inset-0 bg-slate-50 animate-pulse rounded-xl"></div>
                            <div v-else-if="revenueHistory.length === 0"
                                class="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
                                Nessun dato sui ricavi disponibile
                            </div>
                            <Line v-else :data="chartData" :options="chartOptions" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <!-- Main Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
            <RouterLink v-for="card in statCards" :key="card.key" :to="card.link" class="group block">
                <Card
                    class="rounded-2xl border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full">
                    <CardContent class="p-6 flex flex-col justify-between h-full">
                        <div class="flex items-center justify-between mb-4">
                            <div :class="`w-12 h-12 rounded-2xl bg-${card.color}/10 flex items-center justify-center`">
                                <component :is="card.icon" :class="`w-6 h-6 text-${card.color}`" />
                            </div>
                            <ArrowRight
                                class="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <div>
                            <div v-if="loading" class="h-9 w-16 bg-slate-100 rounded-lg animate-pulse mb-1"></div>
                            <p v-else class="text-3xl font-black text-slate-900 mb-1">
                                {{ (stats as any)[card.key] }}
                            </p>
                            <p class="text-sm font-semibold text-slate-400">{{ card.label }}</p>
                        </div>
                    </CardContent>
                </Card>
            </RouterLink>
        </div>

        <!-- Row 3: Recent Bookings & Doughnut -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- Recent Bookings -->
            <div class="lg:col-span-2">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-slate-800">Prenotazioni Recenti</h2>
                    <RouterLink to="/dashboard/prenotazioni" class="text-sm font-bold text-primary hover:underline">Vedi
                        tutte</RouterLink>
                </div>
                <Card class="rounded-2xl border-none shadow-sm overflow-hidden min-h-[300px]">
                    <div v-if="loading" class="p-6 space-y-4">
                        <div v-for="i in 3" :key="i" class="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
                    </div>
                    <div v-else-if="recentBookings.length === 0"
                        class="flex flex-col items-center justify-center h-full p-10 text-center">
                        <Ticket class="w-10 h-10 text-slate-200 mb-3" />
                        <p class="text-slate-500 font-medium">Nessuna prenotazione recente</p>
                    </div>
                    <div v-else class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-slate-100 bg-slate-50/50">
                                    <th class="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase">Utente
                                    </th>
                                    <th
                                        class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase hidden sm:table-cell">
                                        Data</th>
                                    <th class="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Importo
                                    </th>
                                    <th class="text-right py-3 px-6 text-xs font-bold text-slate-400 uppercase">Stato
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="booking in recentBookings" :key="booking.id"
                                    class="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                    <td class="py-3 px-6">
                                        <div class="font-bold text-slate-800 text-sm">{{ getUserName(booking) }}</div>
                                        <div class="text-xs text-slate-400 truncate max-w-[150px]">{{
                                            booking.offer?.trip?.title }}</div>
                                    </td>
                                    <td class="py-3 px-4 hidden sm:table-cell text-xs text-slate-500 font-medium">
                                        {{ formatDate(booking.createdAt) }}
                                    </td>
                                    <td class="py-3 px-4 text-right font-bold text-slate-800 text-sm">
                                        €{{ getAmount(booking) }}
                                    </td>
                                    <td class="py-3 px-6 text-right">
                                        <Badge
                                            :class="[statusBadge(booking.status).class, 'border-none font-bold text-[10px] uppercase']">
                                            {{ statusBadge(booking.status).label }}
                                        </Badge>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <!-- Doughnut Chart (1 col) -->
            <div>
                <h2 class="text-lg font-bold text-slate-800 mb-4">Stato Prenotazioni</h2>
                <Card class="rounded-2xl border-none shadow-sm h-[300px] bg-white">
                    <CardContent class="p-6 h-full relative flex items-center justify-center">
                        <div v-if="loading" class="absolute inset-0 bg-slate-50 animate-pulse rounded-xl"></div>
                        <div v-else-if="!bookingCounts.confirmed && !bookingCounts.pending && !bookingCounts.cancelled"
                            class="text-slate-400 font-medium text-center">
                            Nessuna prenotazione
                        </div>
                        <div v-else class="w-full h-full relative">
                            <Doughnut :data="doughnutData" :options="doughnutOptions" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <!-- Row 4: Recent Users & Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- Recent Users (2 cols) -->
            <div class="lg:col-span-2">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-slate-800">Nuovi Utenti</h2>
                    <RouterLink to="/dashboard/utenti" class="text-sm font-bold text-primary hover:underline">Vedi tutti
                    </RouterLink>
                </div>
                <Card class="rounded-2xl border-none shadow-sm overflow-hidden min-h-[300px]">
                    <div v-if="loading" class="p-6 space-y-4">
                        <div v-for="i in 3" :key="i" class="h-12 bg-slate-50 rounded-xl animate-pulse"></div>
                    </div>
                    <div v-else-if="recentUsers.length === 0"
                        class="p-10 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                        <Users class="w-10 h-10 text-slate-200 mb-3" />
                        <p>Nessun utente recente.</p>
                    </div>
                    <div v-else class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-slate-100 bg-slate-50/50">
                                    <th class="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase">Utente
                                    </th>
                                    <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Email
                                    </th>
                                    <th class="text-right py-3 px-6 text-xs font-bold text-slate-400 uppercase">
                                        Registrato</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="u in recentUsers" :key="u.id"
                                    class="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                    <td class="py-3 px-6">
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {{ u.username?.charAt(0).toUpperCase() }}
                                            </div>
                                            <span class="font-bold text-slate-800 text-sm">{{ u.username }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 text-sm text-slate-500">{{ u.email }}</td>
                                    <td class="py-3 px-6 text-right text-xs text-slate-400 font-medium">{{
                                        formatDate(u.createdAt) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <!-- Quick Actions -->
            <div>
                <h2 class="text-lg font-bold text-slate-800 mb-4">Azioni Rapide</h2>
                <div class="space-y-3">
                    <RouterLink to="/dashboard/viaggi/nuovo" class="block">
                        <Button
                            class="w-full justify-start rounded-2xl h-14 font-bold shadow-md hover:shadow-primary/30 transition-all gap-3 text-left px-5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-100">
                            <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Plus class="w-4 h-4" />
                            </div>
                            <span>Nuovo Viaggio</span>
                        </Button>
                    </RouterLink>
                    <RouterLink to="/dashboard/offerte" class="block">
                        <Button
                            class="w-full justify-start rounded-2xl h-14 font-bold shadow-sm hover:shadow-md transition-all gap-3 text-left px-5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-100">
                            <div
                                class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Tag class="w-4 h-4" />
                            </div>
                            <span>Crea Offerta</span>
                        </Button>
                    </RouterLink>
                    <RouterLink to="/dashboard/utenti" class="block">
                        <Button
                            class="w-full justify-start rounded-2xl h-14 font-bold shadow-sm hover:shadow-md transition-all gap-3 text-left px-5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-100">
                            <div
                                class="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                                <Users class="w-4 h-4" />
                            </div>
                            <span>Gestisci Utenti</span>
                        </Button>
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>
