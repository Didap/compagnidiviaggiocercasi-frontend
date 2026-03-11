// Redirect .com → .it (301 equivalent via JS)
if (window.location.hostname.endsWith('.com')) {
  const newUrl = window.location.href.replace(window.location.hostname, window.location.hostname.replace(/\.com$/, '.it'))
  window.location.replace(newUrl)
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
