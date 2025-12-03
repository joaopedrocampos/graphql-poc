# 🔗 Relacionamentos Entre Módulos - Guia Visual

## 📊 Estrutura de Relacionamento

```
┌─────────────────────────────────────────────────────────────┐
│                    MÓDULO USER                              │
│                                                              │
│  Domain:                                                     │
│    ┌─────────────────┐                                      │
│    │  User Entity    │                                      │
│    │  - id           │                                      │
│    │  - email        │                                      │
│    │  - name         │                                      │
│    └─────────────────┘                                      │
│                                                              │
│    ┌──────────────────────────┐                             │
│    │ IUserRepository         │ ← Interface                  │
│    │ (contrato)              │                             │
│    └──────────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │ implementa
                          │
┌─────────────────────────────────────────────────────────────┐
│                    MÓDULO ORB                               │
│                                                              │
│  Domain:                                                     │
│    ┌─────────────────┐                                      │
│    │  Orb Entity     │                                      │
│    │  - id           │                                      │
│    │  - name         │                                      │
│    └─────────────────┘                                      │
│                                                              │
│    ┌──────────────────────────┐                             │
│    │ IOrbRepository           │ ← Interface                 │
│    │ (contrato)               │                             │
│    └──────────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │ implementa
                          │
┌─────────────────────────────────────────────────────────────┐
│                MÓDULO VERIFICATION                           │
│                                                              │
│  Domain:                                                     │
│    ┌─────────────────────────────┐                          │
│    │  Verification Entity       │                          │
│    │  - id                      │                          │
│    │  - userId: string    ←─────┼─── Referência (ID)      │
│    │  - orbId: string     ←─────┼─── Referência (ID)      │
│    │  - status                  │                          │
│    └─────────────────────────────┘                          │
│                                                              │
│    ┌──────────────────────────┐                             │
│    │ IVerificationRepository  │                             │
│    └──────────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │
┌─────────────────────────────────────────────────────────────┐
│         APPLICATION LAYER (VerificationService)            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  VerificationService                               │    │
│  │                                                    │    │
│  │  constructor(                                     │    │
│  │    verificationRepo: IVerificationRepository,    │    │
│  │    userRepo: IUserRepository,    ←─── Interface   │    │
│  │    orbRepo: IOrbRepository       ←─── Interface   │    │
│  │  )                                                │    │
│  │                                                    │    │
│  │  create(data) {                                   │    │
│  │    // 1. Valida User existe                       │    │
│  │    userRepo.findById(data.userId)                 │    │
│  │                                                    │    │
│  │    // 2. Valida Orb existe                        │    │
│  │    orbRepo.findById(data.orbId)                   │    │
│  │                                                    │    │
│  │    // 3. Cria Verification com IDs                │    │
│  │    verificationRepo.create({                      │    │
│  │      userId: data.userId,                         │    │
│  │      orbId: data.orbId                            │    │
│  │    })                                             │    │
│  │  }                                                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Fluxo Correto (Passo a Passo)

### 1. Cliente faz requisição GraphQL

```graphql
mutation {
  createVerification(input: {
    userId: "user_123"
    orbId: "orb_456"
    status: "pending"
  }) {
    id
    userId
    orbId
  }
}
```

### 2. Resolver recebe e chama Service

```typescript
// verification/graphql/verification.resolvers.ts
createVerification: async (_, { input }) => {
  return await verificationService.create(input);
}
```

### 3. Service valida e cria

```typescript
// verification/application/verification.service.ts
async create(data: CreateVerificationDto) {
  // ✅ Busca User através da INTERFACE
  const user = await this.userRepository.findById(data.userId);
  if (!user) throw new Error('User not found');
  
  // ✅ Busca Orb através da INTERFACE
  const orb = await this.orbRepository.findById(data.orbId);
  if (!orb) throw new Error('Orb not found');
  
  // ✅ Cria Verification apenas com IDs
  return await this.verificationRepository.create({
    userId: data.userId,  // Apenas ID
    orbId: data.orbId,     // Apenas ID
    status: data.status
  });
}
```

### 4. Repository salva no banco

```typescript
// verification/infra/verification.repository.ts
async create(data) {
  // Salva no banco com foreign keys
  await db.query(`
    INSERT INTO verifications (user_id, orb_id, status)
    VALUES ($1, $2, $3)
  `, [data.userId, data.orbId, data.status]);
}
```

---

## ❌ O que NÃO fazer

### ❌ Erro 1: Importar entidades diretamente

```typescript
// verification/domain/verification.entity.ts
import { User } from '../../user/domain/user.entity';  // ❌ ERRADO!
import { Orb } from '../../orb/domain/orb.entity';     // ❌ ERRADO!

export class Verification {
  user: User;  // ❌ Acoplamento direto
  orb: Orb;    // ❌ Acoplamento direto
}
```

**Problema**: Domain depende de outros módulos → quebra isolamento

---

### ❌ Erro 2: Depender de implementações concretas

```typescript
// verification/application/verification.service.ts
import { UserRepository } from '../../user/infra/user.repository';  // ❌ ERRADO!

export class VerificationService {
  constructor(
    private userRepo: UserRepository  // ❌ Implementação concreta
  ) {}
}
```

**Problema**: Depende de implementação → difícil testar e trocar

---

### ❌ Erro 3: Criar dependência circular

```typescript
// user/domain/user.entity.ts
import { Verification } from '../../verification/domain/verification.entity';  // ❌ ERRADO!

export class User {
  verifications: Verification[];  // ❌ Dependência circular
}
```

**Problema**: User depende de Verification, Verification depende de User → ciclo!

---

## ✅ Regras de Ouro

1. **Domain armazena apenas IDs** (referências)
2. **Service injeta interfaces** (não entidades, não implementações)
3. **Validação acontece na Application** (antes de criar relacionamento)
4. **Domain nunca importa de outros módulos** (exceto shared, com cuidado)
5. **Dependências apontam para dentro** (Domain ← Application ← GraphQL)

---

## 🎯 Resumo para Entrevista

**Pergunta**: "Como você relaciona módulos diferentes sem quebrar Clean Architecture?"

**Resposta**:

> "Uso referências por ID ao invés de importar entidades diretamente. Por exemplo, Verification armazena apenas `userId` e `orbId`. Quando preciso validar ou buscar dados, injeto as interfaces dos repositórios dos outros módulos no Service. Isso mantém o Domain isolado e permite testar facilmente com mocks. A validação de existência acontece na Application antes de criar o relacionamento."

**Pontos-chave**:
- ✅ IDs ao invés de objetos
- ✅ Interfaces ao invés de entidades
- ✅ Validação na Application
- ✅ Domain isolado

---

## 📋 Checklist de Implementação

Ao implementar relacionamentos, verifique:

- [ ] Entidade armazena apenas IDs (não objetos)
- [ ] Service injeta interfaces (não entidades)
- [ ] Service valida existência antes de criar
- [ ] Domain não importa de outros módulos
- [ ] Testes usam mocks das interfaces
- [ ] Não há dependência circular
- [ ] Cada módulo permanece independente

---

**Lembre-se**: O objetivo é manter módulos desacoplados, mas ainda assim capazes de se relacionar quando necessário! 🎯

