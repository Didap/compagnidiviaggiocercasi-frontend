<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import Button from '@/components/ui/button/Button.vue'
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
                        Chi Siamo
                    </span>
                    <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-primary leading-[0.9] tracking-tight">
                        Siamo una <br />
                        <span class="text-secondary/80">community</span> <br />
                        di viaggiatori.
                    </h1>
                    <p class="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
                        Non siamo il solito tour operator o un’agenzia di viaggio.
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

        <!-- CONTENT SECTION: REAL CONTENT -->
        <section class="py-24 px-6 bg-white shrink-0">
            <div class="container mx-auto max-w-4xl">
                <div class="space-y-12 text-center md:text-left">
                    <h2 class="text-4xl md:text-5xl font-black text-primary leading-tight text-center mb-16">La nostra
                        Missione</h2>

                    <div class="prose prose-xl mx-auto text-gray-600 font-medium leading-relaxed space-y-8">
                        <p>
                            Compagnidiviaggiocercasi.com nasce per connettere persone, culture e storie attraverso
                            quella che è la nostra più grande passione: <strong>VIAGGIARE</strong>.
                        </p>
                        <p>
                            Per fare questo, creiamo gruppi di 20 persone e li mandiamo in giro per il mondo a vivere
                            avventure incredibili. Viaggiare con sconosciuti è un’esperienza da provare!
                        </p>
                        <p>
                            Quale migliore occasione di conoscere altre persone e fare nuove amicizie, di condividere
                            emozioni e interessi comuni e di trascorrere dei momenti intensi e felici alla scoperta di
                            posti nuovi. Se viaggiare e conoscere nuove persone è anche la vostra passione… allora sei
                            nel posto giusto!
                        </p>
                    </div>

                    <!-- La nostra Storia -->
                    <h2 class="text-4xl md:text-5xl font-black text-secondary leading-tight text-center !mt-24">La
                        nostra
                        Storia</h2>

                    <div class="prose prose-xl mx-auto text-gray-600 font-medium leading-relaxed space-y-8">
                        <p class="text-lg md:text-xl italic text-secondary font-bold text-center">
                            Specialisti nei viaggi di gruppo tra sconosciuti... destinati a diventare amici.
                        </p>
                        <p>
                            Tutto ha avuto inizio nel 2012, da un'idea di <strong>Stefano Ciucci</strong>, fondatore e
                            admin del gruppo
                            Compagni di Viaggio Cercasi su Facebook. Dopo una vacanza organizzata con altri viaggiatori
                            mai incontrati prima, Stefano ha scoperto quanto possa essere potente e trasformativo un
                            viaggio condiviso con perfetti sconosciuti. Quella semplice esperienza ha acceso una
                            scintilla: unire persone con la stessa passione per l'avventura e la scoperta, anche se non
                            si conoscono... ancora.
                        </p>
                        <p>
                            Nasce così una community unica, dove chiunque può scegliere la propria meta tra quelle
                            proposte e partire in compagnia, affidandosi a un team preparato e appassionato. Offriamo
                            supporto professionale, prezzi agevolati rispetto ai listini ufficiali, e soprattutto
                            un'atmosfera inclusiva in cui nascono nuove amicizie, legami autentici – e in certi casi,
                            perfino l'amore.
                        </p>
                        <p>
                            Per noi, il viaggio non è solo una destinazione, ma un'emozione da vivere insieme. Che tu
                            parta da solo o in cerca di nuove esperienze, qui troverai persone con cui condividere
                            risate, momenti indimenticabili, e magari anche una nuova parte di te.
                        </p>
                        <p class="text-lg md:text-xl font-bold text-primary text-center">
                            Scegli la tua meta tra i nostri viaggi... al resto pensiamo noi.
                        </p>
                    </div>

                    <div class="grid md:grid-cols-2 gap-8 pt-16">
                        <div
                            class="bg-secondary/5 rounded-3xl p-10 border border-secondary/10 transition-all hover:shadow-xl group">
                            <h3
                                class="text-2xl font-black text-secondary mb-4 group-hover:text-primary transition-colors">
                                Emozioni Condivise</h3>
                            <p class="text-gray-500 font-medium leading-relaxed Small">
                                Condividi la gioia della scoperta con chi parla la tua stessa lingua: quella della
                                curiosità.
                            </p>
                        </div>
                        <div
                            class="bg-primary/5 rounded-3xl p-10 border border-primary/10 transition-all hover:shadow-xl group">
                            <h3
                                class="text-2xl font-black text-primary mb-4 group-hover:text-secondary transition-colors">
                                Nuove Amicizie</h3>
                            <p class="text-gray-500 font-medium leading-relaxed">
                                Parti come estraneo, torna con una famiglia di amici sparsa per tutta Italia.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- SECTION: LAVORA CON NOI -->
        <section class="py-24 px-6 bg-slate-50 border-t border-slate-100">
            <div class="container mx-auto max-w-5xl">
                <!-- Header -->
                <div class="text-center mb-16 space-y-4">
                    <span
                        class="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm tracking-widest uppercase">
                        ✈️ Unisciti a Noi
                    </span>
                    <h2 class="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Lavora con noi</h2>
                    <p class="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
                        Crediamo che viaggiare significhi creare connessioni, emozioni e ricordi che restano nel tempo.
                        Se per te il viaggio non è solo una passione ma una vocazione, potresti entrare a far parte del
                        nostro team.
                    </p>
                    <p class="text-lg text-slate-500 max-w-2xl mx-auto">
                        Siamo alla ricerca di persone motivate, competenti e orientate alla qualità, pronte a
                        contribuire alla crescita del nostro progetto.
                    </p>
                </div>

                <!-- Roles Grid -->
                <div class="mb-20">
                    <h3 class="text-3xl font-black text-center text-primary mb-10">🌍 Le figure che cerchiamo</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <!-- Role 1 -->
                        <div
                            class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div
                                class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl font-bold mb-6">
                                🗺️
                            </div>
                            <h4 class="text-xl font-black text-slate-900 mb-3">Travel Designer</h4>
                            <p class="text-slate-600 leading-relaxed text-sm">
                                Professionisti creativi e strategici, capaci di progettare itinerari curati nei
                                dettagli, esperienze autentiche e viaggi di gruppo ben strutturati. Cerchiamo persone
                                con visione, precisione e forte attenzione all'esperienza del cliente.
                            </p>
                        </div>
                        <!-- Role 2 -->
                        <div
                            class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div
                                class="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary text-xl font-bold mb-6">
                                🤝
                            </div>
                            <h4 class="text-xl font-black text-slate-900 mb-3">Travel Agent</h4>
                            <p class="text-slate-600 leading-relaxed text-sm">
                                Figure commerciali e consulenziali, in grado di accompagnare il cliente nella scelta del
                                viaggio più adatto, offrendo supporto, ascolto e competenza durante tutto il processo di
                                prenotazione.
                            </p>
                        </div>
                        <!-- Role 3 -->
                        <div
                            class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div
                                class="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 text-xl font-bold mb-6">
                                📸
                            </div>
                            <h4 class="text-xl font-black text-slate-900 mb-3">Collaboratori Freelance</h4>
                            <p class="text-slate-600 leading-relaxed text-sm">
                                Guide locali, fotografi, content creator e professionisti del turismo che desiderano
                                collaborare con noi per arricchire l'esperienza di viaggio con il proprio valore
                                aggiunto.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- How to Apply Card -->
                <div
                    class="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 overflow-hidden relative">
                    <!-- Deco -->
                    <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                    <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>

                    <div class="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div
                            class="w-full md:w-1/3 aspect-square rounded-3xl overflow-hidden shrink-0 shadow-md hidden md:flex border-4 border-slate-100 bg-slate-50 items-center justify-center">
                            <img src="@/assets/logoquadrato.png" alt="Compagni di Viaggio"
                                class="w-20 h-auto opacity-20 grayscale" />
                        </div>
                        <div class="w-full md:w-2/3 space-y-6 text-center md:text-left">
                            <h3 class="text-3xl font-black text-slate-900">💌 Come candidarsi</h3>
                            <div class="prose prose-slate max-w-none text-slate-600">
                                <p>
                                    Se ti riconosci in uno di questi ruoli e desideri lavorare in un ambiente dinamico e
                                    in crescita, inviaci un'email con il tuo <strong>curriculum</strong>.
                                </p>
                                <p>
                                    Ricordati di includere una breve <strong>presentazione personale</strong>, il
                                    <strong>ruolo</strong> per cui ti candidi e il perché vorresti collaborare con noi.
                                </p>
                                <p class="text-sm italic text-slate-500">
                                    Valutiamo con attenzione ogni candidatura e cerchiamo persone che condividano i
                                    nostri valori: professionalità, trasparenza e passione per il viaggio.
                                </p>
                            </div>
                            <div class="pt-4 flex justify-center md:justify-start">
                                <a href="mailto:info@compagnidiviaggiocercasi.com?subject=Spettabile%20Team%20-%20Candidatura%20Lavora%20con%20Noi&body=Ciao%2C%0A%0ATi%20scrivo%20per%20sottoporre%20la%20mia%20candidatura%20per%20una%20posizione%20nel%20team.%0A%0A%5BInserisci%20qui%20la%20tua%20breve%20presentazione%5D%0A%0AIn%20allegato%20troverai%20il%20mio%20CV.%0A%0AGrazie%20e%20a%20presto!"
                                    class="inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-8 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-105 hover:-translate-y-1">
                                    Invia Candidatura (Mail)
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FINAL CTA -->
        <section class="py-24 px-6 bg-bg-primary text-center">
            <div class="container mx-auto max-w-4xl">
                <h2 class="text-4xl md:text-6xl font-black text-primary leading-tight mb-8">Unisciti alla Community</h2>
                <p class="text-xl text-gray-600 font-medium mb-12">Ancora pochi passi e farai parte della nostra storia.
                </p>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <RouterLink to="/destinazioni">
                        <Button size="lg" class="h-16 px-12 text-xl rounded-full shadow-2xl">
                            Scopri i Viaggi
                        </Button>
                    </RouterLink>
                    <RouterLink to="/contatti">
                        <Button variant="outline" size="lg"
                            class="h-16 px-12 text-xl rounded-full border-2 border-secondary/30 text-secondary hover:bg-secondary hover:text-white transition-all">
                            Contattaci
                        </Button>
                    </RouterLink>
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
