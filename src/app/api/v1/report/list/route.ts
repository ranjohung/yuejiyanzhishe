/**
 * GET /api/v1/report/list
 * 用户的报告列表（分页）
 *
 * Query: page=1&size=10&status=3
 * 响应：{ items: Report[], total, page, size }
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { responseSuccess, responseError } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth.ok) return NextResponse.json(auth.error!, { status: 401 })

  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const size = Math.min(50, Math.max(1, parseInt(url.searchParams.get('size') || '10')))
  const statusParam = url.searchParams.get('status')
  const skip = (page - 1) * size

  const where: any = { user_id: auth.userId }
  if (statusParam !== null) where.status = parseInt(statusParam)

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: size,
      select: {
        id: true,
        status: true,
        scene: true,
        error_code: true,
        front_photo_id: true,
        body_photo_id: true,
        created_at: true,
        completed_at: true,
      },
    }),
    prisma.report.count({ where }),
  ])

  return NextResponse.json(responseSuccess({ items, total, page, size }))
}
