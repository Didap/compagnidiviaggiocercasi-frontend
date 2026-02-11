<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const checkScroll = () => {
  isScrolled.value = window.scrollY > 20 // Trigger earlier
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<template>
  <nav
    :class="[
      'fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out',
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-6'
    ]"
  >
    <div class="container mx-auto px-6 flex justify-between items-center">
      <!-- Logo -->
      <a href="/" class="flex items-center group">
        <img
          v-if="!isScrolled && !isMobileMenuOpen"
          src="@/assets/logorettangolare.png"
          alt="Compagni di Viaggio Cercasi"
          class="h-14 md:h-16 transition-transform duration-300 group-hover:scale-105 hidden md:block"
        />
        <img
          v-else
          src="@/assets/logoquadrato.png"
          alt="Compagni di Viaggio Cercasi"
          class="h-10 md:h-12 transition-transform duration-300 group-hover:scale-105"
        />
        <!-- Mobile Logo fallback -->
         <img
          v-if="!isScrolled && !isMobileMenuOpen"
          src="@/assets/logoquadrato.png"
          alt="Compagni di Viaggio Cercasi"
          class="h-10 block md:hidden"
        />
      </a>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center gap-8">
        <a href="#" class="text-secondary font-medium hover:text-primary transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
          Destinazioni
        </a>
        <a href="#" class="text-secondary font-medium hover:text-primary transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
          Come Funziona
        </a>
        <a href="#" class="text-secondary font-medium hover:text-primary transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
          Chi Siamo
        </a>
        <a href="#" class="text-secondary font-medium hover:text-primary transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
          Blog
        </a>
        <Button variant="default" class="rounded-full px-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
          Accedi / Registrati
        </Button>
      </div>

      <!-- Mobile Menu Button -->
      <button @click="toggleMobileMenu" class="md:hidden text-secondary p-2 hover:bg-secondary/10 rounded-full transition-colors">
        <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden absolute top-full left-0 w-full bg-white shadow-xl flex flex-col p-6 gap-2 animate-accordion-down border-t border-gray-100"
    >
      <a href="#" class="text-secondary hover:text-primary hover:bg-primary/5 font-medium p-3 rounded-lg transition-colors">Destinazioni</a>
      <a href="#" class="text-secondary hover:text-primary hover:bg-primary/5 font-medium p-3 rounded-lg transition-colors">Come Funziona</a>
      <a href="#" class="text-secondary hover:text-primary hover:bg-primary/5 font-medium p-3 rounded-lg transition-colors">Chi Siamo</a>
      <a href="#" class="text-secondary hover:text-primary hover:bg-primary/5 font-medium p-3 rounded-lg transition-colors">Blog</a>
      <div class="h-px bg-gray-100 my-2"></div>
      <Button class="w-full justify-center rounded-full text-lg py-6">Accedi / Registrati</Button>
    </div>
  </nav>
</template>
