# Low-Code Platform Project Plan

## Context

实现一个低代码平台，支持可视化页面搭建、组件拖拽、数据源绑定、流程编排、RBAC权限管理、多应用管理和一键发布。技术栈：Vue3 + Element Plus + Vite + TypeScript + Pinia（前端）、NestJS + MySQL + TypeORM（后端）、Kubernetes（部署）。

---

## 1. 项目目录结构 (Monorepo)

使用 pnpm workspaces 管理三个核心包 + 基础设施代码。

```
low-code/
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml
├── tsconfig.base.json              # Shared TS config
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── Dockerfile.frontend
├── Dockerfile.backend
├── Dockerfile.renderer
├── docker-compose.yml              # 本地开发环境
│
├── packages/
│   ├── common/                     # 共享类型、常量、工具
│   │   └── src/
│   │       ├── index.ts
│   │       ├── types/              # 所有业务类型定义
│   │       ├── constants/          # 枚举、常量
│   │       └── utils/              # 纯函数工具
│   │
│   ├── frontend/                   # Vue3 设计器 + 运行态
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.ts
│   │       ├── App.vue
│   │       ├── router/
│   │       │   ├── index.ts
│   │       │   ├── designer.ts     # 设计器路由
│   │       │   └── preview.ts      # 运行态/预览路由
│   │       ├── stores/             # Pinia
│   │       │   ├── auth.ts
│   │       │   ├── editor.ts       # 编辑器核心状态
│   │       │   ├── components.ts   # 组件注册表
│   │       │   └── datasources.ts
│   │       ├── views/
│   │       │   ├── login/
│   │       │   ├── dashboard/      # 工作台(应用列表)
│   │       │   ├── designer/       # 页面设计器主界面
│   │       │   │   ├── DesignerView.vue
│   │       │   │   ├── CanvasPanel.vue         # 中间画布
│   │       │   │   ├── ComponentPanel.vue      # 左侧组件面板
│   │       │   │   ├── PropertyPanel.vue       # 右侧属性配置
│   │       │   │   └── Toolbar.vue             # 顶部工具栏
│   │       │   ├── form-designer/  # 表单设计器
│   │       │   ├── datasource/     # 数据源管理
│   │       │   ├── workflow/       # 流程设计器
│   │       │   ├── admin/          # 系统管理(用户/角色)
│   │       │   └── preview/        # 页面预览/运行态容器
│   │       ├── components/
│   │       │   ├── registry/       # 可拖拽组件注册中心
│   │       │   │   ├── index.ts    # 全局组件注册表
│   │       │   │   ├── basic/      # 基础组件(文本/图片/按钮)
│   │       │   │   ├── form/       # 表单组件(input/select/datepicker)
│   │       │   │   ├── container/  # 容器组件(栅格/卡片/标签页)
│   │       │   │   ├── chart/      # 图表组件(echarts封装)
│   │       │   │   └── table/      # 表格组件
│   │       │   └── shared/         # 通用UI组件
│   │       ├── composables/
│   │       │   ├── useDragDrop.ts  # 拖拽逻辑
│   │       │   ├── useComponentRender.ts  # 动态渲染
│   │       │   └── useDataSource.ts
│   │       ├── plugins/
│   │       │   └── element-plus.ts
│   │       └── utils/
│   │           ├── schema.ts       # JSON Schema 操作
│   │           └── request.ts      # Axios 封装
│   │
│   ├── backend/                    # NestJS API 服务
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── common/             # 拦截器、过滤器、装饰器、守卫
│   │       ├── config/             # 配置模块(env读取)
│   │       └── modules/
│   │           ├── auth/           # JWT登录认证
│   │           ├── user/
│   │           ├── role/
│   │           ├── permission/
│   │           ├── application/
│   │           ├── page/           # 页面CRUD + schema存储
│   │           ├── component/      # 组件库管理
│   │           ├── datasource/     # 数据源配置
│   │           ├── workflow/       # 流程定义 + 实例
│   │           ├── media/          # 静态资源上传
│   │           └── publish/        # 页面发布
│   │
│   └── renderer/                   # 页面渲染微服务(运行态)
│       ├── package.json
│       └── src/
│           ├── main.ts
│           ├── renderer.module.ts
│           └── services/
│               └── page-renderer.service.ts  # 根据schema渲染HTML
│
├── deploy/
│   └── k8s/
│       ├── namespace.yaml
│       ├── configmap.yaml
│       ├── secret.yaml
│       ├── mysql/
│       │   ├── pvc.yaml
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       ├── redis/
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       ├── backend/
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   └── hpa.yaml
│       ├── frontend/               # 设计器前端
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   └── ingress.yaml
│       ├── renderer/               # 运行时渲染服务
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   └── hpa.yaml
│       └── cdn/                    # 静态页面发布到CDN (可选MinIO)
│
├── docs/
│   ├── api.md
│   └── architecture.md
│
└── scripts/
    ├── build.sh                    # CI/CD 构建脚本
    └── deploy.sh
```

---

## 2. 核心功能模块设计

### 2.1 页面设计器 (核心)

**工作流程**: 左侧组件面板 → 拖拽到中间画布 → 右侧属性面板配置 → 保存为 JSON Schema

**技术选型**:
- 拖拽引擎: `vuedraggable` (基于 SortableJS) 用于组件列表拖拽
- 画布: 自由布局用 `css-grid` + 绝对定位，流式布局用 Flex
- Schema 驱动: 画布和预览都是 Schema → Vue 组件的映射

**Schema 设计思路**:
```typescript
// 每个页面存储为一个 JSON
interface IPageSchema {
  version: string;           // schema版本号
  components: IComponentNode[];  // 根节点组件树
  styles: IStyleConfig;      // 全局样式
  datasources: IBinding[];   // 数据源绑定
  events: IEventConfig[];    // 事件流配置
}

interface IComponentNode {
  id: string;
  componentType: string;     // 组件类型，如 'ElButton', 'DataTable'
  props: Record<string, any>;
  style: Record<string, string>;
  children?: IComponentNode[];
  events?: IEventHandler[];
  bindings?: IDataBinding[]; // 数据绑定
}
```

### 2.2 组件库系统

**组件注册机制**:
```typescript
// packages/frontend/src/components/registry/index.ts
export const componentRegistry = new Map<string, ComponentConfig>()

// 注册一个组件
registerComponent({
  type: 'DataTable',
  displayName: '数据表格',
  icon: 'grid',
  category: 'table',
  defaultProps: { columns: [], dataSource: '', pagination: true },
  propertySchema: { /* 属性配置表单的 schema */ },
  render: () => import('./table/DataTable.vue'), // 异步加载
  thumbnail: '/thumbnails/data-table.png'
})
```

**组件分类**:
- 基础组件: 文本、图片、按钮、分割线、图标
- 容器组件: 栅格布局、卡片、标签页、折叠面板
- 表单组件: 输入框、下拉选择、日期选择、开关、上传
- 数据展示: 表格、列表、描述列表、树形控件
- 图表组件: 柱状图、折线图、饼图、仪表盘 (基于 ECharts)
- 高级组件: 轮播图、水印、二维码、富文本编辑器

### 2.3 数据源管理

支持三种数据源类型:
1. **HTTP API**: 配置 URL、Method、Headers、参数映射
2. **数据库直连**: 配置连接串、SQL 模板
3. **Mock 数据**: 在线编辑 JSON

数据绑定机制: 组件 → 声明绑定关系 → 运行时动态请求数据 → 注入组件 props

### 2.4 表单设计器

复用组件库的表单组件，产出表单 Schema。表单 Schema 包含字段定义、校验规则、布局信息，运行时渲染为带校验的表单。

### 2.5 流程引擎

轻量级 BPMN 流程设计:
- 节点类型: 开始、结束、审批、条件分支、并行网关、服务调用、脚本节点
- 流程定义存储为 BPMN 2.0 XML 或 JSON
- 流程实例: 创建 → 流转 → 审批 → 完成/驳回

### 2.6 RBAC 权限

标准 RBAC 模型: 用户 → 角色 → 权限(资源:操作)
- 资源: application、page、datasource 等
- 操作: create、read、update、delete、publish

### 2.7 页面发布

发布流程:
1. 设计师点击"发布"
2. 后端将页面 Schema 标记为已发布版本
3. Renderer 微服务从 DB 拉取最新 Schema
4. 缓存到 Redis，提供 SSR / CSR 渲染
5. 可选: 预渲染为静态 HTML → 上传 CDN

---

## 3. 数据库表设计 (核心表 DDL)

```sql
-- 用户与权限
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  avatar_url VARCHAR(500),
  status TINYINT DEFAULT 1,  -- 1=active, 0=disabled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(200),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
  id CHAR(36) PRIMARY KEY,
  resource VARCHAR(50) NOT NULL,   -- 'application', 'page', 'datasource'
  action VARCHAR(50) NOT NULL,     -- 'create', 'read', 'update', 'delete', 'publish'
  UNIQUE KEY uk_resource_action (resource, action)
);

CREATE TABLE user_roles (user_id CHAR(36), role_id CHAR(36), PRIMARY KEY(user_id, role_id));
CREATE TABLE role_permissions (role_id CHAR(36), permission_id CHAR(36), PRIMARY KEY(role_id, permission_id));

-- 应用
CREATE TABLE applications (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(500),
  owner_id CHAR(36) NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  config JSON,          -- 主题、全局样式等
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 页面
CREATE TABLE pages (
  id CHAR(36) PRIMARY KEY,
  application_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  path VARCHAR(200) NOT NULL,        -- 页面路由
  description TEXT,
  layout_type ENUM('free', 'flow') DEFAULT 'flow',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 页面 Schema (版本化存储)
CREATE TABLE page_schemas (
  id CHAR(36) PRIMARY KEY,
  page_id CHAR(36) NOT NULL,
  version INT NOT NULL,
  schema JSON NOT NULL,              -- IPageSchema JSON
  is_published TINYINT DEFAULT 0,
  published_at DATETIME,
  created_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_page_version (page_id, version)
);

-- 组件库定义
CREATE TABLE components (
  id CHAR(36) PRIMARY KEY,
  type VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  icon VARCHAR(100),
  default_props JSON,
  property_schema JSON,              -- 属性配置面板的 form schema
  thumbnail VARCHAR(500),
  version VARCHAR(20) DEFAULT '1.0.0',
  status ENUM('active', 'deprecated') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 数据源配置
CREATE TABLE datasources (
  id CHAR(36) PRIMARY KEY,
  application_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('http', 'database', 'mock') NOT NULL,
  config JSON NOT NULL,              -- URL / 连接串 / mock数据
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 流程定义
CREATE TABLE workflows (
  id CHAR(36) PRIMARY KEY,
  application_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  definition JSON NOT NULL,          -- 流程节点+连线
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 流程实例
CREATE TABLE workflow_instances (
  id CHAR(36) PRIMARY KEY,
  workflow_id CHAR(36) NOT NULL,
  business_key VARCHAR(100),         -- 关联业务ID
  status ENUM('running', 'completed', 'rejected', 'cancelled') DEFAULT 'running',
  current_node_id CHAR(36),
  context JSON,                      -- 流程变量
  started_by CHAR(36) NOT NULL,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- 媒体资源
CREATE TABLE media (
  id CHAR(36) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size INT,
  url VARCHAR(500) NOT NULL,
  uploaded_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. API 设计 (核心端点)

```
# 认证
POST   /api/auth/login              # 登录 → JWT token
POST   /api/auth/refresh            # 刷新 token
GET    /api/auth/profile            # 当前用户信息

# 用户管理
GET    /api/users                   # 用户列表(分页)
POST   /api/users                   # 创建用户
PUT    /api/users/:id               # 更新用户
DELETE /api/users/:id               # 删除用户
PUT    /api/users/:id/roles         # 分配角色

# 角色管理
GET    /api/roles                   # 角色列表
POST   /api/roles                   # 创建角色
PUT    /api/roles/:id               # 更新角色
DELETE /api/roles/:id               # 删除角色

# 应用管理
GET    /api/applications            # 应用列表
POST   /api/applications            # 创建应用
PUT    /api/applications/:id        # 更新应用
DELETE /api/applications/:id        # 删除应用

# 页面管理
GET    /api/applications/:appId/pages          # 应用下页面列表
POST   /api/applications/:appId/pages          # 创建页面
PUT    /api/pages/:id                          # 更新页面信息
DELETE /api/pages/:id                          # 删除页面

# 页面 Schema
GET    /api/pages/:id/schema                   # 获取最新 schema
GET    /api/pages/:id/schema?version=3         # 获取指定版本
POST   /api/pages/:id/schema                   # 保存新版本 schema
GET    /api/pages/:id/schema/versions          # 版本历史列表
POST   /api/pages/:id/schema/:versionId/restore  # 回滚到指定版本

# 页面发布
POST   /api/pages/:id/publish                  # 发布页面
POST   /api/pages/:id/unpublish                # 取消发布

# 数据源
GET    /api/applications/:appId/datasources    # 数据源列表
POST   /api/applications/:appId/datasources    # 创建数据源
PUT    /api/datasources/:id                    # 更新数据源
DELETE /api/datasources/:id                    # 删除数据源
POST   /api/datasources/:id/test               # 测试连接

# 组件库
GET    /api/components                         # 组件列表
GET    /api/components?category=form           # 按分类筛选
POST   /api/components                         # 注册新组件

# 流程
GET    /api/workflows                          # 流程列表
POST   /api/workflows                          # 创建流程
PUT    /api/workflows/:id                      # 更新流程定义
DELETE /api/workflows/:id                      # 删除流程
POST   /api/workflows/:id/execute              # 启动流程实例
GET    /api/workflows/:id/instances            # 流程实例列表

# 媒体
POST   /api/media/upload                       # 上传文件
GET    /api/media                              # 媒体列表
DELETE /api/media/:id                          # 删除文件
```

---

## 5. 部署架构 (三层分离)

### 5.1 设计态 vs 运行态

项目在代码和部署层面都实现了前后端分离，并进一步拆分为三个独立服务：

| 服务 | 路由 | 职责 | 认证 | 扩缩容 |
|------|------|------|------|--------|
| **Frontend** (Nginx + Vue3 SPA) | `/*` | 设计器界面、工作台、管理后台 | 需要 JWT | 静态资源，CDN 加速 |
| **Backend** (NestJS API) | `/api/*` | CRUD、认证、数据源管理、流程引擎 | 需要 JWT | HPA 2-10 Pods |
| **Renderer** (NestJS 渲染) | `/app/*` | 已发布页面的运行时渲染 | **无认证** | HPA 2-20 Pods |

### 5.2 流量架构图

```
                              ┌──────────────────────────────────┐
                              │       Ingress (Nginx)             │
                              │  /api/*  → Backend  (设计态API)   │
                              │  /app/*  → Renderer (运行态页面)  │
                              │  /*      → Frontend (设计器SPA)   │
                              └──────────────────────────────────┘
                                  │           │            │
                    ┌─────────────┘    ┌──────┘      ┌────┴──────────┐
                    ▼                  ▼              ▼               ▼
              ┌──────────┐     ┌──────────┐   ┌──────────┐   ┌──────────┐
              │ Frontend │     │ Backend  │   │ Renderer │   │   CDN    │
              │   Pod×2  │     │  Pod×3   │   │  Pod×3   │   │ (静态页)  │
              │  Nginx   │     │ NestJS   │   │ NestJS   │   │          │
              │ (设计器) │     │ (读写)   │   │ (只读)   │   │          │
              └──────────┘     └────┬─────┘   └────┬─────┘   └──────────┘
                                    │              │
                               ┌────▼────┐    ┌───▼───┐
                               │  MySQL  │    │ Redis │
                               │ (主从)  │    │Cluster│
                               └─────────┘    └───────┘
```

### 5.3 为什么这样设计？

1. **隔离性**: 运行态 Renderer 完全独立，设计器的高负载（如频繁保存 Schema）不会影响已发布页面的访问
2. **安全性**: Renderer 不暴露管理 API，不需要认证，只读数据库，攻击面最小
3. **弹性**: 运行态页面访问量通常远大于设计态，Renderer 可独立扩到 20 个 Pod，而 Backend 只需 2-3 个
4. **成本**: Renderer 单 Pod 只需 128Mi 内存（纯读+缓存），Backend 需要 256Mi（写操作+事务）

**关键 YAML 示例 (backend deployment)**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lowcode-backend
  namespace: lowcode
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lowcode-backend
  template:
    metadata:
      labels:
        app: lowcode-backend
    spec:
      containers:
        - name: backend
          image: registry.example.com/lowcode-backend:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: lowcode-config
            - secretRef:
                name: lowcode-secret
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: lowcode-backend-svc
  namespace: lowcode
spec:
  selector:
    app: lowcode-backend
  ports:
    - port: 3000
      targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: lowcode-backend-hpa
  namespace: lowcode
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: lowcode-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

**ConfigMap 示例**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: lowcode-config
  namespace: lowcode
data:
  DB_HOST: "mysql-service"
  DB_PORT: "3306"
  DB_NAME: "lowcode"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  JWT_EXPIRES_IN: "7d"
  UPLOAD_DIR: "/data/uploads"
```

---

## 6. 前端路由与状态管理

### 路由设计

```typescript
const routes = [
  { path: '/login',             component: LoginView },
  { path: '/', redirect: '/dashboard' },
  {
    path: '/dashboard',
    component: DashboardView,       // 工作台：应用列表
    meta: { requiresAuth: true }
  },
  {
    path: '/designer/:appId',
    component: DesignerShell,       // 设计器壳
    meta: { requiresAuth: true },
    children: [
      { path: 'pages',     component: PageListView },
      { path: 'page/:pageId/edit', component: DesignerView },
      { path: 'page/:pageId/preview', component: PreviewView },
      { path: 'datasources', component: DatasourceListView },
      { path: 'workflows',  component: WorkflowListView },
    ]
  },
  {
    path: '/admin',
    component: AdminShell,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      { path: 'users',    component: UserManagement },
      { path: 'roles',    component: RoleManagement },
      { path: 'components', component: ComponentManagement },
    ]
  },
  // 运行态页面 (独立 Renderer 渲染)
  { path: '/app/:appId/:pagePath*', component: RuntimeContainer, props: true },
]
```

### Pinia Store 划分

| Store | 职责 |
|-------|------|
| `auth` | 当前用户、JWT token、登录/退出 |
| `editor` | 画布组件树、选中节点、撤销/重做栈、缩放比例 |
| `components` | 已注册组件列表、拖拽中组件类型 |
| `datasources` | 当前应用的数据源列表、查询结果缓存 |
| `applications` | 应用列表、当前应用信息 |
| `clipboard` | 复制/粘贴的组件节点 |

**editor store 核心逻辑**:
```typescript
export const useEditorStore = defineStore('editor', () => {
  const componentTree = ref<IComponentNode[]>([])
  const selectedNodeId = ref<string | null>(null)
  const history = ref<{ past: Snapshot[]; future: Snapshot[] }>({ past: [], future: [] })

  function addComponent(parentId: string, component: IComponentNode) { /* ... */ }
  function removeComponent(nodeId: string) { /* ... */ }
  function updateComponentProps(nodeId: string, props: Record<string, any>) { /* ... */ }
  function moveComponent(nodeId: string, targetParentId: string, index: number) { /* ... */ }
  function undo() { /* 从 past 取，推入 future */ }
  function redo() { /* 从 future 取，推入 past */ }
  function saveSnapshot() { /* 压入 past，清空 future */ }
})
```

---

## 7. 关键技术难点与解决方案

### 7.1 组件动态渲染

**难点**: 设计器保存的是 JSON Schema，运行态需要根据 Schema 动态渲染 Vue 组件。

**方案**: 使用 Vue 的 `<component :is>` + `resolveComponent`:
```typescript
// packages/frontend/src/composables/useComponentRender.ts
import { shallowRef, defineAsyncComponent } from 'vue'

const componentCache = new Map()

export function resolveComponent(type: string) {
  if (!componentCache.has(type)) {
    // 从注册表获取异步加载函数
    const loader = componentRegistry.get(type)?.render
    if (loader) {
      componentCache.set(type, shallowRef(defineAsyncComponent(loader)))
    }
  }
  return componentCache.get(type)
}
```

渲染时递归遍历 `IComponentNode` 树，每个节点根据 `componentType` 解析对应组件，透传 `props` + `style`，并递归渲染 `children`。

### 7.2 页面 Schema 版本管理

**难点**: 需要支持版本历史、版本回滚、版本对比。

**方案**: `page_schemas` 表每次保存新增一行（`version` 自增），不覆盖旧版本。回滚时从历史版本读取 schema JSON，作为新版本保存（而不是直接修改 is_published），保证操作可追溯。

### 7.3 数据源动态绑定

**难点**: 组件绑定的数据源需要在运行时解析并请求。

**方案**: Renderer 微服务解析 Schema 中的 Binding 声明，在服务端预取数据并将结果注入组件 props，或由前端运行时通过统一的数据网关请求。推荐采用后端 BFF 模式聚合数据，减少前端复杂度。

### 7.4 页面发布的隔离

**难点**: 设计器/管理后台和运行态需要隔离，防止后端负载影响已发布的线上应用。

**方案**: Renderer 作为独立微服务部署，只读取已发布的 Schema（走 Redis 缓存），与 Backend 的读写 API 分离。前端静态资源（组件 bundle）发布到 CDN，Renderer 只返回 SSR HTML。流量上 Ingress 将 `/app/*` 路由到 Renderer，`/designer/*` 和 `/api/*` 路由到 Backend。

---

## 8. 实施路径建议 (分阶段)

| 阶段 | 内容 | 周期 |
|------|------|------|
| Phase 1 | 项目脚手架搭建 (Monorepo + 前后端模板 + K8s 基础部署) | 1周 |
| Phase 2 | 认证 + RBAC + 用户管理 | 1周 |
| Phase 3 | 组件注册机制 + 画布拖拽 + 属性面板 (核心设计器) | 3周 |
| Phase 4 | 页面 Schema 存储 + 版本管理 + 预览 | 1.5周 |
| Phase 5 | 数据源管理 + 数据绑定 + 动态渲染 | 2周 |
| Phase 6 | 表单设计器 + 流程引擎 | 2周 |
| Phase 7 | 发布系统 + Renderer 微服务 + CDN | 1.5周 |
| Phase 8 | 测试 + 性能优化 + 文档 | 2周 |

**总计预估: 约14周**

---

## Verification

1. `pnpm install` 在根目录成功安装所有包
2. `docker-compose up` 启动本地 MySQL + Redis，后端启动成功且 `/api/health` 返回 200
3. 前端 `pnpm dev` 启动，登录进入 Dashboard，可创建应用
4. 进入设计器，从左侧拖拽组件到画布，配置属性，保存 Schema
5. 调用 `/api/pages/:id/schema/versions` 验证版本历史
6. 预览页面，验证动态渲染与数据绑定
7. K8s: `kubectl apply -f deploy/k8s/` 全部资源就绪
8. 通过 Ingress 访问 `/app/:appId/page1`，页面正常渲染
