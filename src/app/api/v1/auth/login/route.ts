import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { responseSuccess, responseError } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, password } = body

    if (!phone || !password) {
      return Response.json(responseError(400, '缺少必要参数'))
    }

    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      return Response.json(responseError(401, '手机号或密码错误'))
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return Response.json(responseError(401, '手机号或密码错误'))
    }

    if (user.status !== 1) {
      return Response.json(responseError(403, '账号已被禁用'))
    }

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
