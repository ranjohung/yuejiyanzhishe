# 贡献规范（V1 小队 · 2 人）

本规范是写给「约肌形象社」V1 阶段两位协作开发者的契约。每开一个 PR、每写一次 commit 都请照做。

---

## 1. 分支策略：GitHub Flow

- `main` 是唯一长期分支，**永远保持可跑**（V1 内测基线）。
- 任何功能 / 修 bug：**从 `main` 开新分支** → 提 PR → 至少 1 人 Review → Squash 合入 → 删除该分支。
- **禁止**直接 push 到 `main`。

### 分支命名

| 前缀          | 用途         | 示例                              |
| ------------- | ------------ | --------------------------------- |
| `feat/`       | 新功能       | `feat/tab1-photo-upload`          |
| `fix/`        | 修 bug       | `fix/face-detect-timeout`         |
| `refactor/`   | 重构         | `refactor/upload-component`       |
| `docs/`       | 文档         | `docs/api-contracts`              |
| `chore/`      | 杂项 / 配置  | `chore/upgrade-uniapp`            |

---

## 2. 提交信息：Conventional Commits

格式：`<类型>(<范围>): <简述>`

允许类型：`feat` / `fix` / `refactor` / `docs` / `style` / `test` / `chore` / `perf`

示例：

- `feat(tab1): 新增半身照前置质量校验`
- `fix(api): 修复 /face/analyze 超时未释放资源`
- `docs: 补充 Tab2 换装间 API 文档`

可写正文，多行用 `-` 列表。结尾可关联 issue：`Closes #12` / `Refs #12`。

---

## 3. PR 规则

- **必须**走 PR 才能合入 `main`。
- 合并前**至少 1 人** Approve（关键接口如 `/face/analyze` 建议双方都过一遍）。
- 提交者**不能自审自合**。
- PR 描述请用 `.github/PULL_REQUEST_TEMPLATE.md`（自动套用），至少写清：
  - 改了什么
  - 怎么测
  - 影响范围（模块 / 接口 / 配置）
  - 截图或日志（如有）
- 合并方式：**Squash and merge**（一个 PR = 一个干净 commit，main 历史不碎）。

---

## 4. main 分支保护

管理员（libaodong4571）已在 GitHub 后台为 `main` 配置以下规则：

- Require a pull request before merging
- Require approvals: 1
- Dismiss stale pull request approvals when new commits are pushed
- Require conversation resolution before merging
- Require linear history
- Do not allow bypassing the above settings

如需调整，请私聊管理员。

---

## 5. 仓库目录约定

```
Yueji-Beauty-Society/
├── docs/                    # PRD、API 文档、验收清单
├── src/                     # uni-app 前端（pages / components / stores / utils）
├── server/                  # Node + Express 后端
│   ├── routes/
│   ├── services/            # 腾讯云人脸、Image2 适配
│   ├── jobs/                # 定时清理等
│   └── middleware/
├── tests/                   # 端到端 / 接口用例
├── .github/                 # PR / Issue 模板
├── .gitignore
└── README.md
```

新增模块请放在对应目录下，不要在根目录散落文件。

---

## 6. 敏感信息 & 配置

- `project.private.config.json` **禁止提交**（含 AppID），已在 `.gitignore`。
- `.env` / 任何含密钥的文件 **禁止提交**。
- 后端密钥、腾讯云 AK/SK 在部署时通过环境变量注入。
- 队友本地需要 `project.private.config.json` 时，复制 `project.config.json` 改名 + 在微信开发者工具里重新绑定 AppID 即可。

---

## 7. 协作节奏

- **每日同步**：早 10 分钟对一下今天各自做什么（微信群或当面均可）。
- **每个 Tab / 接口对应一个或多个 PR**，避免一个 PR 改动过大。
- **里程碑（Milestone）**：在 GitHub Issues 里建，命名 `V1-M1 工程脚手架` / `V1-M2 Tab1 主流程` / `V1-M3 Tab2 换装` / `V1-M4 内测验收`，每个 issue 挂在对应 milestone 下。
- **冲突处理**：谁的 PR 较新谁负责 rebase 合入对方代码，先在群里 ping 一下。

---

## 8. 提 PR 前自检

- [ ] 我在本地编译/运行过，行为符合预期
- [ ] 我没把 `project.private.config.json`、`.env`、密钥等加进提交
- [ ] 我没直推 `main`（PR 是通过分支发起的）
- [ ] 提交信息遵循 Conventional Commits
- [ ] 改动的文件都在 `src/` / `server/` / `tests/` / `docs/` 对应目录下

---

## 9. 出错了怎么办

- 误提敏感信息 → 立刻告知管理员，先 `git rm --cached` 再 force push，再考虑在 GitHub 上 purge 历史。
- `main` 编译挂了 → 提紧急 `fix/ci-*` PR，第一时间恢复绿。
- 需求变更 → 改 PRD（`docs/PRD-V1.md`）→ 在群里同步 → 再开任务卡。
