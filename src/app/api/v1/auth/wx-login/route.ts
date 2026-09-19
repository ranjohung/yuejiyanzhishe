/**
 * POST /api/v1/auth/wx-login
 * 微信小程序静默登录
 *
 * 小程序端自动调 wx.login() → 拿到 code → 传这个接口
 * 后端用 code 换 openid（调微信 jscode2session）→ 自动建/查用户 → 发 JWT
 * 用户无感知、无登录页
 *
 * 请求体：{ code: string }
 * 响应：{ token, user: { id, nickname, member_level } }
 *
 * 未配置 WX_MINI_APPID/SECRET 时：
 *   — 返回一个稳定的 mock token（用 code hash），不阻塞 UI
 *   — 方便 H5/App 开发阶段演示
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, hashPassword, generateToken } from '@/lib/auth'
import { responseSuccess, responseError } from '@/lib/utils'

export const runtime = 'nodejs'

const WX_APPID = process.env.WX_MINI_APPID
const WX_SECRET = process.env.WX_MINI_SECRET

interface WxSession {
  openid?: string
  session_key?: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

async function code2session(code: string): Promise<WxSession> {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`
  const res = await fetch(url)
  return res.json() as Promise<WxSession>
}

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json(responseError(400, '请求体不是合法 JSON'), { status: 400 }) }

  const code = body?.code
  if (!code) {
    return NextResponse.json(responseError(400, '缺少 code'), { status: 400 })
  }

  let openid: string | null = null

  if (WX_APPID && WX_SECRET) {
    // 真实环境：调微信
    const session = await code2session(code)
    if (session.errcode) {
      return NextResponse.json(
        responseError(500, `微信登录失败 [${session.errcode}]: ${session.errmsg}`),
        { status: 500 }
      )
    }
    openid = session.openid ?? null
  } else {
    // 开发环境：用 code hash 稳定生成 mock openid
    // 这样同一个 code 每次登录会得到同一个用户
    let h = 0
    for (let i = 0; i < code.length; i++) h = ((h << 5) - h + code.charCodeAt(i)) | 0
    openid = `dev_openid_${Math.abs(h).toString(36)}`
  }

  // 找用户或自动创建（微信静默登录无感知建账）
  let user = await prisma.user.findUnique({ where: { phone: openid! } })
  if (!user) {
    const tempPwd = `wx_auto_${Date.now()}`
    user = await prisma.user.create({
      data: {
        phone: openid!,
        password: await hashPassword(tempPwd),
        nickname: '颜值探索者',
      },
    })
  }

  const token = generateToken(user.id)
  return NextResponse.json(responseSuccess({
    token,
    user: {
      id: user.id,
      nickname: user.nickname,
      phone: user.phone.startsWith('dev_openid') ? user.phone : user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      member_level: user.member_level,
      avatar: user.avatar,
    },
  }))
}
