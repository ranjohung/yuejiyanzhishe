<template>
  <view class="consultant-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @click="onBack">
        <text class="nav-back-icon">←</text>
        <text class="nav-back-text">返回</text>
      </view>
      <view class="nav-center">
        <text class="nav-title">AI变美顾问</text>
        <text class="nav-subtitle" :class="{ 'nav-limit-low': remaining <= 1 }">
          今日剩余 {{ remaining }} / {{ dailyLimit }} 次
        </text>
      </view>
      <view class="nav-action" @click="showHistory = !showHistory">
        <text class="nav-action-icon">☰</text>
      </view>
    </view>

    <!-- 合规声明横幅 -->
    <view class="disclaimer-banner">
      <text class="disclaimer-text">AI顾问回答仅供参考，不能替代专业医疗建议</text>
    </view>

    <!-- 对话列表侧栏 -->
    <view class="history-overlay" v-if="showHistory" @click="showHistory = false" />
    <view class="history-sidebar" :class="{ 'history-sidebar-open': showHistory }">
      <view class="history-header">
        <text class="history-title">对话记录</text>
        <button class="history-new-btn" @click="createNewConversation">+ 新对话</button>
      </view>
      <scroll-view class="history-list" scroll-y>
        <view
          v-for="conv in conversations"
          :key="conv.id"
          class="history-item"
          :class="{ 'history-item-active': conv.id === currentConvId }"
          @click="switchConversation(conv.id)"
        >
          <text class="history-item-title">{{ conv.title || '新对话' }}</text>
          <text class="history-item-time">{{ formatTime(conv.updatedAt) }}</text>
        </view>
        <view class="history-empty" v-if="conversations.length === 0">
          <text class="history-empty-text">暂无对话记录</text>
        </view>
      </scroll-view>
    </view>

    <!-- 聊天区域 -->
    <scroll-view
      class="chat-area"
      scroll-y
      :scroll-into-view="scrollToId"
      scroll-with-animation
      @scrolltoupper="loadMore"
    >
      <!-- 空状态 -->
      <view class="chat-empty" v-if="messages.length === 0">
        <view class="chat-empty-icon">🤖</view>
        <text class="chat-empty-title">你好！我是你的AI变美顾问</text>
        <text class="chat-empty-desc">我可以帮你解答关于护肤、美妆、穿搭、发型等方面的问题，提供个性化的变美建议。</text>
        <view class="chat-suggestions">
          <view
            v-for="(suggestion, si) in suggestions"
            :key="si"
            class="suggestion-chip"
            @click="sendSuggestion(suggestion)"
          >
            <text>{{ suggestion }}</text>
          </view>
        </view>
      </view>

      <!-- 消息列表 -->
      <view
        v-for="(msg, mi) in messages"
        :key="msg.id"
        :id="'msg-' + msg.id"
        class="message-wrapper"
        :class="'message-' + msg.role"
      >
        <view class="message-avatar" v-if="msg.role === 'assistant'">
          <text class="message-avatar-text">🤖</text>
        </view>
        <view class="message-bubble" :class="'bubble-' + msg.role">
          <text class="message-text">{{ msg.content }}</text>
          <text class="message-time">{{ formatTime(msg.createdAt) }}</text>
        </view>
      </view>

      <!-- 正在输入 -->
      <view class="message-wrapper message-assistant" v-if="isLoading">
        <view class="message-avatar">
          <text class="message-avatar-text">🤖</text>
        </view>
        <view class="message-bubble bubble-assistant">
          <view class="typing-indicator">
            <view class="typing-dot" />
            <view class="typing-dot" />
            <view class="typing-dot" />
          </view>
        </view>
      </view>

      <view id="scroll-bottom" />
    </scroll-view>

    <!-- 次数用完提示 -->
    <view class="limit-banner" v-if="remaining <= 0 && !isLoading">
      <text class="limit-banner-text">{{ limitMessages.exhausted }}</text>
    </view>

    <!-- 输入区域 -->
    <view class="input-bar" v-if="remaining > 0 || isLoading">
      <view class="input-wrapper">
        <input
          v-model="inputText"
          class="input-field"
          type="text"
          placeholder="输入你的变美问题..."
          :disabled="isLoading"
          @confirm="sendMessage"
          confirm-type="send"
        />
      </view>
      <button
        class="send-btn"
        :class="{ 'send-btn-disabled': !inputText.trim() || isLoading }"
        :disabled="!inputText.trim() || isLoading"
        @click="sendMessage"
      >
        <text class="send-btn-text">发送</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  generateAnswer,
  getDailyRemaining,
  recordDailyUsage,
  generateTitle,
  DAILY_LIMIT,
  LIMIT_MESSAGES
} from '@/utils/aiConsultant.js'

// 状态
const inputText = ref('')
const messages = ref([])
const conversations = ref([])
const currentConvId = ref(null)
const showHistory = ref(false)
const isLoading = ref(false)
const scrollToId = ref('scroll-bottom')
const remaining = ref(DAILY_LIMIT)
const dailyLimit = ref(DAILY_LIMIT)
const limitMessages = ref(LIMIT_MESSAGES)

// 快捷提问
const suggestions = [
  '我的皮肤比较干，应该怎么护肤？',
  '圆脸适合什么发型？',
  '日常通勤穿搭有什么建议？',
  '如何选择适合自己肤质的粉底？'
]

// 格式化时间
function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  if (isToday) return `${h}:${m}`
  const M = String(date.getMonth() + 1).padStart(2, '0')
  const D = String(date.getDate()).padStart(2, '0')
  return `${M}/${D} ${h}:${m}`
}

// 生成唯一ID
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    scrollToId.value = 'scroll-bottom'
  })
}

// 发送快捷提问
function sendSuggestion(text) {
  inputText.value = text
  sendMessage()
}

// 发送消息
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value || remaining.value <= 0) return

  inputText.value = ''

  // 添加用户消息
  const userMsg = {
    id: genId(),
    role: 'user',
    content: text,
    createdAt: new Date().toISOString()
  }
  messages.value.push(userMsg)
  scrollToBottom()

  // 如果没有当前对话，创建一个
  if (!currentConvId.value) {
    currentConvId.value = genId()
    conversations.value.unshift({
      id: currentConvId.value,
      title: generateTitle(text),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  // 记录使用次数
  recordDailyUsage()
  remaining.value = getDailyRemaining()

  // 模拟AI回答
  isLoading.value = true
  scrollToBottom()

  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

  const answer = generateAnswer(text)
  const assistantMsg = {
    id: genId(),
    role: 'assistant',
    content: answer,
    createdAt: new Date().toISOString()
  }
  messages.value.push(assistantMsg)
  isLoading.value = false
  scrollToBottom()
}

// 切换对话
function switchConversation(id) {
  showHistory.value = false
  // V1 本地模拟：切换时清空当前对话
  currentConvId.value = id
  messages.value = []
}

// 创建新对话
function createNewConversation() {
  showHistory.value = false
  currentConvId.value = null
  messages.value = []
}

// 加载更多历史（V1 暂不实现）
function loadMore() {}

// 返回
function onBack() {
  uni.navigateBack()
}

// 初始化
onMounted(() => {
  remaining.value = getDailyRemaining()
})
</script>

<style scoped>
.consultant-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  position: relative;
  overflow: hidden;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 88rpx 32rpx 16rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
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
.nav-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}
.nav-subtitle {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}
.nav-limit-low {
  color: #e74c3c;
}
.nav-action {
  padding: 8rpx;
}
.nav-action-icon {
  font-size: 36rpx;
  color: #333;
}

/* 合规声明 */
.disclaimer-banner {
  background: #fff8e1;
  padding: 12rpx 32rpx;
  text-align: center;
  flex-shrink: 0;
}
.disclaimer-text {
  font-size: 22rpx;
  color: #b8860b;
}

/* 对话列表侧栏 */
.history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 90;
}
.history-sidebar {
  position: fixed;
  top: 0;
  right: -500rpx;
  width: 460rpx;
  height: 100%;
  background: #fff;
  z-index: 100;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}
.history-sidebar-open {
  right: 0;
}
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 100rpx 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.history-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
}
.history-new-btn {
  font-size: 24rpx;
  color: #7c3aed;
  background: #f5f0ff;
  border: none;
  border-radius: 8rpx;
  padding: 8rpx 20rpx;
  line-height: 1.5;
  height: auto;
}
.history-list {
  flex: 1;
  padding: 16rpx;
}
.history-item {
  padding: 24rpx 16rpx;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  border: 1rpx solid transparent;
}
.history-item-active {
  background: #f5f0ff;
  border-color: #7c3aed40;
}
.history-item-title {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.history-item-time {
  font-size: 20rpx;
  color: #bbb;
  display: block;
}
.history-empty {
  padding: 60rpx 0;
  text-align: center;
}
.history-empty-text {
  font-size: 24rpx;
  color: #ccc;
}

/* 聊天区域 */
.chat-area {
  flex: 1;
  padding: 24rpx 32rpx;
  overflow-y: auto;
}

/* 空状态 */
.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 16rpx 40rpx;
}
.chat-empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}
.chat-empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 16rpx;
}
.chat-empty-desc {
  font-size: 26rpx;
  color: #888;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 32rpx;
}
.chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: center;
}
.suggestion-chip {
  background: #fff;
  border: 1rpx solid #e0e0e0;
  border-radius: 36rpx;
  padding: 16rpx 28rpx;
  font-size: 24rpx;
  color: #555;
}
.suggestion-chip:active {
  background: #f5f0ff;
  border-color: #7c3aed;
}

/* 消息 */
.message-wrapper {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
  align-items: flex-start;
}
.message-user {
  flex-direction: row-reverse;
}
.message-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.message-avatar-text {
  font-size: 32rpx;
}
.message-bubble {
  max-width: 70%;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  position: relative;
}
.bubble-user {
  background: #7c3aed;
  color: #fff;
  border-bottom-right-radius: 4rpx;
}
.bubble-assistant {
  background: #fff;
  color: #333;
  border-bottom-left-radius: 4rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}
.message-text {
  font-size: 28rpx;
  line-height: 1.7;
  white-space: pre-wrap;
  display: block;
}
.message-time {
  font-size: 20rpx;
  color: rgba(0, 0, 0, 0.25);
  margin-top: 8rpx;
  display: block;
  text-align: right;
}
.bubble-user .message-time {
  color: rgba(255, 255, 255, 0.6);
}

/* 正在输入 */
.typing-indicator {
  display: flex;
  gap: 8rpx;
  align-items: center;
  padding: 8rpx 0;
}
.typing-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #ccc;
  animation: typingBounce 1.4s ease-in-out infinite;
}
.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-12rpx); opacity: 1; }
}

/* 次数用完提示 */
.limit-banner {
  background: #fff3e0;
  padding: 16rpx 32rpx;
  text-align: center;
  flex-shrink: 0;
}
.limit-banner-text {
  font-size: 24rpx;
  color: #e65100;
}

/* 输入区域 */
.input-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 32rpx 48rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}
.input-wrapper {
  flex: 1;
  background: #f5f5f5;
  border-radius: 44rpx;
  padding: 0 24rpx;
}
.input-field {
  height: 72rpx;
  font-size: 28rpx;
  color: #333;
  width: 100%;
}
.send-btn {
  width: 120rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  border-radius: 36rpx;
  font-size: 28rpx;
  font-weight: 500;
  text-align: center;
  border: none;
  padding: 0;
  flex-shrink: 0;
}
.send-btn-disabled {
  opacity: 0.4;
}
.send-btn-text {
  color: #fff;
}
</style>