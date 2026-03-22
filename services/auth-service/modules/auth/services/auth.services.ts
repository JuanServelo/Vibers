import { PrismaService } from "../../../infrastructure/database/prisma/prisma.service"
import { PasswordService } from "../../../infrastructure/security/password.service"
import { JwtService } from "../../../infrastructure/security/jwt.service"

export class AuthService {

  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private jwtService: JwtService
  ) {}

  async login(email: string, password: string) {

    const user = await this.prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error("Invalid credentials")
    }

    const valid = await this.passwordService.compare(password, user.password)

    if (!valid) {
      throw new Error("Invalid credentials")
    }

    const token = this.jwtService.generateToken({
      sub: user.id,
      tenantId: user.tenantId
    })

    return {
      access_token: token
    }

  }

}