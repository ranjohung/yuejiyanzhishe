<template>
  <view class="section">
    <view class="section-header">
      <text class="section-icon">✨</text>
      <text class="section-title">综合风格定位</text>
    </view>
    <text class="section-subtitle">{{ subtitle }}</text>
    <text class="section-summary">{{ summary }}</text>
    <view class="section-tags">
      <text class="tag" v-for="tag in tags" :key="tag">{{ tag }}</text>
    </view>
    <view class="style-tip">
      <text class="tip-icon">💡</text>
      <text class="tip-text">风格参考图库正在整理中 · 共 {{ outfitCount + faceCount }} 个可用素材</text>
    </view>
  </view>
</template>

<script setup>
import { useMaterials } from '@/utils/useMaterials'

defineProps({
  subtitle: { type: String, default: '优雅自然风格' },
  summary: { type: String, default: '优雅自然风，简约大方的穿搭和清新自然的妆容。' },
  tags: { type: Array, default: () => ['主风格: 优雅', '气质: 自然', '场景: 日常'] }
})

const { items: outfitItems } = useMaterials('outfit', { limit: 99 })
const { items: faceItems } = useMaterials('face', { limit: 99 })
const outfitCount = outfitItems.length
const faceCount = faceItems.length
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
.style-tip {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  background: #f9f9f9;
  border-radius: 10rpx;
}
.tip-icon { font-size: 28rpx; }
.tip-text { font-size: 24rpx; color: #888; flex: 1; }
</style>


