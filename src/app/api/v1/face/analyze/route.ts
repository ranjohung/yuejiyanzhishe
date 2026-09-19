/**
 * POST /api/v1/face/analyze
 * 人脸分析接口
 *
 * 请求体：{ image_url: string }  或  { image_base64: string }
 * 响应：FaceAnalysisResult（见 src/lib/ai.ts）
 *
 * 错误码：NO_FACE / MULTI_FACE / FACE_TOO_SMALL / BIG_POSE / MASK / IMAGE_BLUR
 * 注意：前端**不能**缓存 face_data 直接传给后续 report/generate，报告生成时服务端会重新分析（防篡改）
 */
import { NextRequest, NextResponse } from 'next/server'
import { analyzeFace } from '@/lib/ai'
import { requireAuth, serverError } from '@/lib/middleware'
import { responseSuccess, responseError } from '@/lib/utils'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth.ok) return NextResponse.json(auth.error!, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(responseError(400, '请求体不是合法 JSON'), { status: 400 })
  }

  const imageUrl = body.image_url
  if (!imageUrl || typeof imageUrl !== 'string') {
    return NextResponse.json(responseError(400, '缺少 image_url 参数'), { status: 400 })
  }

  try {
    const result = await analyzeFace(imageUrl)
    return NextResponse.json(responseSuccess(result))
  } catch (err: any) {
    // 腾讯云原始错误映射为产品错误码
    const msg = err?.message ?? ''
    let code = 'AI_FAILED'
    if (msg.includes('NO_FACE') || msg.includes('未检出')) code = 'NO_FACE'
    else if (msg.includes('MULTI_FACE') || msg.includes('多张')) code = 'MULTI_FACE'
    else if (msg.includes('BLUR') || msg.includes('模糊')) code = 'IMAGE_BLUR'
    return NextResponse.json(
      responseError(500, `人脸分析失败 [${code}]: ${msg.substring(0, 120)}`),
      { status: 500 }
    )
  }
}
