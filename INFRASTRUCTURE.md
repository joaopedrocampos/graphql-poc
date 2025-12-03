# 🏗️ Infraestrutura - PostgreSQL e AWS CDK

## 📋 Visão Geral

Este projeto utiliza:
- **PostgreSQL** como banco de dados relacional
- **AWS CDK** para gerenciar toda a infraestrutura na AWS
- **Infrastructure as Code (IaC)** para versionamento e deploy automatizado

---

## 🗄️ Banco de Dados PostgreSQL

### Estrutura de Arquivos

```
src/
├── config/
│   └── database.ts          # Configuração de conexão PostgreSQL
├── database/
│   ├── connection.ts        # Gerenciamento de pool de conexões
│   ├── migrations/          # Migrations do banco de dados
│   └── seeds/                # Seeds para dados iniciais
```

### Implementação nos Módulos

Cada módulo possui duas implementações de repositório:

```
modules/{nome}/infra/
├── {nome}.repository.ts          # Implementação genérica/mock (para testes)
└── {nome}.repository.postgres.ts # Implementação PostgreSQL (produção)
```

**Por quê duas implementações?**
- `repository.ts`: Pode ser mock ou implementação em memória para testes
- `repository.postgres.ts`: Implementação real usando PostgreSQL
- Service continua dependendo apenas da interface (`I{nome}Repository`)

### Migrations

As migrations ficam em `src/database/migrations/` e devem seguir o padrão:
- Versionamento sequencial ou por timestamp
- Cada migration é um arquivo SQL ou TypeScript
- Ordem de execução é importante

**Exemplo de estrutura:**
```
migrations/
├── 001_create_users_table.sql
├── 002_create_orbs_table.sql
└── 003_create_verifications_table.sql
```

---

## ☁️ AWS CDK - Infrastructure as Code

### Estrutura do CDK

```
infrastructure/
├── bin/
│   └── app.ts                 # Entry point - instancia os stacks
├── lib/
│   ├── database-stack.ts      # RDS PostgreSQL
│   ├── api-stack.ts           # API Gateway + Lambda
│   ├── vpc-stack.ts           # VPC, Subnets, Internet Gateway
│   └── security-stack.ts      # Security Groups, IAM Roles
├── cdk.json                   # Configuração do CDK
├── tsconfig.json              # TypeScript config
└── package.json               # Dependências do CDK
```

### Stacks Principais

#### 1. **VPC Stack** (`vpc-stack.ts`)
- VPC com subnets públicas e privadas
- Internet Gateway
- NAT Gateway (para recursos privados acessarem internet)
- Route Tables

#### 2. **Security Stack** (`security-stack.ts`)
- Security Groups para RDS, Lambda, etc.
- IAM Roles e Policies
- Configurações de segurança

#### 3. **Database Stack** (`database-stack.ts`)
- RDS PostgreSQL Instance
- Subnet Group (subnets privadas)
- Security Group (acesso apenas de recursos autorizados)
- Parameter Store (credenciais)
- Backup automático

#### 4. **API Stack** (`api-stack.ts`)
- API Gateway
- Lambda Functions (GraphQL resolvers)
- CloudWatch Logs
- Integração com RDS

### Benefícios do CDK

1. **Versionamento**: Infraestrutura versionada no Git
2. **Reprodutibilidade**: Mesma infra em dev, staging, prod
3. **Type Safety**: TypeScript garante tipos corretos
4. **Reutilização**: Stacks podem ser compostos
5. **Deploy Automatizado**: CI/CD pode fazer deploy

---

## 🔄 Fluxo de Deploy

```
1. Desenvolver código da aplicação
   ↓
2. Criar/atualizar migrations
   ↓
3. Atualizar stacks CDK (se necessário)
   ↓
4. Deploy CDK: cdk deploy
   ↓
5. Aplicação conecta ao RDS PostgreSQL
   ↓
6. Executar migrations no banco
```

---

## 🔐 Segurança

### Banco de Dados
- RDS em subnets privadas (não acessível da internet)
- Security Groups restritivos
- Credenciais em AWS Secrets Manager ou Parameter Store
- SSL/TLS obrigatório nas conexões

### Aplicação
- IAM Roles com princípio de menor privilégio
- VPC Endpoints para serviços AWS (sem sair da VPC)
- CloudWatch Logs para auditoria

---

## 📊 Arquitetura na AWS

```
┌─────────────────────────────────────────────────┐
│                  Internet                       │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│              API Gateway                       │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│         Lambda Functions (GraphQL)             │
│  ┌──────────────────────────────────────────┐  │
│  │  Lambda Handler                          │  │
│  │  - GraphQL Resolvers                    │  │
│  │  - Services                             │  │
│  └───────────────────┬──────────────────────┘  │
└──────────────────────┼─────────────────────────┘
                       │
                       │ (VPC Endpoint)
                       │
┌──────────────────────▼─────────────────────────┐
│              VPC (Private)                     │
│  ┌──────────────────────────────────────────┐  │
│  │  RDS PostgreSQL                         │  │
│  │  - Subnet Privada                       │  │
│  │  - Security Group Restritivo            │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 🧪 Ambiente de Desenvolvimento

### Local
- PostgreSQL local ou Docker
- Conexão direta ao banco
- Migrations executadas manualmente

### AWS (Dev/Staging/Prod)
- RDS PostgreSQL gerenciado pela AWS
- Conexão via VPC
- Migrations executadas via CI/CD ou manualmente

---

## 📝 Boas Práticas

### Banco de Dados
- ✅ Sempre use migrations (nunca altere schema manualmente)
- ✅ Teste migrations em ambiente de dev primeiro
- ✅ Use connection pooling
- ✅ Configure timeouts adequados
- ✅ Monitore performance (CloudWatch)

### CDK
- ✅ Separe stacks por responsabilidade
- ✅ Use variáveis de ambiente para diferentes ambientes
- ✅ Documente recursos criados
- ✅ Use tags para organização
- ✅ Revise mudanças antes de deploy (`cdk diff`)

### Segurança
- ✅ Nunca commite credenciais
- ✅ Use Secrets Manager ou Parameter Store
- ✅ Aplique princípio de menor privilégio
- ✅ Habilite logs e auditoria
- ✅ Use SSL/TLS em todas as conexões

---

## 🚀 Comandos Úteis

### CDK
```bash
# Instalar dependências
cd infrastructure && npm install

# Visualizar mudanças
cdk diff

# Deploy
cdk deploy

# Deploy stack específico
cdk deploy DatabaseStack

# Destruir recursos
cdk destroy
```

### Migrations
```bash
# Executar migrations (exemplo com ferramenta de migração)
npm run migrate:up

# Reverter última migration
npm run migrate:down

# Status das migrations
npm run migrate:status
```

---

## 🎯 Integração com Clean Architecture

A infraestrutura segue os mesmos princípios:

1. **Domain não conhece PostgreSQL**: Interfaces são genéricas
2. **Infrastructure implementa interfaces**: `repository.postgres.ts` implementa `I{nome}Repository`
3. **Configuração separada**: `config/database.ts` centraliza configuração
4. **Testabilidade**: Implementação mock pode coexistir com PostgreSQL

**Exemplo:**
```typescript
// Service não muda
const service = new UserService(
  process.env.NODE_ENV === 'test' 
    ? new UserRepository()           // Mock
    : new UserRepositoryPostgres()   // PostgreSQL
);
```

---

## 📚 Recursos Adicionais

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [RDS PostgreSQL Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [CDK Patterns](https://cdkpatterns.com/)

---

**Lembre-se**: A infraestrutura também segue Clean Architecture - configuração e implementações específicas ficam na camada de Infrastructure, sem afetar Domain ou Application! 🎯

