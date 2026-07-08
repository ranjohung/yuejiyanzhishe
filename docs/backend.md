# 悦己颜值社 - 后端技术方案

> **⚠️ 注意**：本文档基于原设计方案，采用 NestJS 分离式后端架构。当前开发计划已变更为 **Next.js 全栈架构**（API Route Handlers 替代独立后端服务），详细设计请参考 [development-plan.md](development-plan.md)。

版本：v5.0（去医疗化合规版）  
更新日期：2026年6月17日  
文档类型：后端技术方案

---

## 目录

1. [技术选型](#1-技术选型)
2. [架构设计](#2-架构设计)
3. [服务划分](#3-服务划分)
4. [目录结构](#4-目录结构)
5. [数据库设计](#5-数据库设计)
6. [API设计](#6-api设计)
7. [安全策略](#7-安全策略)
8. [部署方案](#8-部署方案)
9. [监控与日志](#9-监控与日志)
10. [开发规范](#10-开发规范)

---

## 1. 技术选型

### 1.1 核心技术栈

| 分类 | 技术 | 版本 | 选择理由 |
|------|------|------|---------|
| 语言 | Node.js | 20+ | 高性能，生态成熟，适合高并发场景 |
| 框架 | NestJS | 10+ | TypeScript支持，模块化架构，生态完善 |
| 数据库 | PostgreSQL | 16+ | 关系型数据库，支持JSON类型，性能优异 |
| ORM | TypeORM | 0.3+ | TypeScript支持，自动迁移，查询构建器 |
| 缓存 | Redis | 7+ | 高性能缓存，支持分布式锁 |
| 消息队列 | RabbitMQ | 3.13+ | 可靠消息传递，支持延迟队列 |
| 文件存储 | MinIO | 最新 | 对象存储，兼容S3 API |
| 认证 | JWT | 最新 | 无状态认证，支持Token刷新 |
| API文档 | Swagger | 最新 | 自动生成API文档 |
| 测试 | Jest | 29+ | 单元测试和集成测试 |

### 1.2 辅助工具

| 工具 | 用途 |
|------|------|
| Docker | 容器化部署 |
| Docker Compose | 本地开发环境 |
| Git | 版本控制 |
| ESLint | 代码质量检查 |
| Prettier | 代码格式化 |

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │  Web端   │  │  iOS端   │  │ Android  │  │  小程序端      │ │
│  │(Next.js) │  │(React   │  │ (React   │  │  (Taro/Uniapp) │ │
│  │          │  │  Native) │  │  Native) │  │                 │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬────────┘ │
└───────┼─────────────┼─────────────┼─────────────────┼───────────┘
        │             │             │                 │
        ▼             ▼             ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API网关层                                 │
│                    Nginx / Kong                                 │
│  - 请求路由     - 负载均衡     - SSL终止     - 限流熔断          │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用户服务   │    │   分析服务      │    │   内容服务      │
│ (User Service)│   │(Analysis Service)│   │(Content Service)│
└──────────────┘    └─────────────────┘    └─────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   社交服务   │    │   AI顾问服务    │    │   计划服务      │
│ (Social Service)│ │(Consultant Service)│ │(Plan Service)   │
└──────────────┘    └─────────────────┘    └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    PostgreSQL   │    │      Redis      │    │     MinIO       │
│    (主数据库)   │    │    (缓存层)     │    │   (文件存储)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    RabbitMQ     │
                    │   (消息队列)    │
                    └─────────────────┘
```

### 2.2 设计原则

1. **单一职责**：每个服务只负责一个业务领域
2. **高内聚低耦合**：服务内部高内聚，服务之间低耦合
3. **无状态设计**：服务不保存会话状态，便于水平扩展
4. **接口标准化**：统一的API接口规范
5. **容错设计**：服务降级、熔断机制
6. **可观测性**：完善的日志、监控、追踪

---

## 3. 服务划分

### 3.1 服务清单

| 服务名称 | 职责描述 | 核心功能 |
|---------|---------|---------|
| 用户服务 | 用户管理、认证授权 | 用户注册、登录、会员管理、权限控制 |
| 分析服务 | AI分析、结果处理 | 面部分析、肤质检测、报告生成 |
| 内容服务 | 内容管理、推荐 | 内容发布、话题管理、搜索推荐 |
| 社交服务 | 社交互动、成就系统 | 关注粉丝、评论互动、成就徽章、排行榜 |
| AI顾问服务 | 智能对话、个性化推荐 | 聊天机器人、智能问答、推荐算法 |
| 计划服务 | 生活计划、打卡管理 | 计划创建、打卡记录、进度追踪 |

### 3.2 服务交互关系

```
用户服务 ──────┐
               │ 认证信息
               ▼
分析服务 ←─── 用户服务（获取用户信息）
               │
               ▼
内容服务 ←─── 用户服务（获取用户偏好）
               │
               ▼
社交服务 ←─── 用户服务（获取用户关系）
               │
               ▼
AI顾问服务 ←─── 用户服务（获取用户画像）
               │
               ▼
计划服务 ←─── 用户服务（获取用户目标）
```

---

## 4. 目录结构

```
backend/
├── src/
│   ├── main.ts                    # 应用入口
│   ├── app.module.ts              # 根模块
│   ├── config/                    # 配置文件
│   │   ├── database.config.ts     # 数据库配置
│   │   ├── jwt.config.ts          # JWT配置
│   │   ├── redis.config.ts        # Redis配置
│   │   ├── minio.config.ts        # MinIO配置
│   │   └── rabbitmq.config.ts     # RabbitMQ配置
│   ├── common/                    # 公共模块
│   │   ├── guards/                # 守卫
│   │   │   └── jwt-auth.guard.ts
│   │   ├── interceptors/          # 拦截器
│   │   │   ├── logging.interceptor.ts
│   │   │   └── response.interceptor.ts
│   │   ├── filters/               # 过滤器
│   │   │   └── http-exception.filter.ts
│   │   ├── decorators/            # 装饰器
│   │   │   └── roles.decorator.ts
│   │   ├── pipes/                 # 管道
│   │   │   └── validation.pipe.ts
│   │   └── utils/                 # 工具函数
│   │       ├── encryption.ts      # 加密工具
│   │       ├── logger.ts          # 日志工具
│   │       └── helpers.ts         # 辅助函数
│   ├── modules/                   # 业务模块
│   │   ├── user/                  # 用户模块
│   │   │   ├── user.module.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.entity.ts
│   │   │   ├── user.dto.ts
│   │   │   └── user.repository.ts
│   │   ├── analysis/              # 分析模块
│   │   │   ├── analysis.module.ts
│   │   │   ├── analysis.controller.ts
│   │   │   ├── analysis.service.ts
│   │   │   ├── analysis.entity.ts
│   │   │   ├── analysis.dto.ts
│   │   │   └── analysis.repository.ts
│   │   ├── style/                 # 姿造美学模块
│   │   │   ├── style.module.ts
│   │   │   ├── style.controller.ts
│   │   │   ├── style.service.ts
│   │   │   ├── style.entity.ts
│   │   │   ├── style.dto.ts
│   │   │   └── style.repository.ts
│   │   ├── plan/                  # 生活计划模块
│   │   │   ├── plan.module.ts
│   │   │   ├── plan.controller.ts
│   │   │   ├── plan.service.ts
│   │   │   ├── plan.entity.ts
│   │   │   ├── plan.dto.ts
│   │   │   └── plan.repository.ts
│   │   ├── explore/               # 灵感探索模块
│   │   │   ├── explore.module.ts
│   │   │   ├── explore.controller.ts
│   │   │   ├── explore.service.ts
│   │   │   ├── explore.entity.ts
│   │   │   ├── explore.dto.ts
│   │   │   └── explore.repository.ts
│   │   ├── social/                # 社交模块
│   │   │   ├── social.module.ts
│   │   │   ├── social.controller.ts
│   │   │   ├── social.service.ts
│   │   │   ├── social.entity.ts
│   │   │   ├── social.dto.ts
│   │   │   └── social.repository.ts
│   │   ├── consultant/            # AI顾问模块
│   │   │   ├── consultant.module.ts
│   │   │   ├── consultant.controller.ts
│   │   │   ├── consultant.service.ts
│   │   │   ├── consultant.entity.ts
│   │   │   ├── consultant.dto.ts
│   │   │   └── consultant.repository.ts
│   │   └── share/                 # 分享模块
│   │       ├── share.module.ts
│   │       ├── share.controller.ts
│   │       ├── share.service.ts
│   │       ├── share.entity.ts
│   │       ├── share.dto.ts
│   │       └── share.repository.ts
│   ├── providers/                 # 第三方服务提供商
│   │   ├── ai-provider.ts         # AI服务提供商
│   │   ├── oss-provider.ts        # 对象存储提供商
│   │   └── message-provider.ts    # 消息服务提供商
│   └── shared/                    # 共享资源
│       ├── interfaces/            # 接口定义
│       └── types/                 # 类型定义
├── migrations/                    # 数据库迁移文件
├── test/                          # 测试文件
├── .env                           # 环境变量
├── docker-compose.yml             # Docker Compose配置
├── Dockerfile                     # Docker镜像配置
├── nest-cli.json                  # NestJS CLI配置
├── package.json                   # 依赖配置
├── tsconfig.json                  # TypeScript配置
└── README.md                      # 项目说明
```

---

## 5. 数据库设计

### 5.1 数据库架构

采用单一数据库实例，按模块划分表空间：

| 表空间 | 包含表 | 说明 |
|-------|-------|------|
| users | users, user_profiles, memberships, roles | 用户相关表 |
| analysis | analyses, analysis_results, skin_types | 分析相关表 |
| content | contents, topics, tags, collections | 内容相关表 |
| social | followers, comments, achievements, leaderboard | 社交相关表 |
| plan | plans, plan_items, checkins, progress | 计划相关表 |
| consultant | conversations, messages | AI顾问相关表 |
| share | shares, share_posters, referrals | 分享相关表 |

### 5.2 核心表设计

#### 5.2.1 users 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY | 用户唯一标识 |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | 手机号 |
| password | VARCHAR(255) | NOT NULL | 密码（加密存储） |
| nickname | VARCHAR(50) | UNIQUE | 用户昵称 |
| avatar | VARCHAR(255) | | 头像URL |
| gender | SMALLINT | | 性别（0未知，1女，2男） |
| age | SMALLINT | | 年龄 |
| email | VARCHAR(100) | UNIQUE | 邮箱 |
| member_level | SMALLINT | DEFAULT 0 | 会员等级 |
| member_expire_time | TIMESTAMP | | 会员到期时间 |
| status | SMALLINT | DEFAULT 1 | 状态（0禁用，1正常） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

#### 5.2.2 analyses 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY | 分析记录ID |
| user_id | UUID | FOREIGN KEY | 用户ID |
| image_url | VARCHAR(500) | NOT NULL | 分析图片URL |
| analysis_type | SMALLINT | NOT NULL | 分析类型（1面部，2肤质） |
| status | SMALLINT | DEFAULT 0 | 状态（0处理中，1成功，2失败） |
| result | JSONB | | 分析结果JSON |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| completed_at | TIMESTAMP | | 完成时间 |

#### 5.2.3 contents 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY | 内容ID |
| user_id | UUID | FOREIGN KEY | 发布者ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| content | TEXT | | 内容正文 |
| cover_image | VARCHAR(500) | | 封面图片 |
| topic_id | UUID | FOREIGN KEY | 话题ID |
| tags | TEXT[] | | 标签数组 |
| views | INT | DEFAULT 0 | 浏览次数 |
| likes | INT | DEFAULT 0 | 点赞次数 |
| shares | INT | DEFAULT 0 | 分享次数 |
| status | SMALLINT | DEFAULT 1 | 状态（0草稿，1发布，2审核中） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

---

## 6. API设计

### 6.1 API规范

#### 6.1.1 基础规范

- **协议**：HTTPS
- **请求格式**：JSON
- **响应格式**：JSON
- **字符编码**：UTF-8
- **时区**：UTC+8

#### 6.1.2 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1700000000000
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | INT | 状态码 |
| message | STRING | 提示信息 |
| data | ANY | 响应数据 |
| timestamp | LONG | 时间戳（毫秒） |

#### 6.1.3 错误码定义

| 错误码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 10001 | 用户不存在 |
| 10002 | 密码错误 |
| 10003 | 用户已存在 |
| 20001 | 分析处理失败 |
| 20002 | 图片格式错误 |
| 30001 | 内容不存在 |
| 30002 | 内容审核中 |
| 40001 | 会员过期 |
| 40002 | 权限不足 |

### 6.2 API模块划分

| 模块 | 基础路径 | 主要接口 |
|------|---------|---------|
| 用户 | /api/v1/users | 登录、注册、获取信息、更新资料、会员购买 |
| 分析 | /api/v1/analyses | 创建分析、获取记录、获取结果 |
| 姿造美学 | /api/v1/style | 风格测试、造型推荐、虚拟试妆 |
| 生活计划 | /api/v1/plans | 获取计划、创建计划、打卡、进度查询 |
| 灵感探索 | /api/v1/explore | 获取内容、获取话题、搜索、收藏 |
| 社交 | /api/v1/social | 关注、评论、成就、排行榜 |
| AI顾问 | /api/v1/consultant | 发送消息、获取对话历史 |
| 分享 | /api/v1/share | 生成海报、分享记录、邀请奖励 |

---

## 7. 安全策略

### 7.1 认证与授权

- **JWT认证**：用户登录后获取Token，每次请求携带Token
- **Token刷新**：支持Refresh Token机制，定期刷新Token
- **权限控制**：基于角色的访问控制（RBAC）
- **接口权限**：使用守卫验证接口访问权限

### 7.2 数据安全

- **密码加密**：使用bcrypt加密存储密码
- **数据传输**：HTTPS加密传输
- **敏感数据**：日志脱敏处理，禁止明文打印敏感信息
- **数据库访问**：使用参数化查询，防止SQL注入

### 7.3 防护机制

- **限流**：对API接口设置限流，防止恶意请求
- **熔断**：使用Hystrix或Resilience4j实现服务熔断
- **WAF**：部署Web应用防火墙，防止常见攻击
- **输入验证**：对所有输入参数进行严格验证

### 7.4 日志安全

- **日志级别**：生产环境使用INFO级别，开发环境使用DEBUG级别
- **日志脱敏**：敏感信息（手机号、邮箱等）进行脱敏处理
- **日志存储**：日志集中存储，定期清理

---

## 8. 部署方案

### 8.1 本地开发环境

使用Docker Compose搭建本地开发环境：

```yaml
# docker-compose.yml
services:
  postgresql:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: beauty_society
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
  redis:
    image: redis:7
    ports:
      - "6379:6379"
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
  rabbitmq:
    image: rabbitmq:3.13-management
    ports:
      - "5672:5672"
      - "15672:15672"
```

### 8.2 测试环境

- 使用Docker容器部署
- 独立的数据库和缓存实例
- 配置测试数据

### 8.3 生产环境

- **容器编排**：Kubernetes
- **负载均衡**：Nginx + Keepalived
- **数据库**：PostgreSQL主从复制
- **缓存**：Redis集群
- **文件存储**：MinIO分布式集群
- **监控**：Prometheus + Grafana

---

## 9. 监控与日志

### 9.1 监控体系

- **性能监控**：Prometheus + Grafana
- **应用监控**：Sentry
- **数据库监控**：pg_stat_statements
- **服务器监控**：Node Exporter

### 9.2 日志体系

- **日志框架**：Winston
- **日志级别**：DEBUG, INFO, WARN, ERROR
- **日志格式**：JSON格式，便于分析
- **日志存储**：Elasticsearch + Kibana

### 9.3 告警机制

- **告警渠道**：邮件、钉钉、飞书
- **告警规则**：
  - API响应时间超过1秒
  - 错误率超过5%
  - 服务器CPU使用率超过80%
  - 内存使用率超过80%

---

## 10. 开发规范

### 10.1 代码规范

- 使用 TypeScript
- 遵循 NestJS 风格指南
- 使用 ESLint 和 Prettier
- 代码注释覆盖率≥30%

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

### 10.4 数据库迁移

- 使用 TypeORM Migration 管理数据库变更
- 每次数据库变更都需要创建迁移文件
- 迁移文件需要经过代码审查

---

**文档审批：**
- 后端负责人：___________
- 技术负责人：___________