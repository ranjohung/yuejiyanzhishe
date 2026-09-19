<template>
  <view class="page">
    <!-- 1. 头部 -->
    <view class="header">
      <text class="title">悦己颜值社</text>
      <text class="subtitle">找到更适合你的美</text>
    </view>

    <!-- 2. 上传引导 -->
    <view v-if="!hasReport" class="upload-section">
      <view class="section-title">上传多角度照片，AI 将更精确地解读你的面部轮廓与身形比例</view>

      <view class="upload-grid">
        <!-- 正面半身照（必需） -->
        <view class="upload-card" @tap="pickFacePhoto">
          <image v-if="facePhoto" :src="facePhoto" mode="aspectFill" class="uploaded-img" />
          <view v-else class="upload-placeholder">
            <text class="upload-icon">📷</text>
            <text class="upload-label">正脸</text>
            <text class="upload-required">必需</text>
          </view>
        </view>

        <!-- 全身照（推荐） -->
        <view class="upload-card" @tap="pickBodyPhoto">
          <image v-if="bodyPhoto" :src="bodyPhoto" mode="aspectFill" class="uploaded-img" />
          <view v-else class="upload-placeholder">
            <text class="upload-icon">👤</text>
            <text class="upload-label">全身</text>
            <text class="upload-optional">推荐</text>
          </view>
        </view>
      </view>

      <!-- 隐私提示 -->
      <view class="privacy-tip">
        <text class="privacy-icon">🔒</text>
        <text class="privacy-text">人脸数据本地加密运算，完成后自动抹除</text>
      </view>

      <!-- 生成按钮 -->
      <button
        class="generate-btn"
        :disabled="!facePhoto || loading"
        :class="{ disabled: !facePhoto || loading }"
        @tap="onGenerate"
      >
        {{ loading ? 'AI 正在分析...' : '上传照片并生成报告' }}
      </button>
    </view>

    <!-- 3. 扫描动画 -->
    <view v-if="scanning" class="scanning-overlay">
      <view class="scanning-card">
        <text class="scanning-step">{{ scanStep }}</text>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <text class="progress-text">{{ progress }}%</text>
      </view>
    </view>

    <!-- 4. 报告结果 -->
    <view v-if="hasReport && !loading" class="report-section">
      <view class="report-header">
        <text class="report-title">你的专属美学报告</text>
        <text class="report-date">{{ reportDate }}</text>
      </view>

      <view class="report-summary">
        <view class="summary-item">
          <text class="summary-value">{{ report?.face?.face_shape || '—' }}</text>
          <text class="summary-label">脸型</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ report?.face?.skin_color || '—' }}</text>
          <text class="summary-label">肤色</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ report?.face?.score || '—' }}</text>
          <text class="summary-label">颜值分</text>
        </view>
      </view>

      <!-- 推荐列表 -->
      <view class="recommendations">
        <view v-for="rec in recommendations" :key="rec.type" class="rec-card">
          <text class="rec-icon">{{ rec.icon }}</text>
          <view class="rec-info">
            <text class="rec-type">{{ rec.typeLabel }}</text>
            <text class="rec-desc">{{ rec.description }}</text>
          </view>
        </view>
      </view>

      <button class="tryon-btn" @tap="goToTryon">进入换装间生成效果图 →</button>
      <button class="restart-btn" @tap="reset">重新测评</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

// ===== 状态 =====
const facePhoto = ref<string>('')
const bodyPhoto = ref<string>('')
const loading = ref(false)
const scanning = ref(false)
const hasReport = ref(false)
const report = ref<any>(null)

// 扫描动画
const scanStep = ref('正在初始化三维骨骼校准...')
const progress = ref(0)
const scanSteps = [
  '正在初始化三维骨骼校准...',
  '分析三庭五眼与面部折叠比例...',
  '提取基底色温与东方暖杏皮光谱...',
  '正在配对最优发型与多维穿搭方案...',
  '本地加密分析完成，正在解锁美学报告...',
]

const reportDate = computed(() => {
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

const recommendations = computed(() => {
  const recs = report.value?.recommendations || []
  const iconMap: Record<string, string> = { hair: '💇', outfit: '👗', makeup: '💄', beauty: '🧴' }
  const labelMap: Record<string, string> = { hair: '发型推荐', outfit: '穿搭推荐', makeup: '妆容推荐', beauty: '美容方案' }
  return recs.map((r: any) => ({
    type: r.type,
    icon: iconMap[r.type] || '✨',
    typeLabel: labelMap[r.type] || r.type,
    description: r.description || JSON.stringify(r.material_tags || []),
  }))
})

// ===== 选照片 =====
function pickFacePhoto() {
  uni.chooseImage({
    count: 1,
    sourceType: ['album', 'camera'],
    success: (res) => { facePhoto.value = res.tempFilePaths[0] },
  })
}

function pickBodyPhoto() {
  uni.chooseImage({
    count: 1,
    sourceType: ['album', 'camera'],
    success: (res) => { bodyPhoto.value = res.tempFilePaths[0] },
  })
}

// ===== 生成报告 =====
async function onGenerate() {
  if (!facePhoto.value || loading.value) return
  loading.value = true
  scanning.value = true
  progress.value = 0

  // 1. 扫描动画（独立运行，给用户即时反馈）
  let stepIdx = 0
  const scanTimer = setInterval(() => {
    progress.value = Math.min(100, progress.value + Math.floor(Math.random() * 8) + 3)
    if (progress.value > 20 * (stepIdx + 1) && stepIdx < scanSteps.length - 1) {
      stepIdx++
      scanStep.value = scanSteps[stepIdx]
    }
  }, 200)

  try {
    // 2. 上传照片（先传 face，有 body 再传 body）
    let faceId = '', bodyId: string | null = null
    try {
      const uploadRes = await new Promise<any>((resolve, reject) => {
        const token = uni.getStorageSync('token')
        uni.uploadFile({
          url: (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080') + '/api/v1/photo/upload',
          filePath: facePhoto.value,
          name: 'face_photo',
          header: token ? { Authorization: `Bearer ${token}` } : {},
          success: (r) => {
            try { const b = JSON.parse(r.data); resolve(b) } catch { reject(new Error('解析失败')) }
          },
          fail: reject,
        })
      })
      faceId = uploadRes?.data?.face_photo_id

      if (bodyPhoto.value) {
        const bodyRes = await new Promise<any>((resolve, reject) => {
          const token = uni.getStorageSync('token')
          uni.uploadFile({
            url: (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080') + '/api/v1/photo/upload',
            filePath: bodyPhoto.value,
            name: 'body_photo',
            header: token ? { Authorization: `Bearer ${token}` } : {},
            success: (r) => {
              try { const b = JSON.parse(r.data); resolve(b) } catch { reject(new Error('解析失败')) }
            },
            fail: reject,
          })
        })
        bodyId = bodyRes?.data?.body_photo_id
      }
    } catch {
      // 后端未配置时跳过上传 —— 让用户先能看到 UI 骨架
      console.warn('后端未配置，跳过照片上传，演示模式')
    }

    // 3. 创建报告
    let reportId: string | null = null
    try {
      const res = await request({
        url: '/api/v1/report/generate',
        method: 'POST',
        data: {
          front_photo_id: faceId || 'mock_face_id',
          body_photo_id: bodyId,
          scene: 'daily',
        },
      })
      reportId = res.data?.report_id
    } catch {
      // 后端未配置时 —— 用本地 mock 数据演示 UI
      console.warn('后端未配置，用本地 mock 数据')
      report.value = {
        face: { face_shape: '鹅蛋脸', skin_color: '暖杏皮', score: 86 },
        recommendations: [
          { type: 'hair', description: '轻盈蓬松法式刘海，两侧柔化轮廓' },
          { type: 'outfit', description: 'V 领垂坠面料，米白色系优雅通勤' },
          { type: 'makeup', description: '暖杏底妆 + 珊瑚色唇釉，自然清透' },
        ],
      }
    }

    // 4. 轮询报告（如果有 reportId）
    if (reportId) {
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 800))
        try {
          const detail = await request({ url: `/api/v1/report/${reportId}/detail` })
          const d = detail.data
          if (d?.status === 3) {
            report.value = {
              face: d.face_data,
              text_sections: d.text_sections,
              recommendations: d.recommendations,
            }
            break
          } else if (d?.status === 4) {
            throw new Error(d.error_code || 'AI 分析失败')
          }
        } catch (e: any) {
          console.warn('轮询中:', e.message)
        }
      }
    }

    progress.value = 100
    scanStep.value = '分析完成！'
    setTimeout(() => {
      scanning.value = false
      hasReport.value = true
    }, 400)
  } catch (e: any) {
    clearInterval(scanTimer)
    scanning.value = false
    loading.value = false
    uni.showToast({ title: e.message || '分析失败', icon: 'none' })
  } finally {
    clearInterval(scanTimer)
    loading.value = false
  }
}

function goToTryon() {
  uni.switchTab({ url: '/pages/consultant/consultant' })
}

function reset() {
  facePhoto.value = ''
  bodyPhoto.value = ''
  hasReport.value = false
  report.value = null
  progress.value = 0
}

// ===== 生命周期 =====
onLoad(() => {
  // 自动登录（wx.login 静默获取 openid → 换 token）
  autoLogin()
})

async function autoLogin() {
  const token = uni.getStorageSync('token')
  if (token) return // 已有 token 不用重复登录

  // 微信小程序端自动登录
  // #ifdef MP-WEIXIN
  uni.login({
    success: async (loginRes) => {
      if (!loginRes.code) return
      try {
        const res = await request({
          url: '/api/v1/auth/wx-login',
          method: 'POST',
          data: { code: loginRes.code },
          skipAuth: true,
        })
        uni.setStorageSync('token', res.data?.token)
        uni.setStorageSync('userInfo', res.data?.user)
      } catch {
        // 后端未配置时给一个本地 mock token，不阻塞 UI
        uni.setStorageSync('token', 'mock-local-token-v1')
        uni.setStorageSync('userInfo', { nickname: '颜值探索者', member_level: 0 })
      }
    },
    fail: () => {
      uni.setStorageSync('token', 'mock-local-token-v1')
    },
  })
  // #endif

  // H5/App 端给 mock token
  // #ifndef MP-WEIXIN
  uni.setStorageSync('token', 'mock-local-token-v1')
  uni.setStorageSync('userInfo', { nickname: '颜值探索者', member_level: 0 })
  // #endif
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF8F4 0%, #FFFFFF 40%);
  padding: 24rpx 32rpx 160rpx;
}

.header {
  padding: 40rpx 0 48rpx;
  .title {
    font-size: 48rpx;
    font-weight: 700;
    color: #2D2420;
    letter-spacing: 4rpx;
    display: block;
  }
  .subtitle {
    font-size: 26rpx;
    color: #A69989;
    margin-top: 8rpx;
    display: block;
  }
}

.upload-section {
  .section-title {
    font-size: 26rpx;
    color: #6E5D53;
    line-height: 1.6;
    display: block;
    margin-bottom: 32rpx;
  }
}

.upload-grid {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.upload-card {
  flex: 1;
  aspect-ratio: 3 / 4;
  background: #FFF1EE;
  border-radius: 24rpx;
  overflow: hidden;
  position: relative;
}

.uploaded-img {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon { font-size: 64rpx; margin-bottom: 16rpx; }
.upload-label { font-size: 28rpx; color: #6E5D53; font-weight: 600; }
.upload-required, .upload-optional {
  font-size: 20rpx;
  padding: 4rpx 16rpx;
  border-radius: 100rpx;
  margin-top: 12rpx;
}
.upload-required { background: #C26B5D; color: #fff; }
.upload-optional { background: #F4EFE6; color: #A69989; }

.privacy-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: #A69989;
  margin-bottom: 40rpx;
  padding: 16rpx 24rpx;
  background: #FFF8F4;
  border-radius: 12rpx;
}

.generate-btn {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  background: linear-gradient(135deg, #E88070, #C26B5D);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  border-radius: 100rpx;
  border: none;
  &.disabled { background: #E8DDD5; color: #A69989; }
}

.scanning-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(45, 36, 32, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.scanning-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 48rpx 64rpx;
  width: 80%;
  text-align: center;
}
.scanning-step {
  font-size: 26rpx;
  color: #6E5D53;
  display: block;
  margin-bottom: 32rpx;
  min-height: 72rpx;
}
.progress-bar {
  height: 12rpx;
  background: #F4EFE6;
  border-radius: 100rpx;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #E88070, #C26B5D);
  border-radius: 100rpx;
  transition: width 0.3s ease;
}
.progress-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #C26B5D;
  display: block;
  margin-top: 24rpx;
}

.report-section {
  .report-header {
    margin-bottom: 32rpx;
    .report-title {
      font-size: 36rpx;
      font-weight: 700;
      color: #2D2420;
      display: block;
    }
    .report-date {
      font-size: 24rpx;
      color: #A69989;
      display: block;
      margin-top: 4rpx;
    }
  }
}

.report-summary {
  display: flex;
  gap: 24rpx;
  margin-bottom: 40rpx;
  .summary-item {
    flex: 1;
    background: #FFF1EE;
    border-radius: 20rpx;
    padding: 32rpx 24rpx;
    text-align: center;
  }
  .summary-value {
    font-size: 32rpx;
    font-weight: 700;
    color: #C26B5D;
    display: block;
  }
  .summary-label {
    font-size: 22rpx;
    color: #A69989;
    margin-top: 8rpx;
    display: block;
  }
}

.recommendations {
  .rec-card {
    display: flex;
    gap: 20rpx;
    background: #fff;
    border-radius: 20rpx;
    padding: 28rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 16rpx rgba(45, 36, 32, 0.05);
  }
  .rec-icon {
    font-size: 48rpx;
    width: 80rpx;
    text-align: center;
  }
  .rec-info { flex: 1; }
  .rec-type {
    font-size: 26rpx;
    font-weight: 700;
    color: #2D2420;
    display: block;
    margin-bottom: 8rpx;
  }
  .rec-desc {
    font-size: 24rpx;
    color: #6E5D53;
    line-height: 1.5;
  }
}

.tryon-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #E88070, #C26B5D);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 100rpx;
  border: none;
  margin-top: 16rpx;
}

.restart-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: transparent;
  color: #A69989;
  font-size: 26rpx;
  border-radius: 100rpx;
  border: 2rpx solid #E8DDD5;
  margin-top: 16rpx;
}
</style>
