import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/LoginView.vue'),
    },
    {
      path: '/oauth-callback',
      name: 'OAuthCallback',
      component: () => import('@/views/login/OauthCallback.vue'),
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/projects',
      name: 'MyProjects',
      component: () => import('@/views/projects/MyProjectsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/designer/:appId',
      component: () => import('@/views/designer/DesignerShell.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: (to: any) => `/designer/${to.params.appId}/pages` },
        { path: 'pages', component: () => import('@/views/designer/PageListView.vue') },
        { path: 'page/:pageId/edit', component: () => import('@/views/designer/DesignerView.vue') },
        { path: 'datasources', component: () => import('@/views/datasource/DatasourceListView.vue') },
        { path: 'workflows', component: () => import('@/views/workflow/WorkflowListView.vue') },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminShell.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
      children: [
        { path: '', redirect: '/admin/users' },
        { path: 'users', component: () => import('@/views/admin/UserManagement.vue') },
        { path: 'roles', component: () => import('@/views/admin/RoleManagement.vue') },
      ],
    },
    {
      path: '/preview/:pageId',
      name: 'Preview',
      component: () => import('@/views/preview/PreviewView.vue'),
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
