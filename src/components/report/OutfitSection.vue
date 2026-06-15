<template>
  <view class="section">
    <view class="section-header">
      <text class="section-icon">👗</text>
      <text class="section-title">穿搭推荐</text>
    </view>
    <text class="section-subtitle">{{ subtitle }}</text>
    <text class="section-summary">{{ summary }}</text>
    <view class="section-tags">
      <text class="tag" v-for="tag in tags" :key="tag">{{ tag }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  subtitle: { type: String, default: 'TODO · 1 套推荐' },
  summary: { type: String, default: 'TODO · 待 AI 详情接入' },
  tags: { type: Array, default: () => ['场景: TODO', '风格: TODO', '色系: TODO'] }
})
</script>

<style scoped>
.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.section-icon {
  font-size: 36rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}
.section-subtitle {
  font-size: 28rpx;
  color: #1f883d;
  font-weight: 500;
  margin-bottom: 12rpx;
  display: block;
}
.section-summary {
  font-size: 26rpx;
  color: #666;
  line-height: 1.7;
  display: block;
  margin-bottom: 16rpx;
}
.section-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.tag {
  font-size: 22rpx;
  color: #1f883d;
  background: #e8f5ed;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}
</style>