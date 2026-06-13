# 002 · feat(api): /face/analyze 路由 + 腾讯云人脸适配

> **状态**：待办　|　**Milestone**：V1-M2 · Tab1 主流程　|　**Label**：`feat`

## 背景

PRD 3.1.1：前端把半身照以 base64 形式 `POST /face/analyze`，后端调腾讯云人脸分析做人脸质量预检，不合格时返回人话错误码。

## 验收标准

- 新增 `POST /face/analyze` 路由
- 入参校验：图不能为空、单图 ≤ 10MB、jpg/png
- 调腾讯云 `DetectFace` / `AnalyzeFace`（具体 API 选一个能返回姿态/遮挡/大小的）
- 错误码翻译为：NO_FACE / MULTI_FACE / FACE_TOO_SMALL / BIG_POSE / MASK
- 不调用腾讯云时跑通 mock（环境变量 `MOCK_AI=1`）
- 接口响应时间本地 p95 ≤ 1s（不计腾讯云耗时）
- 写 1 个单测文件，覆盖 5 种错误码

## 依赖

需要在腾讯云控制台开通人脸分析服务、拿到 AK/SK，通过环境变量注入：
- `TENCENT_SECRET_ID`
- `TENCENT_SECRET_KEY`
- `TENCENT_FACE_REGION`（如 `ap-guangzhou`）

## 关联文件

- `server/routes/face.js`
- `server/services/tencentFace.js`
- `server/middleware/validate.js`
- `server/__tests__/face.test.js`
