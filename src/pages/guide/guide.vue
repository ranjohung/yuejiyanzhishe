<template>
  <view class="guide-page">
    <swiper 
      class="guide-swiper" 
      :current="currentPage" 
      @change="onSwiperChange"
      circular="false"
    >
      <swiper-item v-for="(page, index) in guidePages" :key="index">
        <view class="guide-content">
          <image class="guide-image" :src="page.image" mode="aspectFill" />
        </view>
      </swiper-item>
    </swiper>

    <view class="guide-footer">
      <view class="dots-container">
        <view 
          v-for="(_, index) in guidePages" 
          :key="index"
          class="dot-wrapper"
          @click="jumpToPage(index)"
        >
          <view class="dot" :class="{ active: currentPage === index }"></view>
        </view>
      </view>

      <view v-if="currentPage === guidePages.length - 1" class="btn-container">
        <button class="start-btn" @click="onStart">开始使用</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentPage = ref(0)

const guidePages = [
  {
    image: 'https://aimeizhuang.libaodong4571.cn/onboarding/1.png'
  },
  {
    image: 'https://aimeizhuang.libaodong4571.cn/onboarding/2.png'
  },
  {
    image: 'https://aimeizhuang.libaodong4571.cn/onboarding/3.png'
  },
  {
    image: 'https://aimeizhuang.libaodong4571.cn/onboarding/4.png'
  }
]

const onSwiperChange = (e) => {
  currentPage.value = e.detail.current
}

const jumpToPage = (index) => {
  currentPage.value = index
}

const onStart = () => {
  uni.setStorageSync('guideShown', 'true')
  uni.redirectTo({
    url: '/pages/login/login'
  })
}

onMounted(() => {
  const token = uni.getStorageSync('token')
  const guideShown = uni.getStorageSync('guideShown')
  
  if (token) {
    uni.reLaunch({
      url: '/pages/tab1/report'
    })
  } else if (guideShown) {
    uni.redirectTo({
      url: '/pages/login/login'
    })
  }
})
</script>

<style scoped>
.guide-page {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #fff;
}

.guide-swiper {
  width: 100%;
  height: 100%;
}

.guide-content {
  width: 100%;
  height: 100%;
}

.guide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.guide-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx 0 60rpx;
  background: linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0));
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.dots-container {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.dot-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ddd;
  border: 2rpx solid #ddd;
  transition: all 0.3s ease;
}

.dot.active {
  width: 12rpx;
  height: 12rpx;
  background: #C26B5D;
  border-color: #C26B5D;
}

.btn-container {
  width: 60%;
}

.start-btn {
  width: 100%;
  height: 88rpx;
  background: #C26B5D;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
  line-height: 88rpx;
  border: none;
}
</style>