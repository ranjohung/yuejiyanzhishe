# 协作日常（V1 小队 · 2 人）

> 这份是和 [CONTRIBUTING.md](./CONTRIBUTING.md) 配套的"日常怎么干活"清单。
> 建议：两个人开工前各读一遍。

---

## 1. 一天怎么开始（10 分钟同步）

早上（或前一天晚上）花 10 分钟对一下：

- 我今天做什么
- 你今天做什么
- 有没有依赖我的产出 / 我依赖你的产出
- 会不会有冲突（比如两个人同时改 `server/routes/upload.js`）

同步形式：微信群一条消息 / 一次 5 分钟语音 / 当面说一句都行，不用开会。

---

## 2. 开工前的 Git 流程

每次开新工作前，先把本地和远端对齐：

```
git checkout main
git pull origin main
git fetch origin
```

如果本地 `main` 落后远端，先 `pull`；如果之前有分支没删干净，先 `git branch -d <旧分支>` 清理。

---

## 3. 开新功能 / 修 bug

### 3.1 建分支

从最新的 `main` 拉分支：

```
git checkout main
git pull origin main
git checkout -b feat/<范围>-<简述>
```

命名规范（与 CONTRIBUTING.md 保持一致）：

| 类型 | 命名 | 例子 |
| --- | --- | --- |
| 新功能 | `feat/<范围>-<简述>` | `feat/tab1-photo-upload` |
| 修 bug | `fix/<范围>-<简述>` | `fix/face-detect-timeout` |
| 重构 | `refactor/<范围>-<简述>` | `refactor/upload-component` |
| 文档 | `docs/<简述>` | `docs/api-contracts` |
| 杂项 | `chore/<简述>` | `chore/upgrade-uniapp` |

### 3.2 提交代码

每次提交一个独立的"逻辑单元"，不要把所有改动堆在一个 commit 里。

格式（Conventional Commits）：

```
<类型>(<范围>): <简述>

# 可选正文，多行用 - 列表
# 可选结尾：Closes #编号 / Refs #编号
```

例子：

- `feat(tab1): 新增半身照前置质量校验`
- `fix(api): 修复 /face/analyze 超时未释放资源`

### 3.3 推到自己远端

```
git push -u origin feat/<范围>-<简述>
```

第一次推会设置 upstream，以后直接 `git push`。

### 3.4 开 PR

打开 GitHub 仓库 → **Pull requests** → **New pull request**。

- base: `main`，compare: `feat/xxx`
- 标题沿用 commit 规范
- 描述用模板（自动套用 `.github/PULL_REQUEST_TEMPLATE.md`）：
  - 改了什么
  - 怎么测
  - 影响范围（模块 / 接口 / 配置）
  - 截图 / 日志（如有）
  - 勾 4 项 Checklist
- 右边栏 **Reviewers** 选对方
- **Labels** 选一个（如 `feat` / `fix`）
- **Milestone** 选当前阶段（如 `V1-M1`）
- **Development**（如果设了）勾关联的 issue
- 点 **Create pull request**

### 3.5 通过 review

- 对方看到 PR 后看代码、提评论、提修改建议
- 提 PR 的人根据评论改 → push 新 commit，旧的 approve 会自动失效（dismiss），需要对方**重新 Approve**
- 改完后，**所有评论要 Resolve** 才能合
- 如果有冲突，PR 页面会出现提示：

  > This branch has conflicts that must be resolved
  
  处理方法（PR 作者负责）：
  
  ```
  git checkout feat/<你的分支>
  git fetch origin
  git rebase origin/main
  # 解决冲突
  git add .
  git rebase --continue
  git push --force-with-lease
  ```
  
  > 不要用 `git push --force`（会覆盖队友的 push），用 `--force-with-lease`。

### 3.6 合并

- 确认：至少 1 个 Approve ✅、所有评论 Resolved ✅、分支与 main 同步 ✅
- 点 **"Squash and merge"**（不是 Merge commit、不是 Rebase）
- 默认 commit message 改成有意义的总结，删掉 `* ` 列表里没用的项
- 合并后 GitHub 提示 **"Delete branch"**，点一下把远端分支删了
- 本地同步：

  ```
  git checkout main
  git pull origin main
  git branch -d feat/<已合并的分支>
  ```

---

## 4. 一个 Tab / 一个接口怎么拆 PR

原则：**一个 PR 越短越好**，最长不超过 1～2 天工作量。

举个例子，做 Tab1 测评报告主流程，可以拆成这些 PR：

1. `feat/scaffold-uniapp` — uni-app 工程脚手架、Tab 框架、空白页面
2. `feat/tab1-upload-page` — 上传引导页 UI（占位、不接接口）
3. `feat/tab1-photo-validator` — 前置质量校验逻辑（封装成 utils）
4. `feat(api): face-analyze-proxy` — 后端 `/face/analyze` 路由 + 腾讯云适配
5. `feat/tab1-report-page` — 报告页 UI
6. `feat(tab1): wire-up` — 把上传 → 校验 → 接口 → 报告 串起来

> 拆分原则：**接口、UI、数据是分开的，串起来是最后一步**。这样 review 容易、bug 好定位、冲突好处理。

---

## 5. 出错了怎么办

### 5.1 提交了敏感信息

立刻告知队友，**不要 force push 掩盖**：

```
git rm --cached <文件>
git commit -m "chore: untrack <文件>"
git push origin <分支>
```

如果信息已经推到 `main`，需要用 `git filter-repo` 或 BFG 清历史 + 强制推送。涉及 AppID / 密钥的，必须在微信开发者工具 / 腾讯云控制台**重置密钥**。

### 5.2 误合了 main

立刻在群里说，**不要假装没事**。提一个 revert PR：

```
# 在 main 上
git revert <坏commit-sha>
# 提 PR "revert: xxx"
```

### 5.3 main 编不起来了

提紧急 `fix/ci-*` 或 `fix/build-*` PR，第一时间恢复绿；不要在群里问"谁动 main 了"——看 PR 历史即可。

### 5.4 需求变了

- 先改 `docs/PRD-V1.md`（或在群里定调后改）
- 在群里同步
- 再调整对应的 issue / PR

---

## 6. 节奏建议（参考）

| 频率 | 动作 |
| --- | --- |
| 每天 | 早晚各一次同步（10 分钟） |
| 每 1～2 天 | 完成 1～2 个小 PR |
| 每周 | 看一下 Milestone 进度，关掉已完成的 issue |
| 每个里程碑结束 | 跑一次 [验收清单](./ACCEPTANCE.md)（V1 阶段），回退 / 修 bug / 进下一里程碑 |

---

## 7. 一页速查卡

```
# 开工
git checkout main && git pull

# 新分支
git checkout -b feat/xxx

# 提交
git add . 
git commit -m "feat(xxx): xxx"

# 推送
git push -u origin feat/xxx

# 同步 main
git fetch origin && git rebase origin/main

# 合并后
git checkout main && git pull && git branch -d feat/xxx
```
