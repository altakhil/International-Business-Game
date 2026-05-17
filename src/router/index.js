import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PropertyMapView from '../views/PropertyMapView.vue'
import GameBoardView from '../views/GameBoardView.vue'
import GameView from '../views/GameView.vue'
import CreateGameView from '../views/CreateGameView.vue'
import JoinGameView from '../views/JoinGameView.vue'
import LobbyView from '../views/LobbyView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/create-game',
    name: 'create-game',
    component: CreateGameView
  },
  {
    path: '/join-game',
    name: 'join-game',
    component: JoinGameView
  },
  {
    path: '/lobby/:gameId',
    name: 'lobby',
    component: LobbyView
  },
  {
    path: '/board/:gameId',
    name: 'board',
    component: GameView
  },
  {
    path: '/board',
    name: 'demo-board',
    component: GameBoardView
  },
  {
    path: '/properties',
    name: 'properties',
    component: PropertyMapView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
