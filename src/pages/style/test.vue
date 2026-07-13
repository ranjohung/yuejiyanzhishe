<template>
  <view class="style-test-page">
    <!-- 顶部标题栏：固定高度48px -->
    <view class="top-bar">
      <view class="top-bar-back" @click="onBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="top-bar-title">风格测试</text>
      <text class="top-bar-page" v-if="currentPage < 3">{{ currentPage + 1 }}/3</text>
    </view>

    <!-- 中间可滚动内容区 -->
    <view class="content-scroll">
      <view class="questions-container">
        <view class="question-card" v-for="(q, qi) in currentQuestions" :key="q.id">
          <text class="question-number">Q{{ String(pageStartIndex + qi + 1).padStart(2, '0') }}</text>
          <text class="question-text">{{ q.text }}</text>
          <view class="options-list">
            <view
              v-for="(option, oi) in q.options"
              :key="oi"
              class="option-item"
              :class="{ 'option-selected': answers[q.id] === option.value }"
              @click="selectOption(q.id, option.value)"
            >
              <view class="option-radio">
                <view
                  class="option-radio-dot"
                  :class="{ 'option-radio-dot-active': answers[q.id] === option.value }"
                />
              </view>
              <text class="option-label">{{ option.label }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部固定按钮区：高度60px（含安全区） -->
    <view class="bottom-bar">
      <button class="main-btn" @click="onMainButtonClick">
        {{ mainButtonText }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { questions, calculateStyleResult } from '@/utils/styleTestData.js'

// 每页题目数量：4 + 3 + 3 = 10
const QUESTIONS_PER_PAGE = [4, 3, 3]
const TOTAL_PAGES = QUESTIONS_PER_PAGE.length

const currentPage = ref(0)
const answers = ref({})

// 当前页起始索引
const pageStartIndex = computed(() => {
  let start = 0
  for (let i = 0; i < currentPage.value; i++) {
    start += QUESTIONS_PER_PAGE[i]
  }
  return start
})

// 当前页题目
const currentQuestions = computed(() => {
  const start = pageStartIndex.value
  const count = QUESTIONS_PER_PAGE[currentPage.value]
  return questions.slice(start, start + count)
})

// 底部按钮文案
const mainButtonText = computed(() => {
  if (currentPage.value < TOTAL_PAGES - 1) return '下一题'
  return '查看结果'
})

function selectOption(qId, value) {
  answers.value[qId] = value
}

function onMainButtonClick() {
  if (currentPage.value < TOTAL_PAGES - 1) {
    // 检查当前页所有题目是否已作答
    const unanswered = currentQuestions.value.filter(q => !answers.value[q.id])
    if (unanswered.length > 0) {
      uni.showToast({
        title: '请完成当前页所有题目',
        icon: 'none'
      })
      return
    }
    // 切换到下一页
    currentPage.value++
  } else {
    submitTest()
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
    // 跳转到第一个未回答的题目所在页
    const firstIdx = questions.indexOf(unanswered[0])
    let page = 0
    let count = 0
    for (let i = 0; i < QUESTIONS_PER_PAGE.length; i++) {
      count += QUESTIONS_PER_PAGE[i]
      if (firstIdx < count) {
        page = i
        break
      }
    }
    currentPage.value = page
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
  uni.showModal({
    title: '提示',
    content: '确定退出风格测试吗？已选择的内容将不会被保存。',
    success(res) {
      if (res.confirm) {
        uni.navigateBack()
      }
    }
  })
}
</script>

<style scoped>
.style-test-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #f8f0ff 0%, #fafafa 30%);
}

/* ===== 顶部标题栏：固定高度48px ===== */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: transparent;
  flex-shrink: 0;
  box-sizing: content-box;
}
.top-bar-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  cursor: pointer;
}
.top-bar-back:active {
  background: rgba(0,0,0,0.05);
}
.back-arrow {
  font-size: 22px;
  color: #333;
  line-height: 1;
}
.top-bar-title {
  font-size: 17px;
  font-weight: 600;
  color: #222;
}
.top-bar-page {
  font-size: 14px;
  color: #999;
  min-width: 40px;
  text-align: right;
}

/* ===== 中间可滚动内容区 ===== */
.content-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px;
  padding-bottom: calc(60px + constant(safe-area-inset-bottom) + 60px);
  padding-bottom: calc(60px + env(safe-area-inset-bottom) + 60px);
}
.questions-container {
  padding-bottom: 8px;
}
.question-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24px 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.question-number {
  font-size: 12px;
  color: #7c3aed;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
}
.question-text {
  font-size: 17px;
  font-weight: 600;
  color: #222;
  line-height: 1.5;
  display: block;
  margin-bottom: 16px;
}

/* 选项 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 14rpx;
  padding: 14px 12px;
  border: 1.5px solid #f0f0f0;
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
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.option-radio-dot {
  width: 10px;
  height: 10px;
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
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

/* ===== 底部固定按钮区：高度60px（含安全区） ===== */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60px;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-sizing: content-box;
}
.main-btn {
  width: 80%;
  height: 44px;
  line-height: 44px;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  border: none;
  padding: 0;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
}
.main-btn:active {
  opacity: 0.85;
}
</style>