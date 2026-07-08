# 悦己颜值社 - 前端技术方案

版本：v5.0（去医疗化合规版）  
更新日期：2026年6月17日  
文档类型：前端技术方案

---

## 目录

1. [技术选型](#1-技术选型)
2. [架构设计](#2-架构设计)
3. [页面结构](#3-页面结构)
4. [组件规划](#4-组件规划)
5. [状态管理](#5-状态管理)
6. [API集成](#6-api集成)
7. [样式与设计](#7-样式与设计)
8. [性能优化](#8-性能优化)
9. [安全考虑](#9-安全考虑)
10. [开发规范](#10-开发规范)

---

## 1. 技术选型

### 1.1 核心技术栈

| 分类 | 技术 | 版本 | 选择理由 |
|------|------|------|---------|
| 前端框架 | Next.js | 14+ | App Router模式，支持SSR/SSG，性能优异 |
| UI框架 | React | 18+ | 生态成熟，组件化开发效率高 |
| 样式方案 | TailwindCSS | 3+ | 原子化CSS，开发效率高，样式统一 |
| 状态管理 | Zustand | 4+ | 轻量级状态管理，API简洁 |
| 路由 | Next.js App Router | - | 内置路由，支持服务端组件 |
| 数据请求 | Axios | 1+ | 成熟的HTTP客户端，支持拦截器 |
| 表单处理 | React Hook Form | 7+ | 轻量级表单解决方案 |
| 图片处理 | Next.js Image | - | 内置图片优化，支持懒加载 |
| 图表可视化 | Chart.js / Recharts | - | 数据可视化展示 |
| 动画 | Framer Motion | - | 强大的动画库，支持复杂交互 |

### 1.2 开发工具

| 工具 | 用途 |
|------|------|
| ESLint | 代码质量检查 |
| Prettier | 代码格式化 |
| TypeScript | 类型安全 |
| Husky | Git钩子 |
| lint-staged | 暂存区代码检查 |

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Next.js 前端应用                          │
│  ┌─────────────┬─────────────┬─────────────┬───────────────┐ │
│  │   Pages     │   Layouts   │  Components │    Hooks      │ │
│  └─────────────┴─────────────┴─────────────┴───────────────┘ │
│  ┌─────────────┬─────────────┬─────────────┬───────────────┐ │
│  │    Store    │    API      │    Utils    │    Styles     │ │
│  └─────────────┴─────────────┴─────────────┴───────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/HTTPS
└──────────────────────────▼──────────────────────────────────┘
│                    后端 API 服务                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 目录结构

```
src/
├── app/                          # Next.js App Router 页面
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页
│   ├── analysis/                 # 变美分析模块
│   │   ├── page.tsx
│   │   └── result/
│   │       └── page.tsx
│   ├── style/                    # 姿造美学模块
│   │   ├── page.tsx
│   │   ├── test/
│   │   │   └── page.tsx
│   │   └── recommendation/
│   │       └── page.tsx
│   ├── plan/                     # 生活美学计划模块
│   │   ├── page.tsx
│   │   └── [planId]/
│   │       └── page.tsx
│   ├── explore/                  # 灵感探索模块
│   │   ├── page.tsx
│   │   ├── topic/
│   │   │   └── [topicId]/
│   │   │       └── page.tsx
│   │   └── search/
│   │       └── page.tsx
│   ├── social/                   # 成就与社交模块
│   │   ├── page.tsx
│   │   ├── achievements/
│   │   │   └── page.tsx
│   │   └── leaderboard/
│   │       └── page.tsx
│   ├── consultant/               # AI变美顾问模块
│   │   └── page.tsx
│   ├── user/                     # 用户与会员模块
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── membership/
│   │       └── page.tsx
│   └── share/                    # 分享系统模块
│       └── page.tsx
├── components/                   # 公共组件
│   ├── ui/                       # UI基础组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Progress.tsx
│   │   └── Avatar.tsx
│   ├── layout/                   # 布局组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── common/                   # 业务公共组件
│   │   ├── ImageUploader.tsx
│   │   ├── AnalysisResult.tsx
│   │   ├── RecommendCard.tsx
│   │   ├── ContentCard.tsx
│   │   └── AchievementBadge.tsx
│   └── chat/                     # AI对话组件
│       ├── ChatMessage.tsx
│       ├── ChatInput.tsx
│       └── ChatHistory.tsx
├── hooks/                        # 自定义Hooks
│   ├── useUser.ts                # 用户状态管理
│   ├── useAnalysis.ts            # 分析模块相关
│   ├── useConsultant.ts          # AI顾问相关
│   ├── usePlan.ts                # 计划相关
│   └── useToast.ts               # Toast通知
├── store/                        # Zustand状态管理
│   ├── userStore.ts              # 用户状态
│   ├── analysisStore.ts          # 分析状态
│   ├── consultantStore.ts        # AI顾问状态
│   └── toastStore.ts             # Toast状态
├── api/                          # API请求封装
│   ├── axios.ts                  # Axios实例配置
│   ├── user.ts                   # 用户相关API
│   ├── analysis.ts               # 分析相关API
│   ├── style.ts                  # 姿造美学API
│   ├── plan.ts                   # 生活计划API
│   ├── explore.ts                # 灵感探索API
│   ├── social.ts                 # 社交相关API
│   └── consultant.ts             # AI顾问API
├── utils/                        # 工具函数
│   ├── format.ts                 # 格式化工具
│   ├── validation.ts             # 表单验证工具
│   ├── constants.ts              # 常量定义
│   └── helpers.ts                # 通用辅助函数
├── styles/                       # 全局样式
│   ├── globals.css               # 全局CSS
│   └── theme.ts                  # Tailwind主题配置
└── types/                        # TypeScript类型定义
    ├── index.ts                  # 全局类型
    ├── user.ts                   # 用户类型
    ├── analysis.ts               # 分析类型
    ├── style.ts                  # 姿造美学类型
    ├── plan.ts                   # 计划类型
    ├── explore.ts                # 灵感探索类型
    ├── social.ts                 # 社交类型
    └── consultant.ts             # AI顾问类型
```

---

## 3. 页面结构

### 3.1 页面路由清单

| 路由 | 页面名称 | 所属模块 | 权限要求 |
|------|---------|---------|---------|
| `/` | 首页 | 公共 | 无 |
| `/analysis` | 变美分析 | 模块一 | 登录 |
| `/analysis/result` | 分析结果 | 模块一 | 登录 |
| `/style` | 姿造美学首页 | 模块二 | 登录 |
| `/style/test` | 风格测试 | 模块二 | 登录 |
| `/style/recommendation` | 造型推荐 | 模块二 | 登录 |
| `/plan` | 生活美学计划 | 模块三 | 登录 |
| `/plan/[planId]` | 计划详情 | 模块三 | 登录 |
| `/explore` | 灵感探索 | 模块四 | 无 |
| `/explore/topic/[topicId]` | 话题详情 | 模块四 | 无 |
| `/explore/search` | 搜索页面 | 模块四 | 无 |
| `/social` | 社交首页 | 模块五 | 登录 |
| `/social/achievements` | 成就中心 | 模块五 | 登录 |
| `/social/leaderboard` | 排行榜 | 模块五 | 登录 |
| `/consultant` | AI变美顾问 | 模块六 | 登录 |
| `/user/login` | 登录页 | 模块七 | 无 |
| `/user/register` | 注册页 | 模块七 | 无 |
| `/user/profile` | 个人中心 | 模块七 | 登录 |
| `/user/membership` | 会员中心 | 模块七 | 登录 |
| `/share` | 分享页面 | 模块八 | 登录 |

### 3.2 页面交互流程图

#### 3.2.1 首页交互

```
用户访问 → 加载首页内容 → 展示推荐内容 → 点击导航 → 跳转到对应模块
```

#### 3.2.2 变美分析流程

```
进入分析页 → 上传/拍摄照片 → 提交分析 → 显示加载动画 → 展示分析报告 → 查看详情/保存
```

#### 3.2.3 AI顾问对话流程

```
进入顾问页 → 查看历史对话 → 输入问题 → 发送请求 → 显示加载状态 → 展示AI回答 → 继续提问
```

---

## 4. 组件规划

### 4.1 UI基础组件

| 组件名 | 功能描述 | 状态 |
|-------|---------|------|
| Button | 按钮组件，支持多种样式和状态 | 开发中 |
| Input | 输入框组件，支持前缀后缀 | 开发中 |
| Card | 卡片组件，支持阴影和圆角 | 开发中 |
| Modal | 弹窗组件，支持自定义内容 | 开发中 |
| Progress | 进度条组件，支持多种样式 | 待开发 |
| Avatar | 头像组件，支持不同尺寸 | 开发中 |
| Badge | 徽章组件，支持颜色和样式 | 待开发 |
| Tabs | 标签页组件 | 待开发 |
| Select | 下拉选择组件 | 待开发 |
| Textarea | 文本域组件 | 待开发 |

### 4.2 布局组件

| 组件名 | 功能描述 | 状态 |
|-------|---------|------|
| Header | 顶部导航栏，包含Logo和菜单 | 开发中 |
| Footer | 底部信息栏 | 待开发 |
| Sidebar | 侧边栏导航（移动端收起） | 开发中 |

### 4.3 业务公共组件

| 组件名 | 功能描述 | 所属模块 |
|-------|---------|---------|
| ImageUploader | 图片上传组件，支持拍照和选择 | 变美分析 |
| AnalysisResult | 分析结果展示组件 | 变美分析 |
| RecommendCard | 推荐卡片组件 | 姿造美学 |
| ContentCard | 内容卡片组件 | 灵感探索 |
| AchievementBadge | 成就徽章组件 | 成就与社交 |
| ChatMessage | 聊天消息组件 | AI变美顾问 |
| ChatInput | 聊天输入组件 | AI变美顾问 |
| PlanItem | 计划项组件 | 生活美学计划 |
| SharePoster | 分享海报组件 | 分享系统 |

---

## 5. 状态管理

### 5.1 状态管理方案

采用 Zustand 作为状态管理库，具有以下优势：
- 轻量级，无额外依赖
- API简洁，易于上手
- 支持TypeScript
- 支持中间件

### 5.2 状态模块划分

| Store | 管理状态 | 主要功能 |
|-------|---------|---------|
| userStore | 用户信息、登录状态、会员等级 | 用户登录、注册、信息更新 |
| analysisStore | 分析记录、分析结果、分析状态 | 照片分析、结果查询 |
| consultantStore | 对话历史、当前对话、加载状态 | AI对话管理 |
| toastStore | Toast消息队列 | 全局通知 |

### 5.3 Store 设计示例

#### userStore 设计

```typescript
interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<User>) => Promise<void>;
}
```

#### analysisStore 设计

```typescript
interface AnalysisState {
  records: AnalysisRecord[];
  currentResult: AnalysisResult | null;
  isAnalyzing: boolean;
  analyze: (image: File) => Promise<void>;
  getRecords: () => Promise<void>;
  getResult: (id: string) => Promise<void>;
}
```

---

## 6. API集成

### 6.1 Axios 配置

```typescript
// 请求拦截器
- 添加Authorization头（token）
- 添加请求超时设置
- 添加请求日志

// 响应拦截器
- 统一处理错误
- 处理token过期
- 统一数据格式
```

### 6.2 API 模块划分

| 模块 | 文件 | 主要接口 |
|------|------|---------|
| 用户 | `api/user.ts` | 登录、注册、获取用户信息、更新资料、会员购买 |
| 分析 | `api/analysis.ts` | 照片分析、获取分析记录、获取分析结果 |
| 姿造美学 | `api/style.ts` | 风格测试、造型推荐、虚拟试妆 |
| 生活计划 | `api/plan.ts` | 获取计划、创建计划、打卡记录、进度查询 |
| 灵感探索 | `api/explore.ts` | 获取内容列表、获取话题、搜索、收藏 |
| 社交 | `api/social.ts` | 获取成就、排行榜、关注、评论 |
| AI顾问 | `api/consultant.ts` | 发送消息、获取对话历史 |

### 6.3 API 调用规范

- 所有API调用封装在 `src/api/` 目录下
- 使用 async/await 语法
- 统一错误处理
- 支持请求取消（用于防止重复请求）

---

## 7. 样式与设计

### 7.1 设计风格

- **整体风格**：简洁、优雅、符合女性审美
- **主色调**：粉色系（#FF6B9D、#FF9EC4等）
- **辅助色**：白色、浅灰色、金色点缀
- **字体**：圆润、柔和的无衬线字体

### 7.2 Tailwind 主题配置

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: {
        50: '#FFF0F5',
        100: '#FFE4E9',
        200: '#FFC8D6',
        300: '#FFA0B9',
        400: '#FF6B9D',
        500: '#FF4D8A',
        600: '#FF3377',
        700: '#E62966',
        800: '#CC2255',
        900: '#991A44',
      },
      secondary: {
        50: '#FFF8F0',
        100: '#FFEDE0',
        200: '#FFDBC0',
        300: '#FFC499',
        400: '#FFA566',
        500: '#FF8C33',
      },
    },
    fontFamily: {
      sans: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
    },
  },
}
```

### 7.3 响应式设计

- **移动端**：375px - 767px
- **平板端**：768px - 1023px
- **桌面端**：1024px+

---

## 8. 性能优化

### 8.1 代码优化

- 使用 Next.js App Router 的服务端组件
- 代码分割和懒加载
- 图片优化（Next.js Image组件）
- 减少不必要的渲染（React.memo、useMemo、useCallback）

### 8.2 加载优化

- 首屏加载优化（SSR/SSG）
- 骨架屏加载状态
- 图片懒加载
- 缓存策略（HTTP缓存、浏览器缓存）

### 8.3 构建优化

- Tree Shaking
- 压缩静态资源
- CDN加速
- Gzip/Brotli压缩

---

## 9. 安全考虑

### 9.1 XSS 防护

- 使用 React 的自动转义
- 对用户输入进行过滤和验证
- 使用 DOMPurify 处理富文本

### 9.2 CSRF 防护

- 使用 anti-CSRF token
- 验证请求来源

### 9.3 数据加密

- HTTPS传输
- 敏感数据加密存储
- Token安全管理

### 9.4 权限控制

- 路由级别权限控制
- 接口级别权限验证
- 敏感操作二次确认

---

## 10. 开发规范

### 10.1 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 代码格式化使用 Prettier
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

### 10.2 提交规范

```
feat: 新增功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 代码重构
test: 测试用例
chore: 构建/工具
```

### 10.3 开发流程

1. 创建功能分支
2. 开发功能代码
3. 编写单元测试
4. 代码审查（PR）
5. 合并到主分支
6. 部署测试环境
7. 验证通过后部署生产环境

---

**文档审批：**
- 前端负责人：___________
- 技术负责人：___________