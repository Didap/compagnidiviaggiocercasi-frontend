<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import Button from '@/components/ui/button/Button.vue'
import { User, ArrowRight } from 'lucide-vue-next'

const posts = [
    {
        id: 1,
        title: 'Perché viaggiare con sconosciuti ti cambia la vita',
        excerpt: 'Uscire dalla propria zona di comfort è il primo passo verso la scoperta di se stessi e di nuove, incredibili amicizie.',
        date: '12 Febbraio 2024',
        author: 'Elena Rossi',
        category: 'Esperienze',
        image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 2,
        title: 'Mete 2024: dove ci porterà la bussola quest\'anno',
        excerpt: 'Dal Vietnam alla Malesia, ecco le destinazioni più desiderate dalla nostra community per i prossimi mesi.',
        date: '8 Febbraio 2024',
        author: 'Marco Neri',
        category: 'Destinazioni',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800'
    }
]
</script>

<template>
    <main class="min-h-screen bg-white overflow-x-hidden">
        <Navbar />

        <!-- HERO SECTION: IDENTICAL TO HOME -->
        <section class="relative w-full min-h-[60dvh] overflow-hidden bg-bg-primary flex items-center justify-center">
            <!-- Background Animated Elements -->
            <div class="absolute inset-0 pointer-events-none select-none overflow-hidden z-1">
                <img src="@/assets/macchia.png" alt=""
                    class="absolute -top-32 -left-32 w-[600px] h-auto opacity-40 mix-blend-multiply animate-pulse-slow" />
                <img src="@/assets/macchia.png" alt="" style="rotate: 180deg"
                    class="absolute -bottom-32 -right-32 w-[700px] h-auto opacity-40 mix-blend-multiply animate-pulse-slow -scale-x-100" />
            </div>

            <!-- Foreground Elements -->
            <div class="absolute inset-0 pointer-events-none select-none overflow-hidden z-20">
                <img src="@/assets/globe.png" alt=""
                    class="absolute top-20 right-[10%] w-20 sm:w-28 h-auto opacity-40 mix-blend-multiply animate-rotate-slow" />
                <img src="@/assets/airplane-passport.png" alt="" style="rotate: -25deg"
                    class="absolute bottom-20 left-[15%] w-32 sm:w-40 h-auto animate-float drop-shadow-xl opacity-90" />
            </div>

            <div class="container mx-auto px-6 relative z-30 text-center py-24">
                <div class="max-w-4xl mx-auto space-y-6">
                    <span
                        class="inline-block py-1 px-3 rounded-full bg-secondary/10 text-secondary font-semibold text-sm tracking-widest uppercase mb-4">
                        Il Nostro Blog
                    </span>
                    <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-primary leading-[0.9] tracking-tight">
                        Storie di <br />
                        <span class="text-secondary/80">viaggio</span> <br />
                        e amicizia.
                    </h1>
                </div>
            </div>

            <!-- Bottom Divider -->
            <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-40 transform translate-y-px">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none"
                    class="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px]">
                    <path d="M1200 120L0 120 0 0z" class="fill-white"></path>
                </svg>
            </div>
        </section>

        <!-- BLOG GRID -->
        <section class="py-24 px-6 bg-white shrink-0">
            <div class="container mx-auto max-w-6xl">
                <div class="grid md:grid-cols-2 gap-12">
                    <article v-for="post in posts" :key="post.id"
                        class="group bg-bg-primary rounded-[2rem] overflow-hidden border border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-2">
                        <div class="aspect-video overflow-hidden">
                            <img :src="post.image" :alt="post.title"
                                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                        <div class="p-8 md:p-10 space-y-6">
                            <div
                                class="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-secondary/60">
                                <span class="bg-white px-3 py-1 rounded-full text-secondary shadow-sm">{{ post.category
                                    }}</span>
                                <span>{{ post.date }}</span>
                            </div>
                            <h2
                                class="text-3xl font-black text-primary leading-tight group-hover:text-secondary transition-colors">
                                {{ post.title }}
                            </h2>
                            <p class="text-gray-600 font-medium leading-relaxed line-clamp-3">
                                {{ post.excerpt }}
                            </p>
                            <div class="pt-6 flex items-center justify-between border-t border-slate-200/50">
                                <div class="flex items-center gap-2 text-sm font-bold text-gray-500">
                                    <User class="w-4 h-4" />
                                    <span>{{ post.author }}</span>
                                </div>
                                <button
                                    class="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
                                    Leggi tutto
                                    <ArrowRight class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <!-- NEWSLETTER / FOOTER CTA -->
        <section class="py-24 px-6 bg-secondary text-white text-center">
            <div class="container mx-auto max-w-4xl">
                <h2 class="text-4xl md:text-6xl font-black mb-8 leading-tight">Iscriviti al Journal</h2>
                <p class="text-xl opacity-80 mb-12">Ricevi ispirazione e offerte esclusive direttamente nel tuo zaino
                    digitale.</p>
                <div class="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                    <input type="email" placeholder="La tua email"
                        class="flex-1 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary h-16" />
                    <Button size="lg" class="h-16 px-10 rounded-full bg-primary text-white font-black">
                        Iscriviti
                    </Button>
                </div>
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
