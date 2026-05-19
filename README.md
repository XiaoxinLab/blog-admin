# Blog Admin

基于 **Vue 3 + Vite + Tailwind CSS** 构建的博客后台管理系统。

## 技术栈

- **Vue 3** (Composition API + `<script setup>`)
- **Vite 5** - 构建工具
- **Vue Router 4** - 路由管理
- **Tailwind CSS** - 原子化 CSS 框架
- **Axios** - HTTP 请求
- **markdown-it + highlight.js** - Markdown 编辑与渲染
- **@vueuse/core** - 组合式工具函数

## 功能模块

- 仪表盘 - 文章数据统计概览
- 文章管理 - 文章 CRUD、模糊搜索、分页、上架/下架
- 项目管理 - 项目展示内容的增删改查
- 字典管理 - 系统字典项维护
- 访客管理 - 访客记录查看
- JWT 认证 - 登录鉴权与权限控制

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 构建开发版本
npm run build:dev
```

## 环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 项目结构

```
blog-admin/
├── src/
│   ├── api/            # API 服务层
│   ├── components/     # 公共组件 (Header, Sidebar)
│   ├── directives/     # 自定义指令 (权限)
│   ├── utils/          # 工具函数 (axios 封装, auth)
│   └── views/          # 页面组件
├── .env.example        # 环境变量示例
└── vite.config.js
```

## 前后端对接

详细的前后端对接说明请参阅 [API_INTEGRATION.md](./API_INTEGRATION.md)。