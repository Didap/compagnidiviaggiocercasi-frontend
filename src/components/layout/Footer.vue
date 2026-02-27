<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Facebook, Instagram, MapPin, Mail, Phone } from 'lucide-vue-next'
import logoRettangolare from '@/assets/logorettangolare.png'

const currentYear = new Date().getFullYear()

const links = {
    esplora: [
        { label: 'Destinazioni', to: '/destinazioni' },
        { label: 'Chi Siamo', to: '/chi-siamo' },
        { label: 'Come Funziona', to: '/come-funziona' },
        { label: 'Blog', to: '/blog' },
        { label: 'Gift Card', to: '/gift-card' }
    ]
}
</script>

<template>
    <footer class="bg-bg-primary text-slate-600 py-16">
        <div class="container mx-auto px-4 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">

                <!-- Brand -->
                <div class="space-y-6">
                    <RouterLink to="/" class="block">
                        <img :src="logoRettangolare" alt="Compagni Di Viaggio" class="h-20 w-auto" />
                    </RouterLink>
                    <p class="text-slate-600 leading-relaxed text-sm max-w-sm">
                        Non siamo il solito tour operator. Siamo una community di viaggiatori che esplora il mondo
                        insieme, creando legami autentici e ricordi indimenticabili.
                    </p>
                    <div class="flex items-center gap-4">
                        <a href="https://www.instagram.com/compagnidiviaggiocercasi/" target="_blank"
                            class="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group shadow-sm">
                            <Instagram class="w-5 h-5" />
                        </a>
                        <a href="https://www.facebook.com/groups/1388438311465622" target="_blank"
                            class="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group shadow-sm">
                            <Facebook class="w-5 h-5" />
                        </a>
                        <a href="https://www.tiktok.com/@compagnidiviaggiocercasi" target="_blank"
                            class="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="w-5 h-5">
                                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                            </svg>
                        </a>
                    </div>
                </div>

                <!-- Esplora -->
                <div>
                    <h3 class="text-slate-900 font-bold mb-6 text-lg">Esplora</h3>
                    <ul class="space-y-4">
                        <li v-for="link in links.esplora" :key="link.to">
                            <RouterLink :to="link.to"
                                class="text-sm font-medium hover:text-primary hover:translate-x-1 transition-all flex items-center gap-2">
                                <span>{{ link.label }}</span>
                            </RouterLink>
                        </li>
                    </ul>
                </div>

                <!-- Contatti -->
                <div>
                    <h3 class="text-slate-900 font-bold mb-6 text-lg">Contatti</h3>
                    <ul class="space-y-6">
                        <li class="flex items-start gap-4">
                            <MapPin class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span class="text-sm">Via Dalmazia 21A,<br>Brindisi - ITA</span>
                        </li>
                        <li class="flex items-center gap-4">
                            <Mail class="w-5 h-5 text-primary flex-shrink-0" />
                            <RouterLink to="/contatti" class="text-sm hover:text-primary transition-colors">Scrivici un
                                messaggio</RouterLink>
                        </li>
                        <li class="flex items-center gap-4">
                            <Phone class="w-5 h-5 text-primary flex-shrink-0" />
                            <a href="tel:+393282437881" class="text-sm hover:text-primary transition-colors">+39 328 243
                                7881</a>
                        </li>
                    </ul>
                </div>

            </div>

            <!-- Bottom -->
            <div class="pt-8 border-t border-slate-200 mt-16 space-y-4 text-center">
                <p class="text-xs text-slate-500 leading-relaxed max-w-4xl mx-auto">
                    COMPAGNI DI VIAGGIO CERCASI SRLS | Via Dalmazia 21/A, 72100 Brindisi (BR) | P.IVA/C.F. 02778420741 |
                    REA BR-256121 | SCIA Agenzia Viaggi – Comune di Brindisi 25/06/2025 | RC e Garanzia Insolvenza: Sara
                    Assicurazioni (valide fino al 01/07/2026) | PEC: <a href="mailto:compagnidiviaggiocercasi@pec.it"
                        class="hover:text-primary transition-colors">compagnidiviaggiocercasi@pec.it</a>
                </p>
                <div class="flex flex-wrap justify-center items-center gap-4 text-xs text-slate-500">
                    <span>&copy; {{ currentYear }} Tutti i diritti riservati</span>
                    <span class="hidden sm:inline text-slate-300">|</span>
                    <RouterLink to="/privacy-policy" class="hover:text-primary transition-colors">Privacy Policy
                    </RouterLink>
                    <span class="hidden sm:inline text-slate-300">|</span>
                    <RouterLink to="/cookie-policy" class="hover:text-primary transition-colors">Cookie Policy
                    </RouterLink>
                </div>
                <div class="pt-2">
                    <a href="https://didap.it" target="_blank" rel="noopener noreferrer"
                        class="text-xs text-slate-400 hover:text-primary transition-colors inline-block">
                        developed by 🐵
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>
