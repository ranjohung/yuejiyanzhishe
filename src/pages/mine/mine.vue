<template>
  <view class="page">
    <view class="user-card">
      <image class="avatar" src="/static/logo.png" mode="aspectFill" />
      <view class="user-info">
        <text class="nickname">{{ userInfo?.nickname || '颜值探索者' }}</text>
        <text class="level">普通会员</text>
      </view>
      <view class="points-badge">
        <text class="points-num">{{ points }}</text>
        <text class="points-label">积分</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @tap="goAchievement">
        <text class="menu-icon">🏆</text>
        <text class="menu-text">我的成就</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="showVipToast">
        <text class="menu-icon">💎</text>
        <text class="menu-text">开通会员</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goAchievement">
        <text class="menu-icon">📄</text>
        <text class="menu-text">我的报告</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goAchievement">
        <text class="menu-icon">🎁</text>
        <text class="menu-text">邀请好友</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @tap="showVipToast">
        <text class="menu-icon">📑</text>
        <text class="menu-text">隐私协议</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="showVipToast">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <button class="logout-btn" @tap="onLogout">退出登录</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const userInfo = ref<any>(uni.getStorageSync('userInfo'))
const points = ref(9999)

function goAchievement() {
  uni.navigateTo({ url: '/pages/achievement/achievement' })
}
function showVipToast() {
  uni.showToast({ title: '即将上线', icon: 'none' })
}
function onLogout() {
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')
  uni.showToast({ title: '已退出', icon: 'none' })
  // 回到首页（没有登录页就留在首页，下次进入自动 mock login）
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #FFF8F4;
  padding: 32rpx 32rpx 160rpx;
}
.user-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 16rpx rgba(45, 36, 32, 0.05);
}
.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  background: #FFF1EE;
}
.user-info {
  flex: 1;
  .nickname { font-size: 32rpx; font-weight: 700; color: #2D2420; display: block; }
  .level { font-size: 24rpx; color: #C26B5D; margin-top: 8rpx; display: block; }
}
.points-badge {
  text-align: center;
  background: #FFF1EE;
  border-radius: 16rpx;
  padding: 12rpx 24rpx;
  .points-num { font-size: 28rpx; font-weight: 700; color: #C26B5D; display: block; }
  .points-label { font-size: 20rpx; color: #A69989; }
}
.menu-list {
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(45, 36, 32, 0.05);
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 2rpx solid #F8F4EE;
  &:last-child { border-bottom: none; }
}
.menu-icon { font-size: 36rpx; margin-right: 24rpx; }
.menu-text { flex: 1; font-size: 28rpx; color: #2D2420; }
.menu-arrow { font-size: 32rpx; color: #D6C5B3; }
.logout-btn {
  width: 100%;
  margin-top: 48rpx;
  background: transparent;
  color: #A69989;
  font-size: 26rpx;
  border: none;
}
</style>
