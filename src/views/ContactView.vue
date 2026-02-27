<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import ContactForm from '@/components/ContactForm.vue'
import { MapPin, Mail, Phone, Instagram, Facebook } from 'lucide-vue-next'
</script>

<template>
    <main class="min-h-screen bg-white overflow-x-hidden">
        <Navbar />

        <!-- HERO SECTION -->
        <section class="relative w-full min-h-[60dvh] overflow-hidden bg-bg-primary flex items-center justify-center">
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
            </div>

            <div class="container mx-auto px-6 relative z-30 text-center py-20 mt-16">
                <div class="max-w-4xl mx-auto space-y-6">
                    <span
                        class="inline-block py-1 px-3 rounded-full bg-secondary/10 text-secondary font-semibold text-sm tracking-widest uppercase mb-4">
                        Contattaci
                    </span>
                    <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-primary leading-[0.9] tracking-tight">
                        Siamo qui per <br />
                        <span class="text-secondary/80">ascoltarti.</span>
                    </h1>
                    <p class="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed mt-6">
                        Hai domande sui nostri viaggi, vuoi collaborare con noi o semplicemente farci un saluto?
                        Scrivici.
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

        <!-- CONTACT SECTION -->
        <section class="py-24 px-6 bg-white shrink-0">
            <div class="container mx-auto max-w-6xl">
                <div class="grid lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24 items-start">

                    <!-- Info Sidebar -->
                    <div class="space-y-12">
                        <div>
                            <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-6">I nostri recapiti</h2>
                            <p class="text-lg text-slate-500 font-medium leading-relaxed">
                                Preferisci usare altri canali? Nessun problema, ecco dove puoi trovarci.
                            </p>
                        </div>

                        <div class="space-y-8">
                            <!-- Email -->
                            <div class="flex items-start gap-6 group">
                                <div
                                    class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                                    <Mail class="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 class="text-lg font-bold text-slate-800 mb-1">Email</h4>
                                    <a href="mailto:info@compagnidiviaggiocercasi.it"
                                        class="text-slate-500 font-medium hover:text-primary transition-colors hover:underline">info@compagnidiviaggiocercasi.it</a>
                                </div>
                            </div>

                            <!-- Phone -->
                            <div class="flex items-start gap-6 group">
                                <div
                                    class="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-white transition-colors shadow-sm">
                                    <Phone class="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 class="text-lg font-bold text-slate-800 mb-1">Telefono / WhatsApp</h4>
                                    <a href="tel:+393282437881"
                                        class="text-slate-500 font-medium hover:text-secondary transition-colors hover:underline">+39
                                        328 243 7881</a>
                                </div>
                            </div>

                            <!-- Address -->
                            <div class="flex items-start gap-6 group">
                                <div
                                    class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-colors shadow-sm">
                                    <MapPin class="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 class="text-lg font-bold text-slate-800 mb-1">Sede Legale</h4>
                                    <p class="text-slate-500 font-medium leading-relaxed">
                                        Via Dalmazia 21/A<br>
                                        72100 Brindisi (BR)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Social -->
                        <div class="pt-8 border-t border-slate-100">
                            <h4 class="text-lg font-bold text-slate-800 mb-4">Seguici sui Social</h4>
                            <div class="flex items-center gap-4">
                                <a href="https://www.instagram.com/compagnidiviaggiocercasi/" target="_blank"
                                    class="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                                    <Instagram class="w-5 h-5" />
                                </a>
                                <a href="https://www.facebook.com/groups/1388438311465622" target="_blank"
                                    class="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] hover:shadow-lg hover:shadow-[#1877F2]/30 hover:-translate-y-1 transition-all duration-300">
                                    <Facebook class="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Form Container -->
                    <div class="relative">
                        <ContactForm />
                    </div>

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
