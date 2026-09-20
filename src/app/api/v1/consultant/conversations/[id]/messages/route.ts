/**
 * POST /api/v1/consultant/conversations/{id}/messages
 * 发消息 → 返回 AI 回答
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { responseSuccess, responseError } from '@/lib/utils'

export const runtime = 'nodejs'

const QWEN_KEY = process.env.QWEN_API_KEY

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

async function callQwen(messages: { role: string; content: string }[]): Promise<string> {
  if (!QWEN_KEY) return mockAnswer(messages[messages.length - 1]?.content || '')

  const res = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${QWEN_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [{ role: 'system', content: buildSystemPrompt() }, ...messages],
      max_tokens: 800,
    }),
  })
  if (!res.ok) throw new Error(`QWEN API error: ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? mockAnswer('')
}

function mockAnswer(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('皮肤') || q.includes('护肤')) {
    return '关于护肤建议：\n\n1️⃣ 先确认你的肤质（干/油/混合）——可以用洁面后 1 小时不涂任何护肤品观察出油情况\n2️⃣ 基础三步不能少：温和清洁 → 补水保湿 → 防晒（SPF30+，全天）\n3️⃣ 如果有具体困扰（痘痘/敏感/暗沉），可以告诉我更多细节，我帮你针对性建议～'
  }
  if (q.includes('发型') || q.includes('头发')) {
    return '发型建议需要结合脸型哦～\n\n· 圆脸 → 两侧留层次+头顶蓬松，避免齐刘海\n· 长脸 → 齐刘海+两侧中长发，增加宽度感\n· 方脸 → 大波浪卷+侧分，柔化棱角\n\n你方便告诉我你的脸型和发长吗？'
  }
  if (q.includes('穿搭') || q.includes('衣服')) {
    return '日常通勤穿搭建议：\n\n✨ 公式：基础款 + 一件亮点单品\n\n· 上装：白衬衫/针织衫/简约T恤\n· 下装：高腰直筒裤/A字裙（显比例关键）\n· 亮点：丝巾、耳饰、一双好看的鞋\n\n配色建议从黑白灰基础色起步，慢慢加驼色、卡其、雾霾蓝等中性色～'
  }
  return '收到你的问题啦！作为你的变美顾问，我可以帮你解答护肤、美妆、穿搭、发型等方面的问题。\n\n试试问我：\n· "我的皮肤比较干，应该怎么护肤？"\n· "圆脸适合什么发型？"\n· "日常通勤穿搭有什么建议？"'
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(req)
  if (!auth.ok) return NextResponse.json(auth.error!, { status: 401 })

  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json(responseError(400, '请求体不是合法 JSON'), { status: 400 }) }

  const content = body?.content?.trim()
  if (!content) {
    return NextResponse.json(responseError(400, '缺少 content'), { status: 400 })
  }

  // 验证对话归属
  const conv = await prisma.conversation.findFirst({
    where: { id: params.id, user_id: auth.userId },
    include: {
      messages: {
        orderBy: { created_at: 'asc' },
        take: 10,
        select: { role: true, content: true },
      },
    },
  })
  if (!conv) {
    return NextResponse.json(responseError(404, '对话不存在'), { status: 404 })
  }

  // 存用户消息
  const userMsg = await prisma.message.create({
    data: {
      conversation_id: conv.id,
      user_id: auth.userId!,
      role: 'user',
      content,
    },
  })

  // 准备历史上下文（最近 6 条）
  const history = conv.messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
  history.push({ role: 'user', content })

  // 调 AI（未配置时返回 mock）
  const aiReply = await callQwen(history)

  // 存 AI 回复
  const assistantMsg = await prisma.message.create({
    data: {
      conversation_id: conv.id,
      user_id: auth.userId!,
      role: 'assistant',
      content: aiReply,
    },
  })

  // 更新对话时间
  await prisma.conversation.update({
    where: { id: conv.id },
    data: { updated_at: new Date() },
  })

  return NextResponse.json(responseSuccess({
    user_message: userMsg,
    assistant_message: assistantMsg,
  }))
}
