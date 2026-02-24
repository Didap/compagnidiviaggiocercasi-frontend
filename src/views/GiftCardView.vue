<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import Button from '@/components/ui/button/Button.vue'
import { Gift, Heart, Calendar, Sparkles } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
</script>

<template>
    <main class="min-h-screen bg-white overflow-x-hidden">
        <Navbar />

        <!-- HERO SECTION -->
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
                        Gift Card
                    </span>
                    <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-primary leading-[0.9] tracking-tight">
                        Dimentica i <br />
                        <span class="text-secondary/80">soliti</span> <br />
                        regali.
                    </h1>
                    <p class="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
                        Regala un viaggio, regala emozioni.
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

        <!-- CONTENT SECTION -->
        <section class="py-24 px-6 bg-white shrink-0">
            <div class="container mx-auto max-w-4xl">
                <div class="space-y-16">

                    <!-- Main Text -->
                    <div class="prose prose-xl mx-auto text-gray-600 font-medium leading-relaxed space-y-8 text-center md:text-left">
                        <p>
                            Regalare un buono vacanza? <strong class="text-primary">Idea top!</strong> È il modo perfetto per dire
                            "Rilassati, divertiti e vivi un'esperienza da ricordare!" Senza lo stress di scegliere
                            destinazioni o date, lasci massima libertà a chi lo riceve.
                        </p>
                        <p>
                            Weekend, avventura, mare o città d'arte—qualsiasi sia il mood, con una gift card
                            <strong class="text-secondary">Compagni di Viaggio Cercasi</strong> si regalano emozioni e momenti speciali.
                            Un pensiero originale che va oltre il classico regalo!
                        </p>
                    </div>

                    <!-- Feature Cards -->
                    <div class="grid md:grid-cols-2 gap-8">
                        <div
                            class="bg-primary/5 rounded-3xl p-10 border border-primary/10 transition-all hover:shadow-xl group">
                            <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Gift class="w-7 h-7 text-primary" />
                            </div>
                            <h3 class="text-2xl font-black text-primary mb-4 group-hover:text-secondary transition-colors">
                                Super Flessibile
                            </h3>
                            <p class="text-gray-500 font-medium leading-relaxed">
                                Scegli l'importo che preferisci e regala ai tuoi cari la possibilità di vivere un'esperienza su misura.
                            </p>
                        </div>
                        <div
                            class="bg-secondary/5 rounded-3xl p-10 border border-secondary/10 transition-all hover:shadow-xl group">
                            <div class="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Sparkles class="w-7 h-7 text-secondary" />
                            </div>
                            <h3 class="text-2xl font-black text-secondary mb-4 group-hover:text-primary transition-colors">
                                Valida Ovunque
                            </h3>
                            <p class="text-gray-500 font-medium leading-relaxed">
                                Valida su tutti i viaggi disponibili con una durata di un anno. C'è tutto il tempo per trovare la destinazione perfetta.
                            </p>
                        </div>
                    </div>

                    <!-- Highlight Box -->
                    <div class="bg-bg-primary rounded-3xl p-10 md:p-14 text-center space-y-6">
                        <div class="flex justify-center gap-4">
                            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Heart class="w-6 h-6 text-primary" />
                            </div>
                            <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                                <Calendar class="w-6 h-6 text-secondary" />
                            </div>
                        </div>
                        <h3 class="text-3xl md:text-4xl font-black text-primary">Un regalo semplice da acquistare</h3>
                        <p class="text-lg text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
                            Le gift card sono un'opzione super flessibile! Potete scegliere l'importo che preferite e regalarle
                            ai vostri cari, dando loro la possibilità di vivere un'esperienza su misura. Sono valide su tutti i
                            viaggi disponibili e hanno una durata di un anno, quindi c'è tutto il tempo per trovare la
                            destinazione perfetta. Un regalo semplice da acquistare, ma che lascia spazio a grandi emozioni!
                        </p>
                        <div class="pt-4">
                            <a href="mailto:info@compagnidiviaggiocercasi.it">
                                <Button size="lg" class="h-16 px-12 text-xl rounded-full shadow-2xl">
                                    Richiedi la tua Gift Card
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FINAL CTA: UNISCITI ALLA COMMUNITY -->
        <section class="py-24 px-6 bg-bg-primary text-center">
            <div class="container mx-auto max-w-4xl">
                <h2 class="text-4xl md:text-6xl font-black text-primary leading-tight mb-8">Unisciti alla Community</h2>
                <p class="text-xl text-gray-600 font-medium mb-12">Ancora pochi passi e farai parte della nostra storia.</p>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <RouterLink to="/destinazioni">
                        <Button size="lg" class="h-16 px-12 text-xl rounded-full shadow-2xl">
                            Scopri i Viaggi
                        </Button>
                    </RouterLink>
                    <a href="mailto:info@compagnidiviaggiocercasi.it">
                        <Button variant="outline" size="lg"
                            class="h-16 px-12 text-xl rounded-full border-2 border-secondary/30 text-secondary hover:bg-secondary hover:text-white transition-all">
                            Contattaci
                        </Button>
                    </a>
                </div>
            </div>
        </section>
    </main>
</template>

<style scoped>
h1,
h2,
h3 {
    font-feature-settings: "ss01", "ss02", "salt";
}
</style>
