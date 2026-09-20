/**
 * GET  /api/v1/consultant/conversations        — 对话列表
 * POST /api/v1/consultant/conversations        — 新建对话
 * POST /api/v1/consultant/conversations/{id}/messages — 发消息
 *
 * V1 安全护栏（5 条规则）：
 *   1. 不做医学诊断
 *   2. 不推荐处方药
 *   3. 不评价用户外貌（避免 body shaming）
 *   4. 不涉及未成年人美妆/穿搭建议
 *   5. 敏感话题（政治/宗教/色情）直接拒答
 *
 * V1 未配置 QWEN_API_KEY 时：返回本地 mock 回答（基于规则模板）
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { responseSuccess, responseError } from '@/lib/utils'

export const runtime = 'nodejs'

const QWEN_KEY = process.env.QWEN_API_KEY

const SAFETY_BLOCKED = [
  { pattern: /性病|癌症|糖尿病|高血压|抑郁症/, reason: 'medical' },
  { pattern: /处方药|抗生素|避孕药/, reason: 'prescription' },
  { pattern: /整容|整形|隆胸|吸脂/, reason: 'plastic_surgery' },
]

function checkSafety(text: string): string | null {
  for (const rule of SAFETY_BLOCKED) {
    if (rule.pattern.test(text)) return rule.reason
  }
  return null
}

function buildSystemPrompt(): string {
  return [
    '你是「悦己颜值社」的 AI 变美顾问，一位温柔、专业、有同理心的变美助手。',
    '回答规则：',
    '1. 只提供护肤、美妆、穿搭、发型、仪态等变美建议，不做医学诊断。',
    '2. 推荐 OTC 非处方药或药妆时提醒"请咨询专业医生"。',
    '3. 不评价用户外貌，不说"你应该整容/减肥"之类的话。',
    '4. 不接待未成年人的美妆/穿搭问题。',
    '5. 敏感话题直接礼貌拒答。',
    '语气：亲切、温暖、多用"你可以考虑"、"建议试试"等柔和表达。',
  ].join('\n')
}

// ===== GET /conversations — 列表 =====
export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth.ok) return NextResponse.json(auth.error!, { status: 401 })

  const convs = await prisma.conversation.findMany({
    where: { user_id: auth.userId },
    orderBy: { updated_at: 'desc' },
    include: {
      messages: {
        orderBy: { created_at: 'asc' },
        take: 1,
        select: { role: true, content: true },
      },
    },
  })
  return NextResponse.json(responseSuccess({ conversations: convs }))
}

// ===== POST /conversations — 新建 =====
export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth.ok) return NextResponse.json(auth.error!, { status: 401 })

  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json(responseError(400, '请求体不是合法 JSON'), { status: 400 }) }

  const conv = await prisma.conversation.create({
    data: {
      user_id: auth.userId!,
      title: body?.title ?? '新对话',
    },
  })
  return NextResponse.json(responseSuccess({ conversation: conv }))
}
