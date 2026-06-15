# 迁移指南 · V1-M2 (2026-06-15)

> 004 任务（feat/004-tab1-report-ui）合入 main 后**必须**遵循的本地操作。

---

## 1. 改了啥

004 任务为了把项目从"老 uni-app 脚手架"迁到"uni-app vue3 alpha 公共 npm 版本"，做了 3 个 breaking change：

| # | 改动 | 原因 |
|---|---|---|
| 1 | **所有源码从根目录移到 `src/`** | uni-app vue3 alpha 硬约定，`UNI_INPUT_DIR` 默认 `src/` |
| 2 | **`package.json` 依赖版本号变更** | 旧版本号是 DCloud 内部 alpha，npm 公网无源 |
| 3 | **编译产物目录从 `unpackage/` 改为 `dist/`** | 同上版本约定，dev/build 都进 `dist/` |

---

## 2. 队友必做（pull 完按顺序跑）

```bash
# 1. 拉最新代码
git pull origin main

# 2. 删旧依赖、重装（版本号变了，必须重装）
#    Windows PowerShell：
Remove-Item -Recurse -Force node_modules
npm install

#    macOS / Linux：
# rm -rf node_modules && npm install

# 3. 重启 dev（产物目录变了，旧的 unpackage/dist/ 失效）
npm run dev:mp-weixin
```

---

## 3. 微信开发者工具

| 旧 | 新 |
|---|---|
| 导入目录 `unpackage/dist/dev/mp-weixin` | 导入目录 `dist/dev/mp-weixin` |

操作：**项目 → 移除项目 → 重新导入**。

---

## 4. 目录结构对照表

```
项目根/
├── src/                    ← 所有源码都在这里
│   ├── App.vue
│   ├── main.js
│   ├── manifest.json
│   ├── pages.json
│   ├── uni.scss
│   ├── pages/
│   │   └── tab1/
│   │       └── report.vue
│   └── components/
│       └── report/
│           ├── FaceSection.vue
│           ├── BodySection.vue
│           ├── StyleSection.vue
│           ├── OutfitSection.vue
│           └── HairstyleSection.vue
├── index.html              ← H5 平台 Vite 入口（不在 src/ 下）
├── vite.config.js
├── package.json
├── AGENTS.md
└── docs/
    └── MIGRATION-V1-M2.md  ← 本文件
```

---

## 5. 常见坑

- **改完代码没生效？** dev 进程在跑会自动重编译，看微信开发者工具有没有报错（"已编译" 提示）。
- **`package.json` 改了但代码不更新？** 删 `node_modules` 重装。
- **H5 build 报 `Could not resolve entry module "index.html"`？** 根目录必须有 `index.html`，它在 `.gitignore` 之外，**别误删**。
- **git pull 后看到一堆 `D` 状态？** 正常，那是文件被移到 `src/`。`git status` 看 R（rename）就知道。

---

## 6. 出问题怎么办

1. 先看 `docs/MIGRATION-V1-M2.md`（本文件）
2. 再看 `AGENTS.md` 的"开发约定"章节
3. 还是不行 → issue 里贴完整报错 + `node -v` + `npm -v` + OS 版本

---

> 最后更新：2026-06-15 · 004 任务落地
