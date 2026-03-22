import { PrismaClient } from '../../../generated/prisma'

export class PrismaService extends PrismaClient {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}