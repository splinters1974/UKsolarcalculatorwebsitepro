import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/HomeView.vue')
    },
    {
      path: '/about',
      component: () => import('./views/AboutView.vue')
    },
    {
      path: '/calculator',
      component: () => import('./views/CalculatorView.vue')
    }
  ]
})

createApp(App).use(router).mount('#app')
