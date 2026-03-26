import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service'
import { PasswordService } from '../../../infrastructure/security/password.service'
import { JwtService } from '../../../infrastructure/security/jwt.service'

export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private jwtService: JwtService
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('Invalid credentials')

    const valid = await this.passwordService.compare(password, user.password)
    if (!valid) throw new Error('Invalid credentials')

    const token = this.jwtService.generateToken({ sub: user.id, tenantId: user.tenantId })
    return { access_token: token }
  }

  async register(tenantName: string, email: string, password: string, name?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('Email already in use')

    const tenant = await this.prisma.tenant.create({ data: { name: tenantName } })
    const hashedPassword = await this.passwordService.hash(password)

    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name, tenantId: tenant.id }
    })

    const token = this.jwtService.generateToken({ sub: user.id, tenantId: user.tenantId })
    return { access_token: token }
  }
}
