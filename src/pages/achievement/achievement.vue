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
        <view class="stats-card">
          <view class="stats-item">
            <text class="stats-icon">⭐</text>
            <text class="stats-value">{{ totalPoints }}</text>
            <text class="stats-label">总积分</text>
          </view>
          <view class="stats-divider" />
          <view class="stats-item">
            <text class="stats-icon">🏅</text>
            <text class="stats-value">{{ unlockedCount }}/{{ totalCount }}</text>
            <text class="stats-label">成就数</text>
          </view>
          <view class="stats-divider" />
          <view class="stats-item">
            <text class="stats-icon">📊</text>
            <text class="stats-value">{{ progressPercent }}%</text>
            <text class="stats-label">完成度</text>
          </view>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </view>

        <view class="category-tabs">
          <scroll-view class="category-scroll" scroll-x show-scrollbar="false">
            <view
              v-for="(cat, key) in ACHIEVEMENT_CATEGORIES"
              :key="key"
              class="category-tab"
              :class="{ 'category-tab-active': activeCategory === key }"
              @click="activeCategory = key"
            >
              <text class="category-tab-icon">{{ cat.icon }}</text>
              <text class="category-tab-label">{{ cat.label }}</text>
            </view>
          </scroll-view>
        </view>

        <view class="unlocked-section" v-if="filteredUnlocked.length > 0">
          <view class="section-header">
            <text class="section-title">已解锁勋章</text>
            <text class="section-count">{{ filteredUnlocked.length }}</text>
          </view>
          <view class="badge-grid">
            <view
              v-for="ach in filteredUnlocked"
              :key="ach.id"
              class="badge-item badge-item-unlocked"
              @click="showDetail(ach)"
            >
              <view class="badge-icon-wrap">
                <text class="badge-icon">{{ ach.icon }}</text>
              </view>
              <text class="badge-name">{{ ach.name }}</text>
              <text class="badge-points">+{{ ach.points }}积分</text>
            </view>
          </view>
        </view>

        <view class="locked-section" v-if="filteredLocked.length > 0">
          <view class="section-header">
            <text class="section-title">未解锁勋章</text>
          </view>
          <view class="badge-grid">
            <view
              v-for="ach in filteredLocked"
              :key="ach.id"
              class="badge-item badge-item-locked"
              @click="showLockedDetail(ach)"
            >
              <view class="badge-icon-wrap badge-icon-wrap-locked">
                <text class="badge-icon badge-icon-locked">{{ ach.icon }}</text>
              </view>
              <text class="badge-name badge-name-locked">{{ ach.name }}</text>
              <view class="badge-progress">
                <view class="mini-progress-bar">
                  <view class="mini-progress-fill" :style="{ width: (ach.progress / ach.progressMax * 100) + '%' }" />
                </view>
                <text class="mini-progress-text">{{ ach.progress }}/{{ ach.progressMax }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="empty-state" v-if="filteredUnlocked.length === 0 && filteredLocked.length === 0">
          <text class="empty-icon">🏅</text>
          <text class="empty-text">该分类暂无成就</text>
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
        <text class="modal-points">积分奖励：+{{ selectedAchievement?.points }}</text>
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
        <text class="modal-condition">{{ selectedLockedAchievement?.condition }}</text>
        <text class="modal-progress">当前进度：{{ selectedLockedAchievement?.progress }}/{{ selectedLockedAchievement?.progressMax }}</text>
        <button class="modal-btn full" @click="closeLockedModal">知道了</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  getUserAchievements,
  formatUnlockTime
} from '@/utils/achievementData.js'

const showDetailModal = ref(false)
const showLockedModal = ref(false)
const selectedAchievement = ref(null)
const selectedLockedAchievement = ref(null)
const userData = ref(null)
const scrollHeight = ref(600)
const activeCategory = ref('all')

const totalCount = computed(() => ACHIEVEMENTS.length)
const unlockedCount = computed(() => userData.value?.unlockedCount || 0)
const totalPoints = computed(() => userData.value?.totalPoints || 0)
const progressPercent = computed(() => Math.round((unlockedCount.value / totalCount.value) * 100))

const mergedAchievements = computed(() => {
  if (!userData.value) return []
  return ACHIEVEMENTS.map(ach => ({
    ...ach,
    ...(userData.value.achievements[ach.id] || { progress: 0, unlocked: false, unlockedAt: null })
  }))
})

const filteredUnlocked = computed(() => {
  return mergedAchievements.value.filter(ach => {
    if (activeCategory.value !== 'all' && ach.category !== activeCategory.value) return false
    return ach.unlocked
  })
})

const filteredLocked = computed(() => {
  return mergedAchievements.value.filter(ach => {
    if (activeCategory.value !== 'all' && ach.category !== activeCategory.value) return false
    return !ach.unlocked
  })
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

.stats-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #F0E6D2;
  margin-bottom: 16rpx;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.stats-icon {
  font-size: 32rpx;
}

.stats-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #5c4f4e;
}

.stats-label {
  font-size: 22rpx;
  color: #D6C5B3;
}

.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background: #F0E6D2;
}

.progress-bar {
  height: 8rpx;
  background: #F5F0EB;
  border-radius: 4rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #E59A8F, #C26B5D);
  border-radius: 4rpx;
  transition: width 0.5s ease;
}

.category-tabs {
  background: #fff;
  padding: 0 0 16rpx;
  margin-bottom: 24rpx;
  border-radius: 16rpx;
}

.category-scroll {
  display: flex;
  white-space: nowrap;
}

.category-tab {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  margin-right: 12rpx;
  border-radius: 32rpx;
  background: #F5F0EB;
  font-size: 24rpx;
  color: #8B7B6B;
}

.category-tab-active {
  background: #E59A8F;
  color: #fff;
}

.category-tab-icon {
  font-size: 24rpx;
}

.category-tab-label {
  font-size: 24rpx;
  font-weight: 500;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
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
  gap: 20rpx;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
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
  opacity: 0.4;
  filter: grayscale(100%);
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

.badge-points {
  font-size: 20rpx;
  color: #E59A8F;
}

.badge-progress {
  display: flex;
  align-items: center;
  gap: 8rpx;
  width: 100%;
}

.mini-progress-bar {
  flex: 1;
  height: 4rpx;
  background: #E8E0D5;
  border-radius: 2rpx;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: #D6C5B3;
  border-radius: 2rpx;
}

.mini-progress-text {
  font-size: 18rpx;
  color: #D6C5B3;
}

.badge-item-locked {
  opacity: 0.8;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
  gap: 16rpx;
}

.empty-icon {
  font-size: 64rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #D6C5B3;
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
  filter: grayscale(100%);
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
  margin-bottom: 16rpx;
}

.modal-points {
  font-size: 24rpx;
  color: #F59E0B;
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
