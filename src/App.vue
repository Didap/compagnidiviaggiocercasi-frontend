<template>
  <RouterView />
  <Footer v-if="!$route.path.startsWith('/dashboard')" />
  <ToastProvider />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastProvider from '@/components/ui/toast/ToastProvider.vue'
import Footer from '@/components/layout/Footer.vue'
</script>
