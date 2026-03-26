import { Response } from 'express'
import { TenantsService } from '../services/tenants.services'
import { AuthRequest } from '../../../infrastructure/middleware/auth.middleware'

export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  async getMyTenant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId
      const tenant = await this.tenantsService.findById(tenantId)
      res.json(tenant)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error fetching tenant'
      res.status(404).json({ error: message })
    }
  }

  async updateMyTenant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId
      const { name } = req.body
      if (!name) {
        res.status(400).json({ error: 'Name is required' })
        return
      }
      const tenant = await this.tenantsService.update(tenantId, { name })
      res.json(tenant)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error updating tenant'
      res.status(400).json({ error: message })
    }
  }
}
