import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { responseSuccess, responseError } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, password, nickname, email } = body

    if (!phone || !password || !nickname) {
      return Response.json(responseError(400, '缺少必要参数'))
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } })
    if (existingUser) {
      return Response.json(responseError(409, '该手机号已注册'))
    }

    const existingNickname = await prisma.user.findUnique({ where: { nickname } })
    if (existingNickname) {
      return Response.json(responseError(409, '该昵称已被使用'))
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        nickname,
        email,
      },
    })

    const token = generateToken(user.id)

    return Response.json(
      responseSuccess({
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          phone: user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
          avatar: user.avatar,
          member_level: user.member_level,
        },
      })
    )
  } catch (error) {
    return Response.json(responseError(500, '服务器内部错误'))
  }
}
