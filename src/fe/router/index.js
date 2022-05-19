import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SimulationView from "@/fe/views/SimulationView";
import MapView from "@/fe/views/MapView";
import DataStats from "@/fe/views/DataStats";
import store from '@/fe/store/'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/sim',
    name: 'sim',
    component: SimulationView
  },
  {
    path: '/map',
    name: 'map',
    component: MapView
  },
  {
    path: '/data',
    name: 'data',
    component: DataStats
  }
]

const router = new VueRouter({
  routes
})

/**
 * Guard that disallows to navigate anywhere in the app until the user is connected to the NewSync server.
 */
router.beforeEach(async (to, from, next) => {
  if (!store.state.ready && to.name !== 'home') {
    next('/')
  }
  next()
})

export default router
