<template>
  <view class="style-test-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @click="onBack">
        <text class="nav-back-icon">←</text>
        <text class="nav-back-text">返回</text>
      </view>
      <text class="nav-title">风格测试</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 进度信息 -->
    <view class="progress-section">
      <view class="progress-info">
        <text class="progress-label">第 {{ currentIndex + 1 }} 题</text>
        <text class="progress-count">共 {{ questions.length }} 题</text>
      </view>
      <view class="progress-bar-bg">
        <view
          class="progress-bar-fill"
          :style="{ width: ((currentIndex + 1) / questions.length * 100) + '%' }"
        />
      </view>
    </view>

    <!-- 题目区域 -->
    <view class="question-section" v-if="questions[currentIndex]">
      <view class="question-card">
        <text class="question-number">Q{{ String(currentIndex + 1).padStart(2, '0') }}</text>
        <text class="question-text">{{ questions[currentIndex].text }}</text>
      </view>

      <view class="options-list">
        <view
          v-for="(option, oi) in questions[currentIndex].options"
          :key="oi"
          class="option-item"
          :class="{ 'option-selected': answers[questions[currentIndex].id] === option.value }"
          @click="selectOption(questions[currentIndex].id, option.value)"
        >
          <view class="option-radio">
            <view
              class="option-radio-dot"
              :class="{ 'option-radio-dot-active': answers[questions[currentIndex].id] === option.value }"
            />
          </view>
          <text class="option-label">{{ option.label }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <button
        class="btn btn-prev"
        :class="{ 'btn-disabled': currentIndex === 0 }"
        :disabled="currentIndex === 0"
        @click="prevQuestion"
      >上一题</button>
      <button
        v-if="currentIndex < questions.length - 1"
        class="btn btn-next"
        :class="{ 'btn-disabled': !answers[questions[currentIndex]?.id] }"
        :disabled="!answers[questions[currentIndex]?.id]"
        @click="nextQuestion"
      >下一题</button>
      <button
        v-else
        class="btn btn-submit"
        :class="{ 'btn-disabled': !answers[questions[currentIndex]?.id] }"
        :disabled="!answers[questions[currentIndex]?.id]"
        @click="submitTest"
      >查看结果</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { questions, calculateStyleResult } from '@/utils/styleTestData.js'

const currentIndex = ref(0)
const answers = ref({})

const currentQuestion = computed(() => questions[currentIndex.value])

function selectOption(qId, value) {
  answers.value[qId] = value
}

function nextQuestion() {
  if (currentIndex.value < questions.length - 1) {
    currentIndex.value++
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function submitTest() {
  // 检查是否所有题目都回答了
  const unanswered = questions.filter(q => !answers.value[q.id])
  if (unanswered.length > 0) {
    uni.showToast({
      title: '请完成所有题目',
      icon: 'none'
    })
    // 跳转到第一个未回答的题目
    const firstUnanswered = questions.indexOf(unanswered[0])
    currentIndex.value = firstUnanswered
    return
  }

  // 计算风格结果
  const result = calculateStyleResult(answers.value)

  // 将结果存入本地存储
  uni.setStorageSync('styleTestResult', result)
  uni.setStorageSync('styleTestAnswers', answers.value)

  // 跳转到结果页
  uni.navigateTo({
    url: '/pages/style/result'
  })
}

function onBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.style-test-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f0ff 0%, #fafafa 30%);
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 88rpx 32rpx 16rpx;
  background: transparent;
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

/* 进度 */
.progress-section {
  padding: 24rpx 32rpx 32rpx;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.progress-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #7c3aed;
}
.progress-count {
  font-size: 24rpx;
  color: #999;
}
.progress-bar-bg {
  height: 8rpx;
  background: #e8e0f0;
  border-radius: 4rpx;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

/* 题目 */
.question-section {
  flex: 1;
  padding: 0 32rpx;
}
.question-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.question-number {
  font-size: 24rpx;
  color: #7c3aed;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}
.question-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
  line-height: 1.5;
  display: block;
}

/* 选项 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.option-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #fff;
  border-radius: 14rpx;
  padding: 28rpx 24rpx;
  border: 2rpx solid #f0f0f0;
  transition: all 0.2s ease;
}
.option-item:active {
  transform: scale(0.98);
}
.option-selected {
  border-color: #7c3aed;
  background: #f5f0ff;
}
.option-radio {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 3rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.option-radio-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: transparent;
  transition: all 0.2s ease;
}
.option-radio-dot-active {
  background: #7c3aed;
}
.option-selected .option-radio {
  border-color: #7c3aed;
}
.option-label {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
}

/* 底部操作栏 */
.action-bar {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx 200rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}
.btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 500;
  text-align: center;
  border: none;
  padding: 0;
}
.btn-prev {
  background: #f5f0ff;
  color: #7c3aed;
}
.btn-next {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
}
.btn-submit {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
}
.btn-disabled {
  opacity: 0.4;
}
</style>