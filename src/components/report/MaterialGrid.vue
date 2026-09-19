<template>
  <view class="material-grid">
    <view class="grid-header" v-if="items.length > 0">
      <text class="grid-title">{{ title }}</text>
      <view class="header-right">
        <view v-if="hasIllustrated" class="filter-tabs">
          <text
            v-for="tab in styleTabs"
            :key="tab.value"
            class="filter-tab"
            :class="{ active: activeStyle === tab.value }"
            @click="activeStyle = tab.value"
          >{{ tab.label }}</text>
        </view>
        <text class="grid-count">共 {{ filtered.length }} 个素材</text>
      </view>
    </view>
    <view class="grid-empty" v-else>
      <text class="empty-text">暂无素材</text>
    </view>

    <view class="grid-wrap" v-if="filtered.length > 0">
      <view
        v-for="item in filtered"
        :key="item.id"
        class="grid-item"
        @click="onTap(item)"
        @longpress="onLongPress(item)"
      >
        <image
          v-if="item.kind === 'image'"
          :src="item.path"
          mode="aspectFill"
          class="thumb"
          lazy-load
        />
        <view v-else class="thumb video-thumb">
          <view class="video-icon">▶</view>
          <text class="video-label">视频</text>
        </view>
        <view class="item-meta">
          <text class="item-name">{{ displayName(item) }}</text>
        </view>
        <view v-if="item.kind === 'video'" class="kind-badge video">视频</view>
        <view v-else class="kind-badge image">图片</view>
        <!-- 非真人风格标识 -->
        <view v-if="item.style === 'illustrated'" class="style-badge">
          <text class="style-badge-icon">🎨</text>
          <text class="style-badge-text">非真人</text>
        </view>
        <!-- 场合标识 -->
        <view v-if="item.occasion && item.occasion !== 'general'" class="occasion-badge">
          {{ occasionLabel(item.occasion) }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  title: { type: String, default: '参考素材' },
  defaultStyle: { type: String, default: 'photo' }  // photo=真人优先, illustrated=非真人优先, all=混合
})
const emit = defineEmits(['select', 'preview'])

// 风格筛选 - 根据 defaultStyle 初始化
const hasIllustrated = computed(() => props.items.some(i => i.style === 'illustrated'))
const hasPhoto = computed(() => props.items.some(i => i.style === 'photo'))
// 如果设置的 defaultStyle 在 items 里不存在，回退到 'all'
const initialStyle = (props.defaultStyle === 'photo' && hasPhoto.value) 
  ? 'photo' 
  : (props.defaultStyle === 'illustrated' && hasIllustrated.value)
    ? 'illustrated'
    : 'all'
const activeStyle = ref(initialStyle)
const styleTabs = computed(() => {
  const tabs = [{ label: '全部', value: 'all' }]
  if (hasIllustrated.value) {
    tabs.push({ label: '非真人风格', value: 'illustrated' })
    tabs.push({ label: '真人实拍', value: 'photo' })
  }
  return tabs
})

const filtered = computed(() => {
  if (activeStyle.value === 'all') return props.items
  return props.items.filter(i => i.style === activeStyle.value)
})

function occasionLabel(key) {
  const map = { work: '💼通勤', date: '💕约会', party: '🎉派对', daily: '日常', wedding: '💒婚礼', tutorial: '📖教程', 'hairstyle-tutorial': '编发', idphoto: '📷证件照', general: '' }
  return map[key] || ''
}

function displayName(item) {
  const n = item.name || ''
  return n.length > 16 ? n.slice(0, 14) + '…' : n
}

function onTap(item) {
  emit('select', item)
  if (item.kind === 'image') {
    uni.previewImage({
      urls: props.items.filter(i => i.kind === 'image').map(i => i.path),
      current: item.path
    })
  } else {
    uni.showModal({
      title: '教程视频',
      content: `来自「${item.source}」的教程视频`,
      confirmText: '打开视频',
      success(r) {
        if (r.confirm) {
          uni.showToast({ title: '视频播放待接入', icon: 'none' })
        }
      }
    })
  }
}

function onLongPress(item) {
  uni.showActionSheet({
    itemList: ['设为推荐素材', '查看完整路径'],
    success(res) {
      if (res.tapIndex === 1) {
        uni.setClipboardData({ data: item.path })
      }
    }
  })
}
</script>

<style scoped>
.material-grid {
  margin-top: 24rpx;
}
.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}
.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}
.filter-tabs {
  display: flex;
  gap: 8rpx;
}
.filter-tab {
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  background: #f0f0f0;
  border-radius: 16rpx;
  color: #666;
}
.filter-tab.active {
  background: #1f883d;
  color: #fff;
}
.style-badge {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 18rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  background: linear-gradient(135deg, #ff6b6b, #ffa07a);
  color: #fff;
  font-weight: 500;
}
.style-badge-icon { font-size: 18rpx; }
.occasion-badge {
  position: absolute;
  bottom: 48rpx;
  left: 8rpx;
  font-size: 18rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
}
.grid-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}
.grid-count {
  font-size: 22rpx;
  color: #999;
}
.grid-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.grid-item {
  width: calc(33.33% - 8rpx);
  aspect-ratio: 1;
  background: #f5f5f5;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
  border: 2rpx solid transparent;
  transition: border-color 0.2s;
}
.grid-item:active {
  border-color: #1f883d;
}
.thumb {
  width: 100%;
  height: 100%;
}
.video-thumb {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
.video-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}
.video-label {
  font-size: 22rpx;
}
.item-meta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16rpx 8rpx 8rpx;
  background: linear-gradient(transparent, rgba(0,0,0,0.65));
}
.item-name {
  font-size: 20rpx;
  color: #fff;
  display: block;
}
.kind-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  font-size: 18rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  font-weight: 500;
}
.kind-badge.image {
  background: rgba(31, 136, 61, 0.85);
  color: #fff;
}
.kind-badge.video {
  background: rgba(102, 126, 234, 0.85);
  color: #fff;
}
.grid-empty {
  padding: 32rpx 0;
  text-align: center;
}
.empty-text {
  font-size: 24rpx;
  color: #ccc;
}
</style>
