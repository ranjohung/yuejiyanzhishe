<template>
  <view class="login-page">
    <view class="login-header">
      <text class="login-title">约肌形象社</text>
      <text class="login-subtitle">发现你的美</text>
    </view>

    <view class="login-form">
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input 
          class="form-input" 
          v-model="phone" 
          type="number" 
          placeholder="请输入手机号"
          placeholder-class="placeholder"
        />
      </view>

      <view class="form-item">
        <text class="form-label">密码</text>
        <input 
          class="form-input" 
          v-model="password" 
          type="password" 
          placeholder="请输入密码"
          placeholder-class="placeholder"
        />
      </view>

      <button class="login-btn" @click="onLogin">登 录</button>
      <button class="register-btn" @click="onRegister">注 册</button>
    </view>

    <view class="login-tip">
      <text class="tip-text">测试账号：任意手机号 + 密码 123456</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const phone = ref('')
const password = ref('')

const onLogin = () => {
  if (!phone.value || !password.value) {
    uni.showToast({
      title: '请输入手机号和密码',
      icon: 'none'
    })
    return
  }

  uni.setStorageSync('token', 'mock-token-' + Date.now())
  uni.reLaunch({
    url: '/pages/tab1/report'
  })
}

const onRegister = () => {
  uni.showToast({
    title: '注册功能开发中',
    icon: 'none'
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #fafafa;
  padding: 80rpx 48rpx;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;
}

.login-title {
  font-size: 56rpx;
  font-weight: 700;
  color: #1f883d;
  display: block;
  margin-bottom: 16rpx;
}

.login-subtitle {
  font-size: 28rpx;
  color: #666;
}

.login-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.placeholder {
  color: #ccc;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: #1f883d;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
  line-height: 88rpx;
  border: none;
  margin-top: 16rpx;
}

.register-btn {
  width: 100%;
  height: 88rpx;
  background: #fff;
  color: #1f883d;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
  line-height: 88rpx;
  border: 2rpx solid #1f883d;
  margin-top: 24rpx;
}

.login-tip {
  text-align: center;
  margin-top: 48rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #999;
}
</style>