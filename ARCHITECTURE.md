# Clean Architecture e DDD - Explicação Completa

## 📚 Índice
1. [O que é Clean Architecture?](#o-que-é-clean-architecture)
2. [O que é DDD (Domain-Driven Design)?](#o-que-é-ddd-domain-driven-design)
3. [Por que usar essas abordagens?](#por-que-usar-essas-abordagens)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Camadas da Arquitetura](#camadas-da-arquitetura)
6. [Fluxo de Dados](#fluxo-de-dados)
7. [Princípios Aplicados](#princípios-aplicados)

---

## 🏗️ O que é Clean Architecture?

**Clean Architecture** (Arquitetura Limpa) é um padrão arquitetural criado por Robert C. Martin (Uncle Bob) que organiza o código em **camadas concêntricas**, onde:

- **Camadas internas** não dependem de camadas externas
- **Dependências apontam para dentro** (regra de dependência)
- O **domínio** (regras de negócio) fica no centro, isolado

### Princípio Fundamental: **Inversão de Dependências**

> "Dependa de abstrações, não de implementações concretas"

**Exemplo prático:**
- ❌ **Ruim**: Service depende diretamente de Repository concreto
- ✅ **Bom**: Service depende de uma Interface, Repository implementa essa interface

---

## 🎯 O que é DDD (Domain-Driven Design)?

**DDD** é uma abordagem de design de software que coloca o **domínio** (regras de negócio) no centro do desenvolvimento.

### Conceitos Principais:

1. **Domain (Domínio)**: O coração do negócio - regras e entidades
2. **Bounded Context**: Limites claros entre diferentes partes do sistema
3. **Entities**: Objetos com identidade única (ex: User, Orb, Verification)
4. **Value Objects**: Objetos sem identidade, definidos por seus valores
5. **Domain Services**: Lógica de negócio que não pertence a uma entidade específica

### No nosso projeto:
- Cada módulo (`user`, `orb`, `verification`) é um **Bounded Context**
- Cada módulo tem seu próprio domínio isolado

---

## 💡 Por que usar essas abordagens?

### 1. **Manutenibilidade**
- Código organizado e fácil de entender
- Mudanças ficam isoladas em camadas específicas

### 2. **Testabilidade**
- Fácil criar mocks usando interfaces
- Testes unitários sem depender de banco de dados

### 3. **Flexibilidade**
- Trocar banco de dados sem afetar regras de negócio
- Trocar GraphQL por REST sem reescrever tudo

### 4. **Escalabilidade**
- Fácil adicionar novos módulos seguindo o mesmo padrão
- Time pode trabalhar em módulos diferentes sem conflitos

### 5. **Desacoplamento**
- Regras de negócio não dependem de frameworks
- Código de infraestrutura pode ser substituído facilmente

---

## 📁 Estrutura do Projeto

```
src/
├── modules/              # Módulos de negócio (Bounded Contexts)
│   ├── user/
│   ├── orb/
│   └── verification/
│
├── graphql/             # Configuração GraphQL global
├── config/              # Configurações da aplicação
│   ├── env.ts
│   └── database.ts     # Configuração PostgreSQL
├── database/            # Banco de dados
│   ├── migrations/      # Migrations do banco
│   ├── seeds/           # Seeds para dados iniciais
│   └── connection.ts    # Gerenciamento de conexão
└── shared/              # Código compartilhado entre módulos

infrastructure/          # AWS CDK - Infraestrutura como Código
├── bin/
│   └── app.ts          # Entry point do CDK
├── lib/
│   ├── database-stack.ts    # Stack RDS PostgreSQL
│   ├── api-stack.ts         # Stack API/Lambda
│   ├── vpc-stack.ts         # Stack VPC
│   └── security-stack.ts    # Stack Security Groups/IAM
├── cdk.json            # Configuração CDK
├── tsconfig.json       # TypeScript config
└── package.json        # Dependências CDK
```

### Cada módulo segue a mesma estrutura:

```
modules/{nome}/
├── domain/              # 🎯 CAMADA DE DOMÍNIO (Mais Interna)
│   ├── {nome}.entity.ts
│   ├── {nome}.repository.interface.ts
│   ├── {nome}.errors.ts
│   └── __tests__/
│
├── application/         # 📋 CAMADA DE APLICAÇÃO
│   ├── {nome}.service.ts
│   ├── dto/
│   └── __tests__/
│
├── infra/               # 🔧 CAMADA DE INFRAESTRUTURA
│   ├── {nome}.repository.ts          # Implementação genérica/mock
│   ├── {nome}.repository.postgres.ts # Implementação PostgreSQL
│   └── __tests__/
│
└── graphql/             # 🌐 CAMADA DE APRESENTAÇÃO
    ├── {nome}.typeDefs.ts
    └── {nome}.resolvers.ts
```

---

## 🎨 Camadas da Arquitetura

### 1. **Domain (Domínio)** - 🎯 Camada Mais Interna

**Responsabilidade**: Contém as regras de negócio puras, sem dependências externas.

**O que contém:**
- **Entities**: Classes que representam conceitos do negócio
- **Interfaces**: Contratos que definem o que precisa ser feito (não como fazer)
- **Domain Errors**: Erros específicos do domínio

**Características:**
- ✅ Não depende de NADA externo
- ✅ Não conhece GraphQL, banco de dados, HTTP, etc.
- ✅ Pode ser testado isoladamente
- ✅ Pode ser reutilizado em outros projetos

**Exemplo:**
```typescript
// domain/user.entity.ts
export class User {
  id: string;
  email: string;
  name: string;
  // Regras de negócio puras aqui
}

// domain/user.repository.interface.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  // Define O QUE precisa ser feito, não COMO
}
```

**Por que separar?**
- Se você mudar de PostgreSQL para MongoDB, o domínio não muda
- Se você mudar de GraphQL para REST, o domínio não muda
- Regras de negócio ficam protegidas de mudanças tecnológicas

**Nota**: O projeto utiliza PostgreSQL como banco de dados. A implementação PostgreSQL fica em `{nome}.repository.postgres.ts`, enquanto a interface permanece no Domain. Isso permite ter múltiplas implementações (mock para testes, PostgreSQL para produção) sem afetar o Domain.

---

### 2. **Application (Aplicação)** - 📋 Casos de Uso

**Responsabilidade**: Orquestra o domínio para executar casos de uso específicos.

**O que contém:**
- **Services**: Coordenam as operações de negócio
- **DTOs**: Objetos de transferência de dados (validação de entrada)

**Características:**
- ✅ Depende apenas do Domain (interfaces)
- ✅ Contém a lógica de casos de uso
- ✅ Valida dados de entrada
- ✅ Coordena chamadas ao repositório

**Exemplo:**
```typescript
// application/user.service.ts
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository  // Interface, não implementação!
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    // 1. Valida dados
    // 2. Verifica regras de negócio
    // 3. Chama repositório
    // 4. Retorna resultado
  }
}
```

**Por que separar?**
- Um caso de uso pode usar múltiplas entidades
- Facilita testes (mock do repositório)
- Lógica de negócio fica clara e testável

---

### 3. **Infrastructure (Infraestrutura)** - 🔧 Implementações Concretas

**Responsabilidade**: Implementa as interfaces definidas no Domain usando tecnologias específicas.

**O que contém:**
- **Repositories**: Implementações concretas (PostgreSQL, MongoDB, etc.)
- **Integrações externas**: APIs, serviços, etc.

**Características:**
- ✅ Implementa interfaces do Domain
- ✅ Conhece tecnologias específicas (banco, APIs)
- ✅ Pode ser substituído sem afetar outras camadas

**Exemplo:**
```typescript
// infra/user.repository.ts
export class UserRepository implements IUserRepository {
  // Implementa a interface usando PostgreSQL, MongoDB, etc.
  async findById(id: string): Promise<User | null> {
    // Código específico do banco de dados
  }
}
```

**Por que separar?**
- Trocar de banco = mudar apenas esta camada
- Testes podem usar implementação em memória
- Múltiplas implementações podem coexistir

**No projeto**:
- `{nome}.repository.ts`: Implementação genérica/mock (para testes)
- `{nome}.repository.postgres.ts`: Implementação PostgreSQL (produção)
- Ambas implementam a mesma interface do Domain (`I{nome}Repository`)
- Service pode usar qualquer uma sem mudanças no código

---

### 4. **GraphQL (Apresentação)** - 🌐 Interface com o Mundo Exterior

**Responsabilidade**: Expõe a aplicação para o mundo exterior via GraphQL.

**O que contém:**
- **TypeDefs**: Definições dos tipos GraphQL
- **Resolvers**: Conectam GraphQL com os Services

**Características:**
- ✅ Depende apenas da Application
- ✅ Converte dados GraphQL para DTOs
- ✅ Trata erros e formata respostas

**Exemplo:**
```typescript
// graphql/user.resolvers.ts
export const userResolvers = {
  Query: {
    user: async (_, { id }) => {
      return await userService.findById(id);  // Usa o Service
    }
  }
}
```

**Por que separar?**
- Trocar GraphQL por REST = mudar apenas esta camada
- Application não conhece GraphQL
- Fácil adicionar outras interfaces (CLI, gRPC, etc.)

---

## 🔄 Fluxo de Dados

### Exemplo: Criar um Usuário

```
1. Cliente GraphQL
   ↓
2. Resolver (graphql/user.resolvers.ts)
   ↓ Recebe: { email, name }
   ↓
3. Service (application/user.service.ts)
   ↓ Valida com DTO
   ↓ Verifica regras de negócio
   ↓
4. Repository Interface (domain/user.repository.interface.ts)
   ↓ (contrato)
   ↓
5. Repository Implementation (infra/user.repository.ts)
   ↓ Salva no banco
   ↓
6. Retorna User Entity (domain/user.entity.ts)
   ↑
7. Service retorna para Resolver
   ↑
8. Resolver retorna para Cliente
```

### Regra de Ouro: **Dependências apontam para dentro**

```
GraphQL → Application → Domain ← Infrastructure
```

- GraphQL depende de Application
- Application depende de Domain
- Infrastructure depende de Domain (implementa interfaces)
- Domain não depende de NADA

---

## 🎯 Princípios Aplicados

### 1. **Dependency Inversion Principle (DIP)**

**O que é**: Depender de abstrações, não de implementações concretas.

**No projeto:**
```typescript
// ✅ BOM: Service depende de interface
class UserService {
  constructor(private repo: IUserRepository) {}  // Interface
}

// ❌ RUIM: Service depende de implementação
class UserService {
  constructor(private repo: UserRepository) {}  // Implementação concreta
}
```

**Benefício**: Pode trocar implementação sem mudar Service.

---

### 2. **Single Responsibility Principle (SRP)**

**O que é**: Cada classe/arquivo tem uma única responsabilidade.

**No projeto:**
- `user.entity.ts` → Apenas estrutura do User
- `user.service.ts` → Apenas lógica de casos de uso
- `user.repository.ts` → Apenas acesso a dados
- `user.resolvers.ts` → Apenas conversão GraphQL

**Benefício**: Fácil de entender, testar e manter.

---

### 3. **Open/Closed Principle (OCP)**

**O que é**: Aberto para extensão, fechado para modificação.

**No projeto:**
- Adicionar novo módulo → Não precisa modificar módulos existentes
- Adicionar novo repositório → Implementa interface existente
- Adicionar novo resolver → Não afeta services

**Benefício**: Sistema cresce sem quebrar código existente.

---

### 4. **Interface Segregation Principle (ISP)**

**O que é**: Interfaces específicas são melhores que interfaces genéricas.

**No projeto:**
- `IUserRepository` → Específico para User
- Não uma interface genérica `IRepository<T>`

**Benefício**: Implementações não precisam implementar métodos que não usam.

---

### 5. **Dependency Injection (DI)**

**O que é**: Dependências são injetadas, não criadas internamente.

**No projeto:**
```typescript
// ✅ BOM: Dependência injetada
class UserService {
  constructor(private repo: IUserRepository) {}
}

// ❌ RUIM: Dependência criada internamente
class UserService {
  private repo = new UserRepository();  // Acoplamento!
}
```

**Benefício**: Fácil testar e trocar implementações.

---

## 🧪 Testabilidade

### Como testar cada camada:

**1. Domain (Mais fácil)**
```typescript
// Testa entidade sem dependências
test('User should validate email', () => {
  const user = new User({ email: 'test@test.com' });
  expect(user.email).toBe('test@test.com');
});
```

**2. Application (Mock do Repository)**
```typescript
// Mock da interface
const mockRepo: IUserRepository = {
  findById: jest.fn(),
  // ...
};

const service = new UserService(mockRepo);
// Testa lógica sem banco de dados
```

**3. Infrastructure (Mock do banco ou banco de teste)**
```typescript
// Testa implementação específica
test('Repository should save to database', async () => {
  const repo = new UserRepository(testDb);
  // ...
});
```

**4. GraphQL (Mock do Service)**
```typescript
// Mock do service
const mockService = { findById: jest.fn() };
// Testa apenas conversão GraphQL
```

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────┐
│      GraphQL (Apresentação)         │  ← Interface com usuário
│  - Resolvers                        │
│  - TypeDefs                         │
└──────────────┬──────────────────────┘
               │ depende de
               ↓
┌─────────────────────────────────────┐
│    Application (Casos de Uso)      │  ← Lógica de negócio
│  - Services                         │
│  - DTOs                             │
└──────────────┬──────────────────────┘
               │ depende de
               ↓
┌─────────────────────────────────────┐
│        Domain (Domínio)             │  ← Regras puras
│  - Entities                         │     (Núcleo)
│  - Interfaces                       │
│  - Errors                           │
└──────────────┬──────────────────────┘
               ↑ implementa
               │
┌─────────────────────────────────────┐
│    Infrastructure (Infraestrutura)  │  ← Implementações
│  - Repositories                     │     concretas
│  - Integrações                      │
└─────────────────────────────────────┘
```

---

## 🎓 Perguntas Comuns em Entrevistas

### 1. "Por que separar em camadas?"

**Resposta**: Para manter o código desacoplado, testável e flexível. Regras de negócio não devem depender de tecnologias específicas.

### 2. "O que é Dependency Inversion?"

**Resposta**: É depender de abstrações (interfaces) ao invés de implementações concretas. Isso permite trocar implementações sem afetar o código que as usa.

### 3. "Como você testaria isso?"

**Resposta**: Cada camada pode ser testada isoladamente usando mocks das dependências. Domain é testado sem mocks, Application usa mocks do Repository, etc.

### 4. "E se precisar trocar de banco de dados?"

**Resposta**: Apenas a camada de Infrastructure precisa mudar. Crio uma nova implementação da interface do Repository. Domain e Application não mudam.

### 5. "Qual a diferença entre Domain e Application?"

**Resposta**: Domain contém as regras de negócio puras e entidades. Application orquestra essas regras para executar casos de uso específicos, coordenando múltiplas entidades quando necessário.

---

## 🚀 Próximos Passos

1. Implementar as entidades no Domain
2. Criar os Services na Application
3. Implementar os Repositories na Infrastructure
4. Conectar tudo nos Resolvers GraphQL
5. Escrever testes para cada camada

---

**Lembre-se**: A arquitetura existe para servir o código, não o contrário. Use o que faz sentido para seu projeto!

