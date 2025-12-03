# 🔗 Relacionamentos Entre Módulos - Clean Architecture & DDD

## 🎯 O Problema

Em DDD, cada módulo é um **Bounded Context** isolado. Mas no mundo real, módulos precisam se relacionar. Como fazer isso sem quebrar os princípios?

**Seu caso:**
- `Verification` precisa de `User` e `Orb`
- Como relacionar sem criar acoplamento?

---

## ✅ Solução: Referências por ID + Injeção de Dependências

### Princípio Fundamental

> **"Um módulo não deve importar entidades de outro módulo diretamente"**

Em vez disso:
1. Armazene apenas **IDs** (referências)
2. Quando precisar dos dados completos, **injete interfaces** dos outros módulos
3. Busque os dados através dessas interfaces

---

## 📋 Implementação Correta

### 1. Domain Layer - Verification Entity

**Arquivo**: `modules/verification/domain/verification.entity.ts`

```typescript
// ✅ CORRETO: Apenas IDs, sem importar User ou Orb
export class Verification {
  id: string;
  userId: string;        // Referência ao User (apenas ID)
  orbId: string;         // Referência ao Orb (apenas ID)
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Verification>) {
    this.id = data.id || '';
    this.userId = data.userId || '';
    this.orbId = data.orbId || '';
    this.status = data.status || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
```

**Por quê?**
- ✅ Não importa `User` ou `Orb`
- ✅ Domain permanece isolado
- ✅ Não quebra Clean Architecture

---

### 2. Domain Layer - Repository Interface

**Arquivo**: `modules/verification/domain/verification.repository.interface.ts`

```typescript
import { Verification } from './verification.entity';

export interface IVerificationRepository {
  findById(id: string): Promise<Verification | null>;
  findByUserId(userId: string): Promise<Verification[]>;
  findByOrbId(orbId: string): Promise<Verification[]>;
  create(verification: Omit<Verification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Verification>;
  update(id: string, verification: Partial<Verification>): Promise<Verification>;
  delete(id: string): Promise<boolean>;
}
```

**Por quê?**
- ✅ Interface trabalha apenas com `Verification`
- ✅ Não conhece `User` ou `Orb`

---

### 3. Application Layer - Service com Injeção de Dependências

**Arquivo**: `modules/verification/application/verification.service.ts`

```typescript
import { IVerificationRepository } from '../domain/verification.repository.interface';
import { Verification } from '../domain/verification.entity';
import { VerificationNotFoundError } from '../domain/verification.errors';
import { CreateVerificationDto } from './dto/create-verification.dto';

// ✅ Importar APENAS interfaces de outros módulos
import { IUserRepository } from '../../user/domain/user.repository.interface';
import { IOrbRepository } from '../../orb/domain/orb.repository.interface';

export class VerificationService {
  constructor(
    private readonly verificationRepository: IVerificationRepository,
    // ✅ Injetar interfaces dos outros módulos
    private readonly userRepository: IUserRepository,
    private readonly orbRepository: IOrbRepository,
  ) {}

  async create(data: CreateVerificationDto): Promise<Verification> {
    // 1. Validar que User existe
    const user = await this.userRepository.findById(data.userId);
    if (!user) {
      throw new Error(`User with id ${data.userId} not found`);
    }

    // 2. Validar que Orb existe
    const orb = await this.orbRepository.findById(data.orbId);
    if (!orb) {
      throw new Error(`Orb with id ${data.orbId} not found`);
    }

    // 3. Criar Verification (apenas com IDs)
    return await this.verificationRepository.create({
      userId: data.userId,
      orbId: data.orbId,
      status: data.status,
    });
  }

  async findById(id: string): Promise<Verification> {
    const verification = await this.verificationRepository.findById(id);
    if (!verification) {
      throw new VerificationNotFoundError(id);
    }
    return verification;
  }

  // Método para buscar Verification com dados completos (se necessário)
  async findByIdWithDetails(id: string): Promise<{
    verification: Verification;
    user: any;  // Ou criar um DTO específico
    orb: any;   // Ou criar um DTO específico
  }> {
    const verification = await this.findById(id);
    
    // Buscar dados dos outros módulos através das interfaces
    const user = await this.userRepository.findById(verification.userId);
    const orb = await this.orbRepository.findById(verification.orbId);

    return {
      verification,
      user,
      orb,
    };
  }
}
```

**Por quê?**
- ✅ Service depende de **interfaces**, não de entidades
- ✅ Valida existência antes de criar relacionamento
- ✅ Domain permanece isolado

---

### 4. DTOs - Apenas IDs

**Arquivo**: `modules/verification/application/dto/create-verification.dto.ts`

```typescript
export interface CreateVerificationDto {
  userId: string;    // Apenas ID
  orbId: string;     // Apenas ID
  status: string;
}

export function validateCreateVerificationDto(data: any): CreateVerificationDto {
  if (!data.userId || typeof data.userId !== 'string') {
    throw new Error('userId is required and must be a string');
  }

  if (!data.orbId || typeof data.orbId !== 'string') {
    throw new Error('orbId is required and must be a string');
  }

  if (!data.status || typeof data.status !== 'string') {
    throw new Error('status is required and must be a string');
  }

  return {
    userId: data.userId.trim(),
    orbId: data.orbId.trim(),
    status: data.status.trim(),
  };
}
```

---

### 5. GraphQL Layer - Resolver

**Arquivo**: `modules/verification/graphql/verification.resolvers.ts`

```typescript
import { IResolvers } from 'graphql-tools';
import { VerificationService } from '../application/verification.service';

export function createVerificationResolvers(
  verificationService: VerificationService
): IResolvers {
  return {
    Query: {
      verification: async (_: any, { id }: { id: string }) => {
        return await verificationService.findById(id);
      },
      
      verificationWithDetails: async (_: any, { id }: { id: string }) => {
        return await verificationService.findByIdWithDetails(id);
      },
    },
    Mutation: {
      createVerification: async (_: any, { input }: { input: any }) => {
        return await verificationService.create(input);
      },
    },
    // ✅ Resolver para buscar User relacionado
    Verification: {
      user: async (verification: any) => {
        // Aqui você pode injetar o UserService ou UserRepository
        // e buscar o user pelo verification.userId
        // Mas isso pode ser feito melhor no Service
        return null; // Implementar conforme necessário
      },
      orb: async (verification: any) => {
        // Similar ao user
        return null;
      },
    },
  };
}
```

---

### 6. GraphQL TypeDefs

**Arquivo**: `modules/verification/graphql/verification.typeDefs.ts`

```typescript
import { gql } from 'apollo-server-express';

export const verificationTypeDefs = gql`
  type Verification {
    id: ID!
    userId: ID!           # Referência ao User
    orbId: ID!             # Referência ao Orb
    status: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Opcional: campos resolvidos
    user: User             # Resolvido via field resolver
    orb: Orb               # Resolvido via field resolver
  }

  input CreateVerificationInput {
    userId: ID!
    orbId: ID!
    status: String!
  }

  type Query {
    verification(id: ID!): Verification
    verificationWithDetails(id: ID!): VerificationWithDetails
  }

  type Mutation {
    createVerification(input: CreateVerificationInput!): Verification!
  }

  # Tipo para retornar com dados completos
  type VerificationWithDetails {
    verification: Verification!
    user: User!
    orb: Orb!
  }
`;
```

---

## 🔄 Fluxo Completo

### Criar uma Verification:

```
1. Cliente GraphQL
   mutation {
     createVerification(input: {
       userId: "user_123"
       orbId: "orb_456"
       status: "pending"
     }) { id }
   }

2. Resolver → VerificationService.create()

3. VerificationService:
   - Valida DTO
   - Busca User via IUserRepository.findById("user_123")
   - Busca Orb via IOrbRepository.findById("orb_456")
   - Cria Verification com apenas IDs
   - Salva via IVerificationRepository

4. Retorna Verification (com userId e orbId)
```

---

## 🎯 Abordagens Alternativas (e quando usar)

### Abordagem 1: Referências por ID (✅ Recomendada)

**Quando usar**: Relacionamentos simples, módulos independentes

**Vantagens**:
- ✅ Mantém módulos desacoplados
- ✅ Fácil de testar
- ✅ Segue princípios DDD

**Desvantagens**:
- ⚠️ Precisa fazer queries adicionais para dados completos
- ⚠️ Não há garantia de integridade referencial no código

---

### Abordagem 2: Domain Events (Para casos mais complexos)

**Quando usar**: Quando ações em um módulo precisam disparar ações em outros

**Exemplo**:
```typescript
// Quando Verification é criada, dispara evento
class VerificationService {
  async create(data: CreateVerificationDto): Promise<Verification> {
    const verification = await this.repository.create(data);
    
    // Dispara evento
    this.eventBus.publish(new VerificationCreatedEvent({
      verificationId: verification.id,
      userId: verification.userId,
      orbId: verification.orbId,
    }));
    
    return verification;
  }
}
```

---

### Abordagem 3: Shared Kernel (⚠️ Use com cuidado)

**Quando usar**: Quando há conceitos realmente compartilhados entre módulos

**Exemplo**:
```typescript
// shared/domain/value-objects/user-id.ts
export class UserId {
  constructor(public readonly value: string) {
    if (!value) throw new Error('UserId cannot be empty');
  }
}
```

**⚠️ Cuidado**: Pode criar acoplamento entre módulos!

---

### Abordagem 4: Anti-Corruption Layer

**Quando usar**: Quando precisa integrar com sistemas legados ou externos

**Exemplo**:
```typescript
// verification/infra/adapters/user-adapter.ts
export class UserAdapter {
  // Traduz entre o formato do módulo User e o que Verification precisa
  async getUserForVerification(userId: string): Promise<VerificationUser> {
    const user = await this.userRepository.findById(userId);
    return this.toVerificationUser(user);
  }
}
```

---

## 🧪 Como Testar

### Teste do VerificationService com Mocks

```typescript
import { VerificationService } from '../verification.service';
import { IVerificationRepository } from '../../domain/verification.repository.interface';
import { IUserRepository } from '../../../user/domain/user.repository.interface';
import { IOrbRepository } from '../../../orb/domain/orb.repository.interface';
import { User } from '../../../user/domain/user.entity';
import { Orb } from '../../../orb/domain/orb.entity';

describe('VerificationService', () => {
  let service: VerificationService;
  let mockVerificationRepo: jest.Mocked<IVerificationRepository>;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockOrbRepo: jest.Mocked<IOrbRepository>;

  beforeEach(() => {
    mockVerificationRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      // ... outros métodos
    };

    mockUserRepo = {
      findById: jest.fn(),
      // ... outros métodos
    };

    mockOrbRepo = {
      findById: jest.fn(),
      // ... outros métodos
    };

    service = new VerificationService(
      mockVerificationRepo,
      mockUserRepo,
      mockOrbRepo
    );
  });

  it('should create verification when user and orb exist', async () => {
    // Arrange
    const user = new User({ id: 'user_123', email: 'test@test.com', name: 'Test' });
    const orb = new Orb({ id: 'orb_456', name: 'Test Orb' });
    const verificationData = {
      userId: 'user_123',
      orbId: 'orb_456',
      status: 'pending',
    };

    mockUserRepo.findById.mockResolvedValue(user);
    mockOrbRepo.findById.mockResolvedValue(orb);
    mockVerificationRepo.create.mockResolvedValue(
      new Verification({ ...verificationData, id: 'ver_789' })
    );

    // Act
    const result = await service.create(verificationData);

    // Assert
    expect(mockUserRepo.findById).toHaveBeenCalledWith('user_123');
    expect(mockOrbRepo.findById).toHaveBeenCalledWith('orb_456');
    expect(mockVerificationRepo.create).toHaveBeenCalled();
    expect(result.userId).toBe('user_123');
    expect(result.orbId).toBe('orb_456');
  });

  it('should throw error if user does not exist', async () => {
    // Arrange
    mockUserRepo.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(
      service.create({ userId: 'invalid', orbId: 'orb_456', status: 'pending' })
    ).rejects.toThrow('User with id invalid not found');
  });
});
```

---

## ✅ Checklist de Boas Práticas

- [ ] ✅ Verification não importa `User` ou `Orb` diretamente
- [ ] ✅ Verification armazena apenas IDs (`userId`, `orbId`)
- [ ] ✅ Service injeta interfaces dos outros módulos
- [ ] ✅ Valida existência antes de criar relacionamento
- [ ] ✅ Testes usam mocks das interfaces
- [ ] ✅ Domain permanece isolado
- [ ] ✅ Não há dependência circular entre módulos

---

## 🎓 Resposta para Entrevista

**Pergunta**: "Como você lida com relacionamentos entre módulos diferentes?"

**Resposta**:

> "Em DDD, cada módulo é um Bounded Context isolado. Para relacionamentos, uso referências por ID ao invés de importar entidades diretamente. Por exemplo, se Verification precisa de User e Orb, ela armazena apenas `userId` e `orbId`. Quando preciso validar ou buscar dados completos, injeto as interfaces dos repositórios dos outros módulos no Service. Isso mantém o Domain isolado e permite testar facilmente usando mocks. A validação de existência acontece na camada de Application, antes de criar o relacionamento."

---

## 📊 Comparação Visual

### ❌ Abordagem Errada (Acoplamento)

```typescript
// verification/domain/verification.entity.ts
import { User } from '../../user/domain/user.entity';  // ❌ ERRO!
import { Orb } from '../../orb/domain/orb.entity';     // ❌ ERRO!

export class Verification {
  user: User;  // ❌ Acoplamento direto
  orb: Orb;    // ❌ Acoplamento direto
}
```

**Problemas**:
- ❌ Domain depende de outros módulos
- ❌ Quebra isolamento
- ❌ Dificulta testes
- ❌ Cria dependência circular

---

### ✅ Abordagem Correta (Desacoplamento)

```typescript
// verification/domain/verification.entity.ts
export class Verification {
  userId: string;  // ✅ Apenas referência
  orbId: string;   // ✅ Apenas referência
}

// verification/application/verification.service.ts
import { IUserRepository } from '../../user/domain/user.repository.interface';  // ✅ Interface
import { IOrbRepository } from '../../orb/domain/orb.repository.interface';   // ✅ Interface

export class VerificationService {
  constructor(
    private userRepo: IUserRepository,  // ✅ Depende de interface
    private orbRepo: IOrbRepository,    // ✅ Depende de interface
  ) {}
}
```

**Vantagens**:
- ✅ Domain isolado
- ✅ Fácil testar
- ✅ Sem acoplamento
- ✅ Segue princípios DDD

---

## 🚀 Implementação no Seu Projeto

Agora você pode implementar seguindo esse padrão:

1. **Verification Entity**: Apenas `userId` e `orbId`
2. **Verification Service**: Injeta `IUserRepository` e `IOrbRepository`
3. **Validação**: Verifica existência antes de criar
4. **Testes**: Usa mocks das interfaces

Isso mantém seu projeto seguindo Clean Architecture e DDD! 🎯

