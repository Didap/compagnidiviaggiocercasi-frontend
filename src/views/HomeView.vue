<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import HeroSection from '@/components/HeroSection.vue'
</script>

<template>
  <main class="min-h-screen bg-bg-primary">
    <Navbar />
    <HeroSection />
    
    <!-- Placeholder for next sections -->
    <section class="container mx-auto py-20">
      <h2 class="text-3xl font-bold text-center text-secondary mb-10">Prossime Partenze</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Example Cards -->
        <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div class="bg-gray-200 h-48 rounded-lg mb-4"></div>
          <h3 class="text-xl font-bold text-primary mb-2">Vietnam & Cambogia</h3>
          <p class="text-gray-600 mb-4">13 Notti / 14 Giorni - A partire da 1.550€</p>
          <button class="text-secondary font-medium hover:underline">Scopri di più →</button>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div class="bg-gray-200 h-48 rounded-lg mb-4"></div>
          <h3 class="text-xl font-bold text-primary mb-2">Malesia Adventures</h3>
          <p class="text-gray-600 mb-4">15 Notti / 16 Giorni - A partire da 2.990€</p>
          <button class="text-secondary font-medium hover:underline">Scopri di più →</button>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div class="bg-gray-200 h-48 rounded-lg mb-4"></div>
          <h3 class="text-xl font-bold text-primary mb-2">Portogallo On The Road</h3>
          <p class="text-gray-600 mb-4">7 Notti / 8 Giorni - A partire da 1.350€</p>
          <button class="text-secondary font-medium hover:underline">Scopri di più →</button>
        </div>
      </div>
    </section>
  </main>
</template>
