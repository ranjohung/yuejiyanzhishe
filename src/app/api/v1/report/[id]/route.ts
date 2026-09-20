/**
 * DELETE /api/v1/report/[id]
 * 删除报告（同时标记关联 Photo 为已清理）
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { responseSuccess, responseError } from '@/lib/utils'

export const runtime = 'nodejs'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req)
  if (!auth.ok) return NextResponse.json(auth.error!, { status: 401 })

  const report = await prisma.report.findFirst({
    where: { id: params.id, user_id: auth.userId },
  })
  if (!report) {
    return NextResponse.json(responseError(404, '报告不存在或无权限'), { status: 404 })
  }

  // 级联清理关联 Photo（只改 status，不删文件）
  const photoIds = [report.front_photo_id, report.body_photo_id].filter(Boolean) as string[]
  if (photoIds.length > 0) {
    await prisma.photo.updateMany({
      where: { id: { in: photoIds }, user_id: auth.userId },
      data: { status: 0 },
    })
  }

  // 删除报告（Prism cascade 会删 tryon、message 等关联）
  await prisma.report.delete({ where: { id: params.id } })

  return NextResponse.json(responseSuccess({ ok: true }))
}
