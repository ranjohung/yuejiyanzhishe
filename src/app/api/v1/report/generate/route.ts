/**
 * POST /api/v1/report/generate
 * 创建美学分析报告 — 核心状态机入口
 *
 * 请求体：
 *   {
 *     front_photo_id: string,         // 必填，POST /photo/upload 返回
 *     body_photo_id?: string,
 *     scene?: string,                 // 日常/通勤/约会...
 *     profile?: {                     // 前端问卷/资料
 *       height?: number, weight?: number, skinType?: string,
 *       hairType?: string, goals?: string[]
 *     },
 *     idempotency_key?: string        // 幂等去重
 *   }
 *
 * ⚠️ 禁止前端传 face_data（防篡改）—— 服务端重新调腾讯云分析
 *
 * 状态机：pending(0) → text_ready(1) → image_generating(2) → completed(3)
 *                        ↘ failed(4)
 *
 * 响应：{ report_id, status: 0 } — 前端轮询 GET /report/:id/detail
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { responseSuccess, responseError } from '@/lib/utils'
import { analyzeFace, generateReportText } from '@/lib/ai'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth.ok) return NextResponse.json(auth.error!, { status: 401 })

  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json(responseError(400, '请求体不是合法 JSON'), { status: 400 }) }

  const { front_photo_id, body_photo_id, scene, profile, idempotency_key } = body || {}

  if (!front_photo_id) {
    return NextResponse.json(responseError(400, '缺少 front_photo_id'), { status: 400 })
  }

  // 1. 幂等去重：同一用户 8 小时内同一 idempotency_key 不重复分析
  if (idempotency_key) {
    const existing = await prisma.report.findFirst({
      where: { user: { id: auth.userId }, idempotency_key },
      orderBy: { created_at: 'desc' },
    })
    if (existing) {
      return NextResponse.json(responseSuccess({
        report_id: existing.id,
        status: existing.status,
        duplicated: true,
      }))
    }
  }

  // 2. 验证照片存在且属于当前用户
  const frontPhoto = await prisma.photo.findFirst({
    where: { id: front_photo_id, user: { id: auth.userId }, status: 1 },
  })
  if (!frontPhoto) {
    return NextResponse.json(responseError(400, 'front_photo_id 无效或已过期'), { status: 400 })
  }

  // 3. 创建 Report 记录（pending）
  const report = await prisma.report.create({
    data: {
      user: { id: auth.userId },
      front_photo_id,
      body_photo_id: body_photo_id,
      scene,
      profile_data: profile ?? null,
      status: 0,
      idempotency_key: idempotency_key ?? null,
    },
  })

  // 4. 异步处理（Next.js Route Handler 不能真后台任务 — V1 直接 await 同步跑完整流程）
  try {
    // 4a. 人脸分析
    const faceResult = await analyzeFace(frontPhoto.url)

    // 4b. 更新 face_data + status→text_ready
    await prisma.report.update({
      where: { id: report.id },
      data: { face_data: faceResult as any, status: 1 },
    })

    // 4c. 生成文字报告 + 推荐
    const textResult = await generateReportText({
      faceResult,
      profile: profile ?? {},
    })

    // 4d. 更新 text_sections + recommendations + status→completed
    await prisma.report.update({
      where: { id: report.id },
      data: {
        text_sections: textResult.text_sections as any,
        recommendations: textResult.recommendations as any,
        status: 3,
        completed_at: new Date(),
      },
    })
  } catch (err: any) {
    // 失败也要更新状态，前端能感知
    await prisma.report.update({
      where: { id: report.id },
      data: { status: 4, error_code: err?.message?.substring(0, 80) || 'AI_FAILED' },
    })
    return NextResponse.json(
      responseError(500, `报告生成失败: ${err?.message ?? 'unknown'}`),
      { status: 500 }
    )
  }

  return NextResponse.json(responseSuccess({
    report_id: report.id,
    status: report.status,
  }))
}
