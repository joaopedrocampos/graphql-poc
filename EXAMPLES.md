# Exemplos Práticos - Clean Architecture no Projeto

Este documento mostra exemplos práticos de como cada camada funciona no seu projeto GraphQL.

---

## 📋 Exemplo Completo: Buscar Usuário por ID

Vamos seguir o fluxo completo de uma query GraphQL até o banco de dados.

### 1. GraphQL Layer (Apresentação)

**Arquivo**: `modules/user/graphql/user.resolvers.ts`

```typescript
import { UserService } from '../application/user.service';

export const userResolvers = {
  Query: {
    // Cliente faz: query { user(id: "123") { name email } }
    user: async (_: any, { id }: { id: string }) => {
      // Chama o Service (camada de Application)
      return await userService.findById(id);
    }
  }
};
```

**Responsabilidade**: 
- Recebe requisição GraphQL
- Extrai parâmetros (`id`)
- Chama o Service
- Retorna resposta GraphQL

**Não faz**: Validação de negócio, acesso a banco, lógica complexa

---

### 2. Application Layer (Casos de Uso)

**Arquivo**: `modules/user/application/user.service.ts`

```typescript
import { IUserRepository } from '../domain/user.repository.interface';
import { User } from '../domain/user.entity';
import { UserNotFoundError } from '../domain/user.errors';

export class UserService {
  // Recebe a INTERFACE, não a implementação concreta
  constructor(private readonly userRepository: IUserRepository) {}

  async findById(id: string): Promise<User> {
    // 1. Validação básica
    if (!id) {
      throw new Error('ID is required');
    }

    // 2. Busca no repositório (usa interface)
    const user = await this.userRepository.findById(id);

    // 3. Regra de negócio: se não encontrou, lança erro específico
    if (!user) {
      throw new UserNotFoundError(id);  // Erro do Domain
    }

    // 4. Retorna entidade do Domain
    return user;
  }
}
```

**Responsabilidade**:
- Orquestra o caso de uso
- Aplica regras de negócio
- Valida dados
- Trata erros do domínio

**Não faz**: Acesso direto ao banco, conhece GraphQL, conhece HTTP

---

### 3. Domain Layer (Domínio)

**Arquivo**: `modules/user/domain/user.entity.ts`

```typescript
export class User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<User>) {
    this.id = data.id || '';
    this.email = data.email || '';
    this.name = data.name || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Regra de negócio: validação de email
  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
}
```

**Arquivo**: `modules/user/domain/user.repository.interface.ts`

```typescript
import { User } from './user.entity';

// Interface: define O QUE precisa ser feito, não COMO
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<boolean>;
}
```

**Arquivo**: `modules/user/domain/user.errors.ts`

```typescript
export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User with id ${id} not found`);
    this.name = 'UserNotFoundError';
  }
}
```

**Responsabilidade**:
- Define entidades do negócio
- Define contratos (interfaces)
- Define erros específicos do domínio
- Contém regras de negócio puras

**Não faz**: Acesso a banco, conhece frameworks, conhece HTTP/GraphQL

---

### 4. Infrastructure Layer (Infraestrutura)

**Arquivo**: `modules/user/infra/user.repository.ts`

```typescript
import { IUserRepository } from '../domain/user.repository.interface';
import { User } from '../domain/user.entity';
import { db } from '../../../config/database';  // Exemplo: conexão com banco

export class UserRepository implements IUserRepository {
  // Implementa a interface definida no Domain
  
  async findById(id: string): Promise<User | null> {
    // Código específico do banco de dados (ex: PostgreSQL)
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Converte dados do banco para entidade do Domain
    return new User(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    // Implementação específica do banco
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // ... outros métodos
}
```

**Responsabilidade**:
- Implementa interfaces do Domain
- Conhece tecnologias específicas (PostgreSQL, MongoDB, etc.)
- Converte dados do banco para entidades

**Não faz**: Define regras de negócio, conhece GraphQL

---

## 🔄 Fluxo Completo Visualizado

```
┌─────────────────────────────────────────────────────────┐
│ 1. CLIENTE GRAPHQL                                      │
│    query { user(id: "123") { name email } }            │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. GRAPHQL LAYER (user.resolvers.ts)                   │
│    - Recebe: { id: "123" }                             │
│    - Extrai parâmetros                                 │
│    - Chama: userService.findById("123")                │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. APPLICATION LAYER (user.service.ts)                 │
│    - Valida ID                                          │
│    - Chama: userRepository.findById("123")             │
│    - Verifica se encontrou                              │
│    - Lança UserNotFoundError se não encontrou          │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. DOMAIN LAYER (user.repository.interface.ts)          │
│    - Interface define contrato                          │
│    - Não implementa nada                               │
└───────────────────┬─────────────────────────────────────┘
                    │ implementa
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 5. INFRASTRUCTURE LAYER (user.repository.ts)           │
│    - Executa SQL: SELECT * FROM users WHERE id = '123' │
│    - Converte resultado para User entity                │
│    - Retorna User ou null                              │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 6. BANCO DE DADOS                                       │
│    Retorna dados do usuário                            │
└─────────────────────────────────────────────────────────┘
                    │
                    ↑ (retorno)
                    │
┌─────────────────────────────────────────────────────────┐
│ 7. INFRASTRUCTURE → Retorna User entity                 │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↑
┌─────────────────────────────────────────────────────────┐
│ 8. APPLICATION → Retorna User                          │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↑
┌─────────────────────────────────────────────────────────┐
│ 9. GRAPHQL → Formata resposta GraphQL                  │
│    { name: "João", email: "joao@example.com" }         │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↑
┌─────────────────────────────────────────────────────────┐
│ 10. CLIENTE recebe resposta                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Por que essa estrutura funciona?

### Cenário 1: Trocar de PostgreSQL para MongoDB

**O que muda?**
- ✅ `infra/user.repository.ts` → Nova implementação usando MongoDB
- ❌ `domain/user.entity.ts` → **NÃO MUDA**
- ❌ `application/user.service.ts` → **NÃO MUDA**
- ❌ `graphql/user.resolvers.ts` → **NÃO MUDA**

**Por quê?** Porque Service depende da interface `IUserRepository`, não da implementação concreta.

---

### Cenário 2: Adicionar validação de email

**Onde adicionar?**
- ✅ `application/user.service.ts` → Valida antes de criar
- OU
- ✅ `domain/user.entity.ts` → Método `isValidEmail()`

**Por quê?** Regra de negócio pode estar na entidade (se é específica do User) ou no Service (se envolve múltiplas entidades).

---

### Cenário 3: Testar sem banco de dados

**Como fazer?**
```typescript
// Criar mock da interface
const mockRepository: IUserRepository = {
  findById: jest.fn().mockResolvedValue(new User({ id: '123', name: 'Test' })),
  // ... outros métodos
};

// Testar Service sem banco
const service = new UserService(mockRepository);
const user = await service.findById('123');
expect(user.name).toBe('Test');
```

**Por quê?** Service depende de interface, então podemos criar um mock facilmente.

---

## 📦 DTOs (Data Transfer Objects)

**Arquivo**: `modules/user/application/dto/create-user.dto.ts`

```typescript
export interface CreateUserDto {
  email: string;
  name: string;
}

export function validateCreateUserDto(data: any): CreateUserDto {
  // Validação de entrada
  if (!data.email || typeof data.email !== 'string') {
    throw new Error('Email is required');
  }
  
  if (!data.name || typeof data.name !== 'string') {
    throw new Error('Name is required');
  }

  // Normalização
  return {
    email: data.email.trim().toLowerCase(),
    name: data.name.trim(),
  };
}
```

**Uso no Service:**
```typescript
async create(data: CreateUserDto): Promise<User> {
  const validatedData = validateCreateUserDto(data);
  // Agora pode usar validatedData com segurança
  return await this.userRepository.create(validatedData);
}
```

**Por que usar DTOs?**
- Separa validação da lógica de negócio
- Garante que dados estão corretos antes de processar
- Facilita testes (testa validação separadamente)

---

## 🧪 Exemplo de Testes

### Teste do Domain (Mais Simples)

```typescript
// domain/__tests__/user.entity.spec.ts
import { User } from '../user.entity';

describe('User Entity', () => {
  it('should create user with valid data', () => {
    const user = new User({
      id: '123',
      email: 'test@example.com',
      name: 'Test User'
    });

    expect(user.id).toBe('123');
    expect(user.email).toBe('test@example.com');
    expect(user.isValidEmail()).toBe(true);
  });
});
```

### Teste do Application (Com Mock)

```typescript
// application/__tests__/user.service.spec.ts
import { UserService } from '../user.service';
import { IUserRepository } from '../../domain/user.repository.interface';
import { User } from '../../domain/user.entity';
import { UserNotFoundError } from '../../domain/user.errors';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    // Criar mock do repositório
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new UserService(mockRepository);
  });

  it('should find user by id', async () => {
    // Arrange
    const user = new User({ id: '123', email: 'test@test.com', name: 'Test' });
    mockRepository.findById.mockResolvedValue(user);

    // Act
    const result = await service.findById('123');

    // Assert
    expect(result).toEqual(user);
    expect(mockRepository.findById).toHaveBeenCalledWith('123');
  });

  it('should throw error if user not found', async () => {
    // Arrange
    mockRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(service.findById('123')).rejects.toThrow(UserNotFoundError);
  });
});
```

### Teste do Infrastructure (Com Banco de Teste)

```typescript
// infra/__tests__/user.repository.spec.ts
import { UserRepository } from '../user.repository';
import { testDb } from '../../../config/test-database';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(async () => {
    repository = new UserRepository(testDb);
    await testDb.query('TRUNCATE TABLE users'); // Limpar banco
  });

  it('should save and retrieve user', async () => {
    // Arrange
    const userData = { email: 'test@test.com', name: 'Test' };

    // Act
    const created = await repository.create(userData);
    const found = await repository.findById(created.id);

    // Assert
    expect(found).not.toBeNull();
    expect(found?.email).toBe('test@test.com');
  });
});
```

---

## 🎓 Conceitos-Chave para Entrevista

### 1. "Explique Dependency Inversion"

**Resposta**: 
> "É o princípio que diz que módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações. No nosso projeto, o Service (alto nível) não depende do Repository concreto (baixo nível), mas sim da interface IUserRepository (abstração). Isso permite trocar implementações sem afetar o código que as usa."

### 2. "Como você organizaria um novo módulo?"

**Resposta**:
> "Seguiria a mesma estrutura: Domain com entidade e interface do repositório, Application com service e DTOs, Infrastructure com implementação do repositório, e GraphQL com resolvers e typeDefs. Isso mantém consistência e facilita manutenção."

### 3. "E se precisar compartilhar código entre módulos?"

**Resposta**:
> "Código compartilhado vai em `src/shared/`. Por exemplo, uma entidade base comum a todos os módulos ficaria em `shared/domain/base.entity.ts`. Mas preciso ter cuidado para não criar acoplamento desnecessário entre módulos."

### 4. "Por que separar Domain de Application?"

**Resposta**:
> "Domain contém as regras de negócio puras e entidades. Application orquestra essas regras para casos de uso específicos. Por exemplo, criar um usuário pode envolver validar email, verificar se já existe, criar o usuário e enviar email de boas-vindas. Essa orquestração fica no Application, enquanto a validação de email pode estar no Domain."

---

## ✅ Checklist de Boas Práticas

- [ ] Domain não importa nada de outras camadas
- [ ] Application depende apenas de Domain (interfaces)
- [ ] Infrastructure implementa interfaces do Domain
- [ ] GraphQL depende apenas de Application
- [ ] Services recebem dependências via construtor (DI)
- [ ] DTOs validam dados de entrada
- [ ] Erros específicos do domínio estão no Domain
- [ ] Testes usam mocks das interfaces
- [ ] Cada arquivo tem uma responsabilidade única

---

**Dica Final**: A melhor forma de entender é implementar! Comece pelo Domain, depois Application, Infrastructure e por último GraphQL. Isso força você a seguir as dependências corretas.

