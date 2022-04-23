import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SimulationView from "@/fe/views/SimulationView";
import AboutView from '@/fe/views/AboutView'
import MapView from "@/fe/views/MapView";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
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
  }
]

const router = new VueRouter({
  routes
})

export default router
