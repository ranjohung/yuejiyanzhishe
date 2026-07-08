# 悦己颜值社 - 数据库设计文档

> **⚠️ 注意**：本文档基于原设计计划，数据库选型为 PostgreSQL。当前开发计划已变更为 **Next.js 全栈 + MySQL + Prisma**，详细设计请参考 [development-plan.md](development-plan.md) 中的 Prisma Schema 设计章节。

版本：v5.0（去医疗化合规版）
更新日期：2026年6月17日
文档类型：数据库设计文档

---

## 目录

1. [数据库概述](#1-数据库概述)
2. [数据库架构设计](#2-数据库架构设计)
3. [用户模块表设计](#3-用户模块表设计)
4. [分析模块表设计](#4-分析模块表设计)
5. [姿造美学模块表设计](#5-姿造美学模块表设计)
6. [生活计划模块表设计](#6-生活计划模块表设计)
7. [灵感探索模块表设计](#7-灵感探索模块表设计)
8. [社交模块表设计](#8-社交模块表设计)
9. [AI顾问模块表设计](#9-ai顾问模块表设计)
10. [分享模块表设计](#10-分享模块表设计)
11. [索引设计](#11-索引设计)
12. [数据字典](#12-数据字典)
13. [数据库迁移](#13-数据库迁移)

---

## 1. 数据库概述

### 1.1 数据库选择
选择 **PostgreSQL 16+** 作为数据库管理系统，理由如下：
- 支持JSONB类型，适合存储分析结果等非结构化数据
- 支持数组类型，适合存储标签等数据
- 性能优异，支持复杂查询优化
- 支持全文搜索，适合内容搜索功能
- 社区活跃，生态成熟

### 1.2 数据库命名规范

| 项目 | 规范 | 示例 |
|------|------|------|
| 数据库名 | 小写，下划线分隔 | beauty_society |
| 表名 | 小写，下划线分隔，复数形式 | users |
| 字段名 | 小写，下划线分隔 | user_id |
| 索引名 | idx_表名_字段名 | idx_users_phone |
| 外键名 | fk_子表_父表_字段 | fk_analyses_users_user_id |

---

## 2. 数据库架构设计

### 2.1 表空间划分

| 表空间 | 包含表 | 说明 |
|-------|-------|------|
| users | users, user_profiles, memberships, roles, role_users | 用户相关表 |
| analysis | analyses, analysis_results, skin_types, face_features | 分析相关表 |
| style | style_tests, style_results, recommendations, makeup_styles | 姿造美学表 |
| plan | plans, plan_items, checkins, plan_progress | 生活计划表 |
| explore | contents, topics, tags, collections, content_tags | 灵感探索表 |
| social | followers, comments, achievements, user_achievements, leaderboard | 社交表 |
| consultant | conversations, messages | AI顾问表 |
| share | shares, share_posters, referrals, referral_rewards | 分享表 |

### 2.2 ER图关系

```
users
├── user_profiles (1:1)
├── memberships (1:1)
├── analyses (1:N)
├── style_tests (1:N)
├── plans (1:N)
├── contents (1:N)
├── followers (N:N)
├── comments (1:N)
├── user_achievements (N:N)
├── conversations (1:N)
├── shares (1:N)
└── referrals (1:N)

analyses ─── analysis_results (1:1)
style_tests ─── style_results (1:1) ─── recommendations (1:N)
plans ─── plan_items (1:N) ─── checkins (1:N)
contents ─── content_tags (N:N) ─── tags
contents ─── collections (1:N)
contents ─── comments (1:N)
topics ─── contents (1:N)
achievements ─── user_achievements (N:N)
conversations ─── messages (1:N)
referrals ─── referral_rewards (1:N)
```

---

## 3. 用户模块表设计

### 3.1 users 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 用户唯一标识 |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | 手机号 |
| password | VARCHAR(255) | NOT NULL | 密码（bcrypt加密） |
| nickname | VARCHAR(50) | UNIQUE | 用户昵称 |
| avatar | VARCHAR(500) | | 头像URL |
| gender | SMALLINT | DEFAULT 0 | 性别（0未知，1女，2男） |
| age | SMALLINT | | 年龄 |
| email | VARCHAR(100) | UNIQUE | 邮箱 |
| member_level | SMALLINT | DEFAULT 0 | 会员等级（0普通，1白银，2黄金，3钻石） |
| member_expire_time | TIMESTAMP | | 会员到期时间 |
| status | SMALLINT | DEFAULT 1 | 状态（0禁用，1正常） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 3.2 user_profiles 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), UNIQUE | 用户ID |
| birthday | DATE | | 生日 |
| height | SMALLINT | | 身高（cm） |
| weight | DECIMAL(5,1) | | 体重（kg） |
| skin_type | SMALLINT | | 肤质类型（1油性，2干性，3混合性，4中性，5敏感性） |
| style_preference | TEXT[] | | 风格偏好（数组） |
| interests | TEXT[] | | 兴趣爱好（数组） |
| bio | TEXT | | 个人简介 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 3.3 memberships 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| level | SMALLINT | UNIQUE, NOT NULL | 会员等级（0普通，1白银，2黄金，3钻石） |
| name | VARCHAR(50) | NOT NULL | 会员名称 |
| price | DECIMAL(10,2) | NOT NULL | 价格（元） |
| duration | INT | NOT NULL | 有效期（天） |
| features | TEXT[] | | 会员权益（数组） |
| status | SMALLINT | DEFAULT 1 | 状态（0禁用，1正常） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 3.4 point_transactions 表（积分明细表）

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| transaction_type | SMALLINT | NOT NULL | 交易类型（1获取，2消耗） |
| point_type | SMALLINT | NOT NULL | 积分类型（1免费获取，2充值购买，3活动奖励） |
| amount | INT | NOT NULL | 积分数量 |
| balance_before | INT | NOT NULL | 交易前余额 |
| balance_after | INT | NOT NULL | 交易后余额 |
| source | VARCHAR(100) | | 来源（成就、邀请、活动等） |
| expire_time | TIMESTAMP | | 积分过期时间 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 3.5 membership_subscriptions 表（会员订阅记录表）

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| membership_level | SMALLINT | NOT NULL | 会员等级 |
| order_no | VARCHAR(50) | UNIQUE | 订单号 |
| payment_method | VARCHAR(50) | | 支付方式（wechat/alipay） |
| amount | DECIMAL(10,2) | NOT NULL | 支付金额 |
| status | SMALLINT | DEFAULT 0 | 状态（0待支付，1已支付，2已取消） |
| start_time | TIMESTAMP | | 生效开始时间 |
| end_time | TIMESTAMP | | 生效结束时间 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| paid_at | TIMESTAMP | | 支付时间 |

---

## 4. 分析模块表设计

### 4.1 analyses 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 分析记录ID |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| image_url | VARCHAR(500) | NOT NULL | 分析图片URL |
| analysis_type | SMALLINT | NOT NULL | 分析类型（1面部特征分析，2肤质检测） |
| status | SMALLINT | DEFAULT 0 | 状态（0处理中，1成功，2失败） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| completed_at | TIMESTAMP | | 完成时间 |

### 4.2 analysis_results 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| analysis_id | UUID | FOREIGN KEY REFERENCES analyses(id), UNIQUE, NOT NULL | 分析记录ID |
| face_shape | VARCHAR(50) | | 脸型（圆形、方形、长形、心形、菱形、椭圆形） |
| skin_type | SMALLINT | | 肤质类型（1油性，2干性，3混合性，4中性，5敏感性） |
| skin_problems | TEXT[] | | 皮肤问题（毛孔粗大、色斑、黑眼圈、皮肤泛红凸起等） |
| complexion | VARCHAR(50) | | 肤色（白皙、偏黄、暗沉、红润等） |
| features | JSONB | | 面部特征详细数据 |
| suggestions | JSONB | | 改善建议 |
| score | DECIMAL(5,2) | | 综合评分（0-100） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 4.3 skin_types 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | SMALLINT | PRIMARY KEY | 肤质类型ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 肤质名称 |
| description | TEXT | | 肤质描述 |
| care_tips | TEXT[] | | 护理建议（数组） |

---

## 5. 姿造美学模块表设计

### 5.1 style_tests 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| answers | JSONB | NOT NULL | 测试答案（JSON格式） |
| status | SMALLINT | DEFAULT 0 | 状态（0进行中，1完成） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| completed_at | TIMESTAMP | | 完成时间 |

### 5.2 style_results 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| test_id | UUID | FOREIGN KEY REFERENCES style_tests(id), UNIQUE, NOT NULL | 测试ID |
| personal_style | VARCHAR(50) | NOT NULL | 个人风格（甜美、优雅、干练、休闲等） |
| style_description | TEXT | | 风格描述 |
| style_tags | TEXT[] | | 风格标签（数组） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 5.3 recommendations 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| result_id | UUID | FOREIGN KEY REFERENCES style_results(id) | 风格测试结果ID |
| recommendation_type | SMALLINT | NOT NULL | 推荐类型（1发型，2妆容，3穿搭） |
| content | JSONB | NOT NULL | 推荐内容（JSON格式） |
| image_url | VARCHAR(500) | | 推荐图片URL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

## 6. 生活计划模块表设计

### 6.1 plans 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| title | VARCHAR(100) | NOT NULL | 计划标题 |
| plan_type | SMALLINT | NOT NULL | 计划类型（1护肤，2饮食，3作息，4运动） |
| description | TEXT | | 计划描述 |
| start_date | DATE | NOT NULL | 开始日期 |
| end_date | DATE | NOT NULL | 结束日期 |
| status | SMALLINT | DEFAULT 1 | 状态（0已完成，1进行中，2暂停） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 6.2 plan_items 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| plan_id | UUID | FOREIGN KEY REFERENCES plans(id), NOT NULL | 计划ID |
| title | VARCHAR(100) | NOT NULL | 任务标题 |
| description | TEXT | | 任务描述 |
| day_index | INT | NOT NULL | 第几天的任务 |
| time_of_day | SMALLINT | | 执行时间（1早晨，2中午，3晚上） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 6.3 checkins 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| plan_item_id | UUID | FOREIGN KEY REFERENCES plan_items(id), NOT NULL | 计划任务ID |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| checkin_date | DATE | NOT NULL | 打卡日期 |
| status | SMALLINT | NOT NULL | 状态（0未完成，1完成） |
| note | TEXT | | 打卡备注 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

## 7. 灵感探索模块表设计

### 7.1 contents 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 内容ID |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 发布者ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| content | TEXT | | 内容正文（HTML格式） |
| cover_image | VARCHAR(500) | | 封面图片URL |
| topic_id | UUID | FOREIGN KEY REFERENCES topics(id) | 话题ID |
| tags | TEXT[] | | 标签数组 |
| views | INT | DEFAULT 0 | 浏览次数 |
| likes | INT | DEFAULT 0 | 点赞次数 |
| shares | INT | DEFAULT 0 | 分享次数 |
| comments_count | INT | DEFAULT 0 | 评论数 |
| status | SMALLINT | DEFAULT 2 | 状态（0草稿，1已发布，2审核中，3已拒绝） |
| is_featured | BOOLEAN | DEFAULT false | 是否精选 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 7.2 topics 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 话题ID |
| name | VARCHAR(100) | UNIQUE, NOT NULL | 话题名称 |
| description | TEXT | | 话题描述 |
| cover_image | VARCHAR(500) | | 话题封面 |
| content_count | INT | DEFAULT 0 | 内容数量 |
| followers_count | INT | DEFAULT 0 | 关注人数 |
| status | SMALLINT | DEFAULT 1 | 状态（0禁用，1正常） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 7.3 tags 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 标签ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 标签名称 |
| color | VARCHAR(20) | | 标签颜色 |
| usage_count | INT | DEFAULT 0 | 使用次数 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 7.4 collections 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 收藏ID |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| content_id | UUID | FOREIGN KEY REFERENCES contents(id), NOT NULL | 内容ID |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

## 8. 社交模块表设计

### 8.1 followers 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| follower_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 关注者ID |
| followee_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 被关注者ID |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 8.2 comments 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 评论ID |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| content_id | UUID | FOREIGN KEY REFERENCES contents(id), NOT NULL | 内容ID |
| parent_id | UUID | FOREIGN KEY REFERENCES comments(id) | 父评论ID（回复） |
| content | TEXT | NOT NULL | 评论内容 |
| likes | INT | DEFAULT 0 | 点赞数 |
| status | SMALLINT | DEFAULT 1 | 状态（0删除，1正常） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 8.3 achievements 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 成就ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 成就名称 |
| description | TEXT | | 成就描述 |
| icon | VARCHAR(255) | | 成就图标URL |
| points | INT | DEFAULT 0 | 成就积分 |
| achievement_type | SMALLINT | NOT NULL | 成就类型（1分析，2计划，3社交，4内容） |
| condition | JSONB | NOT NULL | 达成条件（JSON格式） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 8.4 user_achievements 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| achievement_id | UUID | FOREIGN KEY REFERENCES achievements(id), NOT NULL | 成就ID |
| unlocked_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 解锁时间 |
| progress | INT | DEFAULT 0 | 进度（0-100） |

### 8.5 leaderboard 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), UNIQUE, NOT NULL | 用户ID |
| total_points | INT | DEFAULT 0 | 总积分 |
| rank | INT | DEFAULT 0 | 当前排名 |
| last_updated | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

---

## 9. AI顾问模块表设计

### 9.1 conversations 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 对话ID |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| title | VARCHAR(100) | | 对话标题 |
| status | SMALLINT | DEFAULT 1 | 状态（0关闭，1进行中） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 9.2 messages 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 消息ID |
| conversation_id | UUID | FOREIGN KEY REFERENCES conversations(id), NOT NULL | 对话ID |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| role | VARCHAR(20) | NOT NULL | 角色（user/assistant） |
| content | TEXT | NOT NULL | 消息内容 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

## 10. 分享模块表设计

### 10.1 shares 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 分享ID |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 用户ID |
| content_id | UUID | FOREIGN KEY REFERENCES contents(id) | 分享内容ID |
| share_type | SMALLINT | NOT NULL | 分享类型（1内容分享，2海报分享，3邀请分享） |
| platform | SMALLINT | | 分享平台（1微信，2朋友圈，3微博，4QQ） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 10.2 share_posters 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| share_id | UUID | FOREIGN KEY REFERENCES shares(id), UNIQUE, NOT NULL | 分享ID |
| poster_url | VARCHAR(500) | NOT NULL | 海报图片URL |
| poster_template | SMALLINT | DEFAULT 1 | 海报模板（1模板一，2模板二，3模板三） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 10.3 referrals 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| referrer_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | 推荐人ID |
| referral_code | VARCHAR(20) | UNIQUE, NOT NULL | 推荐码 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 10.4 referral_rewards 表

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| referral_id | UUID | FOREIGN KEY REFERENCES referrals(id), NOT NULL | 推荐记录ID |
| new_user_id | UUID | FOREIGN KEY REFERENCES users(id), UNIQUE, NOT NULL | 新用户ID |
| reward_type | SMALLINT | NOT NULL | 奖励类型（1积分，2会员天数，3优惠券） |
| reward_value | INT | NOT NULL | 奖励值 |
| status | SMALLINT | DEFAULT 0 | 状态（0待发放，1已发放） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| awarded_at | TIMESTAMP | | 发放时间 |

---

## 11. 索引设计

### 11.1 用户模块索引

| 表名 | 索引名 | 字段 | 类型 |
|------|-------|------|------|
| users | idx_users_phone | phone | UNIQUE |
| users | idx_users_nickname | nickname | UNIQUE |
| users | idx_users_email | email | UNIQUE |
| users | idx_users_member_level | member_level | BTREE |
| users | idx_users_status | status | BTREE |
| user_profiles | idx_user_profiles_user_id | user_id | UNIQUE |

### 11.2 分析模块索引

| 表名 | 索引名 | 字段 | 类型 |
|------|-------|------|------|
| analyses | idx_analyses_user_id | user_id | BTREE |
| analyses | idx_analyses_analysis_type | analysis_type | BTREE |
| analyses | idx_analyses_status | status | BTREE |
| analysis_results | idx_analysis_results_analysis_id | analysis_id | UNIQUE |

### 11.3 内容模块索引

| 表名 | 索引名 | 字段 | 类型 |
|------|-------|------|------|
| contents | idx_contents_user_id | user_id | BTREE |
| contents | idx_contents_topic_id | topic_id | BTREE |
| contents | idx_contents_status | status | BTREE |
| contents | idx_contents_created_at | created_at | BTREE |
| contents | idx_contents_title | title | GIN（全文搜索） |
| topics | idx_topics_name | name | UNIQUE |
| collections | idx_collections_user_id | user_id | BTREE |
| collections | idx_collections_content_id | content_id | BTREE |

### 11.4 社交模块索引

| 表名 | 索引名 | 字段 | 类型 |
|------|-------|------|------|
| followers | idx_followers_follower_id | follower_id | BTREE |
| followers | idx_followers_followee_id | followee_id | BTREE |
| comments | idx_comments_user_id | user_id | BTREE |
| comments | idx_comments_content_id | content_id | BTREE |
| comments | idx_comments_parent_id | parent_id | BTREE |
| user_achievements | idx_user_achievements_user_id | user_id | BTREE |
| leaderboard | idx_leaderboard_total_points | total_points | BTREE |

### 11.5 AI顾问模块索引

| 表名 | 索引名 | 字段 | 类型 |
|------|-------|------|------|
| conversations | idx_conversations_user_id | user_id | BTREE |
| messages | idx_messages_conversation_id | conversation_id | BTREE |
| messages | idx_messages_created_at | created_at | BTREE |

---

## 12. 数据字典

### 12.1 枚举值定义

#### 用户相关

| 枚举名 | 值 | 说明 |
|-------|-----|------|
| gender | 0 | 未知 |
| gender | 1 | 女 |
| gender | 2 | 男 |
| member_level | 0 | 普通会员 |
| member_level | 1 | 白银会员 |
| member_level | 2 | 黄金会员 |
| member_level | 3 | 钻石会员 |
| status | 0 | 禁用/关闭 |
| status | 1 | 正常/开启 |

#### 分析相关

| 枚举名 | 值 | 说明 |
|-------|-----|------|
| analysis_type | 1 | 面部特征分析 |
| analysis_type | 2 | 肤质检测 |
| skin_type | 1 | 油性 |
| skin_type | 2 | 干性 |
| skin_type | 3 | 混合性 |
| skin_type | 4 | 中性 |
| skin_type | 5 | 敏感性 |

#### 计划相关

| 枚举名 | 值 | 说明 |
|-------|-----|------|
| plan_type | 1 | 护肤计划 |
| plan_type | 2 | 饮食计划 |
| plan_type | 3 | 作息计划 |
| plan_type | 4 | 运动计划 |
| time_of_day | 1 | 早晨 |
| time_of_day | 2 | 中午 |
| time_of_day | 3 | 晚上 |

#### 内容相关

| 枚举名 | 值 | 说明 |
|-------|-----|------|
| content_status | 0 | 草稿 |
| content_status | 1 | 已发布 |
| content_status | 2 | 审核中 |
| content_status | 3 | 已拒绝 |

---

## 13. 数据库迁移

### 13.1 迁移工具
使用 TypeORM Migration 进行数据库迁移管理。

### 13.2 迁移文件命名规范
```
YYYYMMDDHHMMSS_create_users_table.ts
YYYYMMDDHHMMSS_add_columns_to_users.ts
YYYYMMDDHHMMSS_create_analyses_table.ts
```

### 13.3 迁移流程

1. 创建迁移文件
```bash
npm run migration:create -- -n CreateUsersTable
```

2. 编写迁移逻辑
```typescript
// up: 创建表
// down: 回滚操作（删除表）
```

3. 执行迁移
```bash
npm run migration:run
```

4. 回滚迁移
```bash
npm run migration:revert
```

### 13.4 迁移注意事项

- 每次数据库变更都需要创建迁移文件
- 迁移文件需要经过代码审查
- 在测试环境验证迁移后再部署到生产环境
- 重要数据变更需要备份

---

**文档审批：**
- 数据库负责人：___________
- 技术负责人：___________
