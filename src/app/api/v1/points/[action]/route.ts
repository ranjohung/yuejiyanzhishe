/**
 * GET /api/v1/points/balance
 * GET /api/v1/points/records
 * 积分余额 + 流水
 *
 * V1 仅展示不扣减（feature flag）
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { responseSuccess } from '@/lib/utils'

export const runtime = 'nodejs'

function calcBalance(records: any[]): number {
  return records.reduce((sum, r) => sum + (r.change_amount || 0), 0)
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const action = url.pathname.endsWith('/balance') ? 'balance' : 'records'

  const auth = requireAuth(req)
  if (!auth.ok) return NextResponse.json(auth.error!, { status: 401 })

  if (action === 'balance') {
    const records = await prisma.pointRecord.findMany({
      where: { user_id: auth.userId },
    })
    const balance = calcBalance(records)
    return NextResponse.json(responseSuccess({ balance, feature_enabled: false }))
  }

  // records
  const records = await prisma.pointRecord.findMany({
    where: { user_id: auth.userId },
    orderBy: { created_at: 'desc' },
    take: 50,
  })
  return NextResponse.json(responseSuccess({ records, feature_enabled: false }))
}
