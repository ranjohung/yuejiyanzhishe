# 004 · feat(tab1): 报告页 UI（文字版）

> **状态**：待办　|　**Milestone**：V1-M2 · Tab1 主流程　|　**Label**：`feat`

## 背景

PRD 3.1.3：报告页展示面部结论 / 身形建议 / 综合风格定位 / 1 套穿搭推荐 / 1 套发型推荐（先看得到，AI 详情 V1 先用占位文案）。

## 验收标准

- 进入报告页能展示 5 个模块
- 5 个模块的数据结构先写死，标 TODO 字段（如 `report.bodyShape = TODO`）
- 模块间排版美观，截图能直接拿去做 PRD 评审
- 5 个模块各自有"主标题 / 副标题 / 一句话结论"三段式
- 顶部"重新测评"按钮可回到上传页

## 依赖

- 001 工程脚手架
- 003 上传引导页（用于"重新测评"跳转）

## 关联文件

- `src/pages/tab1/report.vue`
- `src/components/report/FaceSection.vue`
- `src/components/report/BodySection.vue`
- `src/components/report/StyleSection.vue`
- `src/components/report/OutfitSection.vue`
- `src/components/report/HairstyleSection.vue`
