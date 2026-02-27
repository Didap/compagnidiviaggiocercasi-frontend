<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import Button from '@/components/ui/button/Button.vue'
import { CreditCard, Plane, Users, Heart } from 'lucide-vue-next'
</script>

<template>
    <main class="min-h-screen bg-white overflow-x-hidden">
        <Navbar />

        <!-- HERO SECTION: IDENTICAL TO HOME -->
        <section class="relative w-full min-h-[80dvh] overflow-hidden bg-bg-primary flex items-center justify-center">
            <!-- Background Animated Elements -->
            <div class="absolute inset-0 pointer-events-none select-none overflow-hidden z-1">
                <img src="@/assets/macchia.png" alt=""
                    class="absolute -top-32 -left-32 w-[600px] h-auto opacity-40 mix-blend-multiply animate-pulse-slow" />
                <img src="@/assets/macchia.png" alt="" style="rotate: 180deg"
                    class="absolute -bottom-32 -right-32 w-[700px] h-auto opacity-40 mix-blend-multiply animate-pulse-slow -scale-x-100" />
                <img src="@/assets/line.png" alt=""
                    class="absolute bottom-0 left-0 w-[25%] max-w-[300px] h-auto object-contain opacity-25 animate-fade-in-path md:block hidden" />
                <img src="@/assets/line.png" alt=""
                    class="absolute top-0 right-0 w-[25%] max-w-[300px] h-auto object-contain opacity-25 transform rotate-180 animate-fade-in-path md:block hidden" />
            </div>

            <!-- Foreground Elements -->
            <div class="absolute inset-0 pointer-events-none select-none overflow-hidden z-20">
                <img src="@/assets/globe.png" alt=""
                    class="absolute top-20 left-[10%] w-20 sm:w-28 h-auto opacity-60 mix-blend-multiply animate-rotate-slow" />
                <img src="@/assets/airplane-passport.png" alt="" style="rotate: 45deg"
                    class="absolute top-40 right-[15%] w-32 sm:w-40 h-auto animate-float drop-shadow-xl opacity-90" />
            </div>

            <div class="container mx-auto px-6 relative z-30 text-center py-20">
                <div class="max-w-4xl mx-auto space-y-6">
                    <span
                        class="inline-block py-1 px-3 rounded-full bg-secondary/10 text-secondary font-semibold text-sm tracking-widest uppercase mb-4">
                        Come Funziona
                    </span>
                    <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-primary leading-[0.9] tracking-tight">
                        Il viaggio <br />
                        <span class="text-secondary/80">perfetto</span> <br />
                        inizia qui.
                    </h1>
                    <p class="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
                        Viaggi organizzati, semplici e chiari. Parti con sconosciuti. Torni con nuovi amici.
                    </p>
                </div>
            </div>

            <!-- Bottom Divider -->
            <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-40 transform translate-y-px">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none"
                    class="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[120px]">
                    <path d="M1200 120L0 120 0 0z" class="fill-white"></path>
                </svg>
            </div>
        </section>

        <!-- STEPS SECTION: REAL CONTENT -->
        <section class="py-24 px-6 bg-white shrink-0">
            <div class="container mx-auto max-w-6xl">
                <div class="grid md:grid-cols-2 gap-16 items-center mb-24">
                    <div class="space-y-6 order-2 md:order-1">
                        <h2 class="text-4xl md:text-5xl font-black text-primary leading-tight">📝 Prenotazione semplice
                            e trasparente</h2>
                        <p class="text-lg text-gray-600 font-medium leading-relaxed">
                            Blocca il tuo posto con € 100, rimborsabili entro 15 giorni.
                            Nessuna quota di iscrizione e nessun costo nascosto: il prezzo è chiaro fin da subito.
                            Il viaggio verrà confermato al raggiungimento del numero minimo di partecipanti.
                        </p>
                        <div class="flex items-center gap-4 text-secondary font-bold">
                            <CreditCard class="w-6 h-6" />
                            <span>Zero costi nascosti</span>
                        </div>
                    </div>
                    <div class="relative order-1 md:order-2">
                        <div
                            class="bg-bg-primary rounded-[2.5rem] p-8 aspect-video flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800"
                                class="rounded-2xl w-full h-full object-cover shadow-2xl" />
                        </div>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-16 items-center mb-24">
                    <div class="relative">
                        <div
                            class="bg-bg-primary rounded-[2.5rem] p-8 aspect-video flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800"
                                class="rounded-2xl w-full h-full object-cover shadow-2xl" />
                        </div>
                    </div>
                    <div class="space-y-6">
                        <h2 class="text-4xl md:text-5xl font-black text-secondary leading-tight">🛫 Libertà di viaggio
                        </h2>
                        <p class="text-lg text-gray-600 font-medium leading-relaxed">
                            Il volo non è incluso, così puoi scegliere l'aeroporto e l'orario più comodi per te. Su
                            richiesta possiamo supportarti nella prenotazione.
                            Durante il tour organizziamo tutto con passione e professionalità, lasciandoti sempre del
                            tempo libero per vivere il luogo anche in autonomia.
                            Non utilizziamo la cassa comune: ognuno paga solo ciò che sceglie.
                        </p>
                        <div class="flex items-center gap-4 text-primary font-bold">
                            <Plane class="w-6 h-6" />
                            <span>Massima flessibilità</span>
                        </div>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-16 items-center mb-24">
                    <div class="space-y-6 order-2 md:order-1">
                        <h2 class="text-4xl md:text-5xl font-black text-primary leading-tight">👥 Piccoli gruppi, grandi
                            connessioni
                        </h2>
                        <p class="text-lg text-gray-600 font-medium leading-relaxed">
                            Viaggiamo in gruppi di max 15–20 persone per garantire maggiore intimità e coesione.
                            Le camere sono condivise (divise per sesso), ideali per fare nuove amicizie e risparmiare se
                            viaggi da solo.
                            Non abbiamo limiti di età: conta solo la voglia di partire.
                        </p>
                        <div class="flex items-center gap-4 text-secondary font-bold">
                            <Users class="w-6 h-6" />
                            <span>Max 15–20 persone</span>
                        </div>
                    </div>
                    <div class="relative order-1 md:order-2">
                        <div
                            class="bg-bg-primary rounded-[2.5rem] p-8 aspect-video flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800"
                                class="rounded-2xl w-full h-full object-cover shadow-2xl" />
                        </div>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-16 items-center">
                    <div class="relative">
                        <div
                            class="bg-bg-primary rounded-[2.5rem] p-8 aspect-video flex items-center justify-center overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&q=80&w=800"
                                class="rounded-2xl w-full h-full object-cover shadow-2xl" />
                        </div>
                    </div>
                    <div class="space-y-6">
                        <h2 class="text-4xl md:text-5xl font-black text-secondary leading-tight">🇮🇹 Accompagnatore
                            dall'Italia</h2>
                        <p class="text-lg text-gray-600 font-medium leading-relaxed">
                            Al raggiungimento del numero minimo, un accompagnatore di Compagni di Viaggio Cercasi
                            partirà dall'Italia insieme al gruppo, per vivere l'esperienza passo dopo passo.
                        </p>
                        <div class="flex items-center gap-4 text-primary font-bold">
                            <Heart class="w-6 h-6" />
                            <span>Sempre al tuo fianco</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FINAL CTA -->
        <section class="py-24 px-6 bg-bg-primary text-center">
            <div class="container mx-auto max-w-4xl">
                <h2 class="text-4xl md:text-6xl font-black text-primary leading-tight mb-8">Parti con
                    sconosciuti.<br />Torni con nuovi amici.</h2>
                <p class="text-xl text-gray-600 font-medium mb-12">💛 Viaggi organizzati, semplici e chiari.</p>
                <RouterLink to="/destinazioni">
                    <Button size="lg" class="h-16 px-12 text-xl rounded-full shadow-2xl">
                        Scegli la tua Destinazione
                    </Button>
                </RouterLink>
            </div>
        </section>
    </main>
</template>

<style scoped>
h1,
h2 {
    font-feature-settings: "ss01", "ss02", "salt";
}
</style>
