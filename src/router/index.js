import { createRouter, createWebHistory } from 'vue-router'
import Registration from '@/views/Registration.vue'
import Scoring from '@/views/Scoring.vue'
import Results from '@/views/Results.vue'
import BallFeeCalculator from '@/views/BallFeeCalculator.vue'

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
  },
  {
    path: '/ball-fee',
    name: 'BallFeeCalculator',
    component: BallFeeCalculator
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router