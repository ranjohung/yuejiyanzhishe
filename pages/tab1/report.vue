<template>
  <view class="report-page">
    <view class="header">
      <text class="header-title">你的测评报告</text>
    </view>

    <view class="section" v-for="(item, key) in report" :key="key">
      <text class="section-title">{{ item.title }}</text>
      <text class="section-subtitle">{{ item.subtitle }}</text>
      <text class="section-summary">{{ item.summary }}</text>
    </view>

    <view class="footer">
      <button class="reset-btn" @click="onReset">重新测评</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// V1 第一版：写死数据，标 TODO 字段
const report = ref({
  face: { title: '面部结论', subtitle: 'TODO · 待接入人脸分析接口', summary: 'TODO · 待 AI 详情接入' },
  body: { title: '身形建议', subtitle: 'TODO · 待接入身形分析接口', summary: 'TODO · 待 AI 详情接入' },
  style: { title: '综合风格定位', subtitle: 'TODO · 风格画像待生成', summary: 'TODO · 待 AI 详情接入' },
  outfit: { title: '穿搭推荐', subtitle: 'TODO · 1 套推荐', summary: 'TODO · 待 AI 详情接入' },
  hairstyle: { title: '发型推荐', subtitle: 'TODO · 1 套推荐', summary: 'TODO · 待 AI 详情接入' }
})

function onReset () {
  uni.navigateBack({ delta: 1 })
}
</script>

<style scoped>
.report-page {
  padding: 32rpx;
  background: #fafafa;
  min-height: 100vh;
}
.header {
  margin-bottom: 48rpx;
}
.header-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #222;
}
.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}
.section-subtitle {
  font-size: 28rpx;
  color: #666;
}
.section-summary {
  font-size: 26rpx;
  color: #999;
  line-height: 1.6;
}
.footer {
  margin-top: 48rpx;
  padding: 32rpx 0;
}
.reset-btn {
  background: #1f883d;
  color: #fff;
  border-radius: 12rpx;
  font-size: 30rpx;
}
</style>