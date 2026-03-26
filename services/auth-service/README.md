# Auth Service

Serviço responsável por autenticação, autorização e gerenciamento de usuários e tenants no ecossistema Vibers ERP.

---

## Responsabilidades

- Registro de novos tenants (empresas) e seus usuários administradores
- Autenticação via email e senha com emissão de token JWT
- Validação de tokens JWT para rotas protegidas
- CRUD de usuários dentro de um tenant
- Consulta e atualização de dados do tenant

---

## Tecnologias

| Tecnologia | Versão | Papel |
|---|---|---|
| Node.js | 18+ | Runtime |
| TypeScript | 5.9 | Linguagem |
| Express | 5.x | Framework HTTP |
| Prisma ORM | 7.x | Acesso ao banco |
| PostgreSQL | 15 | Banco de dados |
| jsonwebtoken | 9.x | Geração e validação de JWT |
| bcrypt | 6.x | Hash seguro de senhas |
| ts-node-dev | 2.x | Hot reload em desenvolvimento |

---

## Estrutura de Pastas

```
auth-service/
│
├── src/
│   ├── main.ts                          # Entrypoint — instâncias e rotas
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── controllers/
│   │   │   │   └── auth.controller.ts   # Login e registro
│   │   │   ├── services/
│   │   │   │   └── auth.services.ts     # Lógica de autenticação
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── controllers/
│   │   │   │   └── users.controller.ts  # CRUD de usuários
│   │   │   ├── services/
│   │   │   │   └── users.services.ts    # Regras de negócio de usuários
│   │   │   └── repositories/
│   │   │       └── users.repository.ts  # Acesso ao banco
│   │   │
│   │   └── tenants/
│   │       ├── controllers/
│   │       │   └── tenants.controller.ts
│   │       ├── services/
│   │       │   └── tenants.services.ts
│   │       └── dto/
│   │           └── create-tenant.dto.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── prisma/
│   │   │       └── prisma.service.ts    # Wrapper do PrismaClient
│   │   ├── security/
│   │   │   ├── jwt.service.ts           # Geração e verificação de JWT
│   │   │   └── password.service.ts      # Hash e comparação de senhas
│   │   └── middleware/
│   │       └── auth.middleware.ts       # Validação de token nas rotas
│   │
│   └── generated/
│       └── prisma/                      # Cliente Prisma gerado automaticamente
│
├── prisma/
│   ├── schema.prisma                    # Definição dos modelos do banco
│   └── migrations/                      # Histórico de migrations
│
├── .env                                 # Variáveis de ambiente (não versionar)
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

## Arquitetura em Camadas

```
HTTP Request
     │
     ▼
┌─────────────┐
│  Middleware  │  auth.middleware.ts — valida JWT nas rotas protegidas
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Controller  │  Recebe req/res, valida campos obrigatórios, trata erros HTTP
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service   │  Contém a lógica de negócio (regras, validações, orquestração)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Repository  │  Acesso ao banco via Prisma (apenas queries)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PrismaClient│  Conexão com PostgreSQL
└─────────────┘
```

---

## Banco de Dados

### Modelos

#### Tenant
Representa uma empresa cliente (cada assinante do SaaS).

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `name` | String | Nome da empresa |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Última atualização |

#### User
Usuário pertencente a um tenant.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `email` | String (único) | Email de acesso |
| `password` | String | Senha com hash bcrypt |
| `name` | String? | Nome do usuário (opcional) |
| `tenantId` | UUID (FK) | Referência ao tenant |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Última atualização |

#### Role
Perfil de acesso (ex: `admin`, `manager`, `viewer`).

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `name` | String (único) | Nome do perfil |

#### UserRole
Relacionamento many-to-many entre usuários e perfis.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `userId` | UUID (FK) | Referência ao usuário |
| `roleId` | UUID (FK) | Referência ao perfil |

#### RefreshToken
Tokens de refresh para renovação de sessão (estrutura preparada).

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `token` | String | Token de refresh |
| `userId` | UUID (FK) | Usuário proprietário |
| `expiresAt` | DateTime | Data de expiração |

### Diagrama de Relacionamentos

```
Tenant ──< User ──< UserRole >── Role
              └──< RefreshToken
```

---

## Autenticação JWT

O serviço emite **Access Tokens** JWT com as seguintes características:

| Propriedade | Valor |
|---|---|
| Algoritmo | HS256 |
| Expiração | 15 minutos |
| Payload | `{ sub, tenantId, iat, exp }` |
| Secret | Variável `JWT_SECRET` |

### Payload do token

```json
{
  "sub": "uuid-do-usuario",
  "tenantId": "uuid-do-tenant",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Uso nas requisições protegidas

```
Authorization: Bearer <access_token>
```

O middleware `auth.middleware.ts` extrai e valida o token em todas as rotas protegidas, injetando `req.user` com `{ sub, tenantId }`.

---

## Segurança de Senhas

As senhas são armazenadas com hash **bcrypt** (10 rounds salt). A senha original nunca é persistida.

```
Senha em texto → bcrypt.hash(password, 10) → hash armazenado no banco
Validação      → bcrypt.compare(password, hash) → true/false
```

---

## API Reference

### Base URL

```
http://localhost:3000
```

---

### GET /health

Verifica o status do serviço.

**Autenticação:** Não requerida

**Resposta 200**
```json
{
  "status": "ok",
  "service": "auth-service"
}
```

---

### POST /auth/register

Registra um novo tenant e seu primeiro usuário administrador.

**Autenticação:** Não requerida

**Body**
```json
{
  "tenantName": "Empresa Exemplo Ltda",
  "email": "admin@empresa.com",
  "password": "senha_segura",
  "name": "João Silva"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `tenantName` | string | ✅ | Nome da empresa |
| `email` | string | ✅ | Email do administrador |
| `password` | string | ✅ | Senha |
| `name` | string | ❌ | Nome do usuário |

**Resposta 201**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros**

| Status | Descrição |
|---|---|
| `400` | Campos obrigatórios ausentes |
| `400` | Email já cadastrado |

---

### POST /auth/login

Autentica um usuário existente e retorna um token JWT.

**Autenticação:** Não requerida

**Body**
```json
{
  "email": "admin@empresa.com",
  "password": "senha_segura"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `email` | string | ✅ | Email cadastrado |
| `password` | string | ✅ | Senha |

**Resposta 200**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros**

| Status | Descrição |
|---|---|
| `400` | Campos obrigatórios ausentes |
| `401` | Credenciais inválidas |

---

### GET /users

Lista todos os usuários do tenant autenticado.

**Autenticação:** JWT requerido

**Headers**
```
Authorization: Bearer <access_token>
```

**Resposta 200**
```json
[
  {
    "id": "uuid-do-usuario",
    "email": "admin@empresa.com",
    "name": "João Silva",
    "tenantId": "uuid-do-tenant",
    "createdAt": "2026-03-22T00:00:00.000Z",
    "updatedAt": "2026-03-22T00:00:00.000Z"
  }
]
```

> Nota: o campo `password` nunca é retornado em nenhum endpoint.

**Erros**

| Status | Descrição |
|---|---|
| `401` | Token ausente ou inválido |

---

### GET /users/:id

Busca um usuário específico pelo ID, dentro do tenant autenticado.

**Autenticação:** JWT requerido

**Parâmetros de rota**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `id` | UUID | ID do usuário |

**Resposta 200**
```json
{
  "id": "uuid-do-usuario",
  "email": "admin@empresa.com",
  "name": "João Silva",
  "tenantId": "uuid-do-tenant",
  "createdAt": "2026-03-22T00:00:00.000Z",
  "updatedAt": "2026-03-22T00:00:00.000Z"
}
```

**Erros**

| Status | Descrição |
|---|---|
| `401` | Token ausente ou inválido |
| `404` | Usuário não encontrado (ou pertence a outro tenant) |

---

### POST /users

Cria um novo usuário dentro do tenant autenticado.

**Autenticação:** JWT requerido

**Body**
```json
{
  "email": "colaborador@empresa.com",
  "password": "senha_colaborador",
  "name": "Maria Santos"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `email` | string | ✅ | Email do novo usuário |
| `password` | string | ✅ | Senha |
| `name` | string | ❌ | Nome do usuário |

**Resposta 201**
```json
{
  "id": "novo-uuid",
  "email": "colaborador@empresa.com",
  "name": "Maria Santos",
  "tenantId": "uuid-do-tenant",
  "createdAt": "2026-03-25T00:00:00.000Z",
  "updatedAt": "2026-03-25T00:00:00.000Z"
}
```

**Erros**

| Status | Descrição |
|---|---|
| `400` | Campos obrigatórios ausentes |
| `400` | Email já cadastrado |
| `401` | Token ausente ou inválido |

---

### PATCH /users/:id

Atualiza dados de um usuário dentro do tenant autenticado.

**Autenticação:** JWT requerido

**Parâmetros de rota**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `id` | UUID | ID do usuário |

**Body** (campos opcionais — envie apenas o que deseja alterar)
```json
{
  "name": "João da Silva Sauro",
  "email": "novo-email@empresa.com"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `email` | string | ❌ | Novo email |
| `name` | string | ❌ | Novo nome |

**Resposta 200**
```json
{
  "id": "uuid-do-usuario",
  "email": "novo-email@empresa.com",
  "name": "João da Silva Sauro",
  "tenantId": "uuid-do-tenant",
  "createdAt": "2026-03-22T00:00:00.000Z",
  "updatedAt": "2026-03-25T00:00:00.000Z"
}
```

**Erros**

| Status | Descrição |
|---|---|
| `400` | Usuário não encontrado ou pertence a outro tenant |
| `401` | Token ausente ou inválido |

---

### DELETE /users/:id

Remove um usuário do tenant autenticado.

**Autenticação:** JWT requerido

**Parâmetros de rota**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `id` | UUID | ID do usuário |

**Resposta 204** — Sem corpo

**Erros**

| Status | Descrição |
|---|---|
| `400` | Usuário não encontrado ou pertence a outro tenant |
| `401` | Token ausente ou inválido |

---

### GET /tenants/me

Retorna as informações do tenant do usuário autenticado.

**Autenticação:** JWT requerido

**Resposta 200**
```json
{
  "id": "uuid-do-tenant",
  "name": "Empresa Exemplo Ltda",
  "createdAt": "2026-03-22T00:00:00.000Z",
  "updatedAt": "2026-03-22T00:00:00.000Z"
}
```

**Erros**

| Status | Descrição |
|---|---|
| `401` | Token ausente ou inválido |
| `404` | Tenant não encontrado |

---

### PATCH /tenants/me

Atualiza as informações do tenant do usuário autenticado.

**Autenticação:** JWT requerido

**Body**
```json
{
  "name": "Empresa Exemplo S.A."
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | string | ✅ | Novo nome do tenant |

**Resposta 200**
```json
{
  "id": "uuid-do-tenant",
  "name": "Empresa Exemplo S.A.",
  "createdAt": "2026-03-22T00:00:00.000Z",
  "updatedAt": "2026-03-25T00:00:00.000Z"
}
```

**Erros**

| Status | Descrição |
|---|---|
| `400` | Campo `name` ausente |
| `401` | Token ausente ou inválido |
| `400` | Falha ao atualizar |

---

## Padrão de Erros

Todos os erros retornam o seguinte formato:

```json
{
  "error": "Descrição do erro"
}
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do serviço:

```env
# Conexão com o banco de dados PostgreSQL
DATABASE_URL="postgresql://postgres:SENHA@localhost:5432/vibers?schema=public"

# Segredo para assinatura dos tokens JWT
# Use um valor longo e aleatório em produção
JWT_SECRET=seu_segredo_super_secreto_aqui

# Porta do servidor (padrão: 3000)
PORT=3000
```

> **Atenção:** Nunca versione o arquivo `.env`. Ele está no `.gitignore`.

---

## Configuração e Execução

### Pré-requisitos
- Node.js 18+
- Docker (para o banco de dados)

### 1. Instalar dependências

```bash
npm install
```

### 2. Subir o banco de dados

```bash
# A partir da raiz do projeto Vibers
cd ../../docker
docker-compose up postgres -d
```

Ou use o `docker-compose.yml` local do serviço:

```bash
# A partir da pasta do auth-service
docker-compose up -d
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env com suas configurações
```

### 4. Gerar o cliente Prisma

```bash
npx prisma generate
```

### 5. Executar as migrations

```bash
npx prisma migrate dev
```

### 6. Iniciar o servidor

```bash
# Desenvolvimento com hot reload
npm run dev

# Produção
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3000`.

---

## Prisma — Comandos Úteis

```bash
# Gerar cliente após alterar o schema
npx prisma generate

# Criar e aplicar nova migration
npx prisma migrate dev --name nome_da_migration

# Abrir interface visual do banco
npx prisma studio

# Verificar status das migrations
npx prisma migrate status

# Resetar o banco (⚠️ apaga todos os dados)
npx prisma migrate reset
```

---

## Docker

### Executar apenas o banco

```bash
docker-compose up postgres -d
```

### Build e execução completa via Docker

```bash
docker-compose up -d
```

### Variáveis de ambiente no Docker

O `docker-compose.yml` passa as variáveis diretamente:

```yaml
environment:
  DATABASE_URL: postgresql://postgres:Vibers%402112@postgres:5432/vibers
```

> Nota: o caractere `@` na senha deve ser codificado como `%40` na connection string do Docker.

---

## Isolamento Multi-Tenant

O isolamento de dados por tenant é garantido em três camadas:

1. **Token JWT** — cada token carrega `tenantId` no payload
2. **Middleware** — `auth.middleware.ts` extrai e injeta `req.user.tenantId` em cada requisição
3. **Repository/Service** — todas as queries incluem `where: { tenantId }`, impedindo acesso cruzado entre tenants

Exemplo na camada de repositório:

```typescript
// Nunca retorna usuários de outros tenants
findAll(tenantId: string) {
  return this.prisma.user.findMany({
    where: { tenantId }
  })
}
```

---

## Próximos Passos (Fase 2)

- [ ] Endpoint `POST /auth/refresh` para renovar o access token usando o refresh token
- [ ] `POST /auth/logout` para invalidar o refresh token
- [ ] CRUD de roles (`/roles`) e atribuição de roles a usuários (`/users/:id/roles`)
- [ ] Middleware de autorização baseado em roles (RBAC)
- [ ] Paginação na listagem de usuários
- [ ] Soft delete de usuários
