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
      path: '/accedi',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/registrati',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
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
        if (!token) return { name: 'login' }
        // Check admin role via API
        try {
          const apiUrl = import.meta.env.VITE_API_URL
          const res = await fetch(`${apiUrl}/api/users/me?populate=role`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) return { name: 'login' }
          const user = await res.json()
          const roleName = user.role?.name?.toLowerCase()
          const roleType = user.role?.type?.toLowerCase()
          if (roleName !== 'admin' && roleType !== 'admin') return { name: 'home' }
        } catch {
          return { name: 'home' }
        }
      },
      children: [
        { path: '', name: 'dashboard', component: () => import('../views/dashboard/DashboardHome.vue') },
        { path: 'viaggi', name: 'dashboard-trips', component: () => import('../views/dashboard/TripsListView.vue') },
        { path: 'viaggi/nuovo', name: 'dashboard-trip-create', component: () => import('../views/dashboard/TripFormView.vue') },
        { path: 'viaggi/:id/modifica', name: 'dashboard-trip-edit', component: () => import('../views/dashboard/TripFormView.vue') },
        { path: 'offerte', name: 'dashboard-offers', component: () => import('../views/dashboard/OffersListView.vue') },
        { path: 'recensioni', name: 'dashboard-reviews', component: () => import('../views/dashboard/ReviewsListView.vue') },
        { path: 'utenti', name: 'dashboard-users', component: () => import('../views/dashboard/UsersListView.vue') },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
