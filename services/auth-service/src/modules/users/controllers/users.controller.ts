import { Response } from 'express'
import { UsersService } from '../services/users.services'
import { AuthRequest } from '../../../infrastructure/middleware/auth.middleware'

export class UsersController {
  constructor(private usersService: UsersService) {}

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId
      const users = await this.usersService.findAll(tenantId)
      res.json(users)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error fetching users'
      res.status(500).json({ error: message })
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string
      const tenantId = req.user!.tenantId
      const user = await this.usersService.findById(id, tenantId)
      res.json(user)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error fetching user'
      res.status(404).json({ error: message })
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId
      const { email, password, name } = req.body
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' })
        return
      }
      const user = await this.usersService.create(tenantId, { email, password, name })
      res.status(201).json(user)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error creating user'
      res.status(400).json({ error: message })
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string
      const tenantId = req.user!.tenantId
      const { email, name } = req.body
      const user = await this.usersService.update(id, tenantId, { email, name })
      res.json(user)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error updating user'
      res.status(400).json({ error: message })
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string
      const tenantId = req.user!.tenantId
      await this.usersService.delete(id, tenantId)
      res.status(204).send()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error deleting user'
      res.status(400).json({ error: message })
    }
  }
}
