import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import Dashboard from './views/Dashboard.vue'
import ArticleList from './views/ArticleList.vue'
import ArticleEdit from './views/ArticleEdit.vue'
import ArticleDetail from './views/ArticleDetail.vue'
import ProjectList from './views/ProjectList.vue'
import ProjectEdit from './views/ProjectEdit.vue'
import ProjectDetail from './views/ProjectDetail.vue'
import VisitorList from './views/VisitorList.vue'
import DictionaryList from './views/DictionaryList.vue'
import Login from './views/Login.vue'
import permission from './directives/permission'
import auth from './utils/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: ArticleList,
    meta: { requiresAuth: true }
  },
  {
    path: '/articles/new',
    name: 'ArticleNew',
    component: ArticleEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/articles/edit/:id',
    name: 'ArticleEdit',
    component: ArticleEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/articles/detail/:id',
    name: 'ArticleDetail',
    component: ArticleDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'ProjectList',
    component: ProjectList,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/new',
    name: 'ProjectNew',
    component: ProjectEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/edit/:id',
    name: 'ProjectEdit',
    component: ProjectEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/detail/:id',
    name: 'ProjectDetail',
    component: ProjectDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/visitors',
    name: 'VisitorList',
    component: VisitorList,
    meta: { requiresAuth: true }
  },
  {
    path: '/dictionary',
    name: 'DictionaryList',
    component: DictionaryList,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && token) {
    next({ name: 'Dashboard' })
  } else if (to.name === 'VisitorList' && !auth.isAdmin()) {
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresAdmin && !auth.isAdmin()) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

const app = createApp(App)
app.use(router)
app.directive('permission', permission)
app.mount('#app')