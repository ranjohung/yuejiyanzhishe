# 约肌形象社 · Yueji Beauty Society

> V1 内部测试版本（微信小程序 · uni-app + Vue3）

## 仓库

- 主仓库：https://github.com/libaodong4571/Yueji-Beauty-Society（**私有**）
- 管理员：libaodong4571

## 技术栈

- 前端：uni-app + Vue3（H5 / 小程序 / App 三端），**使用 Vite + CLI 编译**（不再依赖 HBuilderX）
- 后端：Node.js + Express（部署在 https://aimeizhuang.libaodong4571.cn）
- 第三方：腾讯云人脸分析、Image2 + 文心/Qwen、微信内容安全

## 目录

- `docs/` — PRD、API 文档、贡献规范
- `src/` — 前端源码（待搭建）
- `server/` — 后端源码（待搭建）
- `tests/` — 用例
- `.github/` — PR / Issue 模板

## 怎么开始

1. 克隆仓库：`git clone https://github.com/libaodong4571/Yueji-Beauty-Society.git`
2. 阅读 [贡献规范](docs/CONTRIBUTING.md) —— **必读**
3. 从 `main` 拉分支开发：`git checkout -b feat/xxx`
4. 本地编译/测试 → 提 PR

## 本地开发（Vite + uni CLI，不再使用 HBuilderX）

环境要求：Node.js ≥ 18、npm ≥ 9。

```bash
# 1. 安装依赖
npm install

# 2. 启动微信小程序编译（产物输出到 dist/dev/mp-weixin）
npm run dev:mp-weixin

# 3. 打开微信开发者工具 → 导入项目 → 目录选择 dist/dev/mp-weixin
#    （AppID 在导入时绑定本地即可，不要提交 project.private.config.json）

# 其它平台
npm run dev:h5         # H5，浏览器打开 http://localhost:8080
npm run build:mp-weixin # 微信小程序生产构建
npm run build:h5        # H5 生产构建
```

> 编译产物的 `project.config.json` / `project.private.config.json` 由 uni-app 自动生成，无需手动维护。

## 敏感配置

`project.private.config.json` **不在仓库里**（`.gitignore` 已忽略）。每个协作者本地自行从微信开发者工具绑定 AppID 后生成。

## 版本

- V1.1 — 内部测试（当前）
