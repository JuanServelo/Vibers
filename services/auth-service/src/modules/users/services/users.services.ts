import { UsersRepository } from '../repositories/users.repository'
import { PasswordService } from '../../../infrastructure/security/password.service'

export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private passwordService: PasswordService
  ) {}

  async findAll(tenantId: string) {
    return this.usersRepository.findAll(tenantId)
  }

  async findById(id: string, tenantId: string) {
    const user = await this.usersRepository.findById(id, tenantId)
    if (!user) throw new Error('User not found')
    return user
  }

  async create(tenantId: string, data: { email: string; password: string; name?: string }) {
    const existing = await this.usersRepository.findByEmail(data.email)
    if (existing) throw new Error('Email already in use')
    const hashedPassword = await this.passwordService.hash(data.password)
    return this.usersRepository.create({ ...data, password: hashedPassword, tenantId })
  }

  async update(id: string, tenantId: string, data: { email?: string; name?: string }) {
    await this.findById(id, tenantId)
    await this.usersRepository.update(id, tenantId, data)
    return this.findById(id, tenantId)
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId)
    await this.usersRepository.delete(id, tenantId)
  }
}
