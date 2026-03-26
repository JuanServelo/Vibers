import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

import { PrismaService } from './infrastructure/database/prisma/prisma.service'
import { JwtService } from './infrastructure/security/jwt.service'
import { PasswordService } from './infrastructure/security/password.service'
import { authMiddleware } from './infrastructure/middleware/auth.middleware'

import { AuthService } from './modules/auth/services/auth.services'
import { AuthController } from './modules/auth/controllers/auth.controller'

import { UsersRepository } from './modules/users/repositories/users.repository'
import { UsersService } from './modules/users/services/users.services'
import { UsersController } from './modules/users/controllers/users.controller'

import { TenantsService } from './modules/tenants/services/tenants.services'
import { TenantsController } from './modules/tenants/controllers/tenants.controller'

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000

// --- Instâncias ---
const prisma = new PrismaService()
const jwtService = new JwtService()
const passwordService = new PasswordService()

const authService = new AuthService(prisma, passwordService, jwtService)
const authController = new AuthController(authService)

const usersRepository = new UsersRepository(prisma)
const usersService = new UsersService(usersRepository, passwordService)
const usersController = new UsersController(usersService)

const tenantsService = new TenantsService(prisma)
const tenantsController = new TenantsController(tenantsService)

// --- Rotas públicas ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' })
})

app.post('/auth/login', (req, res) => authController.login(req, res))
app.post('/auth/register', (req, res) => authController.register(req, res))

// --- Rotas protegidas ---
app.get('/users', authMiddleware, (req, res) => usersController.findAll(req as any, res))
app.get('/users/:id', authMiddleware, (req, res) => usersController.findById(req as any, res))
app.post('/users', authMiddleware, (req, res) => usersController.create(req as any, res))
app.patch('/users/:id', authMiddleware, (req, res) => usersController.update(req as any, res))
app.delete('/users/:id', authMiddleware, (req, res) => usersController.delete(req as any, res))

app.get('/tenants/me', authMiddleware, (req, res) => tenantsController.getMyTenant(req as any, res))
app.patch('/tenants/me', authMiddleware, (req, res) => tenantsController.updateMyTenant(req as any, res))

// --- Iniciar servidor ---
async function main() {
  await prisma.$connect()
  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`)
  })
}

main().catch(console.error)
