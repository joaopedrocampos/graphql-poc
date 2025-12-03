# 🎯 Cheatsheet - Clean Architecture & DDD

## 📐 Estrutura de Camadas (de fora para dentro)

```
GraphQL → Application → Domain ← Infrastructure
```

**Regra**: Dependências apontam para dentro. Domain não depende de nada.

---

## 🎨 Camadas

### 1. **Domain** (Núcleo - Mais Interno)
- ✅ Entidades (`user.entity.ts`)
- ✅ Interfaces (`user.repository.interface.ts`)
- ✅ Erros do domínio (`user.errors.ts`)
- ❌ Não depende de NADA externo
- ❌ Não conhece banco, GraphQL, HTTP

### 2. **Application** (Casos de Uso)
- ✅ Services (`user.service.ts`)
- ✅ DTOs (`dto/create-user.dto.ts`)
- ✅ Orquestra regras de negócio
- ✅ Depende apenas de Domain (interfaces)

### 3. **Infrastructure** (Implementações)
- ✅ Repositories concretos (`user.repository.ts`)
- ✅ Implementa interfaces do Domain
- ✅ Conhece tecnologias (PostgreSQL, MongoDB, etc.)

### 4. **GraphQL** (Apresentação)
- ✅ Resolvers (`user.resolvers.ts`)
- ✅ TypeDefs (`user.typeDefs.ts`)
- ✅ Depende apenas de Application

---

## 🔑 Conceitos-Chave

### Dependency Inversion Principle (DIP)
```typescript
// ✅ BOM: Depende de interface
class Service {
  constructor(private repo: IRepository) {}
}

// ❌ RUIM: Depende de implementação
class Service {
  constructor(private repo: Repository) {}
}
```

### Dependency Injection (DI)
```typescript
// ✅ BOM: Injeta dependência
constructor(private repo: IRepository) {}

// ❌ RUIM: Cria internamente
private repo = new Repository();
```

### Single Responsibility
- Cada arquivo/classe tem UMA responsabilidade
- `entity.ts` → Apenas estrutura
- `service.ts` → Apenas lógica de casos de uso
- `repository.ts` → Apenas acesso a dados

---

## 🔄 Fluxo de Dados

```
Cliente → Resolver → Service → Repository Interface → Repository → Banco
         (GraphQL)  (App)     (Domain)              (Infra)
```

**Retorno**: Banco → Repository → Service → Resolver → Cliente

---

## 🧪 Testabilidade

| Camada | Como Testar |
|--------|-------------|
| **Domain** | Testa direto, sem mocks |
| **Application** | Mock do Repository (interface) |
| **Infrastructure** | Banco de teste ou mock do banco |
| **GraphQL** | Mock do Service |

---

## 📝 Estrutura de Arquivos

```
modules/{nome}/
├── domain/
│   ├── {nome}.entity.ts           # Entidade do negócio
│   ├── {nome}.repository.interface.ts  # Contrato
│   ├── {nome}.errors.ts           # Erros específicos
│   └── __tests__/
│
├── application/
│   ├── {nome}.service.ts          # Casos de uso
│   ├── dto/                        # Validação
│   └── __tests__/
│
├── infra/
│   ├── {nome}.repository.ts       # Implementação
│   └── __tests__/
│
└── graphql/
    ├── {nome}.resolvers.ts        # Resolvers
    └── {nome}.typeDefs.ts         # Schema GraphQL
```

---

## 💬 Perguntas Frequentes em Entrevistas

### "Por que usar Clean Architecture?"
- Manutenibilidade, testabilidade, flexibilidade
- Trocar tecnologias sem reescrever tudo
- Código organizado e escalável

### "O que é Dependency Inversion?"
- Depender de abstrações (interfaces), não implementações
- Permite trocar implementações facilmente
- Facilita testes com mocks

### "Qual a diferença entre Domain e Application?"
- **Domain**: Regras de negócio puras, entidades
- **Application**: Orquestra regras para casos de uso específicos

### "Como testar sem banco de dados?"
- Mock da interface do Repository
- Service testa lógica sem depender de implementação real

### "E se precisar trocar de banco?"
- Apenas Infrastructure muda
- Domain e Application não mudam
- Nova implementação da interface

---

## ✅ Checklist de Boas Práticas

- [ ] Domain não importa nada externo
- [ ] Application depende só de Domain
- [ ] Infrastructure implementa interfaces
- [ ] GraphQL depende só de Application
- [ ] Services recebem dependências via construtor
- [ ] DTOs validam entrada
- [ ] Erros específicos no Domain
- [ ] Testes usam mocks
- [ ] Uma responsabilidade por arquivo

---

## 🎯 DDD - Conceitos

- **Bounded Context**: Cada módulo (`user`, `orb`, `verification`)
- **Entity**: Objeto com identidade (`User`, `Orb`)
- **Repository**: Abstração de acesso a dados
- **Domain Service**: Lógica que não pertence a uma entidade
- **Value Object**: Objeto sem identidade (ex: Email, Money)

---

## 🚀 Vantagens

1. **Manutenibilidade**: Código organizado
2. **Testabilidade**: Fácil testar isoladamente
3. **Flexibilidade**: Trocar tecnologias facilmente
4. **Escalabilidade**: Fácil adicionar módulos
5. **Desacoplamento**: Regras não dependem de frameworks

---

## ⚠️ Pontos de Atenção

- Não criar acoplamento entre módulos
- Não colocar lógica de negócio no Resolver
- Não acessar banco diretamente do Service
- Não criar dependências circulares
- Não misturar responsabilidades

---

**Lembre-se**: A arquitetura serve o código, não o contrário. Use o que faz sentido!

