# 悦己颜值社 - 全栈开发计划

版本：v1.4
更新日期：2026年7月14日
文档类型：开发计划

## 本次更新内容
1. 产品边界调整：在线支付改为实物电商，会员订阅与积分充值支付列为核心业务
2. 方案123展示逻辑：积分显示补充会员优惠（15积分→15积分（会员8积分起））
3. AI顾问安全护栏：尾部追加规则明确为"所有涉及皮肤问题的回答（无论是否被拦截）"
4. 性能需求：补充日活跃用户数(DAU)支持10万DAU
5. 合规定位红线：新增第5条"不收集医疗健康信息"
6. 禁止功能清单：新增健康档案功能和疾病类型过滤推荐内容禁止项
7. 模块四补充：风格测试（3页轻量测试，12种风格标签，风格演化追踪）
8. 模块四补充：一键套用（灵感详情页→效果图生成页参数传递）
9. UI原型全部完成：分析报告、换装间、灵感探索、AI顾问、我的、分享系统、成就系统UI原型开发完成
10. 皮肤状态分析功能补充：新增8项皮肤问题指标（黑头、黑眼圈、皱纹、毛孔、眼袋、痘痘、痣、斑点），采用2行×4列网格布局
11. 报告标签页调整：妆容、穿搭、发型、美容美体独立标签页，每页包含保存至相册和分享报告按钮

---

## 目录

1. [开发概述](#1-开发概述)
2. [架构变更说明](#2-架构变更说明)
3. [PostgreSQL → MySQL 类型映射](#3-postgresql--mysql-类型映射)
4. [Next.js 全栈架构](#4-nextjs-全栈架构)
5. [Prisma Schema 设计（MySQL）](#5-prisma-schema-设计mysql)
6. [分阶段开发计划](#6-分阶段开发计划)
7. [数据库迁移方案](#7-数据库迁移方案)
8. [环境配置](#8-环境配置)
9. [开发规范](#9-开发规范)

---

## 1. 开发概述

### 1.1 目标
使用 Next.js 14+ (App Router) 进行全栈开发，数据库采用 MySQL，基于 Prisma ORM 管理数据层。

### 1.2 技术栈

| 分类 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 全栈框架 | Next.js | 14+ | App Router + API Route Handlers |
| UI框架 | React | 18+ | 组件化开发 |
| 样式方案 | TailwindCSS | 3+ | 原子化CSS |
| 状态管理 | Zustand | 4+ | 轻量级状态管理 |
| ORM | Prisma | 5+ | MySQL数据库操作 |
| 数据库 | MySQL | 8+ | 关系型数据库 |
| 缓存 | Redis | 7+ | Session管理、效果图缓存、幂等锁 |
| 对象存储 | 阿里云OSS / 七牛云 | - | 用户照片、效果图存储 |
| 向量数据库 | Milvus | 2+ | AI顾问知识库检索 |
| 消息队列 | RabbitMQ | 3+ | 效果图异步生成、推送通知 |
| 生图模型 | Stable Diffusion | - | 换装/换发/妆容迁移 |
| 端侧AI | Core ML / MediaPipe | - | iOS端侧人脸检测、Android端侧处理 |
| 表单处理 | React Hook Form | 7+ | 表单解决方案 |
| 数据请求 | Axios | 1+ | HTTP客户端 |
| 类型安全 | TypeScript | 5+ | 类型定义 |
| 构建工具 | Turbopack | - | Next.js内置构建 |

### 1.3 关键变更

| 变更项 | 原方案 | 新方案 |
|-------|-------|-------|
| 架构模式 | 分离式（NestJS + Next.js） | 全栈式（Next.js + API Routes） |
| 数据库 | PostgreSQL | MySQL |
| ORM工具 | TypeORM | Prisma |
| UUID生成 | gen_random_uuid() (数据库) | nanoid/uuid包 (应用层) |
| JSON类型 | JSONB | JSON |
| 数组类型 | TEXT[] | JSON数组 |
| 全文索引 | GIN索引 | FULLTEXT索引 |

---

## 2. 架构变更说明

### 2.1 架构对比

**原架构（分离式）：**
```
┌─────────────────┐     HTTP     ┌─────────────────┐
│   Next.js 前端   │ ───────────→ │   NestJS 后端   │
│   (Vercel部署)   │             │   (Docker部署)   │
└─────────────────┘             └─────────┬───────┘
                                          │
                                  ┌───────▼───────┐
                                  │   PostgreSQL   │
                                  └───────────────┘
```

**新架构（全栈式）：**
```
┌─────────────────────────────────────────────┐
│              Next.js 全栈应用                 │
│  ┌─────────────────┬─────────────────────┐  │
│  │   前端页面       │   API Route        │  │
│  │   (App Router)   │   Handlers         │  │
│  └─────────────────┴─────────┬───────────┘  │
│                              │ Prisma        │
└──────────────────────────────┼──────────────┘
                               │
                       ┌───────▼───────┐
                       │    MySQL      │
                       └───────────────┘
```

### 2.2 变更优势

| 优势 | 说明 |
|------|------|
| 简化部署 | 单一代码库，统一部署流程 |
| 降低延迟 | API和前端同服务器，减少网络开销 |
| 开发效率 | 前后端代码同项目，无缝协作 |
| 类型共享 | Prisma生成的类型前后端共用 |
| 成本降低 | 减少服务器资源占用 |

---

## 3. PostgreSQL → MySQL 类型映射

### 3.1 核心类型映射

| PostgreSQL | MySQL | Prisma类型 | 说明 |
|------------|-------|-----------|------|
| UUID | CHAR(36) | String @id @default(cuid()) | 使用cuid或nanoid生成 |
| VARCHAR | VARCHAR | String | 直接映射 |
| TEXT | TEXT | String | 直接映射 |
| INT | INT | Int | 直接映射 |
| SMALLINT | SMALLINT | Int | 直接映射 |
| DECIMAL(p,s) | DECIMAL(p,s) | Decimal | 直接映射 |
| BOOLEAN | BOOLEAN/TINYINT(1) | Boolean | 直接映射 |
| DATE | DATE | DateTime | 直接映射 |
| TIMESTAMP | DATETIME | DateTime | 直接映射 |
| JSONB | JSON | Json | MySQL支持JSON类型 |
| TEXT[] | JSON | Json | 数组转为JSON数组存储 |
| ARRAY | JSON | Json | 数组转为JSON数组存储 |

### 3.2 索引类型映射

| PostgreSQL | MySQL | 说明 |
|------------|-------|------|
| BTREE索引 | BTREE索引 | MySQL默认索引类型 |
| GIN索引 | FULLTEXT索引 | MySQL全文搜索使用FULLTEXT |
| UNIQUE索引 | UNIQUE索引 | 直接映射 |

### 3.3 函数映射

| PostgreSQL | MySQL | 说明 |
|------------|-------|------|
| gen_random_uuid() | 应用层生成 | 使用cuid()或nanoid |
| CURRENT_TIMESTAMP | CURRENT_TIMESTAMP | 直接映射 |
| NOW() | NOW() | 直接映射 |

---

## 4. Next.js 全栈架构

### 4.1 目录结构

```
src/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # 根布局
│   ├── page.tsx                   # 首页
│   ├── analysis/                  # 变美分析模块页面
│   │   ├── page.tsx
│   │   └── result/
│   │       └── page.tsx
│   ├── style/                     # 姿造美学模块页面
│   │   ├── page.tsx
│   │   ├── test/
│   │   │   └── page.tsx
│   │   └── recommendation/
│   │       └── page.tsx
│   ├── plan/                      # 生活美学计划页面
│   │   ├── page.tsx
│   │   └── [planId]/
│   │       └── page.tsx
│   ├── explore/                   # 灵感探索页面
│   │   ├── page.tsx
│   │   ├── topic/
│   │   │   └── [topicId]/
│   │   │       └── page.tsx
│   │   └── search/
│   │       └── page.tsx
│   ├── social/                    # 成就与社交页面
│   │   ├── page.tsx
│   │   ├── achievements/
│   │   │   └── page.tsx
│   │   └── leaderboard/
│   │       └── page.tsx
│   ├── consultant/                # AI变美顾问页面
│   │   └── page.tsx
│   ├── user/                      # 用户与会员页面
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── membership/
│   │       └── page.tsx
│   ├── share/                     # 分享系统页面
│   │   └── page.tsx
│   └── api/                       # API Route Handlers
│       └── v1/
│           ├── auth/              # 认证API
│           │   ├── login/route.ts
│           │   ├── register/route.ts
│           │   └── logout/route.ts
│           ├── users/             # 用户API
│           │   ├── route.ts
│           │   ├── profile/route.ts
│           │   └── membership/route.ts
│           ├── analysis/          # 分析API
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── style/             # 姿造美学API
│           │   ├── test/route.ts
│           │   └── recommendation/route.ts
│           ├── plan/              # 生活计划API
│           │   ├── route.ts
│           │   └── [planId]/route.ts
│           ├── explore/           # 灵感探索API
│           │   ├── route.ts
│           │   ├── topic/[topicId]/route.ts
│           │   └── search/route.ts
│           ├── social/            # 社交API
│           │   ├── achievements/route.ts
│           │   ├── leaderboard/route.ts
│           │   ├── follow/route.ts
│           │   └── comments/route.ts
│           ├── consultant/        # AI顾问API
│           │   ├── conversations/route.ts
│           │   └── messages/route.ts
│           └── share/             # 分享API
│               ├── invite/route.ts
│               └── poster/route.ts
├── components/                    # 公共组件
│   ├── ui/                        # UI基础组件
│   ├── layout/                    # 布局组件
│   ├── common/                    # 业务公共组件
│   └── chat/                      # AI对话组件
├── hooks/                         # 自定义Hooks
├── store/                         # Zustand状态管理
├── lib/                           # 核心库
│   ├── prisma.ts                  # Prisma客户端
│   ├── auth.ts                    # 认证工具
│   ├── utils.ts                   # 通用工具
│   └── constants.ts               # 常量定义
├── types/                         # TypeScript类型定义
├── styles/                        # 全局样式
└── prisma/                        # Prisma配置
    └── schema.prisma              # Prisma schema
```

### 4.2 API Route 设计规范

| 规范项 | 说明 |
|-------|------|
| 路由路径 | `/api/v1/{module}/{action}` |
| HTTP方法 | GET(查询)、POST(创建)、PUT(更新)、DELETE(删除) |
| 认证方式 | JWT Token，通过Authorization头传递 |
| 响应格式 | `{ code, message, data, timestamp }` |
| 错误处理 | 使用统一的错误处理中间件 |

---

## 5. Prisma Schema 设计（MySQL）

### 5.1 Schema 文件结构

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// 用户模块
model User {
  id              String    @id @default(cuid())
  phone           String    @unique
  password        String
  nickname        String    @unique
  avatar          String?
  gender          Int       @default(0)
  age             Int?
  email           String?   @unique
  member_level    Int       @default(0)
  member_expire_time DateTime?
  status          Int       @default(1)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  profile         UserProfile?
  analyses        Analysis[]
  style_tests     StyleTest[]
  plans           Plan[]
  contents        Content[]
  followers       Follower[] @relation("follower")
  followees       Follower[] @relation("followee")
  comments        Comment[]
  user_achievements UserAchievement[]
  conversations   Conversation[]
  shares          Share[]
  referrals       Referral[]
  sister_groups   SisterGroupMember[]

  @@map("users")
}

model UserProfile {
  id              String   @id @default(cuid())
  user_id         String   @unique
  user            User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  birthday        DateTime?
  height          Int?
  weight          Decimal?
  skin_type       Int?
  style_preference Json?
  interests       Json?
  bio             String?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  @@map("user_profiles")
}

model Membership {
  id          String   @id @default(cuid())
  level       Int      @unique
  name        String
  price       Decimal
  duration    Int
  features    Json?
  status      Int      @default(1)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  @@map("memberships")
}

model PointTransaction {
  id              String    @id @default(cuid())
  user_id         String
  user            User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  transaction_type Int
  point_type      Int
  amount          Int
  balance_before  Int
  balance_after   Int
  source          String?
  expire_time     DateTime?
  created_at      DateTime  @default(now())

  @@map("point_transactions")
}

model MembershipSubscription {
  id                String    @id @default(cuid())
  user_id           String
  user              User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  membership_level  Int
  order_no          String    @unique
  payment_method    String?
  amount            Decimal
  status            Int       @default(0)
  start_time        DateTime?
  end_time          DateTime?
  created_at        DateTime  @default(now())
  paid_at           DateTime?

  @@map("membership_subscriptions")
}

// 分析模块
model Analysis {
  id              String           @id @default(cuid())
  user_id         String
  user            User             @relation(fields: [user_id], references: [id], onDelete: Cascade)
  image_url       String
  front_image_url String?
  left_image_url  String?
  right_image_url String?
  top_image_url   String?
  bottom_image_url String?
  fullbody_image_url String?
  analysis_type   Int
  status          Int              @default(0)
  created_at      DateTime         @default(now())
  completed_at    DateTime?

  result          AnalysisResult?

  @@map("analyses")
}

model AnalysisResult {
  id              String   @id @default(cuid())
  analysis_id     String   @unique
  analysis        Analysis @relation(fields: [analysis_id], references: [id], onDelete: Cascade)
  face_shape      String?
  skin_type       Int?
  skin_problems   Json?
  body_problems   Json?
  complexion      String?
  features        Json?
  suggestions     Json?
  makeup_recommendations Json?
  outfit_recommendations Json?
  hairstyle_recommendations Json?
  beauty_plan     Json?
  score           Decimal?
  created_at      DateTime @default(now())

  @@map("analysis_results")
}

model SkinType {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  care_tips   Json?

  @@map("skin_types")
}

// 姿造美学模块
model StyleTest {
  id          String       @id @default(cuid())
  user_id     String
  user        User         @relation(fields: [user_id], references: [id], onDelete: Cascade)
  answers     Json
  status      Int          @default(0)
  created_at  DateTime     @default(now())
  completed_at DateTime?

  result      StyleResult?

  @@map("style_tests")
}

model StyleResult {
  id                  String          @id @default(cuid())
  test_id             String          @unique
  test                StyleTest       @relation(fields: [test_id], references: [id], onDelete: Cascade)
  personal_style      String
  style_description   String?
  style_tags          Json?
  created_at          DateTime        @default(now())

  recommendations     Recommendation[]

  @@map("style_results")
}

model Recommendation {
  id                  String       @id @default(cuid())
  user_id             String
  user                User         @relation(fields: [user_id], references: [id], onDelete: Cascade)
  result_id           String?
  result              StyleResult? @relation(fields: [result_id], references: [id], onDelete: Cascade)
  recommendation_type Int
  content             Json
  image_url           String?
  created_at          DateTime     @default(now())

  @@map("recommendations")
}

// 生活计划模块
model Plan {
  id          String      @id @default(cuid())
  user_id     String
  user        User        @relation(fields: [user_id], references: [id], onDelete: Cascade)
  title       String
  plan_type   Int
  description String?
  start_date  DateTime
  end_date    DateTime
  status      Int         @default(1)
  created_at  DateTime    @default(now())
  updated_at  DateTime    @updatedAt

  items       PlanItem[]

  @@map("plans")
}

model PlanItem {
  id          String    @id @default(cuid())
  plan_id     String
  plan        Plan      @relation(fields: [plan_id], references: [id], onDelete: Cascade)
  title       String
  description String?
  day_index   Int
  time_of_day Int?
  created_at  DateTime  @default(now())

  checkins    Checkin[]

  @@map("plan_items")
}

model Checkin {
  id              String    @id @default(cuid())
  plan_item_id    String
  plan_item       PlanItem  @relation(fields: [plan_item_id], references: [id], onDelete: Cascade)
  user_id         String
  user            User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  checkin_date    DateTime
  status          Int
  note            String?
  created_at      DateTime  @default(now())

  @@map("checkins")
}

// 灵感探索模块
model Content {
  id              String     @id @default(cuid())
  user_id         String
  user            User       @relation(fields: [user_id], references: [id], onDelete: Cascade)
  title           String
  content         String?
  cover_image     String?
  topic_id        String?
  topic           Topic?     @relation(fields: [topic_id], references: [id], onDelete: SetNull)
  tags            Json?
  views           Int        @default(0)
  likes           Int        @default(0)
  shares          Int        @default(0)
  comments_count  Int        @default(0)
  status          Int        @default(2)
  is_featured     Boolean    @default(false)
  created_at      DateTime   @default(now())
  updated_at      DateTime   @updatedAt

  collections     Collection[]
  comments        Comment[]

  @@map("contents")
  @@fulltext([title])
}

model Topic {
  id              String     @id @default(cuid())
  name            String     @unique
  description     String?
  cover_image     String?
  content_count   Int        @default(0)
  followers_count Int        @default(0)
  status          Int        @default(1)
  created_at      DateTime   @default(now())
  updated_at      DateTime   @updatedAt

  contents        Content[]

  @@map("topics")
}

model Tag {
  id              String     @id @default(cuid())
  name            String     @unique
  color           String?
  usage_count     Int        @default(0)
  created_at      DateTime   @default(now())

  @@map("tags")
}

model Collection {
  id          String    @id @default(cuid())
  user_id     String
  user        User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  content_id  String
  content     Content   @relation(fields: [content_id], references: [id], onDelete: Cascade)
  created_at  DateTime  @default(now())

  @@unique([user_id, content_id])
  @@map("collections")
}

// 社交模块
model Follower {
  id          String    @id @default(cuid())
  follower_id String
  follower    User      @relation("follower", fields: [follower_id], references: [id], onDelete: Cascade)
  followee_id String
  followee    User      @relation("followee", fields: [followee_id], references: [id], onDelete: Cascade)
  created_at  DateTime  @default(now())

  @@unique([follower_id, followee_id])
  @@map("followers")
}

model Comment {
  id          String    @id @default(cuid())
  user_id     String
  user        User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  content_id  String
  content     Content   @relation(fields: [content_id], references: [id], onDelete: Cascade)
  parent_id   String?
  parent      Comment?  @relation("parent", fields: [parent_id], references: [id], onDelete: SetNull)
  reply       Comment[] @relation("parent")
  comment     String
  likes       Int       @default(0)
  status      Int       @default(1)
  created_at  DateTime  @default(now())

  @@map("comments")
}

model Achievement {
  id                String              @id @default(cuid())
  name              String              @unique
  description       String?
  icon              String?
  points            Int                 @default(0)
  achievement_type  Int
  condition         Json
  created_at        DateTime            @default(now())

  user_achievements UserAchievement[]

  @@map("achievements")
}

model UserAchievement {
  id              String      @id @default(cuid())
  user_id         String
  user            User        @relation(fields: [user_id], references: [id], onDelete: Cascade)
  achievement_id  String
  achievement     Achievement @relation(fields: [achievement_id], references: [id], onDelete: Cascade)
  unlocked_at     DateTime    @default(now())
  progress        Int         @default(0)

  @@unique([user_id, achievement_id])
  @@map("user_achievements")
}

model Leaderboard {
  id            String    @id @default(cuid())
  user_id       String    @unique
  user          User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  total_points  Int       @default(0)
  rank          Int       @default(0)
  last_updated  DateTime  @default(now())

  @@map("leaderboard")
}

// AI顾问模块
model Conversation {
  id          String    @id @default(cuid())
  user_id     String
  user        User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  title       String?
  status      Int       @default(1)
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  messages    Message[]

  @@map("conversations")
}

model Message {
  id              String        @id @default(cuid())
  conversation_id String
  conversation    Conversation @relation(fields: [conversation_id], references: [id], onDelete: Cascade)
  user_id         String
  user            User         @relation(fields: [user_id], references: [id], onDelete: Cascade)
  role            String
  content         String
  created_at      DateTime     @default(now())

  @@map("messages")
}

// 社交模块 - 闺蜜小组
model SisterGroup {
  id          String    @id @default(cuid())
  name        String
  description String?
  avatar      String?
  status      Int       @default(1)
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  members     SisterGroupMember[]

  @@map("sister_groups")
}

model SisterGroupMember {
  id          String    @id @default(cuid())
  group_id    String
  group       SisterGroup @relation(fields: [group_id], references: [id], onDelete: Cascade)
  user_id     String
  user        User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  role        Int       @default(0)
  joined_at   DateTime  @default(now())

  @@unique([group_id, user_id])
  @@map("sister_group_members")
}

// 分享模块
model Share {
  id          String    @id @default(cuid())
  user_id     String
  user        User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  content_id  String?
  content     Content?  @relation(fields: [content_id], references: [id], onDelete: SetNull)
  share_type  Int
  platform    Int?
  share_mode  Int       @default(0)
  status      Int       @default(0)
  view_count  Int       @default(0)
  expire_at   DateTime?
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  poster      SharePoster?
  statistics  ShareStatistics?

  @@map("shares")
}

model SharePoster {
  id              String    @id @default(cuid())
  share_id        String    @unique
  share           Share     @relation(fields: [share_id], references: [id], onDelete: Cascade)
  poster_url      String
  poster_template Int       @default(1)
  created_at      DateTime  @default(now())

  @@map("share_posters")
}

model ShareStatistics {
  id              String    @id @default(cuid())
  share_id        String    @unique
  share           Share     @relation(fields: [share_id], references: [id], onDelete: Cascade)
  click_count     Int       @default(0)
  register_count  Int       @default(0)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  @@map("share_statistics")
}

model Referral {
  id              String            @id @default(cuid())
  referrer_id     String
  referrer        User              @relation(fields: [referrer_id], references: [id], onDelete: Cascade)
  referral_code   String            @unique
  created_at      DateTime          @default(now())

  rewards         ReferralReward[]

  @@map("referrals")
}

model ReferralReward {
  id              String    @id @default(cuid())
  referral_id     String
  referral        Referral  @relation(fields: [referral_id], references: [id], onDelete: Cascade)
  new_user_id     String    @unique
  new_user        User      @relation(fields: [new_user_id], references: [id], onDelete: Cascade)
  reward_type     Int
  reward_value    Int
  status          Int       @default(0)
  created_at      DateTime  @default(now())
  awarded_at      DateTime?

  @@map("referral_rewards")
}
```

---

## 6. 分阶段开发计划

### 6.1 阶段总览

| 阶段 | 名称 | 周期 | 核心内容 |
|------|------|------|---------|
| Phase 0 | 项目脚手架搭建 | 1-2天 | Next.js项目初始化、Prisma+MySQL配置 |
| Phase 1 | 用户认证与会员系统 | 3-5天 | 注册、登录、会员体系、个人资料 |
| Phase 2 | 变美分析模块 | 3-5天 | 照片上传、面部分析、结果展示 |
| Phase 3 | 姿造美学与生活计划 | 5-7天 | 风格测试、造型推荐、计划管理、打卡 |
| Phase 4 | 灵感探索与社交 | 5-7天 | 内容浏览、话题、收藏、评论、成就、500张冷启动储备 |
| Phase 5 | AI顾问与分享系统 | 3-5天 | AI对话、分享海报、邀请奖励 |
| Phase 6 | 测试与部署 | 3-5天 | 单元测试、集成测试、部署上线 |

### 6.2 Phase 0：项目脚手架搭建

**目标**：初始化Next.js项目，配置Prisma和MySQL，建立基础开发环境

**任务清单**：

| 任务 | 描述 | 预估时间 |
|------|------|---------|
| 1.1 | 使用 `npx create-next-app@14` 创建项目 | 1小时 |
| 1.2 | 安装依赖：tailwindcss@3, prisma, @prisma/client, axios, zustand, react-hook-form, bcrypt, jsonwebtoken | 30分钟 |
| 1.3 | 配置TailwindCSS | 1小时 |
| 1.4 | 创建Prisma schema并配置MySQL连接 | 1小时 |
| 1.5 | 创建.env文件，配置DATABASE_URL | 30分钟 |
| 1.6 | 运行 `npx prisma migrate dev` 创建数据库表 | 1小时 |
| 1.7 | 创建基础目录结构和工具函数 | 2小时 |
| 1.8 | 配置ESLint和Prettier | 1小时 |

**输出**：
- 可运行的Next.js项目
- Prisma客户端初始化完成
- MySQL数据库表创建完成
- 基础工具函数和配置文件

### 6.3 Phase 1：用户认证与会员系统

**目标**：实现用户注册、登录、会员体系和个人资料管理

**任务清单**：

| 任务 | 描述 | 预估时间 |
|------|------|---------|
| 2.1 | 创建登录API (`/api/v1/auth/login`) | 2小时 |
| 2.2 | 创建注册API (`/api/v1/auth/register`) | 2小时 |
| 2.3 | 创建登出API (`/api/v1/auth/logout`) | 1小时 |
| 2.4 | 创建获取用户信息API (`/api/v1/users/profile`) | 1小时 |
| 2.5 | 创建更新用户资料API (`/api/v1/users/profile`) | 2小时 |
| 2.6 | 创建会员信息API (`/api/v1/users/membership`) | 2小时 |
| 2.7 | 创建登录页面 (`/user/login`) | 2小时 |
| 2.8 | 创建注册页面 (`/user/register`) | 2小时 |
| 2.9 | 创建个人中心页面 (`/user/profile`)，包含我的服务和我的成就入口 | 4小时 |
| 2.10 | 创建会员中心页面 (`/user/membership`) | 2小时 |
| 2.11 | 实现JWT认证中间件 | 2小时 |
| 2.12 | 实现用户状态管理 (Zustand) | 2小时 |

**输出**：
- 完整的用户认证系统
- 会员等级体系（普通会员、悦己会员、悦己Pro会员）
- 会员权益展示（每日咨询次数、效果图积分消耗、生图队列优先级）
- 会员升级页面（会员套餐选择、支付跳转）
- 个人资料管理
- 积分系统（获取/消耗规则、有效期管理：免费积分90天/充值积分永久有效）
- 生图队列设计（标准队列FIFO、优先队列、极速队列）
- 个人数据管理面板（分析照片、效果图、分析报告、打卡记录、AI顾问记录）
- 数据下载功能（打包分析报告JSON、效果图原图、打卡记录JSON、进化史照片，7天生成链接，48小时有效）
- 账号注销流程（二次确认弹窗、账号立即不可登录、7天冷静期、7天后全量数据物理删除、30天备份清除）
- 登录/注册/个人中心页面

### 6.4 Phase 2：变美分析模块

**目标**：实现多角度照片上传、拍摄引导页、分析进度动画、面部特征分析、皮肤状态观察、体态观察、报告标签式导航展示

**任务清单**：

| 任务 | 描述 | 预估时间 |
|------|------|---------|
| 3.1 | 创建照片上传API (`/api/v1/analysis`)，支持多角度照片 | 4小时 |
| 3.2 | 创建获取分析记录API | 2小时 |
| 3.3 | 创建获取分析结果API (`/api/v1/analysis/[id]`) | 2小时 |
| 3.4 | 集成AI分析服务（调用第三方API） | 3小时 |
| 3.5 | 创建分析页面 (`/analysis`)，支持多角度上传界面 | 4小时 |
| 3.6 | 创建分析结果页面 (`/analysis/result`)，标签式导航 | 4小时 |
| 3.7 | 实现多角度图片上传组件（正脸、左脸、右脸、俯视、仰视、全身） | 3小时 |
| 3.8 | 实现分析结果展示组件，包含皮肤状态观察、体态观察 | 4小时 |
| 3.9 | 实现报告标签式导航组件（面部形体分析、妆容、穿搭、发型、美容美体） | 3小时 |
| 3.10 | 实现推荐内容详细描述展示（妆容、穿搭、发型） | 3小时 |
| 3.11 | 实现发型沟通话术展示 | 2小时 |
| 3.12 | 实现美容美体周期计划展示 | 3小时 |
| 3.13 | 实现查看效果图按钮跳转到姿造美学功能区 | 3小时 |

**输出**：
- 多角度照片上传功能（正脸、左脸、右脸、俯视、仰视、全身）
- 拍摄引导页（人脸轮廓线框、实时检测提示）
- 分析进度动画（进度环+文字轮播）
- AI面部分析集成
- 皮肤状态观察（皮肤泛红凸起、皮肤纹理、毛孔可见度）
- 体态观察（身材类型、头肩比、腿身比、体态习惯）
- 报告标签式导航展示
- 妆容、穿搭、发型推荐及查看效果图跳转
- 发型沟通话术
- 生活美学周期计划（动态生成2-5个周期，默认3个，周期名称根据核心内容动态生成）
- 分析记录管理

### 6.5 Phase 3：姿造美学与生活计划

**目标**：实现风格测试、造型推荐、生活计划管理和打卡功能，包含妆容、穿搭、发型、生活美学四种子模块

**任务清单**：

| 任务 | 描述 | 预估时间 |
|------|------|---------|
| 4.1 | 创建风格测试API | 3小时 |
| 4.2 | 创建造型推荐API | 3小时 |
| 4.3 | 创建计划管理API（增删改查） | 4小时 |
| 4.4 | 创建打卡API | 2小时 |
| 4.5 | 创建风格测试页面 (`/style/test`) | 3小时 |
| 4.6 | 创建造型推荐页面 (`/style/recommendation`) | 3小时 |
| 4.7 | 创建计划列表页面 (`/plan`) | 3小时 |
| 4.8 | 创建计划详情页面 (`/plan/[planId]`) | 3小时 |
| 4.9 | 实现风格测试组件 | 2小时 |
| 4.10 | 实现计划打卡组件 | 2小时 |

**姿造美学四种子模块任务**：

| 任务 | 描述 | 预估时间 |
|------|------|---------|
| 4.11 | 创建妆容子模块页面，包含效果图选择、化妆键、我的课程 | 4小时 |
| 4.12 | 实现妆容部位颜色调整功能（唇色、眼影、腮红、整体） | 3小时 |
| 4.13 | 创建穿搭子模块页面，包含效果图选择、换颜色、衣帽间 | 4小时 |
| 4.14 | 实现穿搭部位选择和颜色调整功能 | 3小时 |
| 4.15 | 创建发型子模块页面，包含效果图选择、换颜色、美发室 | 4小时 |
| 4.16 | 实现发型颜色选择功能（7种发色） | 2小时 |
| 4.17 | 实现美发室换发型功能（上传图片/选择系统图片） | 3小时 |
| 4.18 | 创建生活美学子模块页面，包含周期计划、每日步骤 | 5小时 |
| 4.19 | 实现周一到周日每日计划展示（护肤步骤、运动计划、饮食建议） | 4小时 |
| 4.20 | 实现饮食建议展示 | 3小时 |
| 4.21 | 实现运动教程功能（瑜伽、健美操、运动项目） | 3小时 |
| 4.22 | 实现查看当前周期计划按钮跳转功能 | 2小时 |
| 4.23 | 实现打卡记录功能（每日打卡、补打卡机制） | 4小时 |
| 4.24 | 实现周期解锁机制（完成7天打卡+上传照片解锁下一周期） | 3小时 |
| 4.25 | 实现中断恢复机制（1-7天继续、7-14天选择、14天以上建议重新分析） | 3小时 |
| 4.26 | 实现回归鼓励券发放逻辑 | 2小时 |
| 4.27 | 实现饮食与状态关联展示（皮肤好/不好日子对比） | 3小时 |
| 4.28 | 实现每周变化报告自动生成（周日晚20:00） | 3小时 |

**输出**：
- 风格测试系统
- 个性化造型推荐
- 生活计划管理
- 每日打卡功能
- 妆容子模块（效果图选择、化妆键、我的课程、颜色调整）
- 穿搭子模块（效果图选择、换颜色、衣帽间、部位选择）
- 发型子模块（效果图选择、换颜色、美发室、发色选择）
- 生活美学子模块（动态周期计划：根据分析结果生成2-5个周期，周期名称动态生成、每日步骤、饮食建议、运动教程、打卡记录、周期解锁、中断恢复、回归鼓励券、饮食与状态关联展示、每周变化报告）
- 效果图积分消耗确认弹窗
- 效果图加载骨架屏
- 效果图失败兜底机制
- 效果图反馈功能（👍/👎）
- 方案123展示逻辑（无报告/有报告/多份报告/报告页跳转）
- 专属美妆课程（6步骨架约束）
- 预设素材库（AI生成穿搭/发型/妆容素材）

### 6.6 Phase 4：灵感探索与社交

**目标**：实现内容浏览、话题探索、收藏、评论、成就系统、风格测试和一键套用功能，准备500张冷启动储备内容

**任务清单**：

| 任务 | 描述 | 预估时间 |
|------|------|---------|
| 5.1 | 创建内容列表API | 3小时 |
| 5.2 | 创建话题API | 2小时 |
| 5.3 | 创建搜索API | 2小时 |
| 5.4 | 创建收藏API | 2小时 |
| 5.5 | 创建评论API | 3小时 |
| 5.6 | 创建成就API | 3小时 |
| 5.7 | 创建排行榜API | 2小时 |
| 5.8 | 创建关注API | 2小时 |
| 5.9 | 创建风格测试API（测试流程、风格标签计算） | 3小时 |
| 5.10 | 创建风格演化追踪API（30天统计、演化检测） | 2小时 |
| 5.11 | 创建灵感详情API（含套用参数） | 3小时 |
| 5.12 | 创建灵感探索页面 (`/explore`)，底部添加上传照片生成报告按钮 | 4小时 |
| 5.13 | 创建话题详情页面 (`/explore/topic/[topicId]`) | 3小时 |
| 5.14 | 创建搜索页面 (`/explore/search`) | 2小时 |
| 5.15 | 创建风格测试页面 (`/explore/style-test`) | 4小时 |
| 5.16 | 创建灵感详情页面 (`/explore/content/[contentId]`)，含[套在我身上试试]按钮 | 4小时 |
| 5.17 | 创建社交首页 (`/social`) | 3小时 |
| 5.18 | 创建成就中心页面 (`/social/achievements`) | 2小时 |
| 5.19 | 创建排行榜页面 (`/social/leaderboard`) | 2小时 |
| 5.20 | 准备500张冷启动储备内容（护肤、化妆、穿搭、发型等分类） | 8小时 |
| 5.21 | 准备12种风格的AI生成虚拟形象穿搭图（每种风格8张） | 4小时 |

**输出**：
- 内容浏览和搜索
- 话题系统
- 风格测试（3页轻量测试，12种风格标签）
- 风格演化追踪（30天统计、演化提醒）
- 一键套用（灵感详情页→效果图生成页参数传递）
- 灵感详情页（风格标签、适用体型/脸型、方案描述、适合原因）
- 收藏和评论功能
- 成就和排行榜系统（12枚勋章：初识自己、第一张效果图、7天坚持、21天蜕变、风格达人、学霸、灵感贡献者、周期毕业、百日蜕变、风格进化、创作大师、最佳拍档）
- 勋章自动发放逻辑
- 闺蜜小组（隐私边界、无聊天功能）
- 进化史时间轴
- 公开进化史页面
- 关注功能
- 500张冷启动储备内容

### 6.7 Phase 5：AI顾问与分享系统

**目标**：实现AI对话功能、分享海报生成和邀请奖励系统

**任务清单**：

| 任务 | 描述 | 预估时间 |
|------|------|---------|
| 6.1 | 创建对话管理API | 3小时 |
| 6.2 | 创建消息发送API | 3小时 |
| 6.3 | 集成AI聊天服务 | 3小时 |
| 6.4 | 创建邀请链接API | 2小时 |
| 6.5 | 创建分享海报API | 3小时 |
| 6.6 | 创建推荐奖励API | 2小时 |
| 6.7 | 创建分享内容选择器API | 2小时 |
| 6.8 | 创建分享平台API（微信/QQ/抖音/小红书/快手） | 3小时 |
| 6.9 | 创建分享记录管理API（列表/撤回/统计） | 3小时 |
| 6.10 | 创建分享落地页API | 2小时 |
| 6.11 | 创建AI顾问页面 (`/consultant`) | 4小时 |
| 6.12 | 创建分享页面 (`/share`) | 3小时 |
| 6.13 | 创建分享记录页面 (`/share/history`) | 3小时 |
| 6.14 | 创建分享落地页 (`/share/landing`) | 3小时 |
| 6.15 | 实现聊天消息组件 | 3小时 |
| 6.16 | 实现分享海报组件 | 2小时 |
| 6.17 | 实现分享内容选择器组件 | 3小时 |
| 6.18 | 实现分享平台选择组件 | 3小时 |
| 6.19 | 实现分享记录管理组件 | 3小时 |

**输出**：
- AI智能对话
- 对话历史管理
- AI顾问安全护栏规则（关键词过滤、语义检测、用户意图拦截、尾部追加、次数限制）
- 分享内容选择器（完整/匿名/教学/脱敏模式，不同场景可选模式不同）
- 多平台分享支持（微信好友、微信朋友圈、QQ好友、抖音、小红书、快手、复制链接、保存图片）
- 分享海报生成（完整模式/匿名模式/教学模式，尺寸750×1000px）
- 抖音/快手短视频生成（15-30秒变美过程）
- 小红书风格分享图生成（1080×1440px，1-9张）
- 分享卡片生成规范（尺寸、内容元素、底部文案）
- 分享链接有效期（24小时）
- 分享追踪参数（share_id、user_id加密、share_type、platform、share_mode、timestamp）
- 分享统计指标（分享次数、落地页访问量、新用户注册数、分享回流率）
- 分享撤回功能（二次确认、立即失效、不可恢复）
- 分享落地页（展示分享内容、分享者昵称、有效期提示、引导注册）
- 我的分享记录（按类型筛选、状态显示、撤回操作）
- 邀请奖励系统

### 6.8 Phase 6：风控系统与测试部署

**目标**：实现风控系统（行为真实度评分、设备指纹、照片相似度检测），完成测试、性能优化和部署上线

**风控系统任务清单**：

| 任务 | 描述 | 预估时间 |
|------|------|---------|
| 7.1 | 创建设备指纹API | 2小时 |
| 7.2 | 创建照片相似度检测API | 3小时 |
| 7.3 | 实现行为真实度评分计算（7条加减分规则） | 4小时 |
| 7.4 | 实现行为真实度评分应用规则（分数<30限制权益、分数<0冻结权益） | 2小时 |
| 7.5 | 创建动态验证API | 2小时 |

**测试与部署任务清单**：

| 任务 | 描述 | 预估时间 |
|------|------|---------|
| 7.6 | 编写单元测试（API层） | 4小时 |
| 7.7 | 编写集成测试 | 4小时 |
| 7.8 | 性能优化（代码分割、图片优化） | 3小时 |
| 7.9 | 安全审计（XSS、CSRF防护） | 2小时 |
| 7.10 | 配置环境变量（开发/测试/生产） | 2小时 |
| 7.11 | 部署到Vercel或服务器 | 3小时 |
| 7.12 | 数据库迁移（生产环境） | 2小时 |
| 7.13 | 上线前检查清单 | 2小时 |

**输出**：
- 设备指纹系统
- 照片相似度检测
- 行为真实度评分系统（7条加减分规则+评分应用）
- 动态验证机制
- 完整测试用例
- 性能优化完成
- 安全审计通过
- 项目部署上线

---

## 7. 数据库迁移方案

### 7.1 Prisma迁移流程

```bash
# 1. 创建迁移文件
npx prisma migrate dev --name init

# 2. 查看迁移状态
npx prisma migrate status

# 3. 应用迁移到生产环境
npx prisma migrate deploy

# 4. 查看数据库结构
npx prisma studio
```

### 7.2 数据库连接配置

**开发环境**：
```env
DATABASE_URL="mysql://user:password@localhost:3306/beauty_society"
```

**生产环境**：
```env
DATABASE_URL="mysql://user:password@prod-db:3306/beauty_society"
```

### 7.3 MySQL权限要求

| 权限 | 说明 |
|------|------|
| CREATE | 创建数据库和表 |
| ALTER | 修改表结构 |
| INSERT | 插入数据 |
| UPDATE | 更新数据 |
| DELETE | 删除数据 |
| SELECT | 查询数据 |

---

## 8. 环境配置

### 8.1 Node.js版本要求

```bash
# .nvmrc
20.10.0
```

### 8.2 开发命令

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# Prisma相关命令
npx prisma migrate dev      # 开发环境迁移
npx prisma migrate deploy   # 生产环境迁移
npx prisma studio           # 数据库可视化
npx prisma generate         # 生成Prisma客户端

# 测试命令
npm run test                # 运行测试
npm run test:coverage       # 测试覆盖率

# 代码检查
npm run lint                # ESLint检查
npm run format              # Prettier格式化
```

### 8.3 目录结构说明

| 目录 | 说明 |
|------|------|
| `src/app/` | Next.js页面和API路由 |
| `src/components/` | React组件 |
| `src/hooks/` | 自定义React Hooks |
| `src/store/` | Zustand状态管理 |
| `src/lib/` | 核心工具库（Prisma客户端、认证等） |
| `src/types/` | TypeScript类型定义 |
| `src/styles/` | 全局样式 |
| `prisma/` | Prisma配置和schema |

---

## 9. 开发规范

### 9.1 代码规范

| 规范项 | 说明 |
|-------|------|
| 语言 | TypeScript |
| 组件命名 | PascalCase |
| 文件命名 | kebab-case |
| 函数命名 | camelCase |
| 常量命名 | UPPER_SNAKE_CASE |
| 代码格式化 | Prettier |
| 代码检查 | ESLint |

### 9.2 Git提交规范

```
feat: 新增功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 代码重构
test: 测试用例
chore: 构建/工具
perf: 性能优化
security: 安全修复
```

### 9.3 API开发规范

| 规范项 | 说明 |
|-------|------|
| 路径格式 | `/api/v1/{module}/{action}` |
| HTTP方法 | GET(查询)、POST(创建)、PUT(更新)、DELETE(删除) |
| 响应格式 | `{ code: number, message: string, data: any, timestamp: number }` |
| 错误码 | 200成功，4xx客户端错误，5xx服务端错误 |
| 参数校验 | 使用Zod或Yup进行参数验证 |

### 9.4 安全规范

| 规范项 | 说明 |
|-------|------|
| 密码存储 | 使用bcrypt加密存储 |
| Token管理 | 使用JWT，设置过期时间 |
| 数据传输 | HTTPS |
| 输入验证 | 对所有用户输入进行验证和过滤 |
| XSS防护 | 使用React自动转义，DOMPurify处理富文本 |
| CSRF防护 | 使用anti-CSRF token |

---

**文档审批：**
- 技术负责人：___________
- 产品负责人：___________
