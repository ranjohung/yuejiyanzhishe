/**
 * GET /api/v1/report/[id]/detail
 * 查询报告详情 — 前端每 2s 轮询一次
 *
 * 响应：
 *   {
 *     status: 0-4,           // 状态机
 *     error_code?: string,   // status=4 时有值
 *     face_data?: {...},     // 分析结果（status >= 1 有）
 *     text_sections?: [...], // 文字报告（status >= 2 有）
 *     recommendations?: [...],// 推荐（status >= 3 有）
 *     images?: [...]         // 配图（V1.2 溶图接入后有）
 *   }
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { responseSuccess, responseError } from '@/lib/utils'

export const runtime = 'nodejs'

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = requireAuth(_req)
  if (!auth.ok) return NextResponse.json(auth.error!, { status: 401 })

  const report = await prisma.report.findFirst({
    where: { id: params.id, user_id: auth.userId },
  })

  if (!report) {
    return NextResponse.json(responseError(404, '报告不存在或无权限'), { status: 404 })
  }

  // 脱敏返回：永远不返回原始 photo URL（前端拿到的 photo_id 够用）
  return NextResponse.json(responseSuccess({
    report_id: report.id,
    status: report.status,
    error_code: report.error_code,
    scene: report.scene,
    face_data: report.status >= 1 ? report.face_data : null,
    text_sections: report.status >= 3 ? report.text_sections : null,
    recommendations: report.status >= 3 ? report.recommendations : null,
    created_at: report.created_at,
    completed_at: report.completed_at,
  }))
}
