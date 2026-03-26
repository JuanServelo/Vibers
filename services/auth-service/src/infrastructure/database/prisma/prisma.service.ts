import { PrismaClient } from '../../../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
    super({ adapter })
  }
}
