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
      <view class="action-buttons">
        <button class="action-btn secondary" @click="onSave">
          <text class="btn-icon">📥</text>
          <text>保存至相册</text>
        </button>
        <button class="action-btn primary" @click="onShare">
          <text class="btn-icon">📤</text>
          <text>分享报告</text>
        </button>
      </view>
      <button class="reset-btn" @click="onReset">重新测评</button>
      <text class="footer-tip">V1 内部测试版 · 数据为占位示例</text>
    </view>

    <ShareModal 
      :visible="showShareModal" 
      :reportId="reportId"
      :reportType="'analysis'"
      @close="showShareModal = false" 
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ShareModal from '@/components/share/ShareModal.vue'
import { shareManager } from '@/utils/share'

const report = ref({
  face: {
    subtitle: '优雅椭圆形脸型',
    summary: '你的脸型为优雅椭圆形，五官比例协调，是最理想的脸型之一。额头饱满圆润，下巴线条柔和，颧骨宽度适中。建议保持自然妆容，突出眼部和唇部的美感。',
    tags: ['脸型: 椭圆', '五官: 协调', '肤质: 干性']
  },
  body: {
    subtitle: '匀称梨形身材',
    summary: '你的身材为匀称梨形，上半身纤细，下半身线条优美。肩宽适中，腰部纤细，臀部丰满。建议选择A字裙和阔腿裤来平衡身材比例。',
    tags: ['身高: 165cm', '体型: 梨形', 'BMI: 21.5']
  },
  style: {
    subtitle: '优雅自然风格',
    summary: '你的综合风格定位为优雅自然风，适合简约大方的穿搭和清新自然的妆容。这种风格强调舒适与美感的平衡，展现自信从容的气质。',
    tags: ['主风格: 优雅', '气质: 自然', '场景: 日常']
  },
  outfit: {
    subtitle: '3套穿搭推荐',
    summary: '根据你的身材特点，推荐法式优雅风、日系清新风和职场干练风三套穿搭方案，涵盖不同场景需求。',
    tags: ['场景: 通勤', '风格: 优雅', '色系: 米白']
  },
  hairstyle: {
    subtitle: '3款发型推荐',
    summary: '根据你的脸型，推荐温柔波浪卷、利落短发和优雅盘发三款发型，适合不同场合和心情。',
    tags: ['长度: 中长', '卷直: 波浪', '刘海: 空气']
  }
})

const reportId = ref('preview-001')
const showShareModal = ref(false)

onMounted(() => {
  shareManager.showShareMenu()
})

function onReset () {
  uni.navigateBack({ delta: 1 })
}

function onSave () {
  uni.showToast({
    title: '保存功能开发中',
    icon: 'none'
  })
}

function onShare () {
  showShareModal.value = true
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
  gap: 20rpx;
}
.action-buttons {
  display: flex;
  gap: 20rpx;
  width: 100%;
}
.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
}
.action-btn.primary {
  background: #4A90D9;
  color: #fff;
}
.action-btn.secondary {
  background: #fff;
  color: #6E5D53;
  border: 2rpx solid #E8D8C8;
}
.btn-icon {
  font-size: 32rpx;
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
