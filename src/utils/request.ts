/**
 * uni-app 网络请求统一封装
 * - 自动带 Authorization header（从 storage 读 token）
 * - 统一错误处理（401 跳登录）
 * - BASE_URL 可配（从 process.env 或硬编码 fallback）
 *
 * 在各平台的 base URL：
 *   微信小程序: 需在后台配置 request 合法域名（request合法域名）
 *   H5: 直接 http(s)
 *   App: 直接 http(s)
 */

// 开发阶段用本地；生产替换为真实域名
const BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:8080'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  // 手动控制：不传 token / 不自动处理 401
  skipAuth?: boolean
  skipAuthRedirect?: boolean
}

export function request<T = any>(opts: RequestOptions): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...opts.header,
    }
    if (!opts.skipAuth && token) {
      header['Authorization'] = `Bearer ${token}`
    }

    uni.request({
      url: BASE_URL + opts.url,
      method: opts.method || 'GET',
      data: opts.data,
      header,
      success: (res: any) => {
        const body = res.data as ApiResponse<T>
        if (!body) {
          reject(new Error('服务器无响应'))
          return
        }

        if (body.code === 40101 || body.code === 40102) {
          if (!opts.skipAuthRedirect) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            uni.showToast({ title: '登录已过期', icon: 'none' })
            uni.reLaunch({ url: '/pages/login/login' })
          }
          reject(new Error(body.message))
          return
        }

        if (body.code !== 200) {
          reject(new Error(body.message || `请求失败 (${body.code})`))
          return
        }
        resolve(body)
      },
      fail: (err) => {
        // 未配置后端时友好提示 —— 方便 H5/小程序开发阶段 UI 能跑
        if (String(err?.errMsg || '').includes('fail')) {
          uni.showToast({
            title: '网络错误，请检查后端服务',
            icon: 'none',
            duration: 2000,
          })
        }
        reject(err)
      },
    })
  })
}

/** 上传文件（照片上传走 multipart） */
export function uploadFile(
  url: string,
  filePath: string,
  name: string,
  formData?: Record<string, any>
): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const header: Record<string, string> = {}
    if (token) header['Authorization'] = `Bearer ${token}`

    uni.uploadFile({
      url: BASE_URL + url,
      filePath,
      name,
      formData,
      header,
      success: (res: any) => {
        try {
          const body = JSON.parse(res.data)
          if (body.code === 200) resolve(body)
          else reject(new Error(body.message || `上传失败 (${body.code})`))
        } catch {
          reject(new Error('响应格式错误'))
        }
      },
      fail: reject,
    })
  })
}

/** 各模块 API 快捷入口 */
export const api = {
  // Auth
  login: (phone: string, password: string) =>
    request({ url: '/api/v1/auth/login', method: 'POST', data: { phone, password } }),

  // Photo
  uploadFaceAndBody: (facePath: string, bodyPath?: string) => {
    // uni-app 端不能同时传两个文件到 uploadFile —— 先传 face 再传 body
    // 简化版：两次调用，最后返回两个 photo_id
    return new Promise<{ face_photo_id: string; body_photo_id: string | null }>(
      async (resolve, reject) => {
        try {
          const faceRes = await uploadFile('/api/v1/photo/upload', facePath, 'face_photo')
          const faceId = faceRes.data?.face_photo_id
          let bodyId: string | null = null
          if (bodyPath) {
            const bodyRes = await uploadFile('/api/v1/photo/upload', bodyPath, 'body_photo')
            bodyId = bodyRes.data?.body_photo_id ?? null
          }
          resolve({ face_photo_id: faceId, body_photo_id: bodyId })
        } catch (e) { reject(e) }
      }
    )
  },

  // Report
  generateReport: (data: {
    front_photo_id: string
    body_photo_id?: string
    scene?: string
    profile?: Record<string, any>
  }) => request({ url: '/api/v1/report/generate', method: 'POST', data }),

  getReportDetail: (reportId: string) =>
    request({ url: `/api/v1/report/${reportId}/detail` }),

  // Face
  analyzeFace: (imageUrl: string) =>
    request({ url: '/api/v1/face/analyze', method: 'POST', data: { image_url: imageUrl } }),

  // Tryon
  generateTryon: (data: {
    type: 'hair' | 'outfit' | 'makeup'
    source_photo_id: string
    material_url?: string
    report_id?: string
  }) => request({ url: '/api/v1/tryon/generate', method: 'POST', data }),
}
