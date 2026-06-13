# 005 · feat(tab2): 换装间骨架 + 素材列表页

> **状态**：待办　|　**Milestone**：V1-M3 · Tab2 换装间　|　**Label**：`feat`

## 背景

PRD §2：换装间有两个模块（A 发型 / B 穿搭），V1 先做"能看素材、点素材能选上"，生成效果图依赖 Image2，留到 M3 第二轮做。

## 验收标准

- Tab2 默认显示两个模块 tab：发型 / 穿搭
- 每个模块下展示若干素材（先用本地 JSON 占位 8～12 张缩略图）
- 点击素材变"已选"高亮状态
- 顶部展示当前选中的素材（半屏预览）
- 底部"生成效果图"按钮（V1 先置灰，PR 文案写明"V2 接 Image2"）

## 依赖

- 001 工程脚手架
- 003 上传引导页（用于"先去测个评"的引导）

## 关联文件

- `src/pages/tab2/index.vue`
- `src/components/tab2/MaterialGrid.vue`
- `src/components/tab2/ModuleTabs.vue`
- `src/utils/materials.js`（占位素材数据）
