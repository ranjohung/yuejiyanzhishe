# 001 · feat(scaffold): uni-app 工程脚手架 + Tab 框架

> **状态**：待办　|　**Milestone**：V1-M1 · 工程脚手架　|　**Label**：`feat`

## 背景

V1 需要 3 个 Tab（测评报告 / 换装间 / 我的），但仓库目前只有 PRD，没有任何前端代码。先把工程跑起来。

## 验收标准

- 用 HBuilderX 或 CLI 初始化 uni-app + Vue3 工程
- 配置 `manifest.json` 指向现有 AppID（`project.private.config.json` 由各人本地持有）
- 搭好 3 个 Tab 空白页：`pages/tab1/index.vue` / `pages/tab2/index.vue` / `pages/tab3/index.vue`
- 引入状态管理（Pinia 或 Vuex 4，按团队习惯）
- 引入 `utils/request.js`（请求封装，含 baseURL、拦截器）
- 在小程序开发者工具里能跑起来看到 3 个空 Tab

## 依赖

无。

## 建议拆 PR

- PR 1：脚手架 + 3 个空白页
- PR 2：`utils/request.js` + 拦截器

## 关联文件

- `src/pages/tab{1,2,3}/index.vue`
- `src/utils/request.js`
- `manifest.json`
