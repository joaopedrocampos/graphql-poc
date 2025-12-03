# 📊 Status do Projeto - GraphQL POC

**Última atualização**: 2024-12-03 (configuração TypeScript/ESLint completa, path aliases implementados)

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

### ✅ Orb Module (COMPLETO)

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
  - findById: Busca por ID com conversão JSONB → objeto
  - create: Cria Orb com location como JSONB
  - updateStatus: Atualiza apenas status

**GraphQL:**
- `orb.typeDefs.ts` - Schema GraphQL completo (usando `extend type Query/Mutation`)
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
- ✅ Migration criada e executada: `create_orbs_table`
  - Tabela: `orbs` com id (UUID, PK), serial_number (VARCHAR, UNIQUE), location (JSONB), status (VARCHAR com CHECK constraint), created_at, updated_at
  - Constraint CHECK para status válido

**Status**: ✅ Funcionando e testado

---

### ✅ VerificationSession Module (COMPLETO)

**Domain:**
- `verification-session.entity.ts` - Entidade VerificationSession (id, userId, orbId, startedAt, completedAt, status, createdAt, updatedAt)
- `verification-session.types.ts` - VerificationSessionStatus enum (PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED)
- `verification-session.repository.interface.ts` - Interface IVerificationSessionRepository
- `verification-session.errors.ts` - VerificationSessionNotFoundError, VerificationSessionAlreadyCompletedError

**Application:**
- `verification-session.service.ts` - VerificationSessionService
  - Injeção de dependências: IUserRepository e IOrbRepository (valida existência antes de criar)
  - Métodos: findById, findByUserId, create, complete, updateStatus
- `dto/create-verification-session.dto.ts` - Validação de userId e orbId

**Infrastructure:**
- `verification-session.repository.postgres.ts` - Implementação PostgreSQL completa
  - findById: Busca por ID
  - findByUserId: Lista todas as sessões de um usuário (ordenado por created_at DESC)
  - create: Cria nova sessão
  - updateStatus: Atualiza status e completedAt

**GraphQL:**
- `verification-session.typeDefs.ts` - Schema GraphQL completo (usando `extend type Query/Mutation`)
  - Enum `VerificationSessionStatus` (PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED)
  - Type `VerificationSession` completo
  - Queries: `verificationSession(id: ID!)`, `verificationSessionsByUser(userId: ID!)`
  - Mutations: `createVerificationSession`, `completeVerificationSession`, `updateVerificationSessionStatus`
- `verification-session.resolvers.ts` - Resolvers completos
  - Query: `verificationSession` (retorna null se não encontrar)
  - Query: `verificationSessionsByUser` (retorna array)
  - Mutation: `createVerificationSession` (valida User e Orb existem)
  - Mutation: `completeVerificationSession` (completa sessão)
  - Mutation: `updateVerificationSessionStatus` (atualiza status)
  - Conversão Date → String implementada

**Database:**
- ✅ Migration criada e executada: `create_verification_sessions_table`
  - Tabela: `verification_sessions` com id (UUID, PK), user_id (UUID, FK → users), orb_id (UUID, FK → orbs), started_at, completed_at (nullable), status (VARCHAR com CHECK constraint), created_at, updated_at
  - Foreign keys com CASCADE delete
  - Índices em user_id, orb_id e status
  - Constraint CHECK para status válido

**Status**: ✅ Funcionando e testado

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
- `eslint` - Linter com regras TypeScript
- `prettier` - Formatação de código
- `tsconfig-paths` - Suporte a path aliases em runtime

### Scripts (package.json)

```json
"dev": "ts-node-dev --respawn --transpile-only -r tsconfig-paths/register src/app.ts"
"build": "tsc"
"start": "node dist/app.js"
"migrate:up": "node -r dotenv/config node_modules/.bin/node-pg-migrate up --migrations-dir src/database/migrations"
"migrate:down": "node -r dotenv/config node_modules/.bin/node-pg-migrate down --migrations-dir src/database/migrations"
"migrate:create": "node-pg-migrate create --migrations-dir src/database/migrations"
"lint": "eslint src --ext .ts"
"lint:fix": "eslint src --ext .ts --fix"
"format": "prettier --write \"src/**/*.{ts,json}\""
"format:check": "prettier --check \"src/**/*.{ts,json}\""
"type-check": "tsc --noEmit"
"check": "npm run type-check && npm run lint && npm run format:check"
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
│   ├── orb/                 # ✅ Completo
│   └── verification-session/ # ✅ Completo
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
- **Implementação**: Service injeta interfaces dos outros módulos (IUserRepository, IOrbRepository) para validar existência antes de criar relacionamento
- **Benefício**: Domain permanece isolado, fácil de testar com mocks

### 4. DTOs para Validação
- **Padrão**: Criar DTOs com função de validação separada
- **Razão**: Separa validação da lógica de negócio, reutilizável
- **Uso**: Service valida DTO antes de processar

### 5. Conversão Date → String no GraphQL
- **Padrão**: Converter `Date` para `String` nos resolvers
- **Razão**: GraphQL não tem tipo DateTime nativo, usa String
- **Implementação**: `createdAt.toISOString()` nos resolvers
- **Tratamento de null**: `completedAt?.toISOString() || null` para campos opcionais

### 6. Extend Type no GraphQL Schema
- **Padrão**: Primeiro módulo define `type Query` e `type Mutation`, demais usam `extend type Query` e `extend type Mutation`
- **Razão**: GraphQL não permite múltiplas definições do mesmo tipo
- **Implementação**: User module define tipos base, Orb e VerificationSession usam `extend`

### 7. Path Aliases com `~`
- **Decisão**: Usar `~` como alias para `src/` em todos os imports
- **Razão**: Evita imports relativos complexos (`../../../`), código mais limpo e fácil de mover arquivos
- **Configuração**: `tsconfig.json` com `baseUrl` e `paths`, `tsconfig-paths` para runtime
- **Exemplo**: `import pool from '~/config/database'` ao invés de `import pool from '../../../config/database'`

### 8. TypeScript Strict Mode Configurado
- **Configuração**: TypeScript com strict mode completo, mas `noPropertyAccessFromIndexSignature: false`
- **Razão**: Facilita validações de DTOs sem precisar usar bracket notation excessivamente
- **ESLint**: Regras específicas para arquivos DTO que desabilitam unsafe operations (necessárias em validações)

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
- ✅ Migration criada e executada: `create_orbs_table`
- Estrutura: id (UUID, PK), serial_number (VARCHAR, UNIQUE), location (JSONB), status (VARCHAR com CHECK constraint), created_at, updated_at
- Constraint CHECK para status válido

**verification_sessions:**
- ✅ Migration criada e executada: `create_verification_sessions_table`
- Estrutura: id (UUID, PK), user_id (UUID, FK → users), orb_id (UUID, FK → orbs), started_at (TIMESTAMP), completed_at (TIMESTAMP, nullable), status (VARCHAR com CHECK constraint), created_at, updated_at
- Foreign keys com CASCADE delete
- Índices em user_id, orb_id e status

### Migrations

- Localização: `src/database/migrations/`
- Ferramenta: `node-pg-migrate`
- Configuração: `migrate.json` com `migrations-folder: src/database/migrations`

---

## 🚀 Próximos Passos

### Curto Prazo (Melhorias e Refinamentos)
1. ⏳ Melhorar tratamento de erros GraphQL (formatação consistente)
2. ⏳ Adicionar validações adicionais nos DTOs
3. ⏳ Revisar e melhorar type safety (remover `any` dos resolvers)

### Médio Prazo (Features Avançadas)
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

1. **Testes**: Não implementados ainda (unit tests, integration tests)
2. **Error Handling**: Pode ser melhorado (formatação GraphQL mais consistente)
3. **N+1 Problem**: Não resolvido ainda (DataLoader necessário para queries aninhadas)
4. **Pagination**: Não implementada (cursor-based pagination para listagens)
5. **app.ts**: Erro de tipo com Mercurius (não crítico, não afeta funcionamento)

## 📝 Implementações Recentes

### Orb Module (2024-12-03)
- ✅ Criada entidade Orb com location como objeto embutido
- ✅ Criados tipos TypeScript (Location, OrbStatus)
- ✅ Criado DTO com validação completa de location (latitude/longitude ranges)
- ✅ Implementado Repository PostgreSQL com conversão JSONB ↔ objeto
- ✅ Criados TypeDefs GraphQL com tipos aninhados (Location, LocationInput)
- ✅ Criados Resolvers completos (orb, createOrb, updateOrbStatus)
- ✅ Criada migration com constraint CHECK para status
- ✅ Migration executada e integrado no schema principal
- ✅ Testado e funcionando

### VerificationSession Module (2024-12-03)
- ✅ Criada entidade VerificationSession com relacionamentos por ID (userId, orbId)
- ✅ Criado enum VerificationSessionStatus (PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED)
- ✅ Criado Service com injeção de dependências (IUserRepository, IOrbRepository)
- ✅ Validação de existência de User e Orb antes de criar sessão
- ✅ Implementado Repository PostgreSQL com foreign keys e índices
- ✅ Criados TypeDefs GraphQL usando `extend type Query/Mutation`
- ✅ Criados Resolvers completos (verificationSession, verificationSessionsByUser, createVerificationSession, completeVerificationSession, updateVerificationSessionStatus)
- ✅ Criada migration com foreign keys, índices e constraints
- ✅ Migration executada e integrado no schema principal
- ✅ Testado e funcionando

### Decisões Importantes (2024-12-03)
- ✅ Uso de `extend type Query` e `extend type Mutation` para evitar conflitos no GraphQL schema
- ✅ Relacionamentos entre módulos usando apenas IDs (não importar entidades diretamente)
- ✅ Validação de existência de entidades relacionadas no Service antes de criar relacionamento

### Configuração TypeScript e Tooling (2024-12-03)
- ✅ TypeScript strict mode completo configurado
- ✅ ESLint com regras TypeScript estritas
- ✅ Prettier para formatação automática
- ✅ Path aliases (`~`) configurados e aplicados em todos os imports
- ✅ Regras ESLint específicas para arquivos DTO (permite unsafe operations necessárias em validações)
- ✅ `noPropertyAccessFromIndexSignature: false` para facilitar validações sem bracket notation excessiva
- ✅ Validações de DTO simplificadas (sem type guards complexos, validação direta)

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
