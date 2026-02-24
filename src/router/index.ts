import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/viaggio/:slug',
      name: 'trip-detail',
      component: () => import('../views/TripDetailView.vue'),
    },
    {
      path: '/destinazioni',
      name: 'destinations',
      component: () => import('../views/DestinationsView.vue'),
    },
    {
      path: '/prenota/:offerId',
      name: 'booking',
      component: () => import('../views/BookingView.vue'),
    },
    {
      path: '/prenotazione/successo',
      name: 'booking-success',
      component: () => import('../views/BookingSuccessView.vue'),
    },
    {
      path: '/prenotazione/annullato',
      name: 'booking-cancel',
      component: () => import('../views/BookingCancelView.vue'),
    },
    {
      path: '/accedi',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/come-funziona',
      name: 'how-it-works',
      component: () => import('../views/HowItWorksView.vue'),
    },
    {
      path: '/chi-siamo',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/gift-card',
      name: 'gift-card',
      component: () => import('../views/GiftCardView.vue'),
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('../views/BlogView.vue'),
    },
    {
      path: '/blog/:slug',
      name: 'post-detail',
      component: () => import('../views/PostDetailView.vue'),
    },
    {
      path: '/registrati',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/proponi-viaggio',
      name: 'propose-trip',
      component: () => import('../views/ProposeTripView.vue'),
      beforeEnter: (to, _from, next) => {
        const token = localStorage.getItem('jwt')
        if (!token) {
          next({ name: 'login', query: { redirect: to.fullPath } })
        } else {
          next()
        }
      },
    },
    {
      path: '/profilo',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      beforeEnter: () => {
        const token = localStorage.getItem('jwt')
        if (!token) return { name: 'login' }
      },
    },
    {
      path: '/dashboard',
      component: () => import('../views/dashboard/DashboardLayout.vue'),
      beforeEnter: async () => {
        const token = localStorage.getItem('jwt')
        if (!token) {
          console.warn('[Router] No token found, redirecting to login')
          return { name: 'login' }
        }

        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:1337'
          console.log('[Router] Checking admin role at:', apiUrl)

          const res = await fetch(`${apiUrl}/api/users/me?populate=*`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!res.ok) {
            console.error('[Router] User check failed:', res.status)
            return { name: 'login' }
          }

          const userData = await res.json()
          console.log('[Router] User data received:', userData)

          const roleName = userData.role?.name?.toLowerCase()
          const roleType = userData.role?.type?.toLowerCase()

          console.log('[Router] Role info:', { roleName, roleType })

          if (roleName === 'admin' || roleType === 'admin') {
            return true
          }

          console.warn('[Router] Access denied: User is not an admin')
          return { name: 'home' }
        } catch (err) {
          console.error('[Router] Error in admin guard:', err)
          return { name: 'home' }
        }
      },
      children: [
        { path: '', name: 'dashboard', component: () => import('../views/dashboard/DashboardHome.vue') },
        { path: 'prenotazioni', name: 'dashboard-bookings', component: () => import('../views/dashboard/BookingsListView.vue') },
        { path: 'viaggi', name: 'dashboard-trips', component: () => import('../views/dashboard/TripsListView.vue') },
        { path: 'viaggi/nuovo', name: 'dashboard-trip-create', component: () => import('../views/dashboard/TripFormView.vue') },
        { path: 'viaggi/:id/modifica', name: 'dashboard-trip-edit', component: () => import('../views/dashboard/TripFormView.vue') },
        { path: 'offerte', name: 'dashboard-offers', component: () => import('../views/dashboard/OffersListView.vue') },
        { path: 'recensioni', name: 'dashboard-reviews', component: () => import('../views/dashboard/ReviewsListView.vue') },
        { path: 'posts', name: 'dashboard-posts', component: () => import('../views/dashboard/PostsListView.vue') },
        { path: 'posts/new', name: 'dashboard-post-create', component: () => import('../views/dashboard/PostFormView.vue') },
        { path: 'posts/:id', name: 'dashboard-post-edit', component: () => import('../views/dashboard/PostFormView.vue') },
        { path: 'utenti', name: 'dashboard-users', component: () => import('../views/dashboard/UsersListView.vue') },

        { path: 'proposte', name: 'dashboard-proposals', component: () => import('../views/dashboard/ProposalsListView.vue') },
        { path: 'newsletter', name: 'dashboard-newsletter', component: () => import('../views/dashboard/NewsletterListView.vue') },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
