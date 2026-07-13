<template>
  <view class="achievement-page">
    <view class="nav-bar">
      <view class="nav-back" @click="onBack">
        <text class="nav-back-icon">←</text>
      </view>
      <text class="nav-title">我的成就</text>
      <view class="nav-placeholder" />
    </view>

    <scroll-view class="ach-scroll-body" scroll-y :style="{ height: scrollHeight + 'px' }">
      <view class="achievement-content">
        <view class="unlocked-section">
          <view class="section-header">
            <text class="section-title">已解锁勋章</text>
            <text class="section-count">{{ unlockedCount }}/{{ totalCount }}</text>
          </view>
          <view class="badge-grid">
            <view
              v-for="ach in unlockedAchievements"
              :key="ach.id"
              class="badge-item badge-item-unlocked"
              @click="showDetail(ach)"
            >
              <view class="badge-icon-wrap">
                <text class="badge-icon">{{ ach.icon }}</text>
              </view>
              <text class="badge-name">{{ ach.name }}</text>
            </view>
          </view>
        </view>

        <view class="locked-section">
          <view class="section-header">
            <text class="section-title">未解锁勋章</text>
          </view>
          <view class="badge-grid">
            <view
              v-for="ach in lockedAchievements"
              :key="ach.id"
              class="badge-item badge-item-locked"
              @click="showLockedDetail(ach)"
            >
              <view class="badge-icon-wrap badge-icon-wrap-locked">
                <text class="badge-icon badge-icon-locked">{{ ach.icon }}</text>
              </view>
              <text class="badge-name badge-name-locked">{{ ach.name }}</text>
            </view>
          </view>
        </view>

        <view class="stats-footer">
          <view class="stats-row">
            <view class="stat-item">
              <text class="stat-value">{{ totalPoints }}</text>
              <text class="stat-label">总积分</text>
            </view>
            <view class="stat-divider" />
            <view class="stat-item">
              <text class="stat-value">{{ unlockedCount }}</text>
              <text class="stat-label">已获得</text>
            </view>
            <view class="stat-divider" />
            <view class="stat-item">
              <text class="stat-value">{{ totalCount }}</text>
              <text class="stat-label">总成就</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="showDetailModal" class="detail-modal" @click="closeDetailModal">
      <view class="modal-content" @click.stop>
        <view class="modal-icon-wrap">
          <text class="modal-icon">{{ selectedAchievement?.icon }}</text>
        </view>
        <text class="modal-name">{{ selectedAchievement?.name }}</text>
        <text class="modal-date" v-if="selectedAchievement?.unlockedAt">解锁于 {{ formatUnlockTime(selectedAchievement.unlockedAt) }}</text>
        <text class="modal-desc">{{ selectedAchievement?.description }}</text>
        <view class="modal-actions">
          <button class="modal-btn secondary" @click="closeDetailModal">关闭</button>
          <button class="modal-btn primary" @click="shareAchievement">分享</button>
        </view>
      </view>
    </view>

    <view v-if="showLockedModal" class="detail-modal" @click="closeLockedModal">
      <view class="modal-content modal-content-locked" @click.stop>
        <view class="modal-icon-wrap modal-icon-wrap-locked">
          <text class="modal-icon modal-icon-locked">{{ selectedLockedAchievement?.icon }}</text>
        </view>
        <text class="lock-icon">🔒</text>
        <text class="modal-name">{{ selectedLockedAchievement?.name }}</text>
        <text class="modal-condition">达成条件：{{ selectedLockedAchievement?.condition }}</text>
        <text class="modal-progress" v-if="selectedLockedAchievement">进度：{{ selectedLockedAchievement.progress }}/{{ selectedLockedAchievement.progressMax }}</text>
        <button class="modal-btn full" @click="closeLockedModal">知道了</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ACHIEVEMENTS,
  getUserAchievements,
  formatUnlockTime
} from '@/utils/achievementData.js'

const showDetailModal = ref(false)
const showLockedModal = ref(false)
const selectedAchievement = ref(null)
const selectedLockedAchievement = ref(null)
const userData = ref(null)
const scrollHeight = ref(600)

const totalCount = computed(() => ACHIEVEMENTS.length)
const unlockedCount = computed(() => userData.value?.unlockedCount || 0)
const totalPoints = computed(() => userData.value?.totalPoints || 0)

const mergedAchievements = computed(() => {
  if (!userData.value) return []
  return ACHIEVEMENTS.map(ach => ({
    ...ach,
    ...(userData.value.achievements[ach.id] || { progress: 0, unlocked: false, unlockedAt: null })
  }))
})

const unlockedAchievements = computed(() => {
  return mergedAchievements.value.filter(ach => ach.unlocked)
})

const lockedAchievements = computed(() => {
  return mergedAchievements.value.filter(ach => !ach.unlocked)
})

function loadData() {
  userData.value = getUserAchievements()
}

function showDetail(ach) {
  selectedAchievement.value = ach
  showDetailModal.value = true
}

function showLockedDetail(ach) {
  selectedLockedAchievement.value = ach
  showLockedModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedAchievement.value = null
}

function closeLockedModal() {
  showLockedModal.value = false
  selectedLockedAchievement.value = null
}

function shareAchievement() {
  closeDetailModal()
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  })
}

function onBack() {
  uni.navigateBack()
}

onMounted(() => {
  loadData()
  const sysInfo = uni.getSystemInfoSync()
  const navHeight = sysInfo.statusBarHeight + 44
  scrollHeight.value = sysInfo.windowHeight - navHeight
})
</script>

<style scoped>
.achievement-page {
  height: 100vh;
  background: #FAF8F5;
  overflow: hidden;
}

.nav-bar {
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44rpx 32rpx 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #F0E6D2;
}

.nav-back {
  display: flex;
  align-items: center;
  padding: 12rpx;
  border-radius: 20rpx;
}

.nav-back:active {
  background: #F5F0EB;
}

.nav-back-icon {
  font-size: 32rpx;
  color: #5c4f4e;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #5c4f4e;
}

.nav-placeholder {
  width: 60rpx;
}

.ach-scroll-body {
  flex: 1;
}

.achievement-content {
  padding: 32rpx;
}

.unlocked-section {
  margin-bottom: 48rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #5c4f4e;
}

.section-count {
  font-size: 24rpx;
  font-weight: 600;
  color: #E59A8F;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.badge-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  background: #FFF1EE;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #E59A8F;
}

.badge-icon-wrap-locked {
  background: #F5F0EB;
  border-color: #D6C5B3;
}

.badge-icon {
  font-size: 40rpx;
}

.badge-icon-locked {
  opacity: 0.5;
}

.badge-name {
  font-size: 24rpx;
  font-weight: 500;
  color: #5c4f4e;
  text-align: center;
}

.badge-name-locked {
  color: #D6C5B3;
}

.badge-item-locked {
  opacity: 0.7;
}

.stats-footer {
  margin-top: 48rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #F0E6D2;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #5c4f4e;
}

.stat-label {
  font-size: 22rpx;
  color: #D6C5B3;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background: #F0E6D2;
}

.detail-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #fff;
  border-radius: 32rpx;
  padding: 48rpx 32rpx;
  margin: 32rpx;
  width: 100%;
  max-width: 600rpx;
  text-align: center;
}

.modal-content-locked {
  max-width: 560rpx;
}

.modal-icon-wrap {
  width: 128rpx;
  height: 128rpx;
  border-radius: 64rpx;
  background: #FFF1EE;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24rpx;
  border: 4rpx solid #E59A8F;
}

.modal-icon-wrap-locked {
  background: #F5F0EB;
  border-color: #D6C5B3;
  opacity: 0.6;
}

.modal-icon {
  font-size: 56rpx;
}

.modal-icon-locked {
  opacity: 0.5;
}

.lock-icon {
  font-size: 32rpx;
  color: #D6C5B3;
  margin-bottom: 16rpx;
}

.modal-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #5c4f4e;
  display: block;
  margin-bottom: 8rpx;
}

.modal-date {
  font-size: 24rpx;
  color: #E59A8F;
  display: block;
  margin-bottom: 24rpx;
}

.modal-desc {
  font-size: 26rpx;
  color: #8B7B6B;
  line-height: 1.6;
  display: block;
  margin-bottom: 32rpx;
}

.modal-condition {
  font-size: 24rpx;
  color: #8B7B6B;
  line-height: 1.5;
  display: block;
  margin-bottom: 12rpx;
}

.modal-progress {
  font-size: 22rpx;
  color: #D6C5B3;
  display: block;
  margin-bottom: 32rpx;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
}

.modal-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  height: auto;
  line-height: 1.5;
}

.modal-btn.secondary {
  background: #F5F0EB;
  color: #5c4f4e;
  border: none;
}

.modal-btn.primary {
  background: #E59A8F;
  color: #fff;
  border: none;
}

.modal-btn.full {
  width: 100%;
}
</style>
