import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Home from '../views/HomeView.vue'
import Lobby from '../views/LobbyView.vue'
import ProfileView from '../views/ProfileView.vue'
// #web-comp: Demo Route für Web Components
import WebComponentsDemo from '../views/WebComponentsDemo.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: Home },
  {
    path: '/play',
    name: 'LobbyOffline',
    component: Lobby,
    props: { mode: 'offline' }
  },
  {
    path: '/lobby/:id',
    name: 'LobbyOnline',
    component: Lobby,
    props: { mode: 'online' }
  },
  { path: '/profile/:uid', component: ProfileView, props: true }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router