<template>
  <view class="section">
    <view class="section-header">
      <text class="section-icon">💇</text>
      <text class="section-title">发型推荐</text>
    </view>
    <text class="section-subtitle">{{ subtitle }}</text>
    <text class="section-summary">{{ summary }}</text>
    <view class="section-tags">
      <text class="tag" v-for="tag in tags" :key="tag">{{ tag }}</text>
    </view>
    <MaterialGrid
      default-style='illustrated'
      v-if="refs.length > 0"
      :items="refs"
      title="发型参考图"
      @select="onSelect"
    />
    <MaterialGrid
      default-style='illustrated'
      v-if="tutorials.length > 0"
      :items="tutorials"
      title="发型教程视频"
      @select="onSelect"
    />
  </view>
</template>

<script setup>
import MaterialGrid from './MaterialGrid.vue'
import { useMaterials } from '@/utils/useMaterials'

defineProps({
  subtitle: { type: String, default: '3款发型推荐' },
  summary: { type: String, default: '根据脸型推荐温柔波浪卷、利落短发和优雅盘发。' },
  tags: { type: Array, default: () => ['长度: 中长', '卷直: 波浪', '刘海: 空气'] }
})

const { items } = useMaterials('hairstyle', { , limit: 24 })
const refs = items.filter(m => m.type === 'reference').slice(0, 6)
const tutorials = items.filter(m => m.type === 'tutorial').slice(0, 4)

function onSelect(item) {
  console.log('HairstyleSection selected:', item)
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


