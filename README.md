# Blog 后台管理系统

配合 [blog-server](https://github.com/XiaoxinLab/blog-server) 使用的后台管理前端，纯前端单页应用。

## 技术栈

- Vue 3（组合式 API，`<script setup>`）
- Vite 6（打包工具）
- Vue Router 4（**hash 模式**，地址形如 `/#/articles`，部署不需要服务端重写规则）
- Axios（调接口）
- lucide-vue-next（图标）
- markdown-it + highlight.js（文章正文预览与代码高亮）

## 功能一览

| 页面 | 能干什么 |
|---|---|
| 文章管理 | 按关键字和分类筛选；新建、修改、下架；按 ID 恢复已下架的文章；Markdown 编辑器带实时预览；上传封面图和 .md 文件 |
| 项目管理 | 搜索项目；新建、修改、下架；按 ID 恢复；技术栈用标签方式录入；游客体验账号开关 |
| 字典管理 | 按分组查看字典项；新增、修改、删除；新建分组；一键补齐默认文章分类 |
| 组件管理 | 编辑组件展示页的组件内容：标题、说明、分类、HTML/CSS/JS 代码；从模板一键导入 22 个组件 |
| 访问统计 | 近 7/14/30 天趋势；热门页面排行；访客明细（时间、IP、设备、页面、来源） |
| 账号设置 | 查看当前登录账号和令牌；修改自己的密码 |

## 本地开发

```bash
npm install     # 装依赖
npm run dev     # 起开发服务器，默认 http://localhost:5174
npm run build   # 打包到 dist 目录
npm run preview # 本地预览打包结果
```

开发环境的接口地址在 `.env.development` 里，默认指向线上 `https://qisui.asia/request`。

## 部署到服务器

后台是纯静态文件，打包完交给 Nginx 托管就行。仓库里已经放好了配置和脚本。

### 一、服务器上拉代码

```bash
cd /opt
git clone git@github.com:XiaoxinLab/blog-admin.git
cd blog-admin
```

### 二、配置 Nginx

把 `deploy/nginx-admin.conf` 复制到 `/etc/nginx/conf.d/`，改三处：

| 改什么 | 改成什么 |
|---|---|
| `server_name` | 你要用的后台域名，比如 `admin.qisui.asia` |
| `ssl_certificate` / `ssl_certificate_key` | 你自己的证书路径 |
| `root` | 前端文件目录，默认 `/opt/blog-admin/dist` |

```bash
cp deploy/nginx-admin.conf /etc/nginx/conf.d/blog-admin.conf
# 改完域名和证书路径后
nginx -t && nginx -s reload
```

配置里有两段：

- `location /` 托管前端静态文件。后台用的是 hash 路由，浏览器只会请求真实存在的文件，不用配 rewrite
- `location /request/` 把接口请求转到后端 `127.0.0.1:8000`。这样后台和接口同源，不用处理跨域

### 三、解析域名 + 放行端口

在云服务商控制台加一条 A 记录指向服务器公网 IP，安全组放行 80 和 443。

### 四、一键部署

以后每次更新代码，在服务器上跑：

```bash
cd /opt/blog-admin
bash deploy/deploy.sh
```

脚本会依次做四件事：拉代码 → 装依赖 → 构建 → 替换线上目录（旧的先备份到 `/opt/blog-admin-backup`）→ 重载 Nginx。

### 五、验证

打开后台域名，应该看到登录页。用管理员账号登录，左侧导航能看到「文章 / 项目 / 字典 / 组件 / 访问统计 / 账号设置」。

## 环境变量

| 文件 | 变量 | 说明 |
|---|---|---|
| `.env.development` | `VITE_API_BASE_URL` | 开发时的接口地址，默认指向线上 |
| `.env.production` | `VITE_API_BASE_URL` | 生产时的接口地址，默认 `/request`（同源，由 Nginx 转发） |

## 默认账号

| 用户名 | 密码 |
|---|---|
| admin | Aq6y1tSSRbNeldeLwr |

> 这套密码写在 API 文档里，公网上线后请马上到「账号设置」里改掉。

## 目录结构

```
src/
├── components/     通用组件（表格、弹窗、编辑器、上传、图表等）
├── composables/    主题切换
├── data/           组件模板数据（给「从模板导入」用）
├── router/         路由表
├── styles/
│   ├── main.css    结构和节奏
│   └── variants.css 配色和字体令牌（深浅两套）
├── utils/          接口封装、登录态、提示、格式化
└── views/          各个页面
deploy/
├── nginx-admin.conf  Nginx 配置片段
└── deploy.sh         一键部署脚本
```

## 改了配色怎么办

所有颜色和字体都在 `src/styles/variants.css` 的 CSS 变量里，深浅两套各改一次就行，不用翻别的文件。
