<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'

import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { parseDate, type DateValue } from '@internationalized/date'
import {
    Plus, Pencil, Trash2, Tag, Loader2, X, Save, Calendar, Eye,
} from 'lucide-vue-next'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import { TableSkeleton } from '@/components/ui/skeleton'

const { token } = useAuth()
const apiUrl = import.meta.env.VITE_API_URL
const toast = useToast()

const offers = ref<any[]>([])
const trips = ref<any[]>([])
const loading = ref(true)
const deleting = ref<string | null>(null)
const selectedOffer = ref<any>(null)
const offerBookings = ref<any[]>([])
const loadingDetails = ref(false)

// Confirm Modal State
const showConfirm = ref(false)
const confirmMessage = ref('')
const itemToDelete = ref<any>(null)

// Form
const showForm = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref<string | null>(null)

interface InstallmentConfig {
    name: string
    percentage: number
    amount: number
    dueDateType: 'relative' | 'precise'
    relativeMonths: number
    dueDate: string
}

const form = ref({
    trip: '',
    price: '',
    depositPrice: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    occupiedSeats: '0',
    allowInstallments: false,
    installmentConfigs: [] as InstallmentConfig[],
    itinerary: [] as { title: string; description: string }[]
})

const resetForm = () => {
    form.value = { trip: '', price: '', depositPrice: '', startDate: '', endDate: '', maxParticipants: '', occupiedSeats: '0', allowInstallments: false, installmentConfigs: [] as InstallmentConfig[], itinerary: [] as { title: string; description: string }[] }
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
        occupiedSeats: String(offer.occupiedSeats || '0'),
        allowInstallments: offer.allowInstallments || false,
        installmentConfigs: Array.isArray(offer.installmentConfigs)
            ? offer.installmentConfigs.map((c: any) => {
                const price = Number(offer.price) || 0
                const pct = Number(c.percentage) || 0
                return {
                    name: c.name || '',
                    percentage: pct,
                    amount: c.amount != null ? Number(c.amount) : Math.round(price * pct / 100 * 100) / 100,
                    dueDateType: c.dueDateType || 'relative',
                    relativeMonths: c.relativeMonths ?? 2,
                    dueDate: c.dueDate || ''
                }
            })
            : [],
        itinerary: offer.itinerary ? offer.itinerary.map((d: any) => ({ title: d.title || '', description: d.description || '' })) : []
    }
    formError.value = null
    showForm.value = true
}

const openDetails = async (offer: any) => {
    selectedOffer.value = offer
    loadingDetails.value = true
    offerBookings.value = []
    try {
        const docId = offer.documentId || offer.id
        // Fetch confirmed bookings for this offer to show participants
        const res = await fetch(`${apiUrl}/api/bookings?filters[offer][documentId]=${docId}&filters[status]=confirmed&populate[user][fields]=username,firstName,lastName,email&populate[participants]=*`, {
            headers: { Authorization: `Bearer ${token.value}` }
        })
        const data = await res.json()
        offerBookings.value = data.data || []
    } catch (err) {
        console.error('Error fetching offer bookings:', err)
    } finally {
        loadingDetails.value = false
    }
}

const fetchData = async () => {
    loading.value = true
    try {
        const [offersRes, tripsRes] = await Promise.all([
            fetch(`${apiUrl}/api/offers?populate[trip][fields]=title,documentId&populate[participants][fields]=id&populate[itinerary]=*&populate[installmentConfigs]=*&sort=createdAt:desc`, {
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

// Installment Helpers
const getPrice = () => parseFloat(form.value.price) || 0

const recalcAmounts = () => {
    const price = getPrice()
    const configs = form.value.installmentConfigs
    const count = configs.length
    if (count === 0 || price === 0) return
    const evenAmount = Math.floor((price / count) * 100) / 100
    let usedSum = 0
    configs.forEach((c, i) => {
        const isLast = i === count - 1
        c.amount = isLast ? Math.round((price - usedSum) * 100) / 100 : evenAmount
        usedSum += c.amount
        c.percentage = Math.round((c.amount / price) * 1000) / 10
    })
}

const addInstallment = () => {
    const configs = form.value.installmentConfigs
    const newCount = configs.length + 1

    // Calculate smart default for relative date
    let newRelative = 1
    let newType: 'relative' | 'precise' = 'relative'

    if (configs.length > 0) {
        const last = configs[configs.length - 1]
        if (last && last.dueDateType === 'relative' && last.relativeMonths) {
            const max = last.relativeMonths - 1
            if (max < 1) {
                newType = 'precise'
                newRelative = 1
            } else {
                newRelative = max
            }
        }
    } else {
        newRelative = 2
    }

    configs.push({
        name: `Rata ${newCount}`,
        percentage: 0,
        amount: 0,
        dueDateType: newType,
        relativeMonths: newRelative,
        dueDate: ''
    })

    recalcAmounts()
}

watch(() => form.value.allowInstallments, (val) => {
    if (val && form.value.installmentConfigs.length === 0) {
        addInstallment()
    }
})

// Recalculate amounts when price changes
watch(() => form.value.price, () => {
    if (form.value.installmentConfigs.length > 0) {
        recalcAmounts()
    }
})

const removeInstallment = (index: number) => {
    form.value.installmentConfigs.splice(index, 1)
    recalcAmounts()
}

const handleAmountUpdate = (changedIndex: number, newAmount: number) => {
    const configs = form.value.installmentConfigs
    const price = getPrice()
    if (configs.length <= 1 || price === 0) return

    const cfg = configs[changedIndex]
    if (!cfg) return

    // Clamp to [0, price]
    cfg.amount = Math.max(0, Math.min(newAmount, price))

    // Distribute the remaining balance among the other installments
    const remaining = price - cfg.amount
    const otherIndices: number[] = []
    for (let i = 0; i < configs.length; i++) { if (i !== changedIndex) otherIndices.push(i) }
    const otherSum = otherIndices.reduce((s, i) => s + (configs[i]?.amount ?? 0), 0)

    if (otherSum === 0 || otherIndices.length === 0) {
        // Even split among others
        const share = Math.floor((remaining / otherIndices.length) * 100) / 100
        let used = 0
        otherIndices.forEach((idx, j) => {
            const c = configs[idx]
            if (!c) return
            const isLast = j === otherIndices.length - 1
            c.amount = isLast ? Math.round((remaining - used) * 100) / 100 : share
            used += c.amount
        })
    } else {
        // Proportional distribution
        let used = 0
        otherIndices.forEach((idx, j) => {
            const c = configs[idx]
            if (!c) return
            const isLast = j === otherIndices.length - 1
            c.amount = isLast
                ? Math.round((remaining - used) * 100) / 100
                : Math.round((c.amount / otherSum * remaining) * 100) / 100
            used += c.amount
        })
    }

    // Recalculate percentages from amounts
    configs.forEach(c => {
        c.percentage = Math.round((c.amount / price) * 1000) / 10
    })
}

// Date helpers
const getInstallmentDate = (cfg: InstallmentConfig): Date | null => {
    if (cfg.dueDateType === 'relative' && form.value.startDate && cfg.relativeMonths) {
        const d = new Date(form.value.startDate)
        d.setMonth(d.getMonth() - cfg.relativeMonths)
        return d
    }
    if (cfg.dueDateType === 'precise' && cfg.dueDate) {
        return new Date(cfg.dueDate)
    }
    return null
}

const dateErrors = computed(() => {
    const errors: Record<number, string> = {}
    const configs = form.value.installmentConfigs
    for (let i = 1; i < configs.length; i++) {
        const prevCfg = configs[i - 1]
        const currCfg = configs[i]

        if (!prevCfg || !currCfg) continue

        const prev = getInstallmentDate(prevCfg)
        const curr = getInstallmentDate(currCfg)

        if (prev && curr) {
            // Check if current is before previous (ignore time components for safety)
            const p = new Date(prev).setHours(0, 0, 0, 0)
            const c = new Date(curr).setHours(0, 0, 0, 0)
            if (c <= p) {
                errors[i] = 'Data non valida (deve essere successiva alla precedente)'
            }
        }
    }
    return errors
})

const getAvailableMonths = (index: number) => {
    if (index === 0) return Array.from({ length: 12 }, (_, i) => i + 1)

    // For subsequent installments, max months is strictly less than previous
    const configs = form.value.installmentConfigs
    const prev = configs[index - 1]

    if (prev && prev.dueDateType === 'relative' && prev.relativeMonths) {
        // If previous is "4 months before", current can be at most 3
        const max = prev.relativeMonths - 1
        if (max < 1) return [] // No relative months available (must use precise)
        return Array.from({ length: max }, (_, i) => i + 1)
    }

    // Fallback if previous is precise or undefined (maybe allow all?)
    // For safety/strictness, if prev is precise we can't easily limit relative without recalc
    // Let's return full range but validation will catch errors
    return Array.from({ length: 12 }, (_, i) => i + 1)
}


const getCalendarDate = (dateStr: string): DateValue | undefined => {
    if (!dateStr) return undefined
    try {
        return parseDate(dateStr)
    } catch (e) {
        return undefined
    }
}

const setCalendarDate = (val: DateValue | undefined, cfg: InstallmentConfig) => {
    if (val) {
        cfg.dueDate = val.toString()
        cfg.dueDateType = 'precise'
    } else {
        cfg.dueDate = ''
    }
}

// Computed v-model refs for start/end date pickers
// Using computed refs prevents the calendar from resetting the displayed month on re-render
const startDateValue = computed({
    get: () => getCalendarDate(form.value.startDate),
    set: (val: DateValue | undefined) => {
        form.value.startDate = val ? val.toString() : ''
    }
})

const endDateValue = computed({
    get: () => getCalendarDate(form.value.endDate),
    set: (val: DateValue | undefined) => {
        form.value.endDate = val ? val.toString() : ''
    }
})



const getPreviewDate = (cfg: InstallmentConfig) => {
    if (cfg.dueDateType === 'relative' && form.value.startDate) {
        const d = new Date(form.value.startDate)
        d.setMonth(d.getMonth() - cfg.relativeMonths)
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    if (cfg.dueDateType === 'precise' && cfg.dueDate) {
        return new Date(cfg.dueDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    return '—'
}

// Itinerary Helpers
const offerDuration = computed(() => {
    if (!form.value.startDate || !form.value.endDate) return 0
    const start = new Date(form.value.startDate)
    const end = new Date(form.value.endDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    const diffMs = end.getTime() - start.getTime()
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1 // +1 perché il giorno di partenza conta
    return days > 0 ? days : 0
})

const syncItineraryWithDuration = () => {
    const target = offerDuration.value
    if (target <= 0) return
    const current = form.value.itinerary.length
    if (current < target) {
        // Aggiunge i giorni mancanti
        for (let i = current; i < target; i++) {
            form.value.itinerary.push({ title: '', description: '' })
        }
    } else if (current > target) {
        // Rimuove i giorni in eccesso dalla fine
        form.value.itinerary.splice(target)
    }
}

// Auto-sync itinerary when dates change
watch([() => form.value.startDate, () => form.value.endDate], () => {
    if (offerDuration.value > 0) {
        syncItineraryWithDuration()
    }
})

const addDay = () => {
    form.value.itinerary.push({ title: '', description: '' })
}

const removeDay = (index: number) => {
    form.value.itinerary.splice(index, 1)
}

const importTripItinerary = async () => {
    if (!form.value.trip) {
        formError.value = 'Seleziona prima un viaggio'
        setTimeout(() => { formError.value = null }, 3000)
        return
    }

    // Find selected trip ID/DocumentID
    const tripId = form.value.trip

    try {
        // We need to fetch the trip's itinerary
        const res = await fetch(`${apiUrl}/api/trips/${tripId}?populate[itinerary]=*`, {
            headers: { Authorization: `Bearer ${token.value}` }
        })

        if (!res.ok) throw new Error('Impossibile recuperare itinerario del viaggio')

        const json = await res.json()
        const tripData = json.data?.attributes || json.data

        if (tripData?.itinerary && Array.isArray(tripData.itinerary)) {
            form.value.itinerary = tripData.itinerary.map((d: any) => ({
                title: d.title || '',
                description: d.description || ''
            }))
            toast.success('Itinerario importato dal viaggio!')
        } else {
            toast.info('Il viaggio selezionato non ha un itinerario.')
        }

    } catch (err: any) {
        console.error('Import itinerary error:', err)
        formError.value = 'Errore importazione itinerario'
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
                occupiedSeats: parseInt(form.value.occupiedSeats) || 0,
                allowInstallments: form.value.allowInstallments,
                installmentConfigs: form.value.allowInstallments
                    ? form.value.installmentConfigs.filter(c => c.name.trim() && c.percentage > 0).map(c => ({
                        name: c.name,
                        percentage: c.percentage,
                        dueDateType: c.dueDateType,
                        relativeMonths: c.dueDateType === 'relative' ? c.relativeMonths : null,
                        dueDate: c.dueDateType === 'precise' ? c.dueDate : null,
                    }))
                    : [],
                itinerary: form.value.itinerary.filter(d => d.title.trim())
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

const deleteOffer = (offer: any) => {
    itemToDelete.value = offer
    confirmMessage.value = `Sei sicuro di voler eliminare questa offerta? Questa azione è irreversibile.`
    showConfirm.value = true
}

const confirmDelete = async () => {
    if (!itemToDelete.value) return
    const offer = itemToDelete.value
    showConfirm.value = false

    const docId = offer.documentId || offer.id
    deleting.value = docId
    try {
        const res = await fetch(`${apiUrl}/api/offers/${docId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token.value}` },
        })
        if (!res.ok) throw new Error('Errore nella cancellazione')
        offers.value = offers.value.filter((o: any) => (o.documentId || o.id) !== docId)
        toast.success('Offerta eliminata con successo')
    } catch (err) {
        console.error('Delete error:', err)
        toast.error('Errore nella cancellazione dell\'offerta')
    } finally {
        deleting.value = null
        itemToDelete.value = null
    }
}

const getTripTitle = (offer: any) => {
    return offer.trip?.title || offer.trip?.data?.attributes?.title || '—'
}

const getParticipantsCount = (offer: any) => {
    // Use occupiedSeats field if available, otherwise count participants
    if (offer.occupiedSeats !== undefined && offer.occupiedSeats !== null) {
        return offer.occupiedSeats
    }
    const p = offer.participants
    if (!p) return 0
    if (Array.isArray(p)) return p.length
    return p?.data?.length || 0
}

const formatDate = (d: string) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getDateLabel = (dateStr: string) => {
    return dateStr ? formatDate(dateStr) : "Seleziona data"
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
                    <div
                        class="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div class="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                            <h2 class="text-xl font-bold text-slate-900">
                                {{ editingId ? 'Modifica Offerta' : 'Nuova Offerta' }}
                            </h2>
                            <button @click="showForm = false"
                                class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50">
                                <X class="w-5 h-5" />
                            </button>
                        </div>


                        <div class="p-6 flex-1 overflow-y-auto custom-scrollbar">
                            <div class="lg:grid lg:grid-cols-2 lg:gap-8 space-y-8">
                                <!-- Left Column: General Info -->
                                <div class="space-y-4">
                                    <h3
                                        class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 lg:hidden">
                                        Dettagli Generali</h3>

                                    <div>
                                        <Label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Viaggio
                                            *</Label>
                                        <Select v-model="form.trip">
                                            <SelectTrigger
                                                class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                                                <SelectValue placeholder="Seleziona viaggio..." />
                                            </SelectTrigger>
                                            <SelectContent class="z-[100]">
                                                <SelectItem v-for="t in trips" :key="t.documentId || t.id"
                                                    :value="t.documentId || t.id">
                                                    {{ t.title }}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label
                                                class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Prezzo
                                                (€) *</Label>
                                            <Input v-model="form.price" type="number" step="0.01"
                                                class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all placeholder:font-normal"
                                                placeholder="0.00" />
                                        </div>
                                        <div>
                                            <Label
                                                class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Acconto
                                                (€)</Label>
                                            <Input v-model="form.depositPrice" type="number" step="0.01"
                                                class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all placeholder:font-normal"
                                                placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Data
                                                Inizio *</Label>
                                            <Popover>
                                                <PopoverTrigger as-child>
                                                    <Button variant="outline"
                                                        class="w-full h-11 px-4 justify-start text-left font-medium rounded-xl border-slate-200 hover:bg-slate-50"
                                                        :class="!form.startDate && 'text-slate-400 font-normal'">
                                                        <Calendar class="mr-2 h-4 w-4 opacity-50" />
                                                        {{ getDateLabel(form.startDate) }}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent class="w-auto p-0 z-[100]" align="start">
                                                    <CalendarComponent mode="single" locale="it-IT"
                                                        v-model="startDateValue"
                                                        initial-focus />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div>
                                            <Label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Data
                                                Fine *</Label>
                                            <Popover>
                                                <PopoverTrigger as-child>
                                                    <Button variant="outline"
                                                        class="w-full h-11 px-4 justify-start text-left font-medium rounded-xl border-slate-200 hover:bg-slate-50"
                                                        :class="!form.endDate && 'text-slate-400 font-normal'">
                                                        <Calendar class="mr-2 h-4 w-4 opacity-50" />
                                                        {{ getDateLabel(form.endDate) }}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent class="w-auto p-0 z-[100]" align="start">
                                                    <CalendarComponent mode="single" locale="it-IT"
                                                        v-model="endDateValue"
                                                        initial-focus />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Max
                                                Partecipanti *</Label>
                                            <Input v-model="form.maxParticipants" type="number"
                                                class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all placeholder:font-normal"
                                                placeholder="20" />
                                        </div>
                                        <div>
                                            <Label class="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Posti
                                                Occupati</Label>
                                            <Input v-model="form.occupiedSeats" type="number"
                                                class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all placeholder:font-normal"
                                                placeholder="0" />
                                        </div>
                                    </div>

                                    <!-- Installment Configuration -->
                                    <div class="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <!-- Global Enable Installments -->
                                        <div class="flex items-center gap-3 mb-4">
                                            <Switch id="allow-installments" :checked="form.allowInstallments"
                                                @update:checked="(v: boolean) => form.allowInstallments = v" />
                                            <Label for="allow-installments"
                                                class="text-xs font-bold text-slate-900 uppercase tracking-wider cursor-pointer">
                                                Pagamento a Rate
                                            </Label>
                                        </div>

                                        <div v-if="form.allowInstallments" class="space-y-3">
                                            <div v-for="(cfg, i) in form.installmentConfigs" :key="i"
                                                class="bg-white rounded-lg p-3 border border-slate-100 relative shadow-sm">

                                                <!-- Header: Name + Remove -->
                                                <div class="flex items-center gap-2 mb-3">
                                                    <Input v-model="cfg.name" type="text"
                                                        class="flex-1 h-8 px-2 text-xs font-bold placeholder:font-normal"
                                                        :placeholder="`Rata ${i + 1}`" />
                                                    <button @click="removeInstallment(i)" type="button"
                                                        class="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors">
                                                        <Trash2 class="w-4 h-4" />
                                                    </button>

                                                </div>

                                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <!-- Left: Amount Input -->
                                                    <div>
                                                        <div class="flex items-center justify-between mb-1.5">
                                                            <span
                                                                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Importo
                                                                (€)</span>
                                                            <span class="text-[10px] font-medium text-slate-400">{{
                                                                cfg.percentage.toFixed(1) }}%</span>
                                                        </div>
                                                        <Input type="number" :model-value="cfg.amount" :min="0"
                                                            :max="parseFloat(form.price) || 0" :step="1"
                                                            @update:model-value="(v: string | number) => handleAmountUpdate(i, Number(v))"
                                                            class="h-9 text-sm font-bold text-primary" />
                                                    </div>

                                                    <!-- Right: Date Control -->
                                                    <div>
                                                        <div class="flex items-center justify-between mb-1.5">
                                                            <span
                                                                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scadenza</span>
                                                            <span v-if="cfg.dueDateType === 'precise'"
                                                                class="text-[10px] font-medium text-slate-500 truncate">{{
                                                                    getPreviewDate(cfg) }}</span>
                                                        </div>
                                                        <div class="flex gap-2">
                                                            <div class="relative flex-1">
                                                                <Select
                                                                    :model-value="cfg.dueDateType === 'relative' ? cfg.relativeMonths?.toString() : 'precise'"
                                                                    @update:model-value="(val) => {
                                                                        if (val && val !== 'precise') {
                                                                            cfg.dueDateType = 'relative';
                                                                            cfg.relativeMonths = parseInt(val);
                                                                            cfg.dueDate = '';
                                                                        }
                                                                    }">
                                                                    <SelectTrigger
                                                                        class="w-full h-9 text-xs font-medium">
                                                                        <SelectValue placeholder="Seleziona..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem v-for="m in getAvailableMonths(i)"
                                                                            :key="m" :value="m.toString()">
                                                                            {{ m }} {{ m === 1 ? 'mese' : 'mesi' }}
                                                                            prima
                                                                        </SelectItem>
                                                                        <SelectItem value="precise" class="hidden">Data
                                                                            personalizzata</SelectItem>
                                                                    </SelectContent>
                                                                </Select>

                                                                <!-- Arrow icon overlay removed as SelectTrigger has one -->
                                                            </div>

                                                            <Popover>
                                                                <PopoverTrigger as-child>
                                                                    <button type="button"
                                                                        class="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                                                                        :class="{ 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20': cfg.dueDateType === 'precise' }"
                                                                        title="Seleziona data precisa">
                                                                        <Calendar class="w-4 h-4" />
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent class="w-auto p-0" align="end">
                                                                    <CalendarComponent mode="single" locale="it-IT"
                                                                        :model-value="getCalendarDate(cfg.dueDate)"
                                                                        @update:model-value="(v) => setCalendarDate(v as DateValue | undefined, cfg)"
                                                                        initial-focus />
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                        <p v-if="dateErrors[i]"
                                                            class="text-[10px] text-red-500 mt-1 text-right font-bold">
                                                            {{ dateErrors[i] }}</p>
                                                        <p v-else-if="cfg.dueDateType === 'relative'"
                                                            class="text-[10px] text-slate-400 mt-1 text-right">Prevista:
                                                            {{ getPreviewDate(cfg) }}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Total amount bar -->
                                            <div class="flex items-center gap-2 px-1">
                                                <div class="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                                    <div class="h-full rounded-full transition-all duration-300"
                                                        :class="Math.abs(form.installmentConfigs.reduce((s, c) => s + c.amount, 0) - (parseFloat(form.price) || 0)) < 0.01 ? 'bg-green-500' : 'bg-orange-400'"
                                                        :style="{ width: Math.min((form.installmentConfigs.reduce((s, c) => s + c.amount, 0) / (parseFloat(form.price) || 1)) * 100, 100) + '%' }">
                                                    </div>
                                                </div>
                                                <span class="text-[10px] font-bold"
                                                    :class="Math.abs(form.installmentConfigs.reduce((s, c) => s + c.amount, 0) - (parseFloat(form.price) || 0)) < 0.01 ? 'text-green-600' : 'text-orange-500'">
                                                    €{{form.installmentConfigs.reduce((s, c) => s + c.amount,
                                                        0).toFixed(2)}}
                                                    / €{{ parseFloat(form.price) || 0 }}
                                                </span>
                                            </div>

                                            <button @click="addInstallment" type="button"
                                                class="w-full text-xs font-bold text-primary hover:text-primary/80 transition-colors px-3 py-2 bg-primary/10 rounded-lg flex items-center justify-center gap-1">
                                                <Plus class="w-3 h-3" /> Aggiungi Rata
                                            </button>
                                        </div>
                                        <p v-else class="text-xs text-slate-400">Attiva per definire un piano di
                                            pagamento rateale per questa offerta.</p>
                                    </div>

                                    <p v-if="formError"
                                        class="text-sm text-red-500 font-medium bg-red-50 px-4 py-2 rounded-xl">
                                        {{ formError }}
                                    </p>
                                </div>

                                <!-- Right Column: Itinerary Section -->
                                <div class="relative bg-slate-50/50 rounded-2xl lg:bg-transparent">
                                    <div class="p-4 lg:p-0 lg:absolute lg:inset-0 flex flex-col">
                                        <div class="flex items-center justify-between mb-4 shrink-0">
                                            <div class="flex items-center gap-2">
                                                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                                    Itinerario Offerta</h3>
                                                <span v-if="offerDuration > 0" class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                    :class="form.itinerary.length === offerDuration
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-orange-100 text-orange-700'">
                                                    {{ form.itinerary.length }}/{{ offerDuration }} giorni
                                                </span>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <button @click="importTripItinerary" type="button"
                                                    class="text-xs font-bold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 bg-primary/10 rounded-lg">
                                                    Importa da Viaggio
                                                </button>
                                                <button @click="addDay" type="button"
                                                    class="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5 bg-slate-100 rounded-lg flex items-center gap-1">
                                                    <Plus class="w-3 h-3" /> Aggiungi
                                                </button>
                                            </div>
                                        </div>

                                        <div
                                            class="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px] lg:min-h-0">
                                            <div v-if="form.itinerary.length > 0" class="space-y-3">
                                                <div v-for="(day, i) in form.itinerary" :key="i"
                                                    class="bg-slate-50 rounded-xl p-3 relative group border border-slate-100 hover:border-primary/20 transition-colors">
                                                    <div class="flex items-center justify-between mb-2">
                                                        <span class="text-xs font-bold text-slate-400 uppercase">Giorno
                                                            {{ i + 1 }}</span>
                                                        <button @click="removeDay(i)" type="button"
                                                            class="text-red-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors">
                                                            <Trash2 class="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <div class="space-y-2">
                                                        <input v-model="day.title" type="text"
                                                            class="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                            :placeholder="`Titolo giorno ${i + 1}`" />
                                                        <textarea v-model="day.description" rows="3"
                                                            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                                                            placeholder="Descrizione..."></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-else
                                                class="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                                                <div
                                                    class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                    <Calendar class="w-6 h-6 text-slate-300" />
                                                </div>
                                                <p class="text-sm font-bold text-slate-600 mb-1">Nessun itinerario</p>
                                                <p class="text-xs text-slate-400 max-w-[200px]">
                                                    L'offerta utilizzerà l'itinerario predefinito del viaggio.
                                                </p>
                                                <button @click="importTripItinerary" type="button"
                                                    class="mt-4 text-xs font-bold text-primary hover:underline">
                                                    Importa ora
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="p-6 border-t border-slate-100 flex items-center gap-3 shrink-0">
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
        <TableSkeleton v-if="loading" :rows="5" :columns="5" />

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
                            @click="openDetails(offer)"
                            class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
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
                                    {{ getParticipantsCount(offer) }} / {{ offer.maxParticipants || '—' }}
                                </Badge>
                            </td>
                            <td class="py-4 px-6" @click.stop>
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="openDetails(offer)"
                                        class="p-2 text-slate-400 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-colors">
                                        <Eye class="w-4 h-4" />
                                    </button>
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

    <!-- Details Modal -->
    <Teleport to="body">
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="selectedOffer" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="selectedOffer = null"></div>
                <div
                    class="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    <!-- Header -->
                    <div
                        class="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
                        <div>
                            <h2 class="text-xl font-black text-slate-900">Dettagli Offerta</h2>
                            <p class="text-sm text-slate-500 font-medium">{{ getTripTitle(selectedOffer) }}</p>
                        </div>
                        <button @click="selectedOffer = null"
                            class="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="overflow-y-auto p-6 space-y-8">
                        <!-- Dates & Status -->
                        <div class="bg-slate-50 rounded-2xl p-6">
                            <div class="grid grid-cols-2 gap-6">
                                <div>
                                    <p class="text-xs font-bold text-slate-400 uppercase mb-1">Periodo</p>
                                    <div class="flex items-center gap-2 font-bold text-slate-800">
                                        <Calendar class="w-4 h-4 text-primary" />
                                        {{ formatDate(selectedOffer.startDate) }} – {{ formatDate(selectedOffer.endDate)
                                        }}
                                    </div>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-400 uppercase mb-1">Stato Posti</p>
                                    <Badge
                                        class="bg-secondary/10 text-secondary border-none font-bold text-base px-3 py-1">
                                        {{ getParticipantsCount(selectedOffer) }} / {{ selectedOffer.maxParticipants }}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <!-- Pricing -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-4 rounded-xl border border-slate-100 bg-white">
                                <p class="text-xs font-bold text-slate-400 uppercase mb-1">Prezzo Totale</p>
                                <p class="text-2xl font-black text-slate-900">€{{ selectedOffer.price }}</p>
                            </div>
                            <div class="p-4 rounded-xl border border-slate-100 bg-white">
                                <p class="text-xs font-bold text-slate-400 uppercase mb-1">Acconto Richiesto</p>
                                <p class="text-2xl font-black text-slate-900">€{{ selectedOffer.depositPrice }}</p>
                            </div>
                        </div>

                        <!-- Participants List -->
                        <div>
                            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Partecipanti
                                Confermati</h3>

                            <div v-if="loadingDetails" class="flex justify-center py-8">
                                <Loader2 class="w-8 h-8 text-primary animate-spin" />
                            </div>

                            <div v-else-if="offerBookings.length === 0" class="text-center py-8 text-slate-400">
                                <p>Nessun partecipante confermato per questa offerta.</p>
                            </div>

                            <div v-else class="space-y-3">
                                <div v-for="b in offerBookings" :key="b.id"
                                    class="p-4 rounded-xl border border-slate-100 bg-white flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {{ b.user?.firstName?.charAt(0) || b.user?.username?.charAt(0) || '?' }}
                                        </div>
                                        <div>
                                            <p class="font-bold text-slate-800 text-sm">
                                                {{ b.user?.firstName ? `${b.user.firstName} ${b.user.lastName}` :
                                                    b.user?.username }}
                                            </p>
                                            <p class="text-xs text-slate-400">{{ b.user?.email }}</p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-xs font-bold text-slate-500">
                                            {{ (b.participants && b.participants.length > 0) ? `${b.participants.length}
                                            posti` : '1 posto' }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Installment Plan -->
                        <div v-if="selectedOffer.allowInstallments && selectedOffer.installmentConfigs && selectedOffer.installmentConfigs.length > 0">
                            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Piano Rateale</h3>
                            <div class="space-y-3">
                                <div v-for="(cfg, i) in selectedOffer.installmentConfigs" :key="i"
                                    class="p-4 rounded-xl border border-slate-100 bg-white flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {{ Number(i) + 1 }}
                                        </div>
                                        <div>
                                            <p class="font-bold text-slate-800 text-sm">{{ cfg.name || `Rata ${Number(i) + 1}` }}</p>
                                            <p class="text-xs text-slate-400">
                                                <template v-if="cfg.dueDateType === 'relative' && cfg.relativeMonths">
                                                    {{ cfg.relativeMonths }} {{ cfg.relativeMonths === 1 ? 'mese' : 'mesi' }} prima della partenza
                                                </template>
                                                <template v-else-if="cfg.dueDate">
                                                    Scadenza: {{ formatDate(cfg.dueDate) }}
                                                </template>
                                                <template v-else>Data da definire</template>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm font-black text-slate-900" v-if="cfg.amount">€{{ cfg.amount }}</p>
                                        <p class="text-[10px] text-slate-400 font-bold" v-if="cfg.percentage">{{ cfg.percentage.toFixed?.(1) || cfg.percentage }}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Itinerary -->
                        <div v-if="selectedOffer.itinerary && selectedOffer.itinerary.length > 0">
                            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Itinerario Personalizzato</h3>
                            <div class="space-y-0 relative border-l-2 border-slate-100 ml-3 pl-6 pb-2">
                                <div v-for="(day, i) in selectedOffer.itinerary" :key="i" class="mb-6 relative">
                                    <div class="absolute -left-[27px] top-0 w-3 h-3 rounded-full bg-white border-[3px] border-primary"></div>
                                    <h4 class="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                                        <span class="text-[10px] font-black text-white bg-primary px-1.5 py-0.5 rounded">Giorno {{ Number(i) + 1 }}</span>
                                        {{ day.title }}
                                    </h4>
                                    <p class="text-slate-500 text-xs leading-relaxed" v-html="day.description"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- Confirm Dialog -->
    <ConfirmDialog :isOpen="showConfirm" title="Elimina Offerta" :message="confirmMessage"
        confirmText="Elimina definitivamente" variant="danger" @close="showConfirm = false" @confirm="confirmDelete" />
</template>
