<script setup lang="ts">
import { onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import { CheckCircle, ArrowRight, User } from 'lucide-vue-next'
import confetti from 'canvas-confetti'

onMounted(() => {
    // Celebration effect
    const duration = 3 * 1000
    const end = Date.now() + duration

        ; (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#F97316', '#FDBA74', '#FFF7ED'] // Primary colors
            })
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#F97316', '#FDBA74', '#FFF7ED']
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        })()
})
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />

        <main class="flex-grow flex items-center justify-center p-6">
            <Card class="max-w-md w-full p-8 text-center rounded-3xl shadow-xl border-none relative overflow-hidden">
                <!-- Background decorative blob -->
                <div
                    class="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none">
                </div>
                <div
                    class="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none">
                </div>

                <div class="relative z-10">
                    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle class="w-10 h-10 text-green-600" />
                    </div>

                    <h1 class="text-3xl font-black text-slate-900 mb-2">Evviva!</h1>
                    <h2 class="text-xl font-bold text-slate-700 mb-4">Prenotazione Confermata</h2>

                    <p class="text-slate-600 mb-8 leading-relaxed">
                        Grazie per aver prenotato con noi! Il tuo posto è stato bloccato con successo.
                        Riceverai una email di conferma a breve.
                    </p>

                    <div class="space-y-3">
                        <RouterLink to="/profilo">
                            <Button
                                class="w-full h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-primary/30 group">
                                <User class="w-4 h-4 mr-2" />
                                Vai ai Miei Viaggi
                                <ArrowRight class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </RouterLink>

                        <RouterLink to="/">
                            <Button variant="ghost"
                                class="w-full h-12 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                                Torna alla Home
                            </Button>
                        </RouterLink>
                    </div>
                </div>
            </Card>
        </main>
    </div>
</template>
