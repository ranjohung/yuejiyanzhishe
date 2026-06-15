<template>
  <view class="report-page">
    <view class="header">
      <text class="header-title">你的测评报告</text>
      <text class="header-subtitle">报告 ID：{{ reportId }}</text>
    </view>

    <view class="modules">
      <FaceSection :subtitle="report.face.subtitle" :summary="report.face.summary" :tags="report.face.tags" />
      <BodySection :subtitle="report.body.subtitle" :summary="report.body.summary" :tags="report.body.tags" />
      <StyleSection :subtitle="report.style.subtitle" :summary="report.style.summary" :tags="report.style.tags" />
      <OutfitSection :subtitle="report.outfit.subtitle" :summary="report.outfit.summary" :tags="report.outfit.tags" />
      <HairstyleSection :subtitle="report.hairstyle.subtitle" :summary="report.hairstyle.summary" :tags="report.hairstyle.tags" />
    </view>

    <view class="footer">
      <button class="reset-btn" @click="onReset">重新测评</button>
      <text class="footer-tip">V1 内部测试版 · 数据为占位示例</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// V1 第一版：5 个模块数据写死，标 TODO 字段
// 真实接入 002 / 后端 / AI 详情时替换为接口数据
const report = ref({
  face: {
    subtitle: 'TODO · 待接入人脸分析接口',
    summary: 'TODO · 待 AI 详情接入',
    tags: ['脸型: TODO', '五官: TODO', '肤质: TODO']
  },
  body: {
    subtitle: 'TODO · 待接入身形分析接口',
    summary: 'TODO · 待 AI 详情接入',
    tags: ['身高: TODO', '体型: TODO', 'BMI: TODO']
  },
  style: {
    subtitle: 'TODO · 风格画像待生成',
    summary: 'TODO · 待 AI 详情接入',
    tags: ['主风格: TODO', '气质: TODO', '场景: TODO']
  },
  outfit: {
    subtitle: 'TODO · 1 套推荐',
    summary: 'TODO · 待 AI 详情接入',
    tags: ['场景: TODO', '风格: TODO', '色系: TODO']
  },
  hairstyle: {
    subtitle: 'TODO · 1 套推荐',
    summary: 'TODO · 待 AI 详情接入',
    tags: ['长度: TODO', '卷直: TODO', '刘海: TODO']
  }
})

// TODO 接入 sessionStorage 中的 report_id（004 阶段先写死）
const reportId = ref('preview-001')

function onReset () {
  // 003 上传引导页落地后改为 navigateBack / redirectTo 到上传页
  uni.navigateBack({ delta: 1 })
}
</script>

<style scoped>
.report-page {
  padding: 32rpx;
  background: #fafafa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.header {
  margin-bottom: 32rpx;
  padding: 24rpx 0 16rpx;
}
.header-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #222;
  display: block;
  margin-bottom: 8rpx;
}
.header-subtitle {
  font-size: 24rpx;
  color: #999;
  display: block;
}
.modules {
  flex: 1;
}
.footer {
  margin-top: 32rpx;
  padding: 32rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}
.reset-btn {
  background: #1f883d;
  color: #fff;
  border-radius: 12rpx;
  font-size: 30rpx;
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
}
.footer-tip {
  font-size: 22rpx;
  color: #bbb;
}
</style>