/**
 * GET /api/v1/health
 * 健康检查 — 数据库连接 + AI 配置状态
 * 前端联调时可以先调这个判断后端有没有起来
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  const startTime = Date.now()

  let db = 'unknown'
  let dbLatency = 0
  try {
    const t0 = Date.now()
    await prisma.$queryRaw`SELECT 1`
    dbLatency = Date.now() - t0
    db = 'ok'
  } catch (e: any) {
    db = e?.message?.slice(0, 100) || 'error'
  }

  return NextResponse.json({
    status: db === 'ok' ? 'ok' : 'degraded',
    uptime_ms: process.uptime() * 1000,
    db,
    db_latency_ms: dbLatency,
    ai: {
      tencent_cloud: !!process.env.TENCENTCLOUD_SECRET_ID,
      qwen: !!process.env.QWEN_API_KEY,
    },
    version: 'v1-alpha',
    response_time_ms: Date.now() - startTime,
  })
}
