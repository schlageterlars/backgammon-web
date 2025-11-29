import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Home from '../views/HomeView.vue'
import Lobby from '../views/LobbyView.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: Home },
  {
    path: '/lobby/:id',
    name: 'Lobby',
    component: Lobby,
    props: true 
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router