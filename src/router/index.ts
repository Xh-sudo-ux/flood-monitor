import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'
import Login from '@/views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { public: true }
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { title: '系统概览', icon: 'DataLine' }
        },
        {
          path: 'rainfall',
          name: 'rainfall',
          component: () => import('@/views/Rainfall.vue'),
          meta: { title: '实时雨情', icon: 'Pouring' }
        },
        {
          path: 'waterlevel',
          name: 'waterlevel',
          component: () => import('@/views/WaterLevel.vue'),
          meta: { title: '河流水位', icon: 'Watermelon' }
        },
        {
          path: 'flood-extraction',
          name: 'flood-extraction',
          component: () => import('@/views/FloodExtraction.vue'),
          meta: { title: '洪水提取', icon: 'Filter' }
        },
        {
          path: 'water-analysis',
          name: 'water-analysis',
          component: () => import('@/views/WaterAnalysis.vue'),
          meta: { title: '水域分析', icon: 'PieChart' }
        },
        {
          path: 'spatiotemporal',
          name: 'spatiotemporal',
          component: () => import('@/views/Spatiotemporal.vue'),
          meta: { title: '时空演进', icon: 'Timer' }
        },
        {
          path: 'inundation',
          name: 'inundation',
          component: () => import('@/views/Inundation.vue'),
          meta: { title: '淹没分析', icon: 'MapLocation' }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  if (!to.meta.public && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
