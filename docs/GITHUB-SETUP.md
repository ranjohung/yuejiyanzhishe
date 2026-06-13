# GitHub 网页端配置清单（V1 小队）

> 这份是给管理员（libaodong4571）第一次建仓库后要做的事情的清单。做完一次就行。
> 协作者不需要做这套，他们加入后只看 [CONTRIBUTING.md](./CONTRIBUTING.md) 和 [WORKFLOW.md](./WORKFLOW.md) 即可。

---

## 1. 加协作者

路径：仓库首页 → **Settings** → **Collaborators and teams**（左侧 "Access" 下面）
URL：https://github.com/libaodong4571/Yueji-Beauty-Society/settings/access

步骤：

1. 点 **"Invite a collaborator"**（绿色按钮）
2. 填队友的 GitHub 用户名或邮箱
3. 选角色：**Write**（能 push 分支、提 PR、合 PR、关 issue，但不能改仓库设置/删仓库）
4. 点 **"Add <用户名> to this repository"**
5. 队友会收到邮件邀请 → 点接受 → 加入

> 注意：私有仓库协作者要对方有 GitHub 账号；没有的话先注册一个再发邀请。

---

## 2. 保护 main 分支

路径：**Settings** → **Branches**（左侧 "Code and automation" 下面）
URL：https://github.com/libaodong4571/Yueji-Beauty-Society/settings/branches

### 2.1 新建规则

点 **"Add classic branch protection rule"**（不用选 Rulesets，classic 够用）

### 2.2 填写

**Branch name pattern**：`main`

勾选以下项（顺序按页面从上到下）：

- ☑ **Require a pull request before merging**
  - 展开子项：
    - ☑ **Require approvals** → 拉到 **1**
    - ☑ **Dismiss stale pull request approvals when new commits are pushed**
- ☑ **Require conversation resolution before merging**
- ☑ **Require linear history**

**不勾**：

- ☐ Require status checks to pass before merging（等接了 CI 再勾）
- ☐ Require signed commits（V1 阶段没必要）
- ☐ Include administrators（V1 阶段管理员也要走 PR；以后团队大了可以放开）
- ☐ Allow force pushes（保持关）
- ☐ Allow deletions（保持关）

### 2.3 保存

点页面底部 **"Create"**（改已存在的规则是 **"Save changes"**）。

### 2.4 验证

回到仓库首页 → **Pull requests** → **New pull request**：

- base 选 `libaodong4571/main`、compare 也选 `libaodong4571/main` 时，会提示 "There isn't anything to compare"（保护生效）
- 管理员也无法直接 push main，本地会报 `protected branch` 错误 → 这是正常的，去开 PR 即可

---

## 3. 建里程碑（Milestone）

V1 阶段建议建 4 个里程碑：

- **V1-M1 · 工程脚手架**（uni-app + 后端脚手架、CI 占位、目录约定）
- **V1-M2 · Tab1 主流程**（上传 → 校验 → 接口 → 报告）
- **V1-M3 · Tab2 换装间**（发型 + 穿搭模块）
- **V1-M4 · 内测验收**（PRD 第 11 章验收清单全过）

路径：**Issues** → 顶部 **Milestones** → **"New milestone"**：

- Title: `V1-M1 · 工程脚手架`
- Description: 1～2 句话描述这个里程碑的范围
- Due date: 选个大致日期
- 点 **"Create milestone"**

依次建好 4 个。

---

## 4. 建标签（Labels）

路径：**Issues** → 顶部 **Labels** → **"New label"**

建议先建这 7 个（够 V1 用）：

| 名称 | 颜色 | 用途 |
| --- | --- | --- |
| `feat` | `#1f883d`（绿） | 新功能 |
| `fix` | `#d73a4a`（红） | 修 bug |
| `refactor` | `#a2eeef`（浅蓝） | 重构 |
| `docs` | `#0075ca`（蓝） | 文档 |
| `chore` | `#cfd3d7`（灰） | 杂项 |
| `blocked` | `#b60205`（深红） | 卡住 |
| `good first issue` | `#7057ff`（紫） | 新人友好任务（备用） |

---

## 5. 建首批任务卡（示例）

路径：**Issues** → **"New issue"**

每个 issue 一张卡。模板：

```
标题：feat(tab1): 半身照前置质量校验

【背景】
PRD 3.1.1 要求半身照在调用 /face/analyze 之前做前置质量校验，错误码要翻译成人话。

【验收】
- NO_FACE / MULTI_FACE / FACE_TOO_SMALL / BIG_POSE / MASK 五种错误码都有
- 错误信息中文化
- 单测覆盖 5 种错误码

【依赖】
无

【Milestone】
V1-M2 · Tab1 主流程

【Label】
feat
```

再建几张首批卡（按 Tab 拆，参考 [WORKFLOW.md §4](./WORKFLOW.md#4-一个-tab--一个接口怎么拆-pr)）：

- `feat(scaffold): uni-app 工程脚手架 + Tab 框架`
- `feat(api): /face/analyze 路由 + 腾讯云适配`
- `feat(tab1): 上传引导页 UI`
- `feat(tab1): 报告页 UI`
- `feat(tab2): 换装间骨架 + 素材列表页`

每张卡挂在对应 Milestone + Label 下，方便后面 PR 关联（写 `Closes #编号` 即可在合 PR 时自动关 issue）。

---

## 6. 配 GitHub Actions（可选，V1 阶段可后置）

这一步 V1 阶段**不急着做**，等有了 CI 再说。占位记录：

- 推荐工作流：`lint-and-test.yml`（跑 ESLint + Jest）
- 触发：PR open / push 到 main
- 接入后回到"main 分支保护"把"Require status checks to pass"勾上、选这个工作流

---

## 7. 一次性检查清单

完成后过一遍：

- [ ] 队友已加为 Collaborator（Write 角色），并接受了邀请
- [ ] main 分支保护规则已建：Require PR + 1 approval + linear history + dismiss stale + conversation resolution
- [ ] 4 个 Milestone 已建（V1-M1～M4）
- [ ] 7 个 Label 已建（feat/fix/refactor/docs/chore/blocked/good first issue）
- [ ] 首批 5+ 张 issue 任务卡已建，并挂在对应 Milestone
- [ ] 协作者已读过 [CONTRIBUTING.md](./CONTRIBUTING.md) 和 [WORKFLOW.md](./WORKFLOW.md)

全部打勾后，V1 协作环境就齐了。
