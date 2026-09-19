/**
 * POST /api/v1/tryon/generate
 * 溶图（AI 换装/换发型/换妆容）接口
 *
 * 请求体：
 *   {
 *     type: 'hair' | 'outfit' | 'makeup',
 *     source_photo_id: string,   // 用户的照片 ID
 *     material_id?: string,       // 素材 ID（选素材时）
 *     material_url?: string,      // 素材图片 URL
 *     report_id?: string,         // 关联哪份报告
 *     idempotency_key?: string    // 幂等去重
 *   }
 *
 * 状态机：0=queued → 1=generating → 2=completed / 3=failed / 4=blocked
 * V1 同步跑完（AI 未接入时返回 mock URL）
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { responseSuccess, responseError } from '@/lib/utils'

export const runtime = 'nodejs'

const TRYON_TYPE_MAP: Record<string, number> = { hair: 1, outfit: 2, makeup: 3 }

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth.ok) return NextResponse.json(auth.error!, { status: 401 })

  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json(responseError(400, '请求体不是合法 JSON'), { status: 400 }) }

  const type = body?.type
  const sourcePhotoId = body?.source_photo_id
  const materialUrl = body?.material_url
  const materialId = body?.material_id

  if (!type || !TRYON_TYPE_MAP[type]) {
    return NextResponse.json(responseError(400, '缺少或无效的 type（hair/outfit/makeup）'), { status: 400 })
  }
  if (!sourcePhotoId) {
    return NextResponse.json(responseError(400, '缺少 source_photo_id'), { status: 400 })
  }

  // 验证照片
  const photo = await prisma.photo.findFirst({
    where: { id: sourcePhotoId, user_id: auth.userId, status: 1 },
  })
  if (!photo) {
    return NextResponse.json(responseError(400, 'source_photo_id 无效或已过期'), { status: 400 })
  }

  // 幂等去重
  if (body?.idempotency_key) {
    const existing = await prisma.tryon.findFirst({
      where: {
        user_id: auth.userId,
        tryon_type: TRYON_TYPE_MAP[type],
        idempotency_key: body.idempotency_key,
      },
      orderBy: { created_at: 'desc' },
    })
    if (existing) {
      return NextResponse.json(responseSuccess({ tryon_id: existing.id, status: existing.status, result_image_url: existing.result_image_url, duplicated: true }))
    }
  }

  const BASE_URL = process.env.FILE_BASE_URL || 'http://localhost:8080'

  // 创建任务
  const task = await prisma.tryon.create({
    data: {
      user_id: auth.userId,
      report_id: body?.report_id,
      tryon_type: TRYON_TYPE_MAP[type],
      source_photo_url: photo.url,
      material_id: materialId,
      material_url: materialUrl,
      status: 0,
      idempotency_key: body?.idempotency_key,
    },
  })

  // V1 同步跑完 — TODO: 真实 AI 溶图（腾讯云 Image2 / SDXL / ComfyUI）
  // 未配置时返回 mock（用素材 URL 拼接一个演示地址）
  const mockResult = `${BASE_URL}/mock-tryon/${type}_${Date.now()}.png`

  await prisma.tryon.update({
    where: { id: task.id },
    data: {
      status: 2,
      result_image_url: mockResult,
      completed_at: new Date(),
    },
  })

  return NextResponse.json(responseSuccess({
    tryon_id: task.id,
    status: 2,
    result_image_url: mockResult,
  }))
}
