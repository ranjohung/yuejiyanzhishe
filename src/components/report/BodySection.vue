<template>
  <view class="section">
    <view class="section-header">
      <text class="section-icon">🧍</text>
      <text class="section-title">身形建议</text>
    </view>
    <text class="section-subtitle">{{ subtitle }}</text>
    <text class="section-summary">{{ summary }}</text>
    <view class="section-tags">
      <text class="tag" v-for="tag in tags" :key="tag">{{ tag }}</text>
    </view>
    <MaterialGrid
      default-style='illustrated'
      v-if="outfitRefs.length > 0"
      :items="outfitRefs"
      title="适合梨形身材的穿搭参考"
      @select="onSelect"
    />
  </view>
</template>

<script setup>
import MaterialGrid from './MaterialGrid.vue'
import { useMaterials } from '@/utils/useMaterials'

defineProps({
  subtitle: { type: String, default: '匀称梨形身材' },
  summary: { type: String, default: '上半身纤细下半身线条优美。建议A字裙、阔腿裤平衡比例。' },
  tags: { type: Array, default: () => ['身高: 165cm', '体型: 梨形', 'BMI: 21.5'] }
})

const { items: outfitRefs } = useMaterials('outfit', { kind: 'image', limit: 6 })

function onSelect(item) {
  console.log('BodySection selected:', item)
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


