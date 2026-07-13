<template>
  <view class="questionnaire-modal" v-if="visible">
    <view class="modal-mask" @click="handleClose" />
    <view class="modal-content">
      <view class="modal-header">
        <view class="header-icon">📋</view>
        <text class="header-title">报告生成前小问卷</text>
        <view class="close-btn" @click="handleClose">
          <text class="close-icon">×</text>
        </view>
      </view>

      <view class="modal-body">
        <text class="intro-text">为了让报告更像「今天真的能用的方案」，请快速告诉我们你的场景、风格和状态。</text>

        <view class="question-section">
          <view class="section-title">
            <text class="title-icon">📍</text>
            <text class="title-text">今天主要要去做什么？</text>
          </view>
          <text class="question-hint">选择最接近的一个场景</text>
          <view class="option-grid">
            <view
              v-for="option in sceneOptions"
              :key="option.value"
              class="option-item"
              :class="{ 'option-item-active': formData.scene === option.value }"
              @click="selectOption('scene', option.value)"
            >
              <text class="option-text">{{ option.label }}</text>
            </view>
          </view>
        </view>

        <view class="question-section">
          <view class="section-title">
            <text class="title-icon">✨</text>
            <text class="title-text">想要什么穿搭风格？</text>
          </view>
          <view class="option-grid">
            <view
              v-for="option in styleOptions"
              :key="option.value"
              class="option-item"
              :class="{ 'option-item-active': formData.style === option.value }"
              @click="selectOption('style', option.value)"
            >
              <text class="option-text">{{ option.label }}</text>
            </view>
          </view>
        </view>

        <view class="question-section">
          <view class="section-title">
            <text class="title-icon">💧</text>
            <text class="title-text">皮肤与身体状态</text>
          </view>
          
          <view class="sub-question">
            <text class="question-hint">今天皮肤状态更像？</text>
            <view class="option-grid">
              <view
                v-for="option in skinOptions"
                :key="option.value"
                class="option-item"
                :class="{ 'option-item-active': formData.skin === option.value }"
                @click="selectOption('skin', option.value)"
              >
                <text class="option-text">{{ option.label }}</text>
              </view>
            </view>
          </view>

          <view class="sub-question">
            <text class="question-hint">接下来的身体目标？</text>
            <view class="option-grid">
              <view
                v-for="option in bodyOptions"
                :key="option.value"
                class="option-item"
                :class="{ 'option-item-active': formData.body === option.value }"
                @click="selectOption('body', option.value)"
              >
                <text class="option-text">{{ option.label }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="modal-footer">
        <button 
          class="submit-btn" 
          :class="{ 'submit-btn-disabled': !isValid }"
          @click="handleSubmit"
        >
          <text class="submit-text">生成我的专属报告</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = reactive({
  scene: '',
  style: '',
  skin: '',
  body: ''
})

const sceneOptions = [
  { label: '通勤', value: 'commute' },
  { label: '约会', value: 'date' },
  { label: '面试', value: 'interview' },
  { label: '出游', value: 'travel' }
]

const styleOptions = [
  { label: '温柔知性', value: 'gentle' },
  { label: '轻松休闲', value: 'casual' },
  { label: '精致轻熟', value: 'elegant' }
]

const skinOptions = [
  { label: '偏干缺水', value: 'dry' },
  { label: '出油暗沉', value: 'oily' },
  { label: '敏感泛红', value: 'sensitive' }
]

const bodyOptions = [
  { label: '轻盈减脂', value: 'lose_weight' },
  { label: '体态塑形', value: 'shape' },
  { label: '维持活力', value: 'maintain' }
]

const isValid = computed(() => {
  return formData.scene && formData.style && formData.skin && formData.body
})

function selectOption(field, value) {
  formData[field] = value
}

function handleClose() {
  emit('close')
}

function handleSubmit() {
  if (!isValid.value) {
    uni.showToast({
      title: '请完成所有选项',
      icon: 'none'
    })
    return
  }
  emit('submit', { ...formData })
}
</script>

<style scoped>
.questionnaire-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 100%;
  max-height: 85vh;
  background: #FAF8F5;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #F0E6D2;
  position: relative;
}

.header-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #5c4f4e;
}

.close-btn {
  position: absolute;
  right: 32rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #F5F0EB;
}

.close-icon {
  font-size: 32rpx;
  color: #8B7B6B;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 32rpx;
}

.intro-text {
  font-size: 26rpx;
  color: #8B7B6B;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.question-section {
  margin-bottom: 32rpx;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.title-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #5c4f4e;
}

.question-hint {
  font-size: 22rpx;
  color: #D6C5B3;
  margin-bottom: 16rpx;
  display: block;
}

.sub-question {
  margin-bottom: 24rpx;
}

.sub-question:last-child {
  margin-bottom: 0;
}

.option-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-item {
  padding: 16rpx 28rpx;
  background: #fff;
  border: 2rpx solid #F0E6D2;
  border-radius: 32rpx;
  transition: all 0.3s ease;
}

.option-item-active {
  background: #FFF1EE;
  border-color: #E59A8F;
}

.option-text {
  font-size: 24rpx;
  color: #5c4f4e;
}

.option-item-active .option-text {
  color: #C26B5D;
}

.modal-footer {
  padding: 24rpx 32rpx 48rpx;
  border-top: 1rpx solid #F0E6D2;
  background: #FAF8F5;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #E59A8F, #C26B5D);
  color: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
}

.submit-btn-disabled {
  background: #D6C5B3;
}

.submit-text {
  font-size: 30rpx;
  font-weight: 600;
}
</style>
