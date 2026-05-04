import { createRouter, createWebHistory } from 'vue-router'
import { token } from '@/composables/authState'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/pages/LoginForm.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/users',
      name: 'users.index',
      component: () => import('@/pages/users/Index.vue'),
      meta: { requiresAuth: true, action: 'view', subject: 'User' },
    },
    {
      path: '/roles',
      name: 'roles.index',
      component: () => import('@/pages/roles/Index.vue'),
      meta: { requiresAuth: true, action: 'view', subject: 'Role' },
    },
    {
      path: '/permissions',
      name: 'permissions.index',
      component: () => import('@/pages/permissions/Index.vue'),
      meta: { requiresAuth: true, action: 'view', subject: 'Permission' },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/Dashboard.vue'),
      meta: { requiresAuth: true, title: 'Dashboard' },
    },
  ],
})

router.beforeEach((to, _from) => {
  if (to.meta.requiresAuth && !token.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && token.value) {
    return { name: 'dashboard' }
  }
})

export default router
