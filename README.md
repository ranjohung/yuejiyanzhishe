# 悦己颜值社 - 项目文档索引

版本：v5.0（去医疗化合规版）
更新日期：2026年6月17日
文档类型：项目总索引

---

## 📁 文档结构

```
.
├── README.md                    # 项目文档总索引（本文件）
├── docs/
│   ├── prd.md                   # 产品需求文档 (PRD)
│   ├── frontend.md              # 前端技术方案
│   ├── backend.md               # 后端技术方案
│   ├── database.md              # 数据库设计文档
│   ├── api.md                   # API接口规范文档
│   ├── compliance.md            # 合规定位与文案规范
│   ├── development-plan.md      # 全栈开发计划
│   ├── material-checklist.md    # 素材搜集清单与整理规范
│   ├── security-privacy.md      # 数据安全与隐私保护体系
│   └── modules/
│       ├── module-01-analysis.md    # 模块一：变美分析
│       ├── module-02-style.md       # 模块二：姿造美学
│       ├── module-03-lifestyle.md   # 模块三：生活美学计划
│       ├── module-04-inspiration.md # 模块四：灵感探索
│       ├── module-05-social.md      # 模块五：成就与社交
│       ├── module-06-ai-consultant.md # 模块六：AI变美顾问
│       ├── module-07-user-system.md # 模块七：用户与会员系统
│       ├── module-08-share.md       # 模块八：分享系统
│       └── module-09-risk-control.md # 模块九：风控系统
```

---

## 📋 文档索引表

| 文档名称 | 路径 | 说明 |
|---------|------|------|
| 产品需求文档 | [docs/prd.md](docs/prd.md) | 产品定位、目标用户、功能需求、非功能需求 |
| 前端技术方案 | [docs/frontend.md](docs/frontend.md) | Next.js架构、技术选型、组件规划、页面结构 |
| 后端技术方案 | [docs/backend.md](docs/backend.md) | 技术选型、架构设计、服务划分、安全策略 |
| 数据库设计 | [docs/database.md](docs/database.md) | 数据模型、表结构设计、索引优化 |
| API接口规范 | [docs/api.md](docs/api.md) | 接口设计规范、错误码定义、认证机制 |
| 合规与文案规范 | [docs/compliance.md](docs/compliance.md) | 合规定位红线、禁止功能清单、文案用词规范 |
| 全栈开发计划 | [docs/development-plan.md](docs/development-plan.md) | 开发路线图、架构设计、Prisma Schema、分阶段任务 |
| 素材搜集清单 | [docs/material-checklist.md](docs/material-checklist.md) | 8大类素材搜集清单与整理规范 |
| 数据安全与隐私 | [docs/security-privacy.md](docs/security-privacy.md) | 数据安全生命周期、隐私模式、照片加密存储 |
| 模块一：变美分析 | [docs/modules/module-01-analysis.md](docs/modules/module-01-analysis.md) | 面部分析、肤质检测、隐私模式、生活方式问卷 |
| 模块二：姿造美学 | [docs/modules/module-02-style.md](docs/modules/module-02-style.md) | 造型推荐、穿搭指导、效果图缓存、换颜色功能、专属美妆课程生成 |
| 模块三：生活美学计划 | [docs/modules/module-03-lifestyle.md](docs/modules/module-03-lifestyle.md) | 日常护肤、饮食建议、周期解锁、中断恢复、饮食与状态关联展示、每周变化报告 |
| 模块四：灵感探索 | [docs/modules/module-04-inspiration.md](docs/modules/module-04-inspiration.md) | 内容浏览、话题探索、灵感收藏、风格测试、一键套用 |
| 模块五：成就与社交 | [docs/modules/module-05-social.md](docs/modules/module-05-social.md) | 成就系统、社交互动、小组内排名、闺蜜小组、12枚勋章墙、每周变化报告 |
| 模块六：AI变美顾问 | [docs/modules/module-06-ai-consultant.md](docs/modules/module-06-ai-consultant.md) | AI对话、安全护栏、次数限制 |
| 模块七：用户与会员系统 | [docs/modules/module-07-user-system.md](docs/modules/module-07-user-system.md) | 用户注册、会员体系、积分规则、生图队列、积分有效期、个人数据管理面板 |
| 模块八：分享系统 | [docs/modules/module-08-share.md](docs/modules/module-08-share.md) | 内容分享、分享模式、链接有效期与撤回 |
| 模块九：风控系统 | [docs/modules/module-09-risk-control.md](docs/modules/module-09-risk-control.md) | 设备指纹、照片相似度检测、动态验证、延时发放、行为真实度评分、支付验证、事后审计 |

---

## 🎯 产品概述

「悦己颜值社」是一款面向女性用户的美学生活方式平台，旨在帮助用户通过科学的方法实现自我提升与变美。帮助用户从"知道"到"做到"完成变美闭环，通过AI效果图预览让穿搭/妆容/发型方案可执行、可追踪、可进化。平台整合了AI分析、个性化推荐、社交互动等功能，打造全方位的变美体验。

**核心价值：**
- 科学分析：基于AI技术的面部特征与肤质分析
- 个性化推荐：根据用户特征定制专属变美方案
- 可执行方案：AI效果图预览，让方案落地可见
- 社区互动：分享变美心得，建立积极的社交氛围
- 可持续性：倡导健康、可持续的变美理念

---

## 🛠 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | Next.js 14+ (App Router) |
| UI组件 | React 18+, TailwindCSS 3+ |
| 状态管理 | Zustand / React Context |
| 构建工具 | Turbopack (Next.js内置) |
| 后端框架 | Next.js API Routes (全栈) |
| 数据库 | MySQL 8+ |
| ORM | Prisma 5+ |
| 缓存 | Redis 7+ |
| 对象存储 | 阿里云OSS / 七牛云 |
| 向量数据库 | Milvus（AI顾问知识库检索） |
| 消息队列 | RabbitMQ（异步任务） |
| 生图模型 | Stable Diffusion（换装/换发/妆容迁移） |
| 端侧AI | Core ML (iOS) / MediaPipe (Android) |
| AI能力 | 面部分析API、大语言模型集成 |
| 部署 | Vercel（全栈） |

---

## 📖 使用说明

本文档所有细节均已经过产品确认，开发团队请严格照此执行，无需自行补充或修改业务逻辑。

- **产品团队**：重点关注 [docs/prd.md](docs/prd.md) 和各模块设计文档
- **开发团队**：重点关注 [docs/development-plan.md](docs/development-plan.md)、[docs/frontend.md](docs/frontend.md)、[docs/backend.md](docs/backend.md)、[docs/database.md](docs/database.md) 和 [docs/api.md](docs/api.md)
- **后端开发**：需严格按照 docs/database.md 中的表结构编写 Prisma Schema，不得自行增减字段或修改字段类型
- **全体成员**：必须遵守 [docs/compliance.md](docs/compliance.md) 中的合规定位要求
- **各模块负责人**：需在各模块文档开头明确该模块的合规约束，引用 docs/compliance.md 中的相关红线

---

## 📮 联系方式

如有疑问，请联系产品负责人或项目管理员。
