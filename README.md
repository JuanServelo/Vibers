# Vibers ERP

## Overview

**Vibers ERP** é um ecossistema SaaS multi-tenant projetado para fornecer uma plataforma completa de gestão empresarial para pequenas e médias empresas.

O sistema é modular e baseado em **microserviços**, permitindo que diferentes funcionalidades do ERP sejam escaladas e mantidas independentemente.

O objetivo do projeto é oferecer um **ERP altamente personalizável**, permitindo que cada cliente utilize apenas os módulos necessários para seu negócio.

---

# Arquitetura do Sistema

A arquitetura do Vibers segue o padrão de **microserviços**, onde cada domínio do sistema é implementado como um serviço independente.

Cada serviço possui:

* código independente
* banco de dados próprio
* API própria
* deploy independente

Estrutura simplificada:

```
Vibers
│
├ frontend
│
├ services
│   ├ auth-service
│   ├ users-service
│   ├ inventory-service
│   ├ sales-service
│   ├ delivery-service
│   ├ tickets-service
│
├ gateway
│
├ shared
│
└ infrastructure
```

---

# Tecnologias Utilizadas

## Backend

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Docker

## Frontend

* React
* Vite
* TypeScript
* React Router
* Tailwind / CSS Modules

## Infraestrutura

* Docker
* Docker Compose
* Microservices Architecture
* REST APIs

---

# Estrutura de Pastas do Projeto

```
Vibers
│
├ frontend
│
├ services
│   ├ auth-service
│   │
│   │ ├ src
│   │ │
│   │ │ ├ modules
│   │ │ │
│   │ │ │ ├ auth
│   │ │ │ │ ├ controllers
│   │ │ │ │ ├ services
│   │ │ │ │ └ dto
│   │ │ │ │
│   │ │ │ ├ users
│   │ │ │ │ ├ controllers
│   │ │ │ │ ├ services
│   │ │ │ │ └ repositories
│   │ │ │ │
│   │ │ │ ├ tenants
│   │ │ │ └ roles
│   │ │ │
│   │ │ ├ infrastructure
│   │ │ │
│   │ │ │ ├ database
│   │ │ │ │ └ prisma
│   │ │ │ │
│   │ │ │ └ security
│   │ │ │
│   │ │ ├ shared
│   │ │ │ └ utils
│   │ │ │
│   │ │ └ main.ts
│   │
│   │ ├ prisma
│   │ │ ├ schema.prisma
│   │ │ └ migrations
│   │
│   │ ├ docker-compose.yml
│   │ ├ package.json
│   │ └ tsconfig.json
│
└ README.md
```

---

# Serviços Planejados

## Auth Service

Responsável por:

* autenticação
* autorização
* gerenciamento de usuários
* tenants (clientes)
* roles e permissões
* tokens JWT

---

## Inventory Service

Controle de estoque:

* produtos
* categorias
* movimentações
* estoque mínimo
* fornecedores

---

## Sales Service

Gerenciamento de vendas:

* pedidos
* pagamentos
* faturamento
* integração com emissão de notas fiscais

---

## Delivery Service

Controle de entregas:

* rotas
* entregadores
* status de entrega
* histórico logístico

---

## Tickets Service

Sistema de suporte técnico:

* abertura de chamados
* categorização
* base de conhecimento
* dashboards de atendimento
* documentação vinculada a chamados

---

# Banco de Dados

O sistema utiliza **PostgreSQL** como banco principal.

ORM utilizado:

* Prisma

Cada microserviço possui seu próprio schema ou banco.

Exemplo de entidades do auth-service:

* Tenant
* User
* Role
* UserRole
* RefreshToken

---

# Multi-Tenant

O Vibers foi projetado como um **SaaS multi-tenant**, permitindo que uma única instância do sistema atenda múltiplos clientes.

Cada tenant representa uma empresa utilizando o sistema.

Estrutura:

```
Tenant
   └ Users
   └ Roles
   └ Permissions
   └ Data
```

Todas as entidades de negócio possuem referência ao **tenantId**.

---

# Configuração do Ambiente

## Requisitos

* Node.js 18+
* Docker
* PostgreSQL
* npm

---

# Instalação

Clonar o projeto:

```
git clone <repository-url>
```

Entrar no diretório do serviço:

```
cd services/auth-service
```

Instalar dependências:

```
npm install
```

---

# Configuração de Ambiente

Criar arquivo `.env`

```
DATABASE_URL=postgresql://vibers:vibers@localhost:5432/vibers

JWT_SECRET=super_secret_key
```

---

# Prisma

Gerar cliente Prisma:

```
npx prisma generate
```

Rodar migrations:

```
npx prisma migrate dev
```

Abrir interface visual do banco:

```
npx prisma studio
```

---

# Rodando o Projeto

Subir banco com Docker:

```
docker-compose up -d
```

Rodar serviço:

```
npm run dev
```

Servidor disponível em:

```
http://localhost:3000
```

---

# Endpoint Inicial

Login:

```
POST /auth/login
```

Body:

```
{
 "email": "user@email.com",
 "password": "123456"
}
```

Resposta:

```
{
 "access_token": "jwt_token"
}
```

---

# Roadmap do Projeto

## Fase 1

* Auth Service
* Sistema de usuários
* Multi-tenant
* JWT authentication

## Fase 2

* Inventory Service
* Sales Service
* Dashboard inicial

## Fase 3

* Tickets Service
* Base de conhecimento
* Analytics

## Fase 4

* Integração com e-commerce
* Sistema de entregas
* IA para atendimento

---

# Objetivo do Projeto

O Vibers ERP pretende ser um **ecossistema completo de gestão empresarial**, permitindo que empresas utilizem:

* ERP
* CRM
* Helpdesk
* E-commerce
* Analytics

Tudo dentro de uma única plataforma integrada.

---

# Licença

MIT License
