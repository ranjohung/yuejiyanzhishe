# 003 · feat(tab1): 上传引导页 UI

> **状态**：待办　|　**Milestone**：V1-M2 · Tab1 主流程　|　**Label**：`feat`

## 背景

PRD 3.1.1：用户进入 Tab1 看到上传引导页，需要上传半身照 + 全身照，两张都必传，少一张不能"开始测评"。

## 验收标准

- 进入 Tab1 默认显示上传引导页
- 两个上传位（半身 / 全身），支持拍照 + 相册
- 上传后缩略图显示，可点击重传
- 缺图时"开始测评"按钮置灰
- 接入 `security.imgSecCheck`（前端拿到图后先过一次）
- 前端错误码翻译成中文化提示（NO_FACE 等）
- 不接业务接口，纯 UI 走通

## 依赖

- 001 工程脚手架
- 002 的 5 种错误码命名（前端提示文案要与之对齐）

## 关联文件

- `src/pages/tab1/upload.vue`
- `src/components/PhotoUploader.vue`
- `src/utils/imageCheck.js`
