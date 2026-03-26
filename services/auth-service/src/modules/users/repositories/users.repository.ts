import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service'

export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: { id: true, email: true, name: true, tenantId: true, createdAt: true, updatedAt: true }
    })
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: { id, tenantId },
      select: { id: true, email: true, name: true, tenantId: true, createdAt: true, updatedAt: true }
    })
  }

  async create(data: { email: string; password: string; name?: string; tenantId: string }) {
    return this.prisma.user.create({
      data,
      select: { id: true, email: true, name: true, tenantId: true, createdAt: true, updatedAt: true }
    })
  }

  async update(id: string, tenantId: string, data: { email?: string; name?: string }) {
    return this.prisma.user.updateMany({
      where: { id, tenantId },
      data
    })
  }

  async delete(id: string, tenantId: string) {
    return this.prisma.user.deleteMany({
      where: { id, tenantId }
    })
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }
}
