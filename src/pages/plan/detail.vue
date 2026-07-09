<template>
  <view class="plan-detail-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @click="onBack">
        <text class="nav-back-icon">←</text>
        <text class="nav-back-text">返回</text>
      </view>
      <text class="nav-title">计划详情</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 计划不存在 -->
    <view class="empty-state" v-if="!plan">
      <text class="empty-icon">📋</text>
      <text class="empty-text">计划不存在</text>
      <button class="btn-go-back" @click="onBack">返回</button>
    </view>

    <template v-else>
      <!-- 计划概览 -->
      <view class="plan-header">
        <view class="plan-header-top">
          <view class="plan-type-badge" :style="{ background: getPlanColor() + '20', color: getPlanColor() }">
            <text>{{ PLAN_TYPES[plan.type]?.icon }} {{ PLAN_TYPES[plan.type]?.label }}</text>
          </view>
          <text class="plan-status-tag" v-if="plan.status === 'completed'">已完成</text>
        </view>
        <text class="plan-title">{{ plan.title }}</text>
        <text class="plan-desc">{{ plan.description }}</text>
        <view class="plan-progress-section">
          <view class="plan-progress-row">
            <text class="plan-progress-label">总进度</text>
            <text class="plan-progress-value">{{ plan.progress }}%</text>
          </view>
          <view class="plan-progress-bar">
            <view class="plan-progress-fill" :style="{ width: plan.progress + '%', background: getPlanColor() }" />
          </view>
          <view class="plan-meta-row">
            <text class="plan-meta-text">第 {{ plan.currentDay }}/{{ plan.totalDays }} 天</text>
            <text class="plan-meta-text">已完成 {{ completedDays }}/{{ plan.totalDays }} 天</text>
          </view>
        </view>
      </view>

      <!-- 今日任务 -->
      <view class="tasks-section">
        <view class="tasks-header">
          <text class="tasks-title">今日任务 · 第 {{ plan.currentDay }} 天</text>
          <text class="tasks-date">{{ todayDate }}</text>
        </view>

        <view
          v-for="(task, ti) in todayTasks"
          :key="task.key"
          class="task-item"
          :class="{ 'task-done': task.checked }"
          @click="handleCheckin(task)"
        >
          <view class="task-checkbox" :class="{ 'task-checkbox-done': task.checked }">
            <text class="task-check-icon">{{ task.checked ? '✓' : '' }}</text>
          </view>
          <view class="task-content">
            <text class="task-label" :class="{ 'task-label-done': task.checked }">{{ task.label }}</text>
            <text class="task-time" v-if="task.checked && task.checkinTime">已完成</text>
          </view>
        </view>

        <!-- 全部完成提示 -->
        <view class="tasks-complete" v-if="allDone">
          <text class="tasks-complete-icon">🎉</text>
          <text class="tasks-complete-text">今日任务全部完成！</text>
        </view>
      </view>

      <!-- 历史任务（其他天） -->
      <view class="history-section" v-if="otherDaysTasks.length > 0">
        <text class="section-title">历史任务</text>
        <view
          v-for="(day, di) in otherDaysTasks"
          :key="di"
          class="history-day"
        >
          <view class="history-day-header" @click="toggleDay(di)">
            <text class="history-day-title">第 {{ day.dayIndex }} 天</text>
            <view class="history-day-status">
              <text class="history-day-count">{{ day.doneCount }}/{{ day.items.length }}</text>
              <text class="history-day-arrow">{{ day.expanded ? '▼' : '▶' }}</text>
            </view>
          </view>
          <view class="history-day-tasks" v-if="day.expanded">
            <view
              v-for="(item, ii) in day.items"
              :key="ii"
              class="task-item task-item-history"
              :class="{ 'task-done': item.checked }"
            >
              <view class="task-checkbox" :class="{ 'task-checkbox-done': item.checked }">
                <text class="task-check-icon">{{ item.checked ? '✓' : '' }}</text>
              </view>
              <text class="task-label" :class="{ 'task-label-done': item.checked }">{{ item.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部空间 -->
      <view class="bottom-spacer" />
    </template>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PLAN_TYPES, getTodayTasks, doCheckin, isTodayCompleted, getCompletedDays } from '@/utils/planData.js'

const plan = ref(null)
const todayTasks = ref([])
const otherDaysTasks = ref([])
const allDone = ref(false)

const todayDate = computed(() => {
  const d = new Date()
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  return `${M}月${D}日`
})

const completedDays = ref(0)

function getPlanColor() {
  return PLAN_TYPES[plan.value?.type]?.color || '#7c3aed'
}

function loadPlan() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage?.options?.id
  if (!id) return

  const stored = uni.getStorageSync('plans') || []
  const found = stored.find(p => p.id === id)
  if (!found) return

  plan.value = found
  refreshTasks()
}

function refreshTasks() {
  if (!plan.value) return
  todayTasks.value = getTodayTasks(plan.value)
  allDone.value = isTodayCompleted(plan.value)
  completedDays.value = getCompletedDays(plan.value)

  // 构建历史任务（其他天）
  const dayData = getDayData(plan.value)
  if (dayData) {
    otherDaysTasks.value = dayData
      .filter((_, idx) => idx + 1 !== plan.value.currentDay)
      .map((day, idx) => ({
        dayIndex: idx + 1,
        items: day.items.map((label, ii) => ({
          key: `${idx + 1}_${ii}`,
          label,
          checked: !!plan.value.checkins[`${idx + 1}_${ii}`]
        })),
        doneCount: day.items.filter((_, ii) => plan.value.checkins[`${idx + 1}_${ii}`]).length,
        expanded: false
      }))
  }
}

function getDayData(plan) {
  const templates = {
    skincare: [
      ['早晨温和洁面', '爽肤水轻拍', '保湿乳液涂抹', '晚间卸妆清洁'],
      ['早晨温和洁面', '精华液按摩', '保湿面霜', '晚间卸妆清洁'],
      ['早晨温和洁面', '补水面膜（15min）', '保湿乳液', '晚间卸妆清洁'],
      ['早晨温和洁面', '爽肤水+精华', '防晒隔离', '晚间卸妆清洁'],
      ['早晨温和洁面', '去角质（温和）', '补水面膜', '晚间卸妆清洁'],
      ['早晨温和洁面', '精华液按摩', '保湿面霜', '晚间放松面膜'],
      ['早晨温和洁面', '全流程护理', '记录皮肤状态', '总结本周变化']
    ],
    diet: [
      ['早餐：全麦面包+鸡蛋+牛奶', '午餐：杂粮饭+鸡胸肉+青菜', '晚餐：蔬菜沙拉+鱼肉', '饮水2000ml'],
      ['早餐：燕麦粥+水果', '午餐：藜麦饭+虾仁+西兰花', '晚餐：豆腐汤+杂粮', '饮水2000ml'],
      ['早餐：酸奶+坚果+全麦吐司', '午餐：荞麦面+牛肉+蔬菜', '晚餐：番茄蛋汤+杂粮', '饮水2000ml'],
      ['早餐：鸡蛋羹+红薯', '午餐：糙米饭+三文鱼+菠菜', '晚餐：菌菇汤+蔬菜', '饮水2000ml'],
      ['早餐：牛奶+玉米+鸡蛋', '午餐：全麦三明治+鸡胸肉', '晚餐：紫菜汤+豆腐', '饮水2000ml'],
      ['早餐：水果沙拉+坚果', '午餐：杂粮饭+鱼肉+时蔬', '晚餐：蔬菜汤+杂粮', '饮水2000ml'],
      ['早餐：自由搭配（健康）', '午餐：均衡膳食', '晚餐：清淡饮食', '总结本周饮食']
    ],
    sleep: [
      ['22:30 放下手机', '22:45 轻柔拉伸', '23:00 入睡', '07:30 起床'],
      ['22:15 放下手机', '22:30 阅读放松', '22:45 入睡', '07:15 起床'],
      ['22:00 放下手机', '22:15 冥想放松', '22:30 入睡', '07:00 起床'],
      ['22:00 放下手机', '22:15 温水泡脚', '22:30 入睡', '07:00 起床'],
      ['21:45 放下手机', '22:00 轻柔拉伸', '22:15 入睡', '06:45 起床'],
      ['21:45 放下手机', '22:00 冥想放松', '22:15 入睡', '06:45 起床'],
      ['21:30 放下手机', '21:45 放松准备', '22:00 入睡', '06:30 起床']
    ]
  }
  return templates[plan.type] || null
}

function handleCheckin(task) {
  if (task.checked || !plan.value) return

  doCheckin(plan.value, task.dayIndex, task.itemIndex)

  // 保存到本地
  const stored = uni.getStorageSync('plans') || []
  const idx = stored.findIndex(p => p.id === plan.value.id)
  if (idx >= 0) {
    stored[idx] = plan.value
    uni.setStorageSync('plans', stored)
  }

  refreshTasks()

  uni.showToast({
    title: '打卡成功',
    icon: 'success',
    duration: 1000
  })
}

function toggleDay(index) {
  otherDaysTasks.value[index].expanded = !otherDaysTasks.value[index].expanded
}

function onBack() {
  uni.navigateBack()
}

onMounted(() => {
  loadPlan()
})
</script>

<style scoped>
.plan-detail-page {
  min-height: 100vh;
  background: #f8f9fa;
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

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 32rpx;
  gap: 24rpx;
}
.empty-icon {
  font-size: 80rpx;
}
.empty-text {
  font-size: 30rpx;
  color: #333;
}
.btn-go-back {
  background: #7c3aed;
  color: #fff;
  border-radius: 44rpx;
  font-size: 28rpx;
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 48rpx;
  border: none;
}

/* 计划概览 */
.plan-header {
  background: #fff;
  padding: 24rpx 32rpx 32rpx;
  margin-bottom: 16rpx;
}
.plan-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.plan-type-badge {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}
.plan-status-tag {
  font-size: 22rpx;
  color: #10b981;
  background: #ecfdf5;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}
.plan-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #222;
  display: block;
  margin-bottom: 12rpx;
}
.plan-desc {
  font-size: 26rpx;
  color: #888;
  line-height: 1.6;
  display: block;
  margin-bottom: 24rpx;
}
.plan-progress-section {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
}
.plan-progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}
.plan-progress-label {
  font-size: 26rpx;
  color: #555;
}
.plan-progress-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #222;
}
.plan-progress-bar {
  height: 12rpx;
  background: #e8e8e8;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}
.plan-progress-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}
.plan-meta-row {
  display: flex;
  justify-content: space-between;
}
.plan-meta-text {
  font-size: 22rpx;
  color: #bbb;
}

/* 任务列表 */
.tasks-section {
  padding: 0 32rpx;
  margin-bottom: 16rpx;
}
.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0 20rpx;
}
.tasks-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
}
.tasks-date {
  font-size: 24rpx;
  color: #999;
}
.task-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #fff;
  border-radius: 14rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
  border: 2rpx solid #f0f0f0;
}
.task-item:active {
  transform: scale(0.98);
}
.task-done {
  border-color: #10b98130;
  background: #f0fdf4;
}
.task-item-history {
  margin-bottom: 0;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  padding: 20rpx 0;
}
.task-checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 3rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.task-checkbox-done {
  background: #10b981;
  border-color: #10b981;
}
.task-check-icon {
  font-size: 22rpx;
  color: #fff;
  font-weight: bold;
}
.task-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.task-label {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}
.task-label-done {
  color: #999;
  text-decoration: line-through;
}
.task-time {
  font-size: 22rpx;
  color: #10b981;
  flex-shrink: 0;
}
.tasks-complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 0;
  gap: 12rpx;
}
.tasks-complete-icon {
  font-size: 48rpx;
}
.tasks-complete-text {
  font-size: 28rpx;
  color: #10b981;
  font-weight: 500;
}

/* 历史任务 */
.history-section {
  padding: 0 32rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
  display: block;
  padding: 16rpx 0 20rpx;
}
.history-day {
  background: #fff;
  border-radius: 14rpx;
  margin-bottom: 12rpx;
  overflow: hidden;
}
.history-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
}
.history-day-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}
.history-day-status {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.history-day-count {
  font-size: 24rpx;
  color: #999;
}
.history-day-arrow {
  font-size: 24rpx;
  color: #bbb;
}
.history-day-tasks {
  padding: 0 24rpx 16rpx;
}

/* 底部空间 */
.bottom-spacer {
  height: 48rpx;
}
</style>