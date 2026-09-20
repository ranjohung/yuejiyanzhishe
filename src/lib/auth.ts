import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'
const JWT_EXPIRES_IN = '7d'

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export const getAuthToken = (headers: Headers): string | null => {
  const authHeader = headers.get('Authorization')
  if (!authHeader) return null
  return authHeader.replace('Bearer ', '')
}
