# 悦己颜值社 - API接口规范文档

版本：v5.0（去医疗化合规版）  
更新日期：2026年6月17日  
文档类型：API接口规范文档

---

## 目录

1. [API规范基础](#1-api规范基础)
2. [认证机制](#2-认证机制)
3. [响应格式](#3-响应格式)
4. [错误码定义](#4-错误码定义)
5. [用户模块API](#5-用户模块api)
6. [分析模块API](#6-分析模块api)
7. [姿造美学模块API](#7-姿造美学模块api)
8. [生活计划模块API](#8-生活计划模块api)
9. [灵感探索模块API](#9-灵感探索模块api)
10. [社交模块API](#10-社交模块api)
11. [AI顾问模块API](#11-ai顾问模块api)
12. [分享模块API](#12-分享模块api)

---

## 1. API规范基础

### 1.1 基本规范

| 项目 | 规范 |
|------|------|
| 协议 | HTTPS |
| 请求格式 | JSON |
| 响应格式 | JSON |
| 字符编码 | UTF-8 |
| 时区 | UTC+8 |
| 版本号 | v1（路径中体现） |
| 基础路径 | /api/v1 |

### 1.2 请求头规范

| 请求头 | 必填 | 说明 |
|-------|------|------|
| Content-Type | 是 | application/json |
| Authorization | 否 | Bearer Token（登录后必填） |
| X-Request-Id | 否 | 请求唯一标识（用于追踪） |

### 1.3 分页参数规范

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|------|--------|------|
| page | INT | 否 | 1 | 页码 |
| pageSize | INT | 否 | 20 | 每页数量 |
| sortBy | STRING | 否 | created_at | 排序字段 |
| sortOrder | STRING | 否 | desc | 排序方向（asc/desc） |

---

## 2. 认证机制

### 2.1 JWT认证流程

```
1. 用户登录 → POST /api/v1/users/login
2. 服务端验证 → 返回access_token和refresh_token
3. 客户端存储Token → 请求时携带Authorization头
4. Token过期 → 使用refresh_token刷新 → POST /api/v1/users/refresh-token
5. 刷新失败 → 重新登录
```

### 2.2 Token格式

```
Authorization: Bearer <access_token>
```

### 2.3 Token有效期

| Token类型 | 有效期 |
|----------|--------|
| access_token | 2小时 |
| refresh_token | 7天 |

---

## 3. 响应格式

### 3.1 成功响应

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
| code | INT | 状态码（200表示成功） |
| message | STRING | 提示信息 |
| data | ANY | 响应数据（对象或数组） |
| timestamp | LONG | 时间戳（毫秒） |

### 3.2 分页响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "timestamp": 1700000000000
}
```

### 3.3 错误响应

```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null,
  "timestamp": 1700000000000
}
```

---

## 4. 错误码定义

### 4.1 通用错误码

| 错误码 | HTTP状态码 | 说明 |
|-------|-----------|------|
| 200 | 200 | 成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未授权（Token无效或过期） |
| 403 | 403 | 禁止访问（权限不足） |
| 404 | 404 | 资源不存在 |
| 500 | 500 | 服务器内部错误 |

### 4.2 业务错误码

| 错误码 | 说明 |
|-------|------|
| 10001 | 用户不存在 |
| 10002 | 密码错误 |
| 10003 | 用户已存在 |
| 10004 | 手机号已注册 |
| 10005 | 昵称已存在 |
| 10006 | 邮箱已注册 |
| 10007 | 会员已过期 |
| 10008 | 会员等级不足 |

| 错误码 | 说明 |
|-------|------|
| 20001 | 分析处理失败 |
| 20002 | 图片格式错误 |
| 20003 | 图片大小超出限制 |
| 20004 | 分析记录不存在 |
| 20005 | 分析正在处理中 |

| 错误码 | 说明 |
|-------|------|
| 30001 | 内容不存在 |
| 30002 | 内容审核中 |
| 30003 | 内容已删除 |
| 30004 | 话题不存在 |
| 30005 | 标签不存在 |

| 错误码 | 说明 |
|-------|------|
| 40001 | 计划不存在 |
| 40002 | 计划任务不存在 |
| 40003 | 今日已打卡 |
| 40004 | 计划已完成 |

| 错误码 | 说明 |
|-------|------|
| 50001 | 评论不存在 |
| 50002 | 成就不存在 |
| 50003 | 成就未解锁 |
| 50004 | 已关注该用户 |
| 50005 | 未关注该用户 |

| 错误码 | 说明 |
|-------|------|
| 60001 | 对话不存在 |
| 60002 | 消息不存在 |
| 60003 | AI服务暂不可用 |

| 错误码 | 说明 |
|-------|------|
| 70001 | 分享记录不存在 |
| 70002 | 推荐码不存在 |
| 70003 | 推荐人不存在 |
| 70004 | 已使用该推荐码 |

---

## 5. 用户模块API

### 5.1 用户注册

**POST** `/api/v1/users/register`

请求体：
```json
{
  "phone": "13800138000",
  "password": "password123",
  "nickname": "美丽天使",
  "gender": 1,
  "age": 25
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | STRING | 是 | 手机号 |
| password | STRING | 是 | 密码（6-20位） |
| nickname | STRING | 是 | 用户昵称（2-50字符） |
| gender | INT | 否 | 性别（0未知，1女，2男） |
| age | INT | 否 | 年龄 |

成功响应：
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "uuid",
      "phone": "13800138000",
      "nickname": "美丽天使",
      "avatar": null,
      "gender": 1,
      "age": 25,
      "member_level": 0,
      "status": 1,
      "created_at": "2026-06-17T10:00:00Z"
    },
    "access_token": "token",
    "refresh_token": "token"
  },
  "timestamp": 1700000000000
}
```

### 5.2 用户登录

**POST** `/api/v1/users/login`

请求体：
```json
{
  "phone": "13800138000",
  "password": "password123"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | STRING | 是 | 手机号 |
| password | STRING | 是 | 密码 |

成功响应：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "uuid",
      "phone": "13800138000",
      "nickname": "美丽天使",
      "avatar": "url",
      "gender": 1,
      "age": 25,
      "member_level": 1,
      "member_expire_time": "2026-12-17T10:00:00Z",
      "status": 1
    },
    "access_token": "token",
    "refresh_token": "token"
  },
  "timestamp": 1700000000000
}
```

### 5.3 刷新Token

**POST** `/api/v1/users/refresh-token`

请求体：
```json
{
  "refresh_token": "token"
}
```

成功响应：
```json
{
  "code": 200,
  "message": "Token刷新成功",
  "data": {
    "access_token": "new_token",
    "refresh_token": "new_refresh_token"
  },
  "timestamp": 1700000000000
}
```

### 5.4 获取用户信息

**GET** `/api/v1/users/me`

需要Authorization头：`Bearer <token>`

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user": {
      "id": "uuid",
      "phone": "13800138000",
      "nickname": "美丽天使",
      "avatar": "url",
      "gender": 1,
      "age": 25,
      "email": "email@example.com",
      "member_level": 1,
      "member_expire_time": "2026-12-17T10:00:00Z",
      "status": 1,
      "created_at": "2026-06-17T10:00:00Z"
    },
    "profile": {
      "birthday": "1999-01-01",
      "height": 165,
      "weight": 52.5,
      "skin_type": 2,
      "style_preference": ["甜美", "优雅"],
      "interests": ["护肤", "化妆", "穿搭"],
      "bio": "热爱生活，追求美丽"
    }
  },
  "timestamp": 1700000000000
}
```

### 5.5 更新用户信息

**PUT** `/api/v1/users/me`

请求体：
```json
{
  "nickname": "新昵称",
  "avatar": "new_url",
  "gender": 1,
  "age": 26,
  "email": "new_email@example.com"
}
```

### 5.6 更新个人资料

**PUT** `/api/v1/users/profile`

请求体：
```json
{
  "birthday": "1999-01-01",
  "height": 165,
  "weight": 52.5,
  "skin_type": 2,
  "style_preference": ["甜美", "优雅"],
  "interests": ["护肤", "化妆"],
  "bio": "个人简介"
}
```

### 5.7 获取会员等级列表

**GET** `/api/v1/users/memberships`

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "level": 0,
      "name": "普通会员",
      "price": 0,
      "duration": 0,
      "features": ["基础分析", "内容浏览"]
    },
    {
      "level": 1,
      "name": "白银会员",
      "price": 99,
      "duration": 30,
      "features": ["高级分析", "专属推荐", "会员内容"]
    }
  ],
  "timestamp": 1700000000000
}
```

### 5.8 购买会员

**POST** `/api/v1/users/membership/purchase`

请求体：
```json
{
  "level": 1,
  "payment_method": "wechat"
}
```

### 5.9 获取用户数据

**GET** `/api/v1/users/data`

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user": {...},
    "profile": {...},
    "analyses": [...],
    "plans": [...],
    "achievements": [...]
  },
  "timestamp": 1700000000000
}
```

### 5.10 申请注销账户

**POST** `/api/v1/users/delete-account`

请求体：
```json
{
  "password": "password123",
  "reason": "不再使用"
}
```

### 5.11 获取积分记录

**GET** `/api/v1/users/points`

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "uuid",
        "transaction_type": 1,
        "amount": 50,
        "balance_after": 150,
        "source": "成就：初次分析",
        "created_at": "2026-06-17T10:00:00Z"
      }
    ],
    "pagination": {...}
  },
  "timestamp": 1700000000000
}
```

### 5.12 消耗积分

**POST** `/api/v1/users/points/spend`

请求体：
```json
{
  "amount": 100,
  "purpose": "生成效果图"
}
```

---

## 6. 分析模块API

### 6.1 创建分析

**POST** `/api/v1/analyses`

请求体（multipart/form-data）：
```
image: <文件>
analysis_type: 1
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| image | FILE | 是 | 分析图片（JPG/PNG，≤10MB） |
| analysis_type | INT | 是 | 分析类型（1面部特征分析，2肤质检测） |

成功响应：
```json
{
  "code": 200,
  "message": "分析已提交",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "image_url": "url",
    "analysis_type": 1,
    "status": 0,
    "created_at": "2026-06-17T10:00:00Z"
  },
  "timestamp": 1700000000000
}
```

### 6.2 获取分析记录列表

**GET** `/api/v1/analyses`

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| analysis_type | INT | 否 | 分析类型 |
| status | INT | 否 | 状态 |

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "uuid",
        "image_url": "url",
        "analysis_type": 1,
        "status": 1,
        "created_at": "2026-06-17T10:00:00Z",
        "completed_at": "2026-06-17T10:01:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 10,
      "totalPages": 1
    }
  },
  "timestamp": 1700000000000
}
```

### 6.3 获取分析结果

**GET** `/api/v1/analyses/{id}`

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "analysis": {
      "id": "uuid",
      "user_id": "uuid",
      "image_url": "url",
      "analysis_type": 1,
      "status": 1,
      "created_at": "2026-06-17T10:00:00Z",
      "completed_at": "2026-06-17T10:01:00Z"
    },
    "result": {
      "face_shape": "椭圆形",
      "skin_type": 2,
      "skin_problems": ["毛孔粗大", "轻微色斑"],
      "complexion": "白皙",
      "features": {
        "eye_shape": "杏仁眼",
        "nose_shape": "直鼻",
        "lip_shape": "樱桃唇"
      },
      "suggestions": {
        "skincare": ["注意防晒", "使用保湿产品"],
        "makeup": ["适合自然妆容", "推荐暖色调"]
      },
      "score": 85.5
    }
  },
  "timestamp": 1700000000000
}
```

---

## 7. 姿造美学模块API

### 7.1 创建风格测试

**POST** `/api/v1/style/test`

请求体：
```json
{
  "answers": {
    "q1": "A",
    "q2": "B",
    "q3": "A",
    "q4": "C",
    "q5": "B"
  }
}
```

成功响应：
```json
{
  "code": 200,
  "message": "测试已提交",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "answers": {...},
    "status": 1,
    "created_at": "2026-06-17T10:00:00Z",
    "completed_at": "2026-06-17T10:00:30Z",
    "result": {
      "personal_style": "甜美优雅",
      "style_description": "你的风格偏向甜美优雅，适合柔和的色彩和精致的细节",
      "style_tags": ["甜美", "优雅", "温柔"]
    }
  },
  "timestamp": 1700000000000
}
```

### 7.2 获取推荐列表

**GET** `/api/v1/style/recommendations`

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| recommendation_type | INT | 否 | 推荐类型（1发型，2妆容，3穿搭） |

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "recommendation_type": 1,
      "content": {
        "style_name": "空气刘海",
        "description": "适合椭圆形脸型，轻盈自然",
        "length": "中长发",
        "maintenance": "每月修剪一次"
      },
      "image_url": "url",
      "created_at": "2026-06-17T10:00:00Z"
    }
  ],
  "timestamp": 1700000000000
}
```

### 7.3 生成效果图

**POST** `/api/v1/style/generate`

请求体：
```json
{
  "user_id": "uuid",
  "style_type": 1,
  "image_url": "url",
  "parameters": {...}
}
```

### 7.4 换颜色

**POST** `/api/v1/style/change-color`

请求体：
```json
{
  "image_url": "url",
  "target_color": "#FF5733",
  "preview_mode": true
}
```

### 7.5 生成美妆课程

**POST** `/api/v1/style/generate-course`

请求体：
```json
{
  "user_id": "uuid",
  "style_type": "甜美"
}
```

---

## 8. 生活计划模块API

### 8.1 获取计划列表

**GET** `/api/v1/plans`

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| plan_type | INT | 否 | 计划类型（1护肤，2饮食，3作息，4运动） |

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "title": "7天焕肤计划",
        "plan_type": 1,
        "description": "一周护肤计划，改善肤质",
        "start_date": "2026-06-17",
        "end_date": "2026-06-23",
        "status": 1,
        "progress": 50,
        "created_at": "2026-06-17T10:00:00Z"
      }
    ],
    "pagination": {...}
  },
  "timestamp": 1700000000000
}
```

### 8.2 创建计划

**POST** `/api/v1/plans`

请求体：
```json
{
  "title": "7天焕肤计划",
  "plan_type": 1,
  "description": "一周护肤计划",
  "start_date": "2026-06-17",
  "end_date": "2026-06-23",
  "items": [
    {
      "title": "早晨洁面",
      "description": "使用温和洁面产品",
      "day_index": 1,
      "time_of_day": 1
    }
  ]
}
```

### 8.3 获取计划详情

**GET** `/api/v1/plans/{id}`

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "plan": {
      "id": "uuid",
      "title": "7天焕肤计划",
      "plan_type": 1,
      "start_date": "2026-06-17",
      "end_date": "2026-06-23",
      "status": 1,
      "progress": 50
    },
    "items": [
      {
        "id": "uuid",
        "title": "早晨洁面",
        "description": "使用温和洁面产品",
        "day_index": 1,
        "time_of_day": 1,
        "checkin_status": 1
      }
    ]
  },
  "timestamp": 1700000000000
}
```

### 8.4 打卡

**POST** `/api/v1/plans/checkin`

请求体：
```json
{
  "plan_item_id": "uuid",
  "note": "完成打卡"
}
```

成功响应：
```json
{
  "code": 200,
  "message": "打卡成功",
  "data": {
    "id": "uuid",
    "plan_item_id": "uuid",
    "checkin_date": "2026-06-17",
    "status": 1,
    "note": "完成打卡"
  },
  "timestamp": 1700000000000
}
```

### 8.5 上传验证照

**POST** `/api/v1/plans/upload-verification`

请求体（multipart/form-data）：
```
plan_id: <uuid>
image: <文件>
```

### 8.6 获取每周报告

**GET** `/api/v1/plans/weekly-report`

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| plan_id | STRING | 是 | 计划ID |
| week | INT | 否 | 周数 |

### 8.7 获取饮食状态关联

**GET** `/api/v1/plans/diet-status`

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| plan_id | STRING | 是 | 计划ID |

---

## 9. 灵感探索模块API

### 9.1 获取内容列表

**GET** `/api/v1/explore/contents`

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| topic_id | STRING | 否 | 话题ID |
| tag | STRING | 否 | 标签名称 |
| is_featured | BOOLEAN | 否 | 是否精选 |

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "user": {
          "nickname": "美丽天使",
          "avatar": "url"
        },
        "title": "夏日护肤攻略",
        "cover_image": "url",
        "topic_id": "uuid",
        "topic_name": "护肤",
        "tags": ["护肤", "夏日", "防晒"],
        "views": 1000,
        "likes": 200,
        "shares": 50,
        "comments_count": 30,
        "is_featured": true,
        "created_at": "2026-06-17T10:00:00Z"
      }
    ],
    "pagination": {...}
  },
  "timestamp": 1700000000000
}
```

### 9.2 获取内容详情

**GET** `/api/v1/explore/contents/{id}`

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "uuid",
    "user": {...},
    "title": "夏日护肤攻略",
    "content": "<p>详细内容...</p>",
    "cover_image": "url",
    "topic_id": "uuid",
    "topic_name": "护肤",
    "tags": ["护肤", "夏日", "防晒"],
    "views": 1000,
    "likes": 200,
    "shares": 50,
    "comments_count": 30,
    "is_collected": false,
    "is_liked": false,
    "created_at": "2026-06-17T10:00:00Z"
  },
  "timestamp": 1700000000000
}
```

### 9.3 发布内容

**POST** `/api/v1/explore/contents`

请求体：
```json
{
  "title": "夏日护肤攻略",
  "content": "<p>详细内容...</p>",
  "cover_image": "url",
  "topic_id": "uuid",
  "tags": ["护肤", "夏日"]
}
```

### 9.4 获取话题列表

**GET** `/api/v1/explore/topics`

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "uuid",
      "name": "护肤",
      "description": "分享护肤心得",
      "cover_image": "url",
      "content_count": 100,
      "followers_count": 500,
      "is_followed": true
    }
  ],
  "timestamp": 1700000000000
}
```

### 9.5 搜索内容

**GET** `/api/v1/explore/search`

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | STRING | 是 | 搜索关键词 |

### 9.6 收藏内容

**POST** `/api/v1/explore/collections`

请求体：
```json
{
  "content_id": "uuid"
}
```

### 9.7 取消收藏

**DELETE** `/api/v1/explore/collections/{content_id}`

---

## 10. 社交模块API

### 10.1 关注用户

**POST** `/api/v1/social/follow`

请求体：
```json
{
  "followee_id": "uuid"
}
```

### 10.2 取消关注

**DELETE** `/api/v1/social/follow/{followee_id}`

### 10.3 获取关注列表

**GET** `/api/v1/social/following`

### 10.4 获取粉丝列表

**GET** `/api/v1/social/followers`

### 10.5 获取评论列表

**GET** `/api/v1/social/comments`

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content_id | STRING | 是 | 内容ID |

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "uuid",
        "user": {
          "nickname": "美丽天使",
          "avatar": "url"
        },
        "content": "很棒的分享！",
        "likes": 10,
        "created_at": "2026-06-17T10:00:00Z",
        "replies": []
      }
    ],
    "pagination": {...}
  },
  "timestamp": 1700000000000
}
```

### 10.6 发布评论

**POST** `/api/v1/social/comments`

请求体：
```json
{
  "content_id": "uuid",
  "content": "很棒的分享！",
  "parent_id": "uuid"
}
```

### 10.7 获取成就列表

**GET** `/api/v1/social/achievements`

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "uuid",
      "name": "初次分析",
      "description": "完成第一次面部分析",
      "icon": "url",
      "points": 10,
      "achievement_type": 1,
      "is_unlocked": true,
      "unlocked_at": "2026-06-17T10:00:00Z",
      "progress": 100
    },
    {
      "id": "uuid",
      "name": "坚持打卡",
      "description": "连续打卡7天",
      "icon": "url",
      "points": 50,
      "achievement_type": 2,
      "is_unlocked": false,
      "progress": 30
    }
  ],
  "timestamp": 1700000000000
}
```

### 10.8 获取排行榜

**GET** `/api/v1/social/leaderboard`

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | STRING | 否 | 排行类型（points/achievements） |

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "rank": 1,
      "user": {
        "nickname": "美丽天使",
        "avatar": "url"
      },
      "total_points": 1000,
      "achievements_count": 10
    }
  ],
  "timestamp": 1700000000000
}
```

### 10.9 创建闺蜜小组

**POST** `/api/v1/social/sister-group`

请求体：
```json
{
  "name": "美丽闺蜜团",
  "description": "一起变美",
  "avatar": "url"
}
```

### 10.10 加入闺蜜小组

**POST** `/api/v1/social/sister-group/join`

请求体：
```json
{
  "group_id": "uuid"
}
```

### 10.11 获取闺蜜小组列表

**GET** `/api/v1/social/sister-groups`

### 10.12 获取闺蜜小组详情

**GET** `/api/v1/social/sister-groups/{id}`

### 10.13 退出闺蜜小组

**POST** `/api/v1/social/sister-groups/{id}/leave`

---

## 11. AI顾问模块API

### 11.1 创建对话

**POST** `/api/v1/consultant/conversations`

请求体：
```json
{
  "title": "护肤咨询"
}
```

### 11.2 获取对话列表

**GET** `/api/v1/consultant/conversations`

### 11.3 获取对话详情

**GET** `/api/v1/consultant/conversations/{id}`

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "conversation": {
      "id": "uuid",
      "title": "护肤咨询",
      "status": 1,
      "created_at": "2026-06-17T10:00:00Z",
      "updated_at": "2026-06-17T10:05:00Z"
    },
    "messages": [
      {
        "id": "uuid",
        "role": "user",
        "content": "我的皮肤比较干，应该用什么护肤品？",
        "created_at": "2026-06-17T10:00:00Z"
      },
      {
        "id": "uuid",
        "role": "assistant",
        "content": "干性皮肤建议使用保湿效果好的护肤品...",
        "created_at": "2026-06-17T10:00:30Z"
      }
    ]
  },
  "timestamp": 1700000000000
}
```

### 11.4 发送消息

**POST** `/api/v1/consultant/conversations/{id}/messages`

请求体：
```json
{
  "content": "我的皮肤比较干，应该用什么护肤品？"
}
```

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user_message": {
      "id": "uuid",
      "role": "user",
      "content": "我的皮肤比较干，应该用什么护肤品？",
      "created_at": "2026-06-17T10:00:00Z"
    },
    "assistant_message": {
      "id": "uuid",
      "role": "assistant",
      "content": "干性皮肤建议使用保湿效果好的护肤品...",
      "created_at": "2026-06-17T10:00:30Z"
    }
  },
  "timestamp": 1700000000000
}
```

### 11.5 获取可用次数

**GET** `/api/v1/consultant/usage-limit`

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "daily_limit": 3,
    "used_today": 1,
    "remaining": 2
  },
  "timestamp": 1700000000000
}
```

---

## 12. 分享模块API

### 12.1 生成分享海报

**POST** `/api/v1/share/poster`

请求体：
```json
{
  "content_id": "uuid",
  "template": 1
}
```

成功响应：
```json
{
  "code": 200,
  "message": "海报生成成功",
  "data": {
    "poster_url": "url",
    "share_url": "https://example.com/share/{code}"
  },
  "timestamp": 1700000000000
}
```

### 12.2 获取分享记录

**GET** `/api/v1/share/records`

### 12.3 获取推荐码

**GET** `/api/v1/share/referral-code`

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "referral_code": "ABC123",
    "referral_url": "https://example.com/register?code=ABC123",
    "referrals_count": 5,
    "rewards_count": 3
  },
  "timestamp": 1700000000000
}
```

### 12.4 使用推荐码

**POST** `/api/v1/share/use-referral`

请求体：
```json
{
  "referral_code": "ABC123"
}
```

### 12.5 创建分享链接

**POST** `/api/v1/share/link`

请求体：
```json
{
  "content_id": "uuid",
  "share_mode": "full"
}
```

### 12.6 撤回分享链接

**POST** `/api/v1/share/link/{code}/revoke`

---

**文档审批：**
- API负责人：___________
- 技术负责人：___________
