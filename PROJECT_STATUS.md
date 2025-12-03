# 📊 Status do Projeto - GraphQL POC

**Última atualização**: 2024-12-03 (atualizado após implementação Orb Module)

Este documento serve como fonte de verdade sobre o estado atual do projeto, decisões arquiteturais e próximos passos.

---

## 🎯 Objetivo do Projeto

Projeto de estudo GraphQL para preparação de entrevista técnica na Tools for Humanity (TFH).

**Stack:**
- GraphQL (Mercurius + Fastify)
- PostgreSQL
- TypeScript
- AWS CDK (para infraestrutura)
- Clean Architecture + DDD

---

## 🏗️ Arquitetura

### Padrão: Clean Architecture + DDD

**Estrutura de camadas (de fora para dentro):**
```
GraphQL → Application → Domain ← Infrastructure
```

**Princípios:**
- Domain não depende de nada externo
- Application depende apenas de Domain (interfaces)
- Infrastructure implementa interfaces do Domain
- GraphQL depende apenas de Application

**Cada módulo segue a estrutura:**
```
modules/{nome}/
├── domain/              # Entidades, interfaces, erros
├── application/         # Services, DTOs
├── infra/               # Repositories (PostgreSQL)
└── graphql/             # TypeDefs, Resolvers
```

---

## 📦 Módulos do Projeto

### ✅ User Module (COMPLETO)

**Domain:**
- `user.entity.ts` - Entidade User (id, name, email, createdAt, updatedAt)
- `user.repository.interface.ts` - Interface IUserRepository
- `user.errors.ts` - UserNotFoundError, UserEmailAlreadyExistsError

**Application:**
- `user.service.ts` - UserService (findById, create)
- `dto/create-user.dto.ts` - Validação de criação

**Infrastructure:**
- `user.repository.postgres.ts` - Implementação PostgreSQL

**GraphQL:**
- `user.typeDefs.ts` - Schema GraphQL
- `user.resolvers.ts` - Resolvers (user, userByEmail, createUser)

**Database:**
- Migration criada e executada: `create_users_table`
- Tabela: `users` (id UUID, name, email, created_at, updated_at)

**Status**: ✅ Funcionando e testado

---

### ✅ Orb Module (QUASE COMPLETO)

**Domain:**
- `orb.entity.ts` - Entidade Orb (id, serialNumber, location, status, createdAt, updatedAt)
- `orb.types.ts` - Location interface, OrbStatus type
- `orb.repository.interface.ts` - Interface IOrbRepository (findById, create, updateStatus)
- `orb.errors.ts` - OrbNotFound

**Application:**
- `orb.service.ts` - OrbService (findById, create, updateStatus)
- `dto/create-orb.dto.ts` - Validação completa com validação de location (country, city, latitude, longitude)

**Infrastructure:**
- `orb.repository.postgres.ts` - Implementação PostgreSQL completa
  - findById: Busca por ID
  - create: Cria Orb com location como JSONB
  - updateStatus: Atualiza apenas status

**GraphQL:**
- `orb.typeDefs.ts` - Schema GraphQL completo
  - Type `Location` (country, city, latitude, longitude)
  - Input `LocationInput` para mutations
  - Enum `OrbStatus` (ACTIVE, INACTIVE, MAINTENANCE)
  - Type `Orb` completo
  - Query: `orb(id: ID!)`
  - Mutations: `createOrb`, `updateOrbStatus`
- `orb.resolvers.ts` - Resolvers completos
  - Query: `orb` (retorna null se não encontrar)
  - Mutation: `createOrb` (valida e cria)
  - Mutation: `updateOrbStatus` (atualiza status)
  - Conversão Date → String implementada

**Database:**
- ✅ Migration criada: `create_orbs_table`
  - Tabela: `orbs` com id (UUID, PK), serial_number (VARCHAR, UNIQUE), location (JSONB), status (VARCHAR com CHECK constraint), created_at, updated_at
  - Constraint CHECK para status válido
- ⚠️ Migration ainda não executada

**Status**: ⚠️ Falta executar migration e integrar no schema principal (`src/graphql/schema.ts`)

---

### ⏳ VerificationSession Module (NÃO INICIADO)

**Planejado:**
- Entidade com: id, userId, orbId, startedAt, completedAt, status
- Relaciona User e Orb por IDs (não importa entidades diretamente)
- Queries: verificationSession, verificationSessionsByUser
- Mutations: createVerificationSession, completeVerificationSession

**Status**: ⏳ Não iniciado

---

## 🔧 Configurações do Projeto

### Dependências Principais

**Produção:**
- `mercurius` - GraphQL para Fastify
- `fastify` - Servidor HTTP
- `pg` - Cliente PostgreSQL
- `dotenv` - Variáveis de ambiente
- `graphql` - Core GraphQL

**Desenvolvimento:**
- `typescript` - Compilador TypeScript
- `ts-node-dev` - Desenvolvimento com hot reload
- `node-pg-migrate` - Migrations
- `@types/node`, `@types/pg` - Tipos TypeScript

### Scripts (package.json)

```json
"dev": "ts-node-dev --respawn --transpile-only src/app.ts"
"build": "tsc"
"start": "node dist/app.js"
"migrate:up": "node -r dotenv/config node_modules/.bin/node-pg-migrate up --migrations-dir src/database/migrations"
"migrate:down": "node -r dotenv/config node_modules/.bin/node-pg-migrate down --migrations-dir src/database/migrations"
"migrate:create": "node-pg-migrate create --migrations-dir src/database/migrations"
```

### Variáveis de Ambiente (.env)

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=test-password
DB_NAME=graphql_poc
DATABASE_URL=postgresql://postgres:test-password@localhost:5433/graphql_poc
PORT=8000
NODE_ENV=development
```

### Docker Compose

- PostgreSQL 15 na porta 5433
- Volume persistente: `postgres_data`
- Container: `graphql-poc-db`

---

## 📁 Estrutura de Arquivos

```
src/
├── app.ts                    # Entry point - Fastify + Mercurius
├── config/
│   ├── env.ts               # Configuração de variáveis
│   └── database.ts          # Pool de conexões PostgreSQL
├── database/
│   ├── connection.ts         # Gerenciamento de conexão
│   ├── migrations/          # Migrations do banco
│   └── seeds/               # Seeds (vazio)
├── graphql/
│   ├── schema.ts            # Combina TypeDefs e Resolvers
│   └── context.ts           # Context GraphQL (vazio)
├── modules/
│   ├── user/                # ✅ Completo
│   ├── orb/                 # ⚠️ Quase completo
│   └── verification-session/ # ⏳ Não iniciado
└── shared/                  # Código compartilhado (vazio)

infrastructure/              # AWS CDK
├── bin/app.ts
├── lib/
│   ├── database-stack.ts
│   ├── api-stack.ts
│   ├── vpc-stack.ts
│   └── security-stack.ts
└── cdk.json
```

---

## 🎨 Decisões Arquiteturais Importantes

### 1. GraphQL Server: Mercurius (não Apollo Server)
- **Decisão**: Usar Mercurius ao invés de Apollo Server
- **Razão**: Integração nativa com Fastify, mais simples, melhor performance
- **Como funciona**: Registra como plugin do Fastify

### 2. Location como Objeto Embutido
- **Decisão**: Location não é tabela separada, é objeto embutido no Orb
- **Razão**: Location não tem ciclo de vida independente, é atributo do Orb
- **Implementação**: Armazenado como JSONB no PostgreSQL

### 3. Relacionamentos Entre Módulos
- **Padrão**: Usar referências por ID, não importar entidades diretamente
- **Exemplo**: VerificationSession tem `userId` e `orbId` (strings), não objetos User/Orb
- **Razão**: Mantém módulos desacoplados, segue DDD

### 4. DTOs para Validação
- **Padrão**: Criar DTOs com função de validação separada
- **Razão**: Separa validação da lógica de negócio, reutilizável
- **Uso**: Service valida DTO antes de processar

### 5. Conversão Date → String no GraphQL
- **Padrão**: Converter `Date` para `String` nos resolvers
- **Razão**: GraphQL não tem tipo DateTime nativo, usa String
- **Implementação**: `createdAt.toISOString()` nos resolvers

---

## 🔄 Fluxo de Dados

### Criar Usuário (exemplo):

```
1. Cliente GraphQL → mutation createUser
2. Resolver → orbService.create()
3. Service → validateCreateUserDto() → userRepository.create()
4. Repository → INSERT no PostgreSQL
5. Retorno: User entity → Resolver converte Date → String → Cliente
```

### Princípios:
- Resolver apenas orquestra (não contém lógica)
- Service contém lógica de negócio
- Repository apenas acesso a dados
- Domain isolado (não conhece nada externo)

---

## 🗄️ Banco de Dados

### Tabelas Criadas

**users:**
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**orbs:**
- ✅ Migration criada: `create_orbs_table`
- Estrutura: id (UUID, PK), serial_number (VARCHAR, UNIQUE), location (JSONB), status (VARCHAR com CHECK constraint), created_at, updated_at
- ⚠️ Migration ainda não executada

**verification_sessions:**
- ⏳ Não criada
- Planejado: id (UUID, PK), user_id (UUID, FK), orb_id (UUID, FK), started_at, completed_at, status

### Migrations

- Localização: `src/database/migrations/`
- Ferramenta: `node-pg-migrate`
- Configuração: `migrate.json` com `migrations-folder: src/database/migrations`

---

## 🚀 Próximos Passos

### Curto Prazo (Orb Module)
1. ✅ Criar migration para tabela `orbs` - FEITO
2. ⏳ Executar migration (`npm run migrate:up`)
3. ⏳ Integrar Orb no schema GraphQL principal (`src/graphql/schema.ts`)
4. ⏳ Testar queries e mutations do Orb

### Médio Prazo (VerificationSession Module)
1. ⏳ Implementar Domain Layer (Entity, Interface, Errors)
2. ⏳ Implementar Application Layer (Service, DTOs)
3. ⏳ Implementar Infrastructure Layer (Repository PostgreSQL)
4. ⏳ Implementar GraphQL Layer (TypeDefs, Resolvers)
5. ⏳ Criar migration para tabela `verification_sessions`
6. ⏳ Integrar no schema principal

### Longo Prazo (Features Avançadas)
1. ⏳ DataLoader (resolver N+1 problem)
2. ⏳ Cursor-based pagination
3. ⏳ Query depth/complexity limits
4. ⏳ Authentication (JWT)
5. ⏳ AWS CDK (infraestrutura)

---

## 📝 Padrões e Convenções

### Nomenclatura
- Entidades: PascalCase (`User`, `Orb`)
- Interfaces: `I` + PascalCase (`IUserRepository`)
- Services: PascalCase + Service (`UserService`)
- DTOs: PascalCase + Dto (`CreateUserDto`)
- Arquivos: kebab-case (`user.entity.ts`)

### Estrutura de Resolvers
- Função factory: `create{Module}Resolvers(service)`
- Retorna objeto com `Query` e `Mutation`
- Converte `Date` para `String` nos retornos
- Trata erros do domínio apropriadamente

### Estrutura de Services
- Recebe Repository via constructor (DI)
- Valida DTOs antes de processar
- Aplica regras de negócio
- Lança erros do domínio

---

## ⚠️ Problemas Conhecidos / Pendências

1. **Orb Module**: Falta executar migration e integrar no schema principal
2. **VerificationSession Module**: Não iniciado
3. **Testes**: Não implementados ainda
4. **Error Handling**: Pode ser melhorado (formatação GraphQL)
5. **Type Safety**: Alguns `any` nos resolvers (aceitável por enquanto)

## 📝 Implementações Recentes

### Orb Module (2024-12-03)
- ✅ Criada entidade Orb com location como objeto embutido
- ✅ Criados tipos TypeScript (Location, OrbStatus)
- ✅ Criado DTO com validação completa de location (latitude/longitude ranges)
- ✅ Implementado Repository PostgreSQL com conversão JSONB ↔ objeto
- ✅ Criados TypeDefs GraphQL com tipos aninhados (Location, LocationInput)
- ✅ Criados Resolvers completos (orb, createOrb, updateOrbStatus)
- ✅ Criada migration com constraint CHECK para status

---

## 🔍 Como Consultar Este Documento

Este arquivo deve ser atualizado sempre que:
- Um módulo for completado
- Uma decisão arquitetural importante for tomada
- Uma configuração importante mudar
- Um problema importante for resolvido

**Formato de atualização:**
- ✅ = Completo e funcionando
- ⚠️ = Em progresso / Parcial
- ⏳ = Não iniciado

---

**Nota**: Este documento é atualizado dinamicamente durante o desenvolvimento. Sempre consulte a versão mais recente.

