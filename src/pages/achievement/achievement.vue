<template>
  <view class="achievement-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @click="onBack">
        <text class="nav-back-icon">←</text>
        <text class="nav-back-text">返回</text>
      </view>
      <text class="nav-title">我的成就</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 成就概览 -->
    <view class="stats-overview">
      <view class="stats-card">
        <view class="stats-item">
          <text class="stats-icon">🏅</text>
          <text class="stats-value">{{ stats.unlockedCount }}</text>
          <text class="stats-label">已获得</text>
        </view>
        <view class="stats-divider" />
        <view class="stats-item">
          <text class="stats-icon">⭐</text>
          <text class="stats-value">{{ stats.totalPoints }}</text>
          <text class="stats-label">总积分</text>
        </view>
        <view class="stats-divider" />
        <view class="stats-item">
          <text class="stats-icon">📊</text>
          <text class="stats-value">{{ stats.totalCount }}</text>
          <text class="stats-label">总成就</text>
        </view>
      </view>
      <view class="stats-progress-bar">
        <view
          class="stats-progress-fill"
          :style="{ width: (stats.unlockedCount / stats.totalCount * 100) + '%' }"
        />
      </view>
    </view>

    <!-- 分类筛选 -->
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

    <!-- 成就列表 -->
    <scroll-view class="achievement-list" scroll-y>
      <!-- 已解锁 -->
      <view class="ach-section" v-if="filteredUnlocked.length > 0">
        <text class="ach-section-label">已解锁</text>
        <view
          v-for="ach in filteredUnlocked"
          :key="ach.id"
          class="ach-card ach-card-unlocked"
          @click="showDetail(ach)"
        >
          <view class="ach-icon-wrap">
            <text class="ach-icon">{{ ach.icon }}</text>
          </view>
          <view class="ach-info">
            <text class="ach-name">{{ ach.name }}</text>
            <text class="ach-desc">{{ ach.description }}</text>
            <text class="ach-time" v-if="ach.userAch.unlockedAt">
              解锁于 {{ formatUnlockTime(ach.userAch.unlockedAt) }}
            </text>
          </view>
          <view class="ach-points">
            <text class="ach-points-value">+{{ ach.points }}</text>
            <text class="ach-points-label">积分</text>
          </view>
        </view>
      </view>

      <!-- 未解锁 -->
      <view class="ach-section" v-if="filteredLocked.length > 0">
        <text class="ach-section-label">未解锁</text>
        <view
          v-for="ach in filteredLocked"
          :key="ach.id"
          class="ach-card ach-card-locked"
          @click="showDetail(ach)"
        >
          <view class="ach-icon-wrap ach-icon-wrap-locked">
            <text class="ach-icon ach-icon-locked">🔒</text>
          </view>
          <view class="ach-info">
            <text class="ach-name">{{ ach.name }}</text>
            <text class="ach-desc">{{ ach.description }}</text>
            <view class="ach-progress-row">
              <view class="ach-progress-bar">
                <view
                  class="ach-progress-fill"
                  :style="{ width: (ach.userAch.progress / ach.progressMax * 100) + '%' }"
                />
              </view>
              <text class="ach-progress-text">{{ ach.userAch.progress }}/{{ ach.progressMax }}</text>
            </view>
          </view>
          <view class="ach-points">
            <text class="ach-points-value">+{{ ach.points }}</text>
            <text class="ach-points-label">积分</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="ach-empty" v-if="filteredUnlocked.length === 0 && filteredLocked.length === 0">
        <text class="ach-empty-icon">🏅</text>
        <text class="ach-empty-text">该分类暂无成就</text>
      </view>
    </scroll-view>

    <!-- 抽奖模拟按钮（V1 测试用） -->
    <view class="dev-tools" v-if="showDevTools">
      <text class="dev-tools-title">测试工具</text>
      <view class="dev-tools-grid">
        <button class="dev-btn" @click="simulateAction('analysis_done')">模拟分析完成</button>
        <button class="dev-btn" @click="simulateAction('plan_checkin')">模拟打卡</button>
        <button class="dev-btn" @click="simulateAction('plan_completed')">模拟计划完成</button>
        <button class="dev-btn" @click="simulateAction('style_test_done')">模拟风格测试</button>
        <button class="dev-btn" @click="simulateAction('share_done')">模拟分享</button>
        <button class="dev-btn" @click="simulateAction('ai_consult')">模拟AI对话</button>
        <button class="dev-btn" @click="resetAll">重置所有成就</button>
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
  triggerAchievementAction,
  formatUnlockTime
} from '@/utils/achievementData.js'

const activeCategory = ref('all')
const showDevTools = ref(true)
const userData = ref(null)

const stats = computed(() => ({
  unlockedCount: userData.value?.unlockedCount || 0,
  totalPoints: userData.value?.totalPoints || 0,
  totalCount: ACHIEVEMENTS.length
}))

// 合并成就定义与用户状态
const mergedAchievements = computed(() => {
  if (!userData.value) return []
  return ACHIEVEMENTS.map(ach => ({
    ...ach,
    userAch: userData.value.achievements[ach.id] || { progress: 0, unlocked: false, unlockedAt: null }
  }))
})

const filteredUnlocked = computed(() => {
  return mergedAchievements.value.filter(ach => {
    if (activeCategory.value !== 'all' && ach.category !== activeCategory.value) return false
    return ach.userAch.unlocked
  })
})

const filteredLocked = computed(() => {
  return mergedAchievements.value.filter(ach => {
    if (activeCategory.value !== 'all' && ach.category !== activeCategory.value) return false
    return !ach.userAch.unlocked
  })
})

function loadData() {
  userData.value = getUserAchievements()
}

function simulateAction(action) {
  userData.value = triggerAchievementAction(action)
  uni.showToast({
    title: '触发成功',
    icon: 'success',
    duration: 1000
  })
}

function resetAll() {
  uni.removeStorageSync('userAchievements')
  loadData()
  uni.showToast({
    title: '已重置',
    icon: 'none',
    duration: 1000
  })
}

function showDetail(ach) {
  uni.showModal({
    title: ach.name + (ach.userAch.unlocked ? ' ✅' : ' 🔒'),
    content: ach.description + '\n\n达成条件：' + ach.condition + '\n积分奖励：' + ach.points + '分' + (ach.userAch.unlocked ? '\n\n解锁于：' + (ach.userAch.unlockedAt ? formatUnlockTime(ach.userAch.unlockedAt) : '') : '\n\n当前进度：' + ach.userAch.progress + '/' + ach.progressMax),
    showCancel: false
  })
}

function onBack() {
  uni.navigateBack()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.achievement-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 导航栏 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 32rpx 20rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}
.nav-back {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 16rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
}
.nav-back:active {
  background: #e8e8e8;
}
.nav-back-icon {
  font-size: 32rpx;
  color: #333;
}
.nav-back-text {
  font-size: 28rpx;
  color: #333;
}
.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}
.nav-placeholder {
  width: 100rpx;
}

/* 成就概览 */
.stats-overview {
  padding: 140rpx 32rpx 24rpx;
  background: #fff;
}
.stats-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 24rpx 0;
  background: linear-gradient(135deg, #7c3aed10, #a855f710);
  border-radius: 16rpx;
}
.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}
.stats-icon {
  font-size: 36rpx;
}
.stats-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #222;
}
.stats-label {
  font-size: 22rpx;
  color: #999;
}
.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background: #e0e0e0;
}
.stats-progress-bar {
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  margin-top: 16rpx;
  overflow: hidden;
}
.stats-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  border-radius: 4rpx;
  transition: width 0.5s ease;
}

/* 分类筛选 */
.category-tabs {
  background: #fff;
  padding: 0 24rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
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
  background: #f5f5f5;
  font-size: 24rpx;
  color: #666;
}
.category-tab-active {
  background: #7c3aed;
  color: #fff;
}
.category-tab-icon {
  font-size: 24rpx;
}
.category-tab-label {
  font-size: 24rpx;
}

/* 成就列表 */
.achievement-list {
  height: calc(100vh - 140rpx);
  padding: 16rpx 32rpx 160rpx;
}
.ach-section {
  margin-bottom: 24rpx;
}
.ach-section-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}
.ach-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #fff;
  border-radius: 14rpx;
  padding: 20rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}
.ach-card:active {
  transform: scale(0.98);
}
.ach-card-unlocked {
  border-left: 6rpx solid #7c3aed;
}
.ach-card-locked {
  border-left: 6rpx solid #e0e0e0;
  opacity: 0.7;
}
.ach-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background: #f5f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ach-icon-wrap-locked {
  background: #f0f0f0;
}
.ach-icon {
  font-size: 32rpx;
}
.ach-icon-locked {
  font-size: 28rpx;
}
.ach-info {
  flex: 1;
  min-width: 0;
}
.ach-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}
.ach-desc {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ach-time {
  font-size: 20rpx;
  color: #7c3aed;
  display: block;
}
.ach-progress-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.ach-progress-bar {
  flex: 1;
  height: 6rpx;
  background: #f0f0f0;
  border-radius: 3rpx;
  overflow: hidden;
}
.ach-progress-fill {
  height: 100%;
  background: #7c3aed;
  border-radius: 3rpx;
  transition: width 0.3s ease;
}
.ach-progress-text {
  font-size: 20rpx;
  color: #bbb;
  flex-shrink: 0;
}
.ach-points {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.ach-points-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #f59e0b;
}
.ach-points-label {
  font-size: 20rpx;
  color: #bbb;
}

/* 空状态 */
.ach-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
  gap: 16rpx;
}
.ach-empty-icon {
  font-size: 64rpx;
}
.ach-empty-text {
  font-size: 26rpx;
  color: #999;
}

/* 测试工具 */
.dev-tools {
  background: #fffbe6;
  padding: 24rpx 32rpx 48rpx;
  border-top: 1rpx solid #f0e68c;
}
.dev-tools-title {
  font-size: 24rpx;
  color: #b8860b;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}
.dev-tools-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.dev-btn {
  font-size: 22rpx;
  color: #7c3aed;
  background: #f5f0ff;
  border: 1rpx solid #7c3aed40;
  border-radius: 8rpx;
  padding: 8rpx 20rpx;
  line-height: 1.5;
  height: auto;
}
</style>