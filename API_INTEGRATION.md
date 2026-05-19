# 博客后台管理系统 - 前后端对接说明

## 📋 项目结构

```
t:\Desktop\MCP Server\
├── server/                 # 后端服务 (Koa + Sequelize + MySQL)
│   ├── src/
│   │   ├── controller/     # 控制器
│   │   ├── service/        # 服务层
│   │   ├── model/          # 数据模型
│   │   ├── router/         # 路由定义
│   │   └── middleware/      # 中间件
│   └── package.json
│
└── blog-admin/             # 前端管理后台 (Vue 3 + Vite + Tailwind)
    ├── src/
    │   ├── api/            # API 服务层
    │   ├── utils/          # 工具函数 (axios 封装)
    │   ├── views/          # 页面组件
    │   └── components/     # 公共组件
    ├── .env                # 环境变量配置
    └── package.json
```

## 🚀 快速启动

### 1. 启动后端服务

```bash
cd t:\Desktop\MCP Server\server

# 安装依赖
npm install

# 配置环境变量（在项目根目录创建 .env 文件）
# .env 文件内容：
APP_PORT=8000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PWD=your_password
MYSQL_DB=blog_database
JWT_SECRET=your_jwt_secret_key

# 启动开发服务器
npm run dev
```

后端服务将在 **http://localhost:8000** 运行

### 2. 启动前端应用

```bash
cd t:\Desktop\MCP Server\blog-admin

# 安装依赖（已完成）
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 **http://localhost:3001** 运行（端口可能不同）

## 🔌 API 接口对接详情

### 已对接的 API 端点

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| **文章列表** | GET | `/article` | 分页获取文章列表 |
| **文章详情** | GET | `/article/findOne/:id` | 获取单篇文章 |
| **创建文章** | POST | `/article` | 创建新文章 |
| **更新文章** | PUT | `/article/:id` | 更新文章内容 |
| **下架文章** | POST | `/article/:id/off` | 软删除文章 |
| **恢复文章** | POST | `/article/:id/on` | 恢复已删除文章 |
| **搜索文章** | GET | `/article/fuzzyKeywords/:key` | 模糊搜索标题 |
| **上传图片** | POST | `/article/upload` | 上传文章封面图 |

### 数据模型映射

后端数据模型 → 前端表单字段：

```javascript
{
  id: Number,                    // 文章 ID
  article_title: String,         // 文章标题 ✅ 必填
  article_author: String,        // 文章作者 ✅ 必填
  article_classification: String,// 文章分类 ✅ 必填
  article_content: String,       // 文章内容 (Markdown) ✅ 必填
  article_img: String,           // 封面图片 URL
  createdAt: Date,               // 创建时间
  updatedAt: Date,               // 更新时间
  deletedAt: Date | null         // 删除时间（软删除）
}
```

## 📁 核心文件说明

### 前端 API 层 ([api/index.js](file:///t:/Desktop/MCP%20Server/blog-admin/src/api/index.js))

- **articleApi**: 文章相关接口封装
- **dashboardApi**: 仪表板统计接口
- **authApi**: 用户认证接口（预留）

### HTTP 客户端 ([utils/request.js](file:///t:/Desktop/MCP%20Server/blog-admin/src/utils/request.js))

基于 axios 封装，包含：
- ✅ 请求拦截器：自动添加 JWT Token
- ✅ 响应拦截器：统一错误处理
- ✅ 401 自动跳转登录页
- ✅ 全局超时设置（10秒）

### 页面组件改造

#### [Dashboard.vue](file:///t:/Desktop/MCP%20Server/blog-admin/src/views/Dashboard.vue)

**改动点：**
- ✅ 从 `/article` 接口获取真实统计数据
- ✅ 动态计算已发布/已下架文章数量
- ✅ 显示最近 5 篇文章
- ✅ 加载状态显示
- ✅ 错误处理与降级显示

#### [ArticleList.vue](file:///t:/Desktop/MCP%20Server/blog-admin/src/views/ArticleList.vue)

**改动点：**
- ✅ 对接分页接口（pageNum, pageSize）
- ✅ 实现模糊搜索（防抖 500ms）
- ✅ 分页组件（上一页/下一页/页码跳转）
- ✅ 软删除/恢复功能
- ✅ 显示后端字段（分类、作者、ID）
- ✅ 加载状态与空状态处理

#### [ArticleEdit.vue](file:///t:/Desktop/MCP%20Server/blog-admin/src/views/ArticleEdit.vue)

**改动点：**
- ✅ 表单字段适配后端模型
- ✅ 编辑时从 API 加载文章数据
- ✅ 创建/更新分别调用不同接口
- ✅ 表单验证（必填项检查）
- ✅ 保存状态按钮禁用
- ✅ 成功后自动跳转列表页

## ⚙️ 配置说明

### 环境变量 ([.env](file:///t:/Desktop/MCP%20Server/blog-admin/.env))

```env
VITE_API_BASE_URL=http://localhost:8000
```

修改此变量可切换后端服务器地址。

### CORS 配置

后端已配置 `@koa/cors` 中间件，允许跨域请求。

如需修改 CORS 策略，编辑：
[server/src/app/index.js](file:///t:/Desktop/MCP%20Server/server/src/app/index.js)

## 🔐 认证说明

当前后端接口需要 JWT 认证：

1. 部分接口需要 `auth` 中间件验证 Token
2. 写入操作需要 `hadAdminPermission` 权限检查
3. 前端会在请求头自动添加 `Authorization: Bearer <token>`

**测试建议：**
- 先通过 Postman/curl 测试接口是否正常
- 或临时注释掉后端路由中的认证中间件进行开发调试

## 🐛 常见问题

### Q1: 前端无法连接后端

**检查清单：**
1. 后端服务是否正常启动（终端无报错）
2. `.env` 中 `VITE_API_BASE_URL` 是否正确
3. 浏览器控制台是否有 CORS 错误
4. 后端端口是否被占用

### Q2: 401 未授权错误

**解决方案：**
- 登录获取 Token 并存储到 localStorage
- 或临时注释认证中间件用于开发测试

### Q3: 数据库连接失败

**检查项：**
- MySQL 服务是否运行
- `.env` 数据库配置是否正确
- 数据库 `blog_database` 是否已创建

### Q4: 接口返回格式不匹配

**后端标准响应格式：**
```json
{
  "code": 0,
  "message": "操作成功",
  "result": { ... }
}
```

前端会自动解析 `result` 字段。

## 📝 开发建议

1. **先确保后端可独立运行** - 使用 Postman 测试所有接口
2. **使用浏览器开发者工具** - Network 面板查看请求/响应
3. **查看控制台日志** - 前后会打印详细错误信息
4. **逐步调试** - 先对接列表接口，再对接 CRUD 操作

## 🎯 下一步优化方向

- [ ] 添加用户登录页面
- [ ] 实现 Token 刷新机制
- [ ] 添加图片上传功能（调用 upload 接口）
- [ ] 优化加载状态和骨架屏
- [ ] 添加表单级联验证
- [ ] 实现撤销/重做功能
- [ ] 添加文章版本历史

---

**技术支持：** 如有问题请查看浏览器控制台或后端日志输出