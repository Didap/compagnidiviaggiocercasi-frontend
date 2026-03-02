<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
</script>

<template>
    <main class="min-h-screen bg-white overflow-x-hidden">
        <Navbar />

        <!-- Header -->
        <section class="pt-32 pb-16 px-6 bg-bg-primary">
            <div class="container mx-auto max-w-4xl text-center">
                <h1 class="text-4xl md:text-6xl font-black text-primary mb-6">Condizioni d’uso del sito</h1>
            </div>
        </section>

        <!-- Content -->
        <section class="py-16 px-6 bg-white shrink-0">
            <div class="container mx-auto max-w-4xl">
                <div class="prose prose-lg mx-auto text-gray-600 font-medium leading-relaxed">
                    <p><strong>CONDIZIONI D’USO DEL SITO</strong></p>
                    <p>Condizioni di utilizzo del sito www.compagnidiviaggiocercasi.it</p>
                    <p>L’accesso e l’utilizzo del sito implicano l’accettazione delle presenti condizioni.</p>

                    <h3 class="text-xl font-bold text-slate-800 mt-8 mb-4">1. Titolare del sito</h3>
                    <p>Il sito è di proprietà di:<br>
                        <strong>Compagni di Viaggio Cercasi SRLS</strong><br>
                        Via Dalmazia 21/A – 72100 Brindisi (BR)<br>
                        P.IVA IT02778420741<br>
                        PEC: <a href="mailto:compagnidiviaggiocercasi@pec.it">compagnidiviaggiocercasi@pec.it</a>
                    </p>

                    <h3 class="text-xl font-bold text-slate-800 mt-8 mb-4">2. Oggetto del sito</h3>
                    <p>Il sito ha finalità informative e commerciali relative all’organizzazione e vendita di pacchetti
                        turistici.</p>

                    <h3 class="text-xl font-bold text-slate-800 mt-8 mb-4">3. Proprietà intellettuale</h3>
                    <p>Tutti i contenuti presenti sul sito (testi, immagini, loghi, grafiche, marchi, video) sono di
                        proprietà della società o concessi in licenza.<br>
                        È vietata la riproduzione, distribuzione o utilizzo non autorizzato.</p>

                    <h3 class="text-xl font-bold text-slate-800 mt-8 mb-4">4. Limitazione di responsabilità</h3>
                    <p>La società non garantisce che il sito sia privo di errori o interruzioni.<br>
                        Non è responsabile per eventuali danni derivanti dall’uso del sito, salvo dolo o colpa grave.
                    </p>

                    <h3 class="text-xl font-bold text-slate-800 mt-8 mb-4">5. Link esterni</h3>
                    <p>Il sito può contenere collegamenti a siti di terze parti.<br>
                        La società non è responsabile dei contenuti di tali siti.</p>

                    <h3 class="text-xl font-bold text-slate-800 mt-8 mb-4">6. Prenotazioni online</h3>
                    <p>Le prenotazioni effettuate tramite il sito sono regolate dalle Condizioni Generali di Contratto
                        dei pacchetti turistici.</p>

                    <h3 class="text-xl font-bold text-slate-800 mt-8 mb-4">7. Protezione dei dati</h3>
                    <p>Il trattamento dei dati personali avviene nel rispetto del Regolamento UE 2016/679.<br>
                        L’informativa completa è disponibile nella sezione Privacy Policy.</p>

                    <h3 class="text-xl font-bold text-slate-800 mt-8 mb-4">8. Legge applicabile</h3>
                    <p>Il sito è regolato dalla legge italiana.</p>
                </div>
            </div>
        </section>
    </main>
</template>

<style scoped>
h1 {
    font-feature-settings: "ss01", "ss02", "salt";
}

/* Ensure prose styles apply properly */
:deep(.prose) {
    max-width: 100%;
}

:deep(.prose p) {
    margin-bottom: 1.5em;
}

:deep(.prose strong) {
    color: #111827;
}

:deep(.prose a) {
    color: #0250ac;
    text-decoration: underline;
}
</style>
