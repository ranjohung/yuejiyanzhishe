/**
 * Next.js Route Handler 认证辅助
 *
 * 用法：
 *   import { requireAuth } from '@/lib/middleware'
 *   export async function POST(req: Request) {
 *     const auth = requireAuth(req);
 *     if (!auth.ok) return Response.json(auth.error!, { status: 401 });
 *     const userId = auth.userId!;
 *     // ... 业务逻辑
 *   }
 */
import { verifyToken, getAuthToken } from './auth'
import { responseError } from './utils'

export interface AuthResult {
  ok: boolean
  userId?: string
  error?: ReturnType<typeof responseError>
}

export function requireAuth(req: Request): AuthResult {
  const token = getAuthToken(req.headers)
  if (!token) {
    return { ok: false, error: responseError(40101, '缺少认证令牌') }
  }
  const payload = verifyToken(token)
  if (!payload) {
    return { ok: false, error: responseError(40102, '令牌无效或已过期') }
  }
  return { ok: true, userId: payload.userId }
}

export function getUserId(req: Request): string | null {
  const token = getAuthToken(req.headers)
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.userId ?? null
}

/** 通用错误包装 — 统一 500 格式 */
export function serverError(message = '服务器内部错误') {
  return Response.json(responseError(500, message), { status: 500 })
}
