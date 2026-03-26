import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service'

export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } })
    if (!tenant) throw new Error('Tenant not found')
    return tenant
  }

  async update(id: string, data: { name: string }) {
    return this.prisma.tenant.update({ where: { id }, data })
  }
}
