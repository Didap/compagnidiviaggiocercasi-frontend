<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import { useAuth } from '@/composables/useAuth'
import {
    Users,
    Calendar,
    Trash2,
    Plus,
    ArrowLeft,
    Info,
    CheckCircle2,
    MapPin,
    Star,
    Clock,
    Shield,
    Heart,
    ArrowRight,
    Mail,
    FileText,
    Home
} from 'lucide-vue-next'
import { getImageUrl } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated } = useAuth()

const offer = ref<any>(null)
const trip = ref<any>(null)
const loading = ref(true)
const submitting = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

const apiUrl = import.meta.env.VITE_API_URL

// Travelers data
interface Traveler {
    firstName: string
    lastName: string
    birthDate: string
    gender: 'male' | 'female' | 'other'
}

const participants = ref<Traveler[]>([
    { firstName: '', lastName: '', birthDate: '', gender: 'male' }
])

const notes = ref('')
const operatorCode = ref('')
const requestInvoice = ref(false)
const paymentOption = ref<'full' | 'deposit' | 'installments'>('deposit')
const selectedSupplements = ref<Record<number, boolean>>({})

// Guest checkout & profile fields
const guestEmail = ref('')
const codiceFiscale = ref('')
const address = ref('')
const city = ref('')
const zip = ref('')
const province = ref('')

const fetchOffer = async () => {
    try {
        const offerId = route.params.offerId
        const response = await fetch(`${apiUrl}/api/offers/${offerId}?populate[trip][populate]=*&populate[installmentConfigs]=*`)
        if (!response.ok) throw new Error('Offerta non trovata')
        const data = await response.json()
        const rawOffer = data.data.attributes || data.data
        offer.value = rawOffer

        // Extract trip data
        const rawTrip = rawOffer.trip?.data?.attributes || rawOffer.trip?.data || rawOffer.trip?.attributes || rawOffer.trip
        trip.value = rawTrip

        // Pre-fill logic moved to watch for better reactivity
    } catch (err: any) {
        error.value = err.message
    } finally {
        loading.value = false
    }
}

// Pre-fill first traveler and profile fields when user is loaded
watch(user, (newUser) => {
    if (newUser && participants.value[0] && !participants.value[0].firstName && !participants.value[0].lastName) {
        participants.value[0].firstName = newUser.firstName || ''
        participants.value[0].lastName = newUser.lastName || ''
        participants.value[0].birthDate = newUser.birthday || ''
    }
    // Pre-fill profile fields
    if (newUser) {
        if (newUser.codiceFiscale && !codiceFiscale.value) codiceFiscale.value = newUser.codiceFiscale
        if (newUser.address && !address.value) address.value = newUser.address
        if (newUser.city && !city.value) city.value = newUser.city
        if (newUser.zip && !zip.value) zip.value = newUser.zip
        if (newUser.province && !province.value) province.value = newUser.province
    }
}, { immediate: true })

// Helpers (Consistent with TripDetailView)
const imageUrl = computed(() => {
    if (!trip.value?.image) return getImageUrl(null)
    const img = trip.value.image
    const firstImage = Array.isArray(img) ? img[0] : img
    const url = firstImage?.url || firstImage?.attributes?.url || firstImage?.data?.attributes?.url || firstImage?.data?.url
    return getImageUrl(url)
})

const averageRating = computed(() => {
    const reviews = trip.value?.reviews?.data || trip.value?.reviews
    if (!Array.isArray(reviews) || reviews.length === 0) return 0
    const sum = reviews.reduce((acc: number, r: any) => acc + (r.attributes?.rating ?? r.rating ?? 0), 0)
    return (sum / reviews.length).toFixed(1)
})

const formatDateRange = (o: any) => {
    if (!o?.startDate || !o?.endDate) return ''
    const fmt = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
    return `${fmt(o.startDate)} — ${fmt(o.endDate)}`
}

const getDuration = (o: any) => {
    if (!o?.startDate || !o?.endDate) return ''
    const diff = Math.ceil((new Date(o.endDate).getTime() - new Date(o.startDate).getTime()) / (1000 * 60 * 60 * 24))
    return `${diff + 1} ${diff + 1 === 1 ? 'giorno' : 'giorni'} / ${diff} ${diff === 1 ? 'notte' : 'notti'}`
}

const availableSeats = computed(() => {
    if (!offer.value) return 0
    return (offer.value.maxParticipants || 0) - (offer.value.occupiedSeats || 0)
})

const isSoldOut = computed(() => availableSeats.value <= 0)

const canAddTraveler = computed(() => participants.value.length < availableSeats.value)

const addTraveler = () => {
    if (canAddTraveler.value) {
        participants.value.push({ firstName: '', lastName: '', birthDate: '', gender: 'male' })
    }
}

const removeTraveler = (index: number) => {
    if (participants.value.length > 1) {
        participants.value.splice(index, 1)
    }
}

const supplementsTotal = computed(() => {
    const supps = offer.value?.supplement
    if (!Array.isArray(supps)) return 0
    return supps.reduce((sum: number, s: any, i: number) => {
        if (selectedSupplements.value[i]) return sum + (Number(s.price) || 0)
        return sum
    }, 0) * participants.value.length
})

const totalAmount = computed(() => ((offer.value?.price || 0) + (offer.value?.depositPrice || 0)) * participants.value.length + supplementsTotal.value)
const totalDeposit = computed(() => (offer.value?.depositPrice || 0) * participants.value.length)

const installmentsAvailable = computed(() => {
    if (offer.value?.allowInstallments !== true) return false
    const configs = offer.value?.installmentConfigs
    if (Array.isArray(configs) && configs.length > 0) {
        const firstCfg = configs[0]
        let firstDue: Date | null = null
        if (firstCfg.dueDateType === 'relative' && offer.value?.startDate && firstCfg.relativeMonths) {
            firstDue = new Date(offer.value.startDate)
            firstDue.setMonth(firstDue.getMonth() - firstCfg.relativeMonths)
        } else if (firstCfg.dueDate) {
            firstDue = new Date(firstCfg.dueDate)
        }
        if (firstDue) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            firstDue.setHours(0, 0, 0, 0)
            if (firstDue.getTime() < today.getTime()) return false
        }
    }
    return true
})
const installmentsCount = computed(() => {
    const configs = offer.value?.installmentConfigs
    if (Array.isArray(configs) && configs.length > 0) return configs.length
    return offer.value?.installmentsCount || 3
})
// Installments apply only to the price (excluding deposit)
const totalPriceOnly = computed(() => (offer.value?.price || 0) * participants.value.length + supplementsTotal.value)

const installmentAmount = computed(() => {
    if (!installmentsAvailable.value) return 0
    const configs = offer.value?.installmentConfigs
    const count = (Array.isArray(configs) && configs.length > 0) ? configs.length : (offer.value?.installmentsCount || 3)
    // If evenly divisible, use clean division
    if (totalPriceOnly.value % count === 0) {
        return totalPriceOnly.value / count
    }
    // Otherwise, use percentage-based calculation
    if (Array.isArray(configs) && configs.length > 0) {
        const firstPct = Number(configs[0].percentage) || 0
        return Math.round((totalPriceOnly.value * firstPct / 100) * 100) / 100
    }
    return Math.floor((totalPriceOnly.value / count) * 100) / 100
})

const firstPaymentAmount = computed(() => {
    if (paymentOption.value === 'full') return totalAmount.value
    if (paymentOption.value === 'installments' && installmentsAvailable.value) return totalDeposit.value
    return totalDeposit.value // deposit
})

const firstPaymentLabel = computed(() => {
    if (paymentOption.value === 'full') return 'Totale da pagare'
    if (paymentOption.value === 'installments') return 'Acconto ora'
    return 'Acconto ora'
})

const isFormValid = computed(() => {
    const participantsValid = participants.value.every(p =>
        p.firstName.trim() !== '' &&
        p.lastName.trim() !== '' &&
        p.birthDate !== '' &&
        /^\d{4}-\d{2}-\d{2}$/.test(p.birthDate)
    )

    // CF and address are always required
    const profileValid = codiceFiscale.value.trim() !== '' &&
        address.value.trim() !== '' &&
        city.value.trim() !== '' &&
        zip.value.trim() !== '' &&
        province.value.trim() !== ''

    // Email required only for guests
    const emailValid = isAuthenticated.value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.value)

    return participantsValid && profileValid && emailValid
})

const submitBooking = async () => {
    console.log('[Booking] Submitting booking...', {
        user: user.value?.id,
        offerId: route.params.offerId,
        participants: participants.value.length,
        isGuest: !isAuthenticated.value
    })

    submitting.value = true
    error.value = null

    try {
        const payload: any = {
            data: {
                bookingStatus: 'pending',
                totalPrice: totalAmount.value,
                depositPrice: totalDeposit.value,
                notes: notes.value,
                operatorCode: operatorCode.value || undefined,
                requestInvoice: requestInvoice.value,
                paymentOption: paymentOption.value,
                participants: participants.value,
                selectedSupplements: Array.isArray(offer.value?.supplement)
                    ? offer.value.supplement.filter((_: any, i: number) => selectedSupplements.value[i]).map((s: any) => ({ name: s.name, price: Number(s.price) || 0 }))
                    : [],
                offer: route.params.offerId,
                // Profile / tax fields
                codiceFiscale: codiceFiscale.value,
                address: address.value,
                city: city.value,
                zip: zip.value,
                province: province.value,
            }
        }

        if (isAuthenticated.value) {
            // Logged-in user: attach user ID
            payload.data.user = user.value?.documentId || user.value?.id
        } else {
            // Guest checkout: attach email + name for auto account creation
            payload.data.email = guestEmail.value
            payload.data.firstName = participants.value[0]?.firstName || ''
            payload.data.lastName = participants.value[0]?.lastName || ''
        }

        console.log('[Booking] POST payload:', JSON.stringify(payload, null, 2))

        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        const jwt = localStorage.getItem('jwt')
        if (jwt) {
            headers['Authorization'] = `Bearer ${jwt}`
        }

        const response = await fetch(`${apiUrl}/api/bookings`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errData = await response.json()
            console.error('[Booking] Submission failed:', errData)
            throw new Error(errData?.error?.message || 'Errore durante la prenotazione')
        }

        const data = await response.json()
        const checkoutUrl = data?.meta?.checkoutUrl

        // If a guest JWT was returned, auto-login the user
        if (data?.meta?.guestJwt) {
            localStorage.setItem('jwt', data.meta.guestJwt)
            console.log('[Booking] Guest auto-logged in with JWT')
        }

        if (checkoutUrl) {
            console.log('[Booking] Redirecting to Stripe:', checkoutUrl)
            window.location.href = checkoutUrl
            return
        }

        console.log('[Booking] Submission successful (no Stripe URL)!')
        success.value = true
        window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
        console.error('[Booking] Submit error:', err)
        error.value = err.message
    } finally {
        if (!success.value && !error.value) {
            // keeping spinner...
        } else {
            submitting.value = false
        }
    }
}


onMounted(fetchOffer)
</script>

<template>
    <div class="min-h-screen bg-slate-50">
        <Navbar />

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center min-h-screen">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>

        <template v-else-if="trip">
            <!-- Hero Section (Consistent with TripDetailView) -->
            <section class="relative h-[40vh] md:h-[50vh] overflow-hidden">
                <img :src="imageUrl" :alt="trip.title" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div
                    class="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none h-1/2">
                </div>

                <!-- Back Button -->
                <button @click="router.back()"
                    class="absolute top-32 left-6 md:left-12 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:bg-white transition-colors z-10">
                    <ArrowLeft class="w-4 h-4 text-slate-700" />
                    <span class="text-sm font-bold text-slate-700">Indietro</span>
                </button>

                <!-- Hero Content -->
                <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div class="container mx-auto">
                        <div class="flex flex-wrap items-center gap-3 mb-4">
                            <div
                                class="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                                <MapPin class="w-4 h-4 text-primary" />
                                <span class="text-sm font-bold text-slate-800">{{ trip.destination }}</span>
                            </div>
                            <div
                                class="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                                <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span class="text-sm font-bold text-slate-800">{{ averageRating }}</span>
                            </div>
                        </div>
                        <h1 class="text-3xl md:text-5xl font-black text-white leading-tight mb-2 drop-shadow-lg">
                            Blocca il tuo posto: {{ trip.title }}
                        </h1>
                    </div>
                </div>
            </section>

            <!-- Main Content -->
            <section class="container mx-auto px-6 py-12">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    <!-- Left Column: Form -->
                    <div class="lg:col-span-2 space-y-8">

                        <div v-if="success"
                            class="bg-green-50 rounded-[2.5rem] p-10 text-center border-2 border-green-100 shadow-xl shadow-green-900/5 transition-all animate-in fade-in zoom-in duration-500">
                            <div
                                class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 class="w-10 h-10 text-green-600" />
                            </div>
                            <h2 class="text-3xl font-black text-green-800 mb-4">Prenotazione Inviata!</h2>
                            <p class="text-green-700 font-medium mb-8">Abbiamo ricevuto la tua richiesta. Ti
                                contatteremo a breve per completare il pagamento dell'acconto.</p>
                            <RouterLink to="/profilo">
                                <Button size="lg" class="rounded-full px-10">Vai alle mie prenotazioni</Button>
                            </RouterLink>
                        </div>

                        <template v-else>
                            <div class="flex items-center justify-between mb-6">
                                <h2 class="text-2xl font-bold text-slate-900">Dettagli Partecipanti</h2>
                                <div class="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                                    <Users class="w-4 h-4 text-slate-500" />
                                    <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        {{ availableSeats }} Posti Rimanenti
                                    </span>
                                </div>
                            </div>

                            <!-- Participant Section -->
                            <div v-for="(p, index) in participants" :key="index"
                                class="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100 relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div class="flex items-center justify-between mb-8">
                                    <h3 class="text-xl font-bold text-slate-800 flex items-center gap-3">
                                        <div
                                            class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-black">
                                            {{ index + 1 }}
                                        </div>
                                        Viaggiatore {{ index === 0 ? '(Tu)' : 'Aggiuntivo' }}
                                    </h3>
                                    <button v-if="index > 0" @click="removeTraveler(index)"
                                        class="text-red-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50">
                                        <Trash2 class="w-5 h-5" />
                                    </button>
                                </div>

                                <div class="grid md:grid-cols-2 gap-6">
                                    <div class="space-y-2">
                                        <label
                                            class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                                        <input v-model="p.firstName" type="text" placeholder="Es. Mario"
                                            class="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            required />
                                    </div>
                                    <div class="space-y-2">
                                        <label
                                            class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Cognome</label>
                                        <input v-model="p.lastName" type="text" placeholder="Es. Rossi"
                                            class="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            required />
                                    </div>
                                    <div class="space-y-2">
                                        <label
                                            class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Data
                                            di Nascita</label>
                                        <input v-model="p.birthDate" type="date"
                                            class="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            required />
                                    </div>
                                    <div class="space-y-2">
                                        <label
                                            class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Sesso</label>
                                        <select v-model="p.gender"
                                            class="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium">
                                            <option value="male">Uomo</option>
                                            <option value="female">Donna</option>
                                            <option value="other">Altro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Add Participant Button -->
                            <button @click="addTraveler" :disabled="!canAddTraveler || isSoldOut"
                                class="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center gap-3 text-slate-400 font-bold hover:border-primary/40 hover:text-primary transition-all group hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                                <div
                                    class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Plus class="w-4 h-4" />
                                </div>
                                {{ isSoldOut ? 'Posti Esauriti' : (canAddTraveler ? 'Aggiungi un altro partecipante' :
                                    'Limite posti raggiunto') }}
                            </button>

                            <!-- Guest Email Section (only for non-logged-in users) -->
                            <div v-if="!isAuthenticated"
                                class="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <Mail class="w-6 h-6 text-primary/60" />
                                    Il tuo Account
                                </h3>
                                <p class="text-sm text-slate-500 mb-6">Inserisci la tua email per creare automaticamente
                                    un account collegato alla prenotazione.</p>
                                <div class="space-y-2">
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email
                                        *</label>
                                    <input v-model="guestEmail" type="email" placeholder="Es. mario.rossi@email.com"
                                        class="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        required />
                                </div>
                            </div>

                            <!-- Codice Fiscale & Address Section -->
                            <div
                                class="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 class="text-xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                                    <FileText class="w-6 h-6 text-primary/60" />
                                    Dati di Fatturazione
                                </h3>
                                <p class="text-sm text-slate-500 mb-6">Questi dati sono necessari per la prenotazione e
                                    verranno salvati nel tuo profilo.</p>

                                <div class="grid md:grid-cols-2 gap-6">
                                    <div class="space-y-2 md:col-span-2">
                                        <label
                                            class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Codice
                                            Fiscale *</label>
                                        <input v-model="codiceFiscale" type="text" placeholder="Es. RSSMRA85M01H501Z"
                                            class="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium uppercase"
                                            maxlength="16" required />
                                    </div>
                                    <div class="space-y-2 md:col-span-2">
                                        <label class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            <Home class="w-3 h-3 inline -mt-0.5 mr-1" />Indirizzo di Residenza *
                                        </label>
                                        <input v-model="address" type="text" placeholder="Es. Via Roma 1"
                                            class="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            required />
                                    </div>
                                    <div class="space-y-2">
                                        <label
                                            class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Città
                                            *</label>
                                        <input v-model="city" type="text" placeholder="Es. Roma"
                                            class="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            required />
                                    </div>
                                    <div class="space-y-2">
                                        <label
                                            class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Provincia
                                            *</label>
                                        <input v-model="province" type="text" placeholder="Es. RM" maxlength="2"
                                            class="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium uppercase"
                                            required />
                                    </div>
                                    <div class="space-y-2">
                                        <label
                                            class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">CAP
                                            *</label>
                                        <input v-model="zip" type="text" placeholder="Es. 00100" maxlength="5"
                                            class="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            required />
                                    </div>
                                </div>
                            </div>

                            <!-- Supplements Section -->
                            <div v-if="offer?.supplement && offer.supplement.length > 0"
                                class="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
                                <h3 class="text-xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                                    <Plus class="w-6 h-6 text-primary/60" />
                                    Supplementi Disponibili
                                </h3>
                                <p class="text-sm text-slate-500 mb-6">Seleziona i supplementi che desideri aggiungere
                                    (il prezzo è per partecipante)</p>

                                <div class="space-y-3">
                                    <label v-for="(supp, i) in (offer.supplement as any[])" :key="i"
                                        class="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all group"
                                        :class="selectedSupplements[i] ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-100 hover:bg-slate-50'">
                                        <div class="relative flex items-center">
                                            <input type="checkbox" v-model="selectedSupplements[i]"
                                                class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-200 bg-white transition-all checked:border-primary checked:bg-primary" />
                                            <svg class="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 stroke-white opacity-0 transition-opacity peer-checked:opacity-100"
                                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="4" stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <div class="flex-1">
                                            <span class="text-sm font-bold text-slate-800">{{ supp.name }}</span>
                                        </div>
                                        <span class="text-sm font-black text-primary">+{{ supp.price }}€</span>
                                    </label>
                                </div>

                                <div v-if="supplementsTotal > 0"
                                    class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Totale
                                        supplementi</span>
                                    <span class="text-sm font-black text-primary">+{{ supplementsTotal }}€</span>
                                </div>
                            </div>

                            <!-- Notes Section -->
                            <div class="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
                                <h3 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <Info class="w-6 h-6 text-primary/60" />
                                    Note o Richieste Speciali
                                </h3>
                                <textarea v-model="notes" rows="4"
                                    placeholder="Allergie, esigenze alimentari, o messaggi per il coordinatore..."
                                    class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"></textarea>

                                <!-- Operator Code -->
                                <div class="mt-6 pt-6 border-t border-slate-100">
                                    <label
                                        class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Codice
                                        Operatore</label>
                                    <input v-model="operatorCode" type="text"
                                        placeholder="Inserisci il codice operatore (opzionale)"
                                        class="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                                </div>
                            </div>


                            <!-- Submission Error -->
                            <div v-if="error"
                                class="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl font-medium flex items-center gap-3">
                                <Info class="w-5 h-5" />
                                {{ error }}
                            </div>
                        </template>
                    </div>

                    <!-- Right Column: Summary -->
                    <div class="lg:col-span-1">
                        <div class="sticky top-28 space-y-6">
                            <Card v-if="offer" class="rounded-3xl border-none shadow-xl overflow-hidden">
                                <CardContent class="p-0">
                                    <!-- Sidebar Header -->
                                    <div class="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                                        <h3 class="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">
                                            Riepilogo Prenotazione</h3>
                                        <div class="flex items-baseline gap-2">
                                            <span class="text-4xl font-black">{{ totalAmount }}€</span>
                                            <span class="text-white/70 text-sm">totale</span>
                                        </div>
                                    </div>

                                    <!-- Sidebar Details -->
                                    <div class="p-6 space-y-5">
                                        <div class="flex items-center gap-3 text-slate-600">
                                            <Calendar class="w-5 h-5 text-primary flex-shrink-0" />
                                            <span class="text-sm font-medium">{{ formatDateRange(offer) }}</span>
                                        </div>
                                        <div class="flex items-center gap-3 text-slate-600">
                                            <Clock class="w-5 h-5 text-primary flex-shrink-0" />
                                            <span class="text-sm font-medium">{{ getDuration(offer) }}</span>
                                        </div>
                                        <div class="flex items-center gap-3 text-slate-600">
                                            <Users class="w-5 h-5 text-primary flex-shrink-0" />
                                            <span class="text-sm font-medium">{{ participants.length }} {{
                                                participants.length === 1 ?
                                                    'partecipante' : 'partecipanti' }} ({{ offer.price }}€ cad.)</span>
                                        </div>

                                        <!-- Invoice Request (Relocated to Sidebar) -->
                                        <div class="pt-2">
                                            <label
                                                class="flex items-start gap-3 cursor-pointer group p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                <div class="relative flex items-center mt-1">
                                                    <input v-model="requestInvoice" type="checkbox"
                                                        class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-200 bg-white transition-all checked:border-primary checked:bg-primary" />
                                                    <svg class="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 stroke-white opacity-0 transition-opacity peer-checked:opacity-100"
                                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                        fill="none" stroke="currentColor" stroke-width="4"
                                                        stroke-linecap="round" stroke-linejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </div>
                                                <div class="flex flex-col">
                                                    <span
                                                        class="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                        Richiedo la fattura
                                                    </span>
                                                    <span
                                                        class="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                                                        Inserirai i dati di fatturazione su Stripe
                                                    </span>
                                                </div>
                                            </label>
                                        </div>

                                        <!-- Payment Option Selector -->
                                        <div class="border-t border-slate-100 pt-5">
                                            <span
                                                class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3 block">Modalità
                                                di
                                                pagamento</span>

                                            <div class="space-y-2">
                                                <!-- Option: Deposit -->
                                                <label
                                                    class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                                                    :class="paymentOption === 'deposit' ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-100 hover:bg-slate-50'">
                                                    <input type="radio" v-model="paymentOption" value="deposit"
                                                        class="accent-primary w-4 h-4" />
                                                    <div class="flex-1">
                                                        <span class="text-sm font-bold text-slate-800">Acconto +
                                                            Saldo</span>
                                                        <p class="text-[11px] text-slate-500 leading-tight">Paga {{
                                                            totalDeposit }}€ ora, il
                                                            resto dopo</p>
                                                    </div>
                                                </label>


                                                <!-- Option: Installments (only if offer allows it) -->
                                                <label v-if="installmentsAvailable"
                                                    class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                                                    :class="paymentOption === 'installments' ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-100 hover:bg-slate-50'">
                                                    <input type="radio" v-model="paymentOption" value="installments"
                                                        class="accent-primary w-4 h-4" />
                                                    <div class="flex-1">
                                                        <span class="text-sm font-bold text-slate-800">Paga a
                                                            rate</span>
                                                        <p class="text-[11px] text-slate-500 leading-tight">Acconto {{
                                                            totalDeposit }}€ + {{
                                                                installmentsCount }} rate da
                                                            {{ installmentAmount }}€</p>
                                                    </div>
                                                </label>
                                            </div>

                                            <!-- Option: Full -->
                                            <label
                                                class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                                                :class="paymentOption === 'full' ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-100 hover:bg-slate-50'">
                                                <input type="radio" v-model="paymentOption" value="full"
                                                    class="accent-primary w-4 h-4" />
                                                <div class="flex-1">
                                                    <span class="text-sm font-bold text-slate-800">Paga tutto
                                                        ora</span>
                                                    <p class="text-[11px] text-slate-500 leading-tight">{{
                                                        totalAmount }}€ in un'unica
                                                        soluzione</p>
                                                </div>
                                            </label>
                                        </div>

                                        <!-- Dynamic Amount & Button -->
                                        <div class="border-t border-slate-100 pt-5">
                                            <div class="flex items-center justify-between mb-4">
                                                <span
                                                    class="text-sm text-slate-500 font-bold uppercase tracking-wider">{{
                                                        firstPaymentLabel
                                                    }}</span>
                                                <span class="text-2xl font-black text-primary">{{ firstPaymentAmount
                                                }}€</span>
                                            </div>

                                            <Button @click="submitBooking"
                                                :disabled="submitting || success || isSoldOut || !isFormValid"
                                                class="w-full rounded-2xl h-14 text-base font-bold shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                                                size="lg">
                                                <div v-if="submitting" class="flex items-center gap-2">
                                                    <div
                                                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin">
                                                    </div>
                                                    <span>Inviando...</span>
                                                </div>
                                                <span v-else-if="success">Inviato con successo</span>
                                                <span v-else-if="isSoldOut">Sold Out</span>
                                                <span v-else-if="!isFormValid">Compila tutti i campi</span>
                                                <span v-else>Conferma e paga</span>
                                                <ArrowRight v-if="!submitting && !success && !isSoldOut && isFormValid"
                                                    class="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                            </Button>
                                        </div>

                                        <!-- Trust Signals -->
                                        <div class="grid grid-cols-1 gap-3 pt-2">
                                            <div class="flex items-center gap-2 text-xs text-slate-500">
                                                <Shield class="w-4 h-4 text-green-500 flex-shrink-0" />
                                                <span>Prenotazione sicura e protetta</span>
                                            </div>
                                            <div class="flex items-center gap-2 text-xs text-slate-500">
                                                <Heart class="w-4 h-4 text-red-400 flex-shrink-0" />
                                                <span>Cancellazione gratuita entro 15gg</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <!-- Help Box -->
                            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex gap-4">
                                <Users class="w-6 h-6 text-primary/40 shrink-0" />
                                <div>
                                    <h4 class="font-bold text-slate-700">Ti servono info?</h4>
                                    <p class="text-sm text-slate-500 mt-1">Siamo qui per aiutarti a pianificare la tua
                                        avventura.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </template>
    </div>
</template>

<style scoped>
.backdrop-blur-md {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

h1,
h2,
h3 {
    font-feature-settings: "ss01", "ss02", "salt";
}
</style>
