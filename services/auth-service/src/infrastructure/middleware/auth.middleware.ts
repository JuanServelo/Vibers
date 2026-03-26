import { Request, Response, NextFunction } from 'express'
import { JwtService } from '../security/jwt.service'

export interface AuthRequest extends Request {
  user?: {
    sub: string
    tenantId: string
  }
}

const jwtService = new JwtService()

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwtService.verifyToken(token) as { sub: string; tenantId: string }
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
