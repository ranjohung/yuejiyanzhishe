<template>
  <view class="section">
    <view class="section-header">
      <text class="section-icon">😊</text>
      <text class="section-title">面部结论</text>
    </view>
    <text class="section-subtitle">{{ subtitle }}</text>
    <text class="section-summary">{{ summary }}</text>
    <view class="section-tags">
      <text class="tag" v-for="tag in tags" :key="tag">{{ tag }}</text>
    </view>
    <MaterialGrid
      default-style='illustrated'
      v-if="images.length > 0"
      :items="images"
      title="妆容参考（按脸型适配）"
      @select="onSelect"
    />
  </view>
</template>

<script setup>
import MaterialGrid from './MaterialGrid.vue'
import { useMaterials } from '@/utils/useMaterials'

defineProps({
  subtitle: { type: String, default: '优雅椭圆形脸型' },
  summary: { type: String, default: '脸型为优雅椭圆形，五官比例协调。建议保持自然妆容，突出眼部和唇部。' },
  tags: { type: Array, default: () => ['脸型: 椭圆', '五官: 协调', '肤质: 干性'] }
})

const { images } = useMaterials('face', { kind: 'image', limit: 6 })

function onSelect(item) {
  console.log('FaceSection selected:', item)
}
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
.section-icon { font-size: 36rpx; }
.section-title { font-size: 32rpx; font-weight: 600; color: #222; }
.section-subtitle { font-size: 28rpx; color: #1f883d; font-weight: 500; margin-bottom: 12rpx; display: block; }
.section-summary { font-size: 26rpx; color: #666; line-height: 1.7; display: block; margin-bottom: 16rpx; }
.section-tags { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 16rpx; }
.tag { font-size: 22rpx; color: #1f883d; background: #e8f5ed; padding: 6rpx 16rpx; border-radius: 20rpx; }
</style>


