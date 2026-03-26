import { Request, Response } from 'express'
import { AuthService } from '../services/auth.services'

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' })
        return
      }
      const result = await this.authService.login(email, password)
      res.json(result)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed'
      res.status(401).json({ error: message })
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { tenantName, email, password, name } = req.body
      if (!tenantName || !email || !password) {
        res.status(400).json({ error: 'tenantName, email and password are required' })
        return
      }
      const result = await this.authService.register(tenantName, email, password, name)
      res.status(201).json(result)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      res.status(400).json({ error: message })
    }
  }
}
