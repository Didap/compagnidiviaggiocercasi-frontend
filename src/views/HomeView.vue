<script setup lang="ts">
import HeroSection from '@/components/HeroSection.vue';
import Navbar from '@/components/Navbar.vue';
import TopRatedTrips from '@/components/TopRatedTrips.vue';
</script>

<template>
  <main class="min-h-screen bg-bg-primary">
    <Navbar />
    <HeroSection />
    <TopRatedTrips />
  </main>
</template>
