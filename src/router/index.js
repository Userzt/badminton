import { createRouter, createWebHistory } from 'vue-router'
import Registration from '@/views/Registration.vue'
import Scoring from '@/views/Scoring.vue'
import Results from '@/views/Results.vue'

const routes = [
  {
    path: '/',
    name: 'Registration',
    component: Registration
  },
  {
    path: '/scoring',
    name: 'Scoring',
    component: Scoring
  },
  {
    path: '/results',
    name: 'Results',
    component: Results
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router