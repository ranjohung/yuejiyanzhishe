# API接口分析报告

> 项目：约肌形象社（Yueji Beauty Society）
> 日期：2026-07-14
> 版本：V1 内部测试版

---

## 一、整体评估

| 评估维度 | 状态 | 说明 |
|---------|------|------|
| API架构设计 | ⚠️ 缺失 | 无统一的API请求封装层 |
| 接口调用覆盖率 | ❌ 极低 | 90%以上功能为本地模拟 |
| Token认证机制 | ❌ 未实现 | 仅本地mock-token |
| 数据传输安全 | ❌ 缺失 | 无HTTPS、无签名 |
| 错误处理 | ⚠️ 不完善 | 缺少统一错误处理 |
| 接口契约文档 | ❌ 缺失 | 无API文档说明 |

---

## 二、逐页面API检查

### 2.1 引导页 (guide.vue)

**当前实现：**
- 通过`uni.getStorageSync('token')`检查登录状态
- 有token → 跳转`/pages/tab1/report`
- 无token但已看过引导 → 跳转`/pages/login/login`

**问题：**
- ❌ 没有验证token有效性（后端验证）
- ❌ 没有token过期处理
- ❌ 引导图硬编码在代码中

**建议：**
```javascript
// 增加token有效性验证
const token = uni.getStorageSync('token')
if (token) {
  // 调用后端验证token接口
  uni.request({
    url: 'https://aimeizhuang.libaodong4571.cn/api/auth/validate',
    method: 'GET',
    header: { 'Authorization': `Bearer ${token}` },
    success: (res) => {
      if (res.data.code === 200) {
        uni.reLaunch({ url: '/pages/tab1/report' })
      } else {
        uni.removeStorageSync('token')
        uni.redirectTo({ url: '/pages/login/login' })
      }
    },
    fail: () => {
      uni.removeStorageSync('token')
      uni.redirectTo({ url: '/pages/login/login' })
    }
  })
}
```

---

### 2.2 登录页 (login.vue)

**当前实现：**
```javascript
const onLogin = () => {
  if (!phone.value || !password.value) {
    uni.showToast({ title: '请输入手机号和密码', icon: 'none' })
    return
  }
  // 直接设置mock-token，无后端调用
  uni.setStorageSync('token', 'mock-token-' + Date.now())
  uni.reLaunch({ url: '/pages/tab1/report' })
}
```

**问题：**
- ❌ 没有调用后端登录接口
- ❌ 没有密码加密传输
- ❌ 没有用户注册功能
- ❌ 没有获取用户信息接口
- ❌ 没有记住密码功能
- ❌ 没有手机验证码登录
- ❌ Token格式不规范（应为JWT）
- ❌ 登录成功后没有获取用户信息

**建议：**
```javascript
const onLogin = async () => {
  if (!phone.value || !password.value) {
    uni.showToast({ title: '请输入手机号和密码', icon: 'none' })
    return
  }

  uni.showLoading({ title: '登录中...' })
  try {
    const res = await uni.request({
      url: 'https://aimeizhuang.libaodong4571.cn/api/auth/login',
      method: 'POST',
      data: {
        phone: phone.value,
        password: password.value // 建议前端加密
      }
    })

    if (res.data.code === 200) {
      uni.setStorageSync('token', res.data.data.token)
      uni.setStorageSync('userInfo', res.data.data.user)
      uni.reLaunch({ url: '/pages/tab1/report' })
    } else {
      uni.showToast({ title: res.data.message || '登录失败', icon: 'none' })
    }
  } catch (err) {
    uni.showToast({ title: '网络异常', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
```

---

### 2.3 报告页 (report.vue)

**当前实现：**
- 报告数据完全硬编码在前端
- 没有调用后端分析接口
- 没有上传图片流程

**问题：**
- ❌ 缺少上传页面和图片上传接口调用
- ❌ 报告数据为mock数据，无实际分析
- ❌ 缺少后端分析接口调用（face/analyze等）
- ❌ 没有获取历史报告列表接口
- ❌ 分享时没有传递真实reportId

**建议接口：**
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/analysis/upload` | POST | 上传图片（半身照+全身照） |
| `/api/analysis/face` | POST | 人脸分析（腾讯云API） |
| `/api/analysis/body` | POST | 形体分析 |
| `/api/analysis/style` | POST | 风格分析 |
| `/api/report/list` | GET | 获取历史报告列表 |
| `/api/report/detail` | GET | 获取报告详情 |

---

### 2.4 分享功能 (share.js)

**当前实现：**
```javascript
async handleShareSuccess(reportId, channel) {
  try {
    await uni.request({
      url: `${this.shareConfig.shareUrl}/record`,
      method: 'POST',
      data: { reportId, channel, timestamp: Date.now() }
    })
  } catch (err) {
    console.error('Record share error:', err)
  }
}
```

**问题：**
- ❌ 没有携带Token认证
- ❌ 没有错误处理（失败后无提示）
- ❌ 分享链接生成无签名验证
- ❌ 没有分享次数统计接口

**建议：**
```javascript
async handleShareSuccess(reportId, channel) {
  const token = uni.getStorageSync('token')
  try {
    await uni.request({
      url: `${this.shareConfig.shareUrl}/record`,
      method: 'POST',
      header: { 'Authorization': `Bearer ${token}` },
      data: { reportId, channel, timestamp: Date.now() },
      fail: () => {
        // 可以记录到本地，稍后重试
      }
    })
  } catch (err) {
    console.error('Record share error:', err)
  }
}
```

---

### 2.5 AI顾问 (aiConsultant.js)

**当前实现：**
- 完全本地模拟，关键词匹配预设回答
- 没有调用后端AI接口（通义千问/Qwen）
- 本地存储对话次数限制

**问题：**
- ❌ 没有调用后端AI接口
- ❌ 没有对话历史存储接口
- ❌ 没有会员次数限制接口
- ❌ 没有敏感词过滤后端校验

**建议接口：**
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/consultant/chat` | POST | AI对话接口 |
| `/api/consultant/history` | GET | 获取对话历史 |
| `/api/consultant/limit` | GET | 获取剩余次数 |

---

### 2.6 成就系统 (achievementData.js)

**当前实现：**
- 完全本地存储，无后端同步
- 成就触发逻辑在前端

**问题：**
- ❌ 没有后端成就数据同步接口
- ❌ 成就进度容易被篡改（本地存储可修改）
- ❌ 没有成就解锁通知接口
- ❌ 没有积分消费接口

**建议接口：**
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/achievement/list` | GET | 获取成就列表和状态 |
| `/api/achievement/progress` | POST | 更新成就进度 |
| `/api/achievement/unlock` | POST | 解锁成就 |
| `/api/points/balance` | GET | 获取积分余额 |
| `/api/points/history` | GET | 积分变动记录 |

---

## 三、数据传输问题

### 3.1 统一请求封装缺失

**问题：** 项目中没有统一的HTTP请求封装，每次都是直接调用`uni.request`，导致：
- 重复代码
- Token管理不一致
- 错误处理不统一
- 请求/响应拦截缺失

**建议创建 `src/utils/request.js`：**
```javascript
class Request {
  constructor() {
    this.baseUrl = 'https://aimeizhuang.libaodong4571.cn/api'
    this.timeout = 10000
  }

  request(options) {
    const token = uni.getStorageSync('token')
    const header = {
      'Content-Type': 'application/json',
      ...options.header,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }

    return new Promise((resolve, reject) => {
      uni.request({
        url: this.baseUrl + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header,
        timeout: this.timeout,
        success: (res) => {
          if (res.statusCode === 401) {
            uni.removeStorageSync('token')
            uni.reLaunch({ url: '/pages/login/login' })
            reject(new Error('登录失效'))
            return
          }
          resolve(res.data)
        },
        fail: (err) => {
          uni.showToast({ title: '网络异常', icon: 'none' })
          reject(err)
        }
      })
    })
  }

  get(url, data) {
    return this.request({ url, method: 'GET', data })
  }

  post(url, data) {
    return this.request({ url, method: 'POST', data })
  }

  put(url, data) {
    return this.request({ url, method: 'PUT', data })
  }

  delete(url, data) {
    return this.request({ url, method: 'DELETE', data })
  }
}

export const request = new Request()
export default Request
```

### 3.2 Token管理问题

**问题：**
- Token存储在本地，没有过期时间检查
- 没有自动刷新Token机制
- Token被窃取后无法失效

**建议：**
```javascript
// 在request.js中增加Token自动刷新
async request(options) {
  let token = uni.getStorageSync('token')
  const refreshToken = uni.getStorageSync('refreshToken')
  const tokenExpire = uni.getStorageSync('tokenExpire')
  
  // 检查Token是否即将过期
  if (token && tokenExpire && Date.now() > tokenExpire - 60000) {
    // 尝试刷新Token
    try {
      const res = await uni.request({
        url: this.baseUrl + '/auth/refresh',
        method: 'POST',
        data: { refreshToken }
      })
      if (res.data.code === 200) {
        token = res.data.data.token
        uni.setStorageSync('token', token)
        uni.setStorageSync('tokenExpire', Date.now() + 3600000)
      }
    } catch (err) {
      uni.removeStorageSync('token')
      uni.reLaunch({ url: '/pages/login/login' })
      return
    }
  }
  
  // ... 继续请求
}
```

### 3.3 数据格式规范缺失

**问题：** 没有统一的数据格式规范，各页面数据结构不一致。

**建议统一响应格式：**
```javascript
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": { /* 业务数据 */ }
}

// 失败响应
{
  "code": 400,
  "message": "参数错误",
  "data": null
}

// 登录失效
{
  "code": 401,
  "message": "登录失效",
  "data": null
}
```

---

## 四、安全问题

### 4.1 密码传输

**问题：** 登录时密码明文传输，存在中间人攻击风险。

**建议：**
- 前端对密码进行MD5或SHA256加密后传输
- 或使用HTTPS + 后端加盐加密

### 4.2 请求签名

**问题：** 没有请求签名机制，容易被伪造请求。

**建议：**
```javascript
// 请求签名示例
const sign = (data, timestamp, nonce) => {
  const str = `${timestamp}&${nonce}&${JSON.stringify(data)}&${APP_SECRET}`
  return md5(str)
}
```

### 4.3 XSS攻击防护

**问题：** 没有对用户输入进行过滤。

**建议：**
- 后端对所有输入进行HTML转义
- 前端使用v-html时进行过滤

---

## 五、后端接口契约检查

根据AGENTS.md，后端部署在 `https://aimeizhuang.libaodong4571.cn`，但当前项目：

**已使用的后端资源：**
- ✅ 引导图：`https://aimeizhuang.libaodong4571.cn/onboarding/{1-4}.png`
- ✅ 分享链接：`https://aimeizhuang.libaodong4571.cn/share`
- ✅ 海报链接：`https://aimeizhuang.libaodong4571.cn/share/poster`

**缺失的后端接口：**
| 模块 | 接口 | 状态 |
|------|------|------|
| 认证 | `/api/auth/login` | ❌ 未实现 |
| 认证 | `/api/auth/register` | ❌ 未实现 |
| 认证 | `/api/auth/validate` | ❌ 未实现 |
| 认证 | `/api/auth/refresh` | ❌ 未实现 |
| 分析 | `/api/analysis/upload` | ❌ 未实现 |
| 分析 | `/api/analysis/face` | ❌ 未实现 |
| 分析 | `/api/analysis/body` | ❌ 未实现 |
| 报告 | `/api/report/list` | ❌ 未实现 |
| 报告 | `/api/report/detail` | ❌ 未实现 |
| 顾问 | `/api/consultant/chat` | ❌ 未实现 |
| 顾问 | `/api/consultant/history` | ❌ 未实现 |
| 成就 | `/api/achievement/list` | ❌ 未实现 |
| 成就 | `/api/points/balance` | ❌ 未实现 |
| 分享 | `/api/share/record` | ⚠️ 部分实现 |

---

## 六、问题汇总与优先级

### P0 - 紧急（必须修复）

| 编号 | 问题 | 影响 | 建议 |
|------|------|------|------|
| P0-01 | 登录无后端验证 | 任何人可绕过登录 | 实现登录接口调用 |
| P0-02 | 无统一请求封装 | 代码重复、难以维护 | 创建request.js |
| P0-03 | Token管理缺失 | 登录状态无法验证 | 实现Token验证和刷新 |

### P1 - 重要（建议修复）

| 编号 | 问题 | 影响 | 建议 |
|------|------|------|------|
| P1-01 | 报告数据为mock | 核心功能无法使用 | 实现分析接口 |
| P1-02 | 分享无认证 | 分享记录可能被伪造 | 添加Token认证 |
| P1-03 | 成就数据本地存储 | 数据可被篡改 | 实现后端同步 |
| P1-04 | AI顾问本地模拟 | 功能受限 | 接入后端AI接口 |

### P2 - 优化（后续改进）

| 编号 | 问题 | 影响 | 建议 |
|------|------|------|------|
| P2-01 | 密码明文传输 | 安全风险 | 加密传输 |
| P2-02 | 无请求签名 | 防伪造能力弱 | 添加签名机制 |
| P2-03 | 无接口文档 | 前后端协作困难 | 创建API文档 |
| P2-04 | 无错误码规范 | 错误处理不统一 | 定义错误码 |

---

## 七、建议的修复路线图

### 第一阶段：基础架构（1-2天）
1. 创建统一请求封装 `src/utils/request.js`
2. 实现登录接口调用
3. 添加Token验证和过期处理

### 第二阶段：核心功能（3-5天）
1. 实现图片上传接口
2. 实现人脸分析接口（对接腾讯云）
3. 实现报告生成和查询接口

### 第三阶段：扩展功能（2-3天）
1. 实现分享记录接口
2. 实现AI顾问接口（对接通义千问）
3. 实现成就和积分接口

### 第四阶段：安全加固（1-2天）
1. 密码加密传输
2. 请求签名机制
3. 创建API文档

---

## 八、结论

当前项目处于**V1内部测试版**阶段，大部分功能为本地模拟实现，尚未接入后端真实接口。主要问题集中在：

1. **认证体系缺失** - 登录、Token管理、权限验证均未实现
2. **API调用不足** - 核心业务接口（分析、报告、顾问）均未调用
3. **数据安全薄弱** - 本地存储易篡改、无加密传输
4. **架构设计不完善** - 无统一请求封装、无错误处理机制

建议按照上述路线图逐步修复，优先解决认证和核心功能接口问题，确保应用能够正常运行。
