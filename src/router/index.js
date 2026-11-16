import { createRouter, createWebHashHistory } from 'vue-router'
import { isLoggedIn, isAdmin } from '@/utils/auth'
import { toastError } from '@/utils/toast'

/**
 * 路由表
 * 说明：使用 hash 模式（地址栏形如 /#/articles），
 * 因为后台打包后是纯静态文件，hash 模式不需要服务器额外配置重写规则。
 */
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true, title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/components/AdminLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/articles'
      },
      {
        path: 'articles',
        name: 'article-list',
        component: () => import('@/views/ArticleListView.vue'),
        meta: { title: '文章管理', admin: true }
      },
      {
        path: 'articles/new',
        name: 'article-create',
        component: () => import('@/views/ArticleEditView.vue'),
        meta: { title: '写文章', admin: true }
      },
      {
        path: 'articles/:id/edit',
        name: 'article-edit',
        component: () => import('@/views/ArticleEditView.vue'),
        meta: { title: '改文章', admin: true }
      },
      {
        path: 'projects',
        name: 'project-list',
        component: () => import('@/views/ProjectListView.vue'),
        meta: { title: '项目管理', admin: true }
      },
      {
        path: 'projects/new',
        name: 'project-create',
        component: () => import('@/views/ProjectEditView.vue'),
        meta: { title: '建项目', admin: true }
      },
      {
        path: 'projects/:id/edit',
        name: 'project-edit',
        component: () => import('@/views/ProjectEditView.vue'),
        meta: { title: '改项目', admin: true }
      },
      {
        path: 'dictionary',
        name: 'dictionary',
        component: () => import('@/views/DictionaryView.vue'),
        meta: { title: '字典管理', admin: true }
      },
      {
        path: 'widgets',
        name: 'widget-list',
        component: () => import('@/views/WidgetView.vue'),
        meta: { title: '组件管理', admin: true }
      },
      {
        path: 'visit',
        name: 'visit',
        component: () => import('@/views/VisitView.vue'),
        meta: { title: '访问统计' }
      },
      {
        path: 'account',
        name: 'account',
        component: () => import('@/views/AccountView.vue'),
        meta: { title: '账号设置' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

/**
 * 路由守卫：负责拦未登录的访问，以及非管理员访问管理员页面
 * @param {object} to - 即将进入的路由
 * @returns {object|boolean} 放行返回 true，重定向返回路由位置对象
 */
router.beforeEach((to) => {
  if (to.meta.public) {
    // 已登录时不该再看到登录页，直接回仪表盘
    if (to.path === '/login' && isLoggedIn()) {
      return { path: '/' }
    }
    return true
  }

  if (!isLoggedIn()) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.admin && !isAdmin()) {
    toastError('这个页面需要管理员权限，当前账号没有')
    return { path: '/' }
  }

  return true
})

/**
 * 路由切换后更新浏览器标签页标题
 * @param {object} to - 刚进入的路由
 * @returns {void}
 */
router.afterEach((to) => {
  const title = to.meta.title || '后台管理'
  document.title = `${title} · ${import.meta.env.VITE_APP_TITLE || 'Blog 后台'}`
})

export default router
