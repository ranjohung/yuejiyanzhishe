<template>
  <view class="plan-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @click="onBack">
        <text class="nav-back-icon">←</text>
        <text class="nav-back-text">返回</text>
      </view>
      <text class="nav-title">美容减脂</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 合规声明 -->
    <view class="disclaimer-banner">
      <text class="disclaimer-text">所有计划内容仅供日常参考，不替代专业医疗建议</text>
    </view>

    <!-- 计划类型选择 -->
    <view class="type-section">
      <text class="section-title">选择计划类型</text>
      <view class="type-grid">
        <view
          v-for="(pt, key) in PLAN_TYPES"
          :key="key"
          class="type-card"
          :style="{ borderColor: pt.color + '30', background: pt.color + '08' }"
          @click="createPlan(key)"
        >
          <view class="type-icon" :style="{ background: pt.color + '20' }">
            <text>{{ pt.icon }}</text>
          </view>
          <text class="type-label">{{ pt.label }}</text>
          <text class="type-desc">{{ typeDescriptions[key] }}</text>
        </view>
      </view>
    </view>

    <!-- 正在进行的计划 -->
    <view class="plan-section" v-if="activePlans.length > 0">
      <text class="section-title">进行中的计划</text>
      <view
        v-for="plan in activePlans"
        :key="plan.id"
        class="plan-card"
        @click="goToDetail(plan.id)"
      >
        <view class="plan-card-header">
          <view class="plan-type-tag" :style="{ background: getPlanColor(plan.type) + '20', color: getPlanColor(plan.type) }">
            <text>{{ PLAN_TYPES[plan.type]?.icon }} {{ PLAN_TYPES[plan.type]?.label }}</text>
          </view>
          <text class="plan-status">进行中</text>
        </view>
        <text class="plan-card-title">{{ plan.title }}</text>
        <view class="plan-progress-row">
          <view class="plan-progress-bar">
            <view class="plan-progress-fill" :style="{ width: plan.progress + '%', background: getPlanColor(plan.type) }" />
          </view>
          <text class="plan-progress-text">{{ plan.progress }}%</text>
        </view>
        <view class="plan-meta">
          <text class="plan-meta-text">第 {{ plan.currentDay }}/{{ plan.totalDays }} 天</text>
          <text class="plan-meta-text">{{ plan.startDate }} ~ {{ plan.endDate }}</text>
        </view>
      </view>
    </view>

    <!-- 已完成计划 -->
    <view class="plan-section" v-if="completedPlans.length > 0">
      <text class="section-title">已完成计划</text>
      <view
        v-for="plan in completedPlans"
        :key="plan.id"
        class="plan-card plan-card-completed"
        @click="goToDetail(plan.id)"
      >
        <view class="plan-card-header">
          <view class="plan-type-tag" :style="{ background: getPlanColor(plan.type) + '20', color: getPlanColor(plan.type) }">
            <text>{{ PLAN_TYPES[plan.type]?.icon }} {{ PLAN_TYPES[plan.type]?.label }}</text>
          </view>
          <text class="plan-status-completed">已完成</text>
        </view>
        <text class="plan-card-title">{{ plan.title }}</text>
        <view class="plan-progress-row">
          <view class="plan-progress-bar">
            <view class="plan-progress-fill" :style="{ width: '100%', background: '#10b981' }" />
          </view>
          <text class="plan-progress-text">100%</text>
        </view>
        <view class="plan-meta">
          <text class="plan-meta-text">{{ plan.startDate }} ~ {{ plan.endDate }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-section" v-if="activePlans.length === 0 && completedPlans.length === 0">
      <text class="empty-icon">🎯</text>
      <text class="empty-text">还没有创建计划</text>
      <text class="empty-desc">选择一个计划类型，开始你的变美之旅</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PLAN_TYPES, createPlanFromTemplate, getAllTemplates } from '@/utils/planData.js'

const typeDescriptions = {
  skincare: '每日护肤流程，养成好肌肤',
  diet: '科学饮食搭配，吃出好状态',
  sleep: '规律作息，焕发好气色'
}

const plans = ref([])

const activePlans = computed(() => plans.value.filter(p => p.status === 'active'))
const completedPlans = computed(() => plans.value.filter(p => p.status === 'completed'))

function getPlanColor(type) {
  return PLAN_TYPES[type]?.color || '#7c3aed'
}

function loadPlans() {
  const stored = uni.getStorageSync('plans')
  plans.value = stored || []
}

function savePlans() {
  uni.setStorageSync('plans', plans.value)
}

function createPlan(type) {
  const template = getPlanTemplateByType(type)
  if (!template) {
    uni.showToast({ title: '暂无可选计划', icon: 'none' })
    return
  }

  // 检查是否已有同类型进行中的计划
  const existing = plans.value.find(p => p.type === type && p.status === 'active')
  if (existing) {
    uni.showToast({ title: '已有进行中的计划', icon: 'none' })
    return
  }

  const plan = createPlanFromTemplate(template.id)
  plans.value.unshift(plan)
  savePlans()

  uni.navigateTo({
    url: '/pages/plan/detail?id=' + plan.id
  })
}

function getPlanTemplateByType(type) {
  const templates = getAllTemplates()
  return templates.find(t => t.type === type)
}

function goToDetail(id) {
  uni.navigateTo({
    url: '/pages/plan/detail?id=' + id
  })
}

function onBack() {
  uni.navigateBack()
}

onMounted(() => {
  loadPlans()
})
</script>

<style scoped>
.plan-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 40rpx;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 88rpx 32rpx 16rpx;
  background: #fff;
}
.nav-back {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 0;
}
.nav-back-icon {
  font-size: 36rpx;
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

/* 合规声明 */
.disclaimer-banner {
  background: #fff8e1;
  padding: 12rpx 32rpx;
  text-align: center;
}
.disclaimer-text {
  font-size: 22rpx;
  color: #b8860b;
}

/* 通用区块 */
.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
  display: block;
  margin-bottom: 24rpx;
}

/* 计划类型选择 */
.type-section {
  padding: 32rpx 32rpx 16rpx;
  background: #fff;
  margin-bottom: 16rpx;
}
.type-grid {
  display: flex;
  gap: 20rpx;
}
.type-card {
  flex: 1;
  border-radius: 16rpx;
  padding: 28rpx 20rpx;
  text-align: center;
  border: 2rpx solid;
}
.type-card:active {
  transform: scale(0.96);
}
.type-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16rpx;
}
.type-icon text {
  font-size: 36rpx;
}
.type-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}
.type-desc {
  font-size: 22rpx;
  color: #999;
  display: block;
  line-height: 1.4;
}

/* 计划列表 */
.plan-section {
  padding: 24rpx 32rpx;
}
.plan-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.plan-card:active {
  transform: scale(0.98);
}
.plan-card-completed {
  opacity: 0.7;
}
.plan-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}
.plan-type-tag {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}
.plan-status {
  font-size: 22rpx;
  color: #7c3aed;
  background: #f5f0ff;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}
.plan-status-completed {
  font-size: 22rpx;
  color: #10b981;
  background: #ecfdf5;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}
.plan-card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
  display: block;
  margin-bottom: 16rpx;
}
.plan-progress-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}
.plan-progress-bar {
  flex: 1;
  height: 10rpx;
  background: #f0f0f0;
  border-radius: 5rpx;
  overflow: hidden;
}
.plan-progress-fill {
  height: 100%;
  border-radius: 5rpx;
  transition: width 0.3s ease;
}
.plan-progress-text {
  font-size: 24rpx;
  color: #999;
  width: 48rpx;
  text-align: right;
}
.plan-meta {
  display: flex;
  justify-content: space-between;
}
.plan-meta-text {
  font-size: 22rpx;
  color: #bbb;
}

/* 空状态 */
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 32rpx;
}
.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}
.empty-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 12rpx;
}
.empty-desc {
  font-size: 26rpx;
  color: #999;
}
</style>