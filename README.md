# Vibers ERP

## Visão Geral

**Vibers ERP** é um ecossistema SaaS multi-tenant projetado para fornecer uma plataforma completa de gestão empresarial para pequenas e médias empresas.

O sistema é modular e baseado em **microserviços**, permitindo que diferentes funcionalidades do ERP sejam escaladas e mantidas de forma independente. Cada cliente (tenant) utiliza apenas os módulos necessários para seu negócio.

---

## Status do Projeto

| Serviço | Status | Descrição |
|---|---|---|
| `auth-service` | ✅ Fase 1 completa | Autenticação, usuários, tenants, JWT |
| `inventory-service` | 🔲 Planejado | Controle de estoque |
| `sales-service` | 🔲 Planejado | Pedidos e pagamentos |
| `delivery-service` | 🔲 Planejado | Rotas e entregas |
| `tickets-service` | 🔲 Planejado | Suporte técnico |
| `gateway` | 🔲 Planejado | API Gateway central |
| `frontend` | 🔲 Planejado | Interface React |

---

## Arquitetura

O Vibers segue o padrão de **microserviços**, onde cada domínio é um serviço independente com seu próprio banco de dados, API e deploy.

```
                          ┌─────────────────┐
                          │     Frontend     │
                          │   React + Vite   │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │     Gateway      │
                          │   API Gateway    │
                          └────────┬────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────▼────────┐  ┌────────▼────────┐  ┌───────▼─────────┐
     │  auth-service   │  │inventory-service│  │  sales-service  │
     │   porta 3000    │  │   porta 3001    │  │   porta 3002    │
     └────────┬────────┘  └────────┬────────┘  └───────┬─────────┘
              │                    │                    │
     ┌────────▼────────┐  ┌────────▼────────┐  ┌───────▼─────────┐
     │   PostgreSQL    │  │   PostgreSQL    │  │   PostgreSQL    │
     │  vibers (auth)  │  │  (inventory)   │  │    (sales)      │
     └─────────────────┘  └─────────────────┘  └─────────────────┘
```

Cada serviço possui:
- Código independente
- Banco de dados próprio
- API REST própria
- Deploy independente via Docker

---

## Estrutura de Pastas

```
Vibers/
│
├── docker/
│   └── docker-compose.yml          # Orquestração do ambiente completo
│
├── services/
│   ├── auth-service/               # ✅ Implementado — Fase 1
│   ├── inventory-service/          # 🔲 Planejado
│   ├── sales-service/              # 🔲 Planejado
│   ├── delivery-service/           # 🔲 Planejado
│   ├── tickets-service/            # 🔲 Planejado
│   ├── users-service/              # 🔲 Planejado
│   ├── crm-service/                # 🔲 Planejado
│   └── analytics-service/          # 🔲 Planejado
│
├── gateway/                        # 🔲 Planejado — roteamento central
├── frontend/                       # 🔲 Planejado — React + Vite
├── shared/                         # Código compartilhado entre serviços
├── infrastructure/                 # Configurações de infra centralizada
└── README.md
```

---

## Tecnologias

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| TypeScript | 5.9 | Linguagem |
| Express | 5.x | Framework HTTP |
| Prisma ORM | 7.x | Acesso ao banco |
| PostgreSQL | 15 | Banco de dados |
| JWT (jsonwebtoken) | 9.x | Autenticação |
| bcrypt | 6.x | Hash de senhas |

### Frontend (planejado)
| Tecnologia | Uso |
|---|---|
| React | Interface |
| Vite | Build tool |
| TypeScript | Linguagem |
| React Router | Navegação |
| Tailwind CSS | Estilização |

### Infraestrutura
| Tecnologia | Uso |
|---|---|
| Docker | Containerização |
| Docker Compose | Orquestração local |

---

## Multi-Tenant

O Vibers foi projetado como **SaaS multi-tenant**: uma única instância do sistema atende múltiplos clientes simultaneamente, com isolamento total de dados.

```
Tenant (empresa cliente)
  └── Users          → usuários da empresa
  └── Roles          → perfis de acesso
  └── [Dados ERP]    → estoque, vendas, etc.
```

- Cada usuário pertence a exatamente um `Tenant`
- Todas as entidades de negócio carregam `tenantId` para garantir isolamento
- O token JWT inclui `tenantId` no payload, identificando o contexto de cada requisição

---

## Ambiente com Docker

A pasta `docker/` contém dois arquivos:

| Arquivo | Uso |
|---|---|
| `docker-compose.yml` | Desenvolvimento — sobe apenas a infraestrutura (banco de dados) |
| `docker-compose.prod.yml` | Produção — sobe todos os serviços containerizados |

### Desenvolvimento

Em desenvolvimento, os serviços rodam localmente (`npm run dev`). O Docker gerencia apenas o banco:

```bash
cd docker
docker-compose up -d
```

| Serviço | Endereço |
|---|---|
| PostgreSQL | `localhost:5432` |

### Produção

```bash
cd docker
docker-compose -f docker-compose.prod.yml up -d
```

| Serviço | Endereço |
|---|---|
| PostgreSQL | `localhost:5432` |
| auth-service | `http://localhost:3000` |

---

## Quick Start — Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- npm

### 1. Clonar o repositório

```bash
git clone <repository-url>
cd Vibers
```

### 2. Subir o banco de dados

```bash
cd docker
docker-compose up postgres -d
```

### 3. Configurar e rodar o auth-service

```bash
cd services/auth-service
npm install
```

Criar o arquivo `.env`:
```env
DATABASE_URL="postgresql://postgres:Vibers@2112@localhost:5432/vibers?schema=public"
JWT_SECRET=seu_segredo_aqui
PORT=3000
```

Gerar o cliente Prisma e rodar as migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

Iniciar o serviço:
```bash
npm run dev
```

O serviço estará disponível em `http://localhost:3000`.

---

## Documentação dos Serviços

Cada serviço possui sua própria documentação detalhada:

- [auth-service](services/auth-service/README.md) — Autenticação, usuários e tenants

---

## Roadmap

### Fase 1 — Auth Service ✅ Completa
- [x] Registro de tenant e primeiro usuário
- [x] Login com JWT
- [x] Middleware de autenticação
- [x] CRUD de usuários (isolado por tenant)
- [x] Gerenciamento de tenant
- [x] Hash seguro de senhas com bcrypt
- [x] Schema do banco com Prisma

### Fase 2 — Núcleo do ERP 🔄 Próxima
- [ ] Inventory Service (produtos, categorias, estoque)
- [ ] Sales Service (pedidos, pagamentos)
- [ ] Frontend — Dashboard inicial com React + Vite
- [ ] API Gateway para roteamento centralizado

### Fase 3 — Suporte e Inteligência
- [ ] Tickets Service (chamados, base de conhecimento)
- [ ] Analytics Service (dashboards, relatórios)
- [ ] Notificações

### Fase 4 — Expansão
- [ ] CRM Service
- [ ] E-commerce Service
- [ ] Delivery Service
- [ ] IA para atendimento automatizado

---

## Licença

MIT License
