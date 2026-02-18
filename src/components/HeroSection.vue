<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
</script>

<template>
  <section class="relative w-full h-[100dvh] overflow-hidden bg-bg-primary flex items-center justify-center">
    <!-- Foreground Animated Elements - Airplanes & Globe -->
    <div class="absolute inset-0 pointer-events-none select-none overflow-hidden z-20">
      <!-- Globe (Top Left relative to text) -->
      <img src="@/assets/globe.png" alt="Mondo"
        class="absolute top-28 left-[5%] sm:left-[20%] sm:top-80 w-14 sm:w-28 h-auto opacity-60 mix-blend-multiply animate-rotate-slow" />

      <!-- Airplane & Passport (Top Right - Near the line start) -->
      <img src="@/assets/airplane-passport.png" alt="Viaggio" style="rotate: 45deg"
        class="absolute top-44 right-[5%] sm:top-40 sm:right-[25%] w-24 sm:w-40 h-auto animate-float drop-shadow-xl z-20 opacity-90" />

      <!-- Airplane & Passport (Bottom Left - Near the line start) -->
      <img src="@/assets/airplane-passport.png" alt="Viaggio" style="rotate: -25deg"
        class="absolute bottom-20 left-[10%] sm:bottom-10 sm:left-[30%] w-24 sm:w-36 h-auto animate-float drop-shadow-xl z-20 opacity-90 transform rotate-45" />
    </div>

    <!-- Background Animated Elements - Blobs -->
    <div class="absolute inset-0 pointer-events-none select-none overflow-hidden z-1">

      <!-- Blob Top Left -->
      <img src="@/assets/macchia.png" alt=""
        class="absolute -top-32 -left-32 w-[600px] h-auto opacity-40 mix-blend-multiply animate-pulse-slow" />

      <!-- Blob Bottom Right -->
      <img src="@/assets/macchia.png" alt="" style="rotate: 180deg"
        class="absolute -bottom-32 -right-32 w-[700px] h-auto opacity-40 mix-blend-multiply animate-pulse-slow -scale-x-100" />

      <!-- Path Line Left -->
      <img src="@/assets/line.png" alt=""
        class="absolute bottom-0 left-0 w-[25%] max-w-[300px] h-auto object-contain opacity-25 animate-fade-in-path md:block hidden" />

      <!-- Path Line Right -->
      <img src="@/assets/line.png" alt=""
        class="absolute top-0 right-0 w-[25%] max-w-[300px] h-auto object-contain opacity-25 transform rotate-180 animate-fade-in-path md:block hidden" />

    </div>

    <!-- Content Container - Centered -->
    <div
      class="container mx-auto px-6 relative z-30 flex flex-col items-center justify-center h-full text-center pt-10">
      <div class="max-w-4xl space-y-6">

        <!-- Badge / Eyebrow Text -->
        <span
          class="inline-block py-1 px-3 rounded-full bg-secondary/10 text-secondary font-semibold text-sm tracking-widest uppercase mb-4">
          Community di Viaggiatori
        </span>

        <!-- Main Headline -->
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-primary leading-[0.9] tracking-tight">
          Non siamo <br />
          <span class="text-secondary/80">il solito</span> <br />
          tour operator.
        </h1>

        <!-- Subtext -->
        <p class="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
          Connettiamo persone, culture e storie attraverso la nostra più grande passione: <span
            class="bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">VIAGGIARE</span>.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row justify-center gap-4 pt-8">
          <Button size="lg"
            class="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
            Scopri i Viaggi
          </Button>
          <Button variant="outline" size="lg"
            class="h-14 px-10 text-lg rounded-full border-2 border-secondary/30 text-secondary hover:bg-secondary hover:text-white transition-all">
            Chi Siamo
          </Button>
        </div>
      </div>
    </div>
    <!-- Bottom Divider -->
    <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-40 transform translate-y-px">
      <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"
        class="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[120px]">
        <path d="M1200 120L0 120 0 0z" class="fill-white"></path>
      </svg>
    </div>
  </section>
</template>

<style scoped>
/* Custom utility for nicer font rendering on large headings */
h1 {
  font-feature-settings: "ss01", "ss02", "salt";
}
</style>
