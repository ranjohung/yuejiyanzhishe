/**
 * GET /api/v1/cron/cleanup-photos
 * 清理过期照片（expires_at < now() 的 Photo 记录）
 *
 * Vercel/Next.js 推荐做法：
 *   - 在 Vercel Dashboard 配 Cron（每天 03:00 UTC）调用这个 endpoint
 *   - 或者用 node-cron 在 Next.js dev server 里跑
 *
 * 清理逻辑：
 *   1. 找所有 status=1 且 expires_at < now() 的 Photo
 *   2. 标记 status=0（"已清理"）
 *   3. TODO: 如果用了对象存储，这里调用 COS/OSS/S3 SDK 删实际文件
 *
 * 安全：CRON_SECRET 必须匹配（防止外部乱调）
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { responseSuccess, responseError } from '@/lib/utils'

export const runtime = 'nodejs'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: NextRequest) {
  // 简单密钥验证
  const secret = req.headers.get('x-cron-secret')
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json(responseError(401, 'invalid cron secret'), { status: 401 })
  }

  const now = new Date()

  // 清理过期照片（标记 status=0）
  const expiredPhotos = await prisma.photo.updateMany({
    where: { status: 1, expires_at: { lt: now } },
    data: { status: 0 },
  })

  // 清理过期积分（V1 只有骨架，先不跑）
  // const expiredPoints = await prisma.pointRecord.updateMany({...})

  console.log(`[cron/cleanup-photos] marked ${expiredPhotos.count} photos as cleaned`)

  return NextResponse.json(responseSuccess({
    cleaned_photos: expiredPhotos.count,
    ran_at: now.toISOString(),
  }))
}
