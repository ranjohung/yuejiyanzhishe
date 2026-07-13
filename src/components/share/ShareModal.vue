<template>
  <view v-if="visible" class="share-modal-overlay" @click="handleClose">
    <view class="share-modal-content" @click.stop>
      <view class="share-modal-header">
        <text class="share-modal-title">分享报告</text>
        <text class="share-modal-close" @click="handleClose">×</text>
      </view>
      
      <view class="share-mode-section">
        <text class="share-section-title">分享模式</text>
        <view class="share-mode-options">
          <view 
            v-for="mode in modes" 
            :key="mode.value"
            class="share-mode-item"
            :class="{ active: selectedMode === mode.value }"
            @click="selectedMode = mode.value"
          >
            <view class="share-mode-icon">{{ mode.icon }}</view>
            <text class="share-mode-name">{{ mode.name }}</text>
            <text class="share-mode-desc">{{ mode.desc }}</text>
          </view>
        </view>
      </view>
      
      <view class="share-platform-section">
        <text class="share-section-title">分享到</text>
        <view class="share-platform-grid">
          <view class="share-platform-item" @click="handleShare('wechat')">
            <view class="share-platform-icon bg-green-500">
              <text class="icon-text">微信</text>
            </view>
            <text class="share-platform-name">微信好友</text>
          </view>
          <view class="share-platform-item" @click="handleShare('timeline')">
            <view class="share-platform-icon bg-green-600">
              <text class="icon-text">朋友圈</text>
            </view>
            <text class="share-platform-name">朋友圈</text>
          </view>
          <view class="share-platform-item" @click="handleShare('qq')">
            <view class="share-platform-icon bg-blue-500">
              <text class="icon-text">QQ</text>
            </view>
            <text class="share-platform-name">QQ好友</text>
          </view>
          <view class="share-platform-item" @click="handleShare('copy')">
            <view class="share-platform-icon bg-gray-500">
              <text class="icon-text">链接</text>
            </view>
            <text class="share-platform-name">复制链接</text>
          </view>
          <view class="share-platform-item" @click="handleShare('image')">
            <view class="share-platform-icon bg-pink-500">
              <text class="icon-text">图片</text>
            </view>
            <text class="share-platform-name">保存图片</text>
          </view>
          <view class="share-platform-item" @click="handleShare('poster')">
            <view class="share-platform-icon bg-amber-500">
              <text class="icon-text">海报</text>
            </view>
            <text class="share-platform-name">生成海报</text>
          </view>
        </view>
      </view>
      
      <view class="share-modal-footer">
        <button class="share-cancel-btn" @click="handleClose">取消</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { shareManager } from '@/utils/share'

const props = defineProps({
  visible: { type: Boolean, default: false },
  reportId: { type: String, default: '' },
  reportType: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close'])

const selectedMode = ref('full')

const modes = [
  { value: 'full', name: '完整模式', desc: '展示全部内容', icon: '📋' },
  { value: 'anonymous', name: '匿名模式', desc: '隐藏个人信息', icon: '🔒' },
  { value: 'teach', name: '教学模式', desc: '仅知识科普', icon: '📚' }
]

const handleClose = () => {
  emit('close')
}

const handleShare = async (channel) => {
  const reportId = props.reportId || 'demo-report-001'
  
  try {
    switch (channel) {
      case 'wechat':
        await shareManager.shareReport(reportId, { 
          mode: selectedMode.value, 
          type: props.reportType 
        })
        break
      case 'timeline':
        await shareManager.shareToTimeline(reportId, { 
          mode: selectedMode.value, 
          type: props.reportType 
        })
        break
      case 'qq':
        uni.showToast({
          title: 'QQ分享开发中',
          icon: 'none'
        })
        break
      case 'copy':
        shareManager.copyLink(shareManager.generateShareLink(reportId, selectedMode.value))
        break
      case 'image':
        await shareManager.saveShareImage(reportId, { mode: selectedMode.value })
        break
      case 'poster':
        uni.showToast({
          title: '海报生成开发中',
          icon: 'none'
        })
        break
      default:
        break
    }
  } catch (err) {
    console.error('Share error:', err)
    uni.showToast({
      title: '分享失败',
      icon: 'error'
    })
  }
  
  handleClose()
}
</script>

<style scoped>
.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.share-modal-content {
  width: 100%;
  background: #FAF8F5;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.share-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.share-modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #6E5D53;
}

.share-modal-close {
  font-size: 48rpx;
  color: #D6C5B3;
  line-height: 1;
  padding: 8rpx;
}

.share-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #6E5D53;
  margin-bottom: 20rpx;
  display: block;
}

.share-mode-section {
  margin-bottom: 32rpx;
}

.share-mode-options {
  display: flex;
  gap: 16rpx;
}

.share-mode-item {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  text-align: center;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.share-mode-item.active {
  border-color: #C26B5D;
  background: #FFF1EE;
}

.share-mode-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.share-mode-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #6E5D53;
  display: block;
  margin-bottom: 4rpx;
}

.share-mode-desc {
  font-size: 20rpx;
  color: #A69989;
  display: block;
}

.share-platform-section {
  margin-bottom: 32rpx;
}

.share-platform-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.share-platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.share-platform-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 18rpx;
  color: #fff;
  font-weight: 600;
}

.share-platform-name {
  font-size: 24rpx;
  color: #6E5D53;
}

.share-modal-footer {
  padding-top: 16rpx;
}

.share-cancel-btn {
  width: 100%;
  height: 88rpx;
  background: #E8D8C8;
  color: #6E5D53;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: 44rpx;
  border: none;
}
</style>
