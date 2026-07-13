<template>
  <view class="style-result-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @click="onBack">
        <text class="nav-back-icon">←</text>
        <text class="nav-back-text">返回</text>
      </view>
      <text class="nav-title">测试结果</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 结果为空 -->
    <view class="empty-state" v-if="!result">
      <text class="empty-icon">📝</text>
      <text class="empty-text">还没有测试结果</text>
      <button class="btn-go-test" @click="goTest">去测试</button>
    </view>

    <!-- 结果内容 -->
    <template v-else>
      <!-- 结果头部 -->
      <view class="result-header">
        <view class="result-badge">
          <text class="result-badge-icon">{{ result.icons[0] }}</text>
        </view>
        <text class="result-title">你的风格是</text>
        <text class="result-style">{{ result.label }}</text>
        <view class="result-tags">
          <text class="result-tag" v-for="tag in result.tags" :key="tag">{{ tag }}</text>
        </view>
      </view>

      <!-- 风格描述 -->
      <view class="result-section">
        <view class="section-header">
          <text class="section-icon">💫</text>
          <text class="section-title">风格解读</text>
        </view>
        <text class="section-content">{{ result.description }}</text>
      </view>

      <!-- 推荐色系 -->
      <view class="result-section">
        <view class="section-header">
          <text class="section-icon">🎨</text>
          <text class="section-title">推荐色系</text>
        </view>
        <view class="color-list">
          <view
            v-for="(color, ci) in result.colors"
            :key="ci"
            class="color-item"
            :style="getColorStyle(color)"
          >
            <text class="color-label">{{ color }}</text>
          </view>
        </view>
      </view>

      <!-- 分数雷达 -->
      <view class="result-section">
        <view class="section-header">
          <text class="section-icon">📊</text>
          <text class="section-title">风格维度分布</text>
        </view>
        <view class="scores-list">
          <view
            v-for="([tag, score], si) in sortedScores"
            :key="si"
            class="score-item"
          >
            <view class="score-header">
              <text class="score-tag">{{ tag }}</text>
              <text class="score-value">{{ score }}分</text>
            </view>
            <view class="score-bar-bg">
              <view
                class="score-bar-fill"
                :style="{ width: (score / maxScore * 100) + '%' }"
                :class="'score-bar-' + tag"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="action-bar">
        <button class="btn btn-to-outfit" @click="goToOutfit">查看适合我的穿搭</button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const result = ref(null)

onMounted(() => {
  const stored = uni.getStorageSync('styleTestResult')
  if (stored) {
    result.value = stored
  }
})

const sortedScores = computed(() => {
  if (!result.value?.scores) return []
  return Object.entries(result.value.scores)
    .sort((a, b) => b[1] - a[1])
})

const maxScore = computed(() => {
  if (!sortedScores.value.length) return 1
  return sortedScores.value[0][1]
})

function getColorStyle(color) {
  const colorMap = {
    '粉色': '#f8b4d9',
    '浅紫': '#d4b8f0',
    '暖白': '#fdf5e6',
    '米色': '#f5e6d3',
    '驼色': '#c4a882',
    '深蓝': '#1a3a5c',
    '黑色': '#333333',
    '白色': '#f5f5f5',
    '灰色': '#999999',
    '米白': '#faf0e6',
    '卡其': '#c3b091',
    '豆绿': '#9bba7a',
    '亮色': '#ff6b6b',
    '金属色': '#d4af37',
    '撞色': '#ff8c00',
    '暖粉': '#ffb6c1',
    '浅咖': '#a67b5b'
  }
  return {
    background: colorMap[color] || '#e0e0e0',
    color: ['黑色', '深蓝', '驼色', '卡其', '浅咖', '金属色'].includes(color) ? '#fff' : '#333'
  }
}

function onBack() {
  uni.navigateBack()
}

function goToOutfit() {
  // 跳转到姿造美学穿搭子模块
  uni.navigateTo({
    url: '/pages/tab1/report?section=outfit'
  })
}

function goTest() {
  uni.redirectTo({
    url: '/pages/style/test'
  })
}
</script>

<style scoped>
.style-result-page {
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

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding: 32rpx;
}
.empty-icon {
  font-size: 80rpx;
}
.empty-text {
  font-size: 28rpx;
  color: #999;
}
.btn-go-test {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  border-radius: 44rpx;
  font-size: 28rpx;
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 48rpx;
  border: none;
}

/* 结果头部 */
.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 32rpx 40rpx;
}
.result-badge {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, #7c3aed20, #a855f720);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}
.result-badge-icon {
  font-size: 56rpx;
}
.result-title {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 12rpx;
}
.result-style {
  font-size: 48rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 24rpx;
}
.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  justify-content: center;
}
.result-tag {
  font-size: 22rpx;
  color: #7c3aed;
  background: #f5f0ff;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
}

/* 通用区块 */
.result-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin: 0 32rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}
.section-icon {
  font-size: 32rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
}
.section-content {
  font-size: 26rpx;
  color: #555;
  line-height: 1.8;
  display: block;
  white-space: pre-wrap;
}

/* 颜色列表 */
.color-list {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}
.color-item {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}

/* 分数列表 */
.scores-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.score-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.score-tag {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}
.score-value {
  font-size: 22rpx;
  color: #999;
}
.score-bar-bg {
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}
.score-bar-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.5s ease;
}
.score-bar-甜美 { background: #f472b6; }
.score-bar-浪漫 { background: #c084fc; }
.score-bar-优雅 { background: #818cf8; }
.score-bar-干练 { background: #64748b; }
.score-bar-简约 { background: #94a3b8; }
.score-bar-自然 { background: #4ade80; }
.score-bar-休闲 { background: #a3e635; }
.score-bar-温柔 { background: #fbbf24; }
.score-bar-冷艳 { background: #a78bfa; }
.score-bar-个性 { background: #fb7185; }
.score-bar-潮流 { background: #f97316; }

/* 底部操作 */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 32rpx 200rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  margin-top: 8rpx;
}
.btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 500;
  text-align: center;
  border: none;
  padding: 0;
}
.btn-to-outfit {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  max-width: 80%;
}
</style>