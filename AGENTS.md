# AGENTS.md · 约肌形象社 (Yueji Beauty Society)

> 项目专属约束与约定。AI Agent / 协作者必读。

---

## 1. 项目背景

- **产品**：约肌形象社（Yueji Beauty Society）—— 微信小程序
- **一句话定位**：用户上传半身照+全身照 → AI 分析面部和形体特征 → 生成个人形象测评报告 + AI 穿搭/发型推荐 + 溶图换装体验
- **阶段**：V1 内部测试版（全部功能免费、不限次、积分体系仅 UI 占位）
- **商业化钩子**：V1 之后启用，文字推荐免费 → 第 1 张效果图免费 → 后续积分解锁
- **PRD**：`PRD-V1 (2).md`（完整规格）

---

## 2. 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | uni-app + Vue 3（Composition API + `<script setup>`） |
| 编译 | **Vite + uni CLI**（**不再使用 HBuilderX**） |
| 三端 | 微信小程序（主）、H5、App |
| 后端 | 已有 Node + Express（部署在 `https://aimeizhuang.libaodong4571.cn`，接口契约兼容） |
| 第三方 AI | 腾讯云人脸分析（iai v20200303）、Image2 溶图、通义千问/Qwen |
| 样式 | SCSS（`uni.scss` 公共变量） |

---

## 3. 目录约定

```
约肌形象社/
├── pages/                  # 页面（uni-app 默认约定，不用 src/ 包裹）
│   └── tab1/
│       └── report.vue      # 报告页（首页）
├── components/             # 公共组件（按 tab 分目录）
│   └── report/
│       ├── FaceSection.vue
│       ├── BodySection.vue
│       ├── StyleSection.vue
│       ├── OutfitSection.vue
│       └── HairstyleSection.vue
├── docs/
│   ├── issues/             # 任务卡（001 ~ 005+）
│   ├── CONTRIBUTING.md
│   ├── WORKFLOW.md
│   └── GITHUB-SETUP.md
├── manifest.json           # 三端配置
├── pages.json              # 页面注册
├── App.vue / main.js       # 入口
├── uni.scss                # SCSS 公共变量
├── package.json
└── vite.config.js
```

**注意**：任务卡里写过 `src/pages/...` 路径是**写错了**，以本文件为准 —— 不建 `src/`，直接 `pages/` + `components/`。

---

## 4. 开发约定

### 4.1 本地编译

```bash
npm install                    # 一次性
npm run dev:mp-weixin          # 微信小程序编译
npm run dev:h5                 # H5
```

产物输出 `dist/dev/<platform>/`（dev 模式）或 `dist/build/<platform>/`（build 模式），H5 浏览器开 `http://localhost:8080`。

### 4.2 分支与提交

- **永远不要直接动 `main`**（受保护）
- 分支命名：`feat/<编号>-<英文短描述>` 或 `fix/<编号>-<描述>`，例如 `feat/004-tab1-report-ui`
- commit message：英文 + 前缀（`feat:` / `fix:` / `docs:` / `chore:` / `refactor:`）
- 一个分支对应一张任务卡（issue）

### 4.3 还原点（本地专属）

- **本地是 source of truth，云端是镜像** —— 改动都在本地做，git 推云端
- **还原点只建在本地**（`D:\AI Development\约肌形象社-backup-{name}`），不在云端建
- 还原点目录命名 kebab-case：`backup-pre-{3-4 词阶段描述}`
- 触发建还原点的场景：
  - 改 3+ 文件
  - 改核心逻辑
  - 改 AI 集成
  - 改部署脚本
- 备份含 `node_modules`，避免重装时间

### 4.4 PR 规范

- 开 PR 时**标题单独写一行**，**不要直接复制 commit message 当 PR 标题**
  - 错误示例：`Feat/4 tab1 report UIupdate README with Vite + uni CLI workflow`（分支名和 commit message 黏在一起）
  - 正确示例：`docs: update README with Vite + uni CLI workflow`
- 描述里写"改了什么"+"关联 issue"
- 合并选项推荐：**Squash and merge**（单人小改动，main 历史干净）

### 4.5 Git 身份

```bash
git config user.name "AI"
git config user.email "ai@beauty.local"
```

（这是临时占位，正式协作者再加）

### 4.6 不要提交的文件

- `project.private.config.json`（含本地 AppID，已在 `.gitignore`）
- `dist/`（编译产物，含 dev/build 两个子目录）
- `node_modules/`
- `.env` / 任何含密钥的文件

---

## 5. 当前阶段任务卡

| 编号 | 标题 | Milestone | 状态 |
|---|---|---|---|
| 001 | scaffold uni-app project with report page (placeholder) | V1-M1 | ✅ 已合并 |
| 002 | face/analyze 接口 | V1-M1 | ✅ 已完成 |
| 003 | Tab1 上传引导页 | V1-M2 | ✅ 已完成 |
| **004** | **Tab1 报告页 UI（文字版）** | **V1-M2** | **✅ 已完成** |
| 005 | Tab2 换装间骨架 | V1-M3 | ✅ 已完成 |
| 006 | Tab3 灵感探索（风格测试） | V1-M3 | ✅ 已完成 |
| 007 | Tab4 AI变美顾问 | V1-M3 | ✅ 已完成 |
| 008 | Tab5 我的（用户中心） | V1-M3 | ✅ 已完成 |
| 009 | 分享系统 | V1-M3 | ✅ 已完成 |
| 010 | 成就系统 | V1-M3 | ✅ 已完成 |

详细规格见 `docs/issues/<编号>-*.md`。

---

## 6. 关键业务约束（来自 PRD）

- **V1 不做医学/诊断/专业鉴定属性**的 AI 结论，肤色冷暖/体型分析只作"低置信娱乐化建议"
- 全身照校验：V1 至少基础校验（清晰、单人、主体完整、非违规），V2 再补人体关键点/人体分割
- 报告配图存 URL、不存 base64（前端 storage 只存 `report_id`，完整数据走 API）
- 报告生成状态机：`pending → text_ready → image_generating → completed` / `failed`
- 失败场景文案独立：未检出人脸 / 多人脸 / 图片模糊 / 接口异常

---

## 7. 后端接口契约

V1 接口尽量复用 `aimeizhuang.libaodong4571.cn` 的契约（避免双端重复开发）。详细 API 文档待 002 任务完成后补充。

---

## 8. 协作流程

1. 从最新 `main` 开新分支
2. 本地编译跑通
3. 截图 / 自测
4. 提交 → 推远端 → 开 PR
5. 等 review（或管理员自审）→ Squash and merge → 删分支
6. 切回 `main` 拉一下

详细见 `docs/CONTRIBUTING.md` 和 `docs/WORKFLOW.md`。

---

> 最后更新：2026-07-14 · V1 UI原型全部完成，进入开发阶段