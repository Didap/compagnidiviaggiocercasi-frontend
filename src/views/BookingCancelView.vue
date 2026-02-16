<script setup lang="ts">
import { useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-vue-next'

const route = useRoute()
const offerId = route.query.offer_id
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />

        <main class="flex-grow flex items-center justify-center p-6">
            <Card class="max-w-md w-full p-8 text-center rounded-3xl shadow-xl border-none relative overflow-hidden">
                <!-- Background decorative blob -->
                <div
                    class="absolute -top-24 -right-24 w-64 h-64 bg-slate-100 rounded-full blur-3xl pointer-events-none">
                </div>

                <div class="relative z-10">
                    <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle class="w-10 h-10 text-red-500" />
                    </div>

                    <h1 class="text-3xl font-black text-slate-900 mb-2">Prenotazione Annullata</h1>
                    <p class="text-slate-600 mb-8 leading-relaxed">
                        Nessun problema, non è stato effettuato alcun addebito.
                        Puoi riprovare quando vuoi o cercare un altro viaggio.
                    </p>

                    <div class="space-y-3">
                        <RouterLink v-if="offerId" :to="`/offer/${offerId}`">
                            <Button
                                class="w-full h-12 text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all group">
                                <RefreshCw
                                    class="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                Riprova a prenotare
                            </Button>
                        </RouterLink>

                        <RouterLink to="/">
                            <Button variant="outline"
                                class="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700">
                                <ArrowLeft class="w-4 h-4 mr-2" />
                                Torna alla Home
                            </Button>
                        </RouterLink>
                    </div>
                </div>
            </Card>
        </main>
    </div>
</template>
