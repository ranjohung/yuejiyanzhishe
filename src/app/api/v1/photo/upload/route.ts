/**
 * POST /api/v1/photo/upload
 * 照片上传接口 — 用 FormData，支持 face_photo + body_photo 同时传
 *
 * 请求：multipart/form-data
 *   face_photo: File       （必需，正面半身照）
 *   body_photo: File       （可选，全身照）
 * 返回：{ face_photo_id, body_photo_id }
 *
 * 后端做：
 *   1. sharp 压缩（max 1080px width，WebP 格式）
 *   2. 生成 pHash 用于去重（同一用户 180 天内同一照片只算一次免费分析）
 *   3. 存对象存储 / 本地 uploads
 *   4. 写 photos 表，expires_at = now + 7d（自动清理）
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { responseSuccess, responseError } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// V1 简化版：直接返回本地存储的 URL（真实生产要上 COS/OSS/S3）
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const BASE_URL = process.env.FILE_BASE_URL || 'http://localhost:8080'

async function saveFile(file: File, userId: string, type: number) {
  // TODO: sharp 压缩 + pHash + 对象存储
  // V1 直接用 File.text() / blob 保存到 uploads 目录
  const hash = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const url = `${BASE_URL}/uploads/${userId}/${type}/${hash}.jpg`
  const photo = await prisma.photo.create({
    data: {
      user_id: userId,
      photo_type: type,
      url,
      hash,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
  return photo.id
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth.ok) return NextResponse.json(auth.error!, { status: 401 })

  const form = await req.formData()
  const facePhoto = form.get('face_photo') as File | null
  const bodyPhoto = form.get('body_photo') as File | null

  if (!facePhoto) {
    return NextResponse.json(responseError(400, '缺少 face_photo（正面照）'), { status: 400 })
  }

  try {
    const faceId = await saveFile(facePhoto, auth.userId!, 1)
    let bodyId: string | null = null
    if (bodyPhoto) bodyId = await saveFile(bodyPhoto, auth.userId!, 2)

    return NextResponse.json(responseSuccess({
      face_photo_id: faceId,
      body_photo_id: bodyId,
    }))
  } catch (err: any) {
    return NextResponse.json(
      responseError(500, `照片上传失败: ${err?.message ?? 'unknown'}`),
      { status: 500 }
    )
  }
}
