# graphql-poc

A reference GraphQL API built with Fastify, Mercurius, PostgreSQL and TypeScript, organized with Clean Architecture and Domain-Driven Design, and deployable to AWS with the CDK.

## What it does

The API models a small **in-person identity verification network**:

- **Users** are people who want to verify their identity (`name`, unique `email`).
- **Orbs** are physical verification devices placed around the world. Each has a unique `serialNumber`, a `status` (`ACTIVE`, `INACTIVE`, `MAINTENANCE`) and an embedded `location` (country, city, latitude, longitude).
- **Verification sessions** record a user verifying at a specific Orb. A session has a lifecycle (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`, `CANCELLED`) with `startedAt` / `completedAt` timestamps, and resolves its `user` and `orb` as nested fields.

### GraphQL operations

| Module | Queries | Mutations |
| --- | --- | --- |
| User | `user(id)`, `userByEmail(email)` | `createUser(name, email)` |
| Orb | `orb(id)` | `createOrb(serialNumber, status, location)`, `updateOrbStatus(id, status)` |
| VerificationSession | `verificationSession(id)`, `verificationSessionsByUser(userId)` | `createVerificationSession(userId, orbId)`, `completeVerificationSession(id)`, `updateVerificationSessionStatus(id, status)` |

Other things the project shows:

- **DataLoader** batching and per-request caching for `VerificationSession.user` and `VerificationSession.orb`, so nested queries don't cause N+1 queries.
- **Centralized error formatting**. Domain errors (`UserNotFoundError`, `OrbNotFoundError`, ...) map to stable codes such as `USER_NOT_FOUND` and `DUPLICATE_ENTRY`, which are returned in `extensions`.
- **DTO validation** in the application layer, before business rules run.
- **Strict TypeScript**, ESLint and Prettier.

## Who it's for

Backend developers who want a small but realistic example of:

- building a modular GraphQL schema with Mercurius on Fastify,
- applying Clean Architecture / DDD layering (domain, application, infrastructure, GraphQL) in a TypeScript codebase,
- fixing the N+1 problem with DataLoader,
- deploying a containerized Node.js API with RDS to AWS using the CDK.

The codebase is meant to be read and changed. The longer design notes are listed under [Documentation](#documentation).

## Tech stack

- **Runtime:** Node.js 20, TypeScript 5 (strict mode)
- **HTTP / GraphQL:** Fastify 5, Mercurius 16, graphql-js 16, GraphiQL
- **Data:** PostgreSQL 15, `pg`, `node-pg-migrate`, `dataloader`
- **Tooling:** ESLint 9, Prettier 3, ts-node-dev, tsconfig-paths (`~/` → `src/`)
- **Infrastructure:** Docker, Docker Compose (local database), AWS CDK v2 (VPC, RDS PostgreSQL, ECS Fargate, Application Load Balancer, Secrets Manager)

## Running locally

### Prerequisites

- Node.js 20+ and npm
- Docker with Docker Compose

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

This starts `postgres:15` as the container `graphql-poc-db` and publishes it on **host port 5433**. Credentials come from `docker-compose.yml` (user `postgres`, password `test-password`, database `graphql_poc`). They are local development values only.

### 3. Configure the environment

```bash
cp .env.example .env
```

Then edit `.env` to match the Compose database. `.env.example` uses port `5432` and password `postgres`, and it has no `DATABASE_URL`, which `node-pg-migrate` needs.

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

The app reads the `DB_*` variables. The migration scripts read `DATABASE_URL`.

### 4. Run migrations

```bash
npm run migrate:up
```

This creates the `users`, `orbs` and `verification_sessions` tables from `src/database/migrations/`. You can check connectivity at any time with `npm run test:connection`.

### 5. Start the dev server

```bash
npm run dev
```

- GraphQL endpoint: `http://localhost:8000/graphql`
- GraphiQL IDE: `http://localhost:8000/graphiql`

Example:

```graphql
mutation {
  createUser(name: "Ada Example", email: "ada@example.com") { id }
}

query {
  verificationSessionsByUser(userId: "<user-id>") {
    id
    status
    user { name }
    orb { serialNumber location { city country } }
  }
}
```

### Useful scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with reload (`ts-node-dev` + path aliases) |
| `npm run build` / `npm start` | Compile to `dist/` and run the compiled server |
| `npm run migrate:up` / `migrate:down` | Apply / roll back migrations |
| `npm run migrate:create -- <name>` | Create a new migration |
| `npm run check` | Type-check, lint and format-check |
| `npm run fix` | Auto-fix lint and formatting issues |

> There is no automated test suite yet: `npm test` is a placeholder and the `__tests__/*.spec.ts` files are empty. Adding tests is the first phase of the [roadmap](ROADMAP.md).

## Deploying to AWS (CDK)

The `infrastructure/` folder is a separate CDK app with three stacks:

- `GraphQlPocVpcStack`: VPC with public and private subnets and a NAT gateway
- `GraphQlDatabaseStack`: RDS PostgreSQL (t3.micro) in private subnets, with credentials in Secrets Manager
- `GraphQlApiStack`: ECS Fargate service built from the root `Dockerfile`, behind a public Application Load Balancer

```bash
cd infrastructure
npm install
npx cdk bootstrap   # once per account/region
npx cdk synth
npx cdk deploy --all
```

The region defaults to `eu-central-1` unless `CDK_DEFAULT_REGION` is set. The deploy outputs the load balancer URL. Run `npx cdk destroy --all` to remove everything. See [INFRASTRUCTURE.md](INFRASTRUCTURE.md) for details. Production hardening (HTTPS, migrations on deploy, CI) is still on the [roadmap](ROADMAP.md).

## Project structure

```
src/
├── app.ts                    # Fastify + Mercurius bootstrap, error formatter, per-request context
├── config/database.ts        # pg connection pool
├── database/migrations/      # node-pg-migrate migrations
├── graphql/
│   ├── schema.ts             # Composition root: repositories → services → resolvers
│   ├── context.ts            # GraphQL context type
│   ├── loaders/              # DataLoaders (user, orb)
│   └── errors/               # Error codes and formatter
└── modules/
    ├── user/
    ├── orb/
    └── verification-session/
        ├── domain/           # Entities, types, domain errors, repository interfaces
        ├── application/      # Services and DTOs
        ├── infra/            # PostgreSQL repositories
        └── graphql/          # typeDefs and resolvers
infrastructure/               # AWS CDK app (bin/, lib/)
Dockerfile                    # Production image used by the CDK API stack
docker-compose.yml            # Local PostgreSQL
```

## Documentation

These documents are written in Portuguese. Translating them is planned in the roadmap.

- [ARCHITECTURE.md](ARCHITECTURE.md): Clean Architecture and DDD concepts as applied here
- [CHEATSHEET.md](CHEATSHEET.md): quick reference for the layers and principles
- [EXAMPLES.md](EXAMPLES.md): a request traced through every layer, plus testing examples
- [RELATIONSHIPS.md](RELATIONSHIPS.md) / [RELATIONSHIPS_VISUAL.md](RELATIONSHIPS_VISUAL.md): how the modules relate
- [INFRASTRUCTURE.md](INFRASTRUCTURE.md): PostgreSQL and AWS CDK setup
- [PROJECT_STATUS.md](PROJECT_STATUS.md): detailed implementation status and design decisions

## Roadmap

Planned work (tests, CI, authentication, pagination, subscriptions, observability, infrastructure hardening and more) is in [ROADMAP.md](ROADMAP.md).

## License

[ISC](LICENSE) © 2025 Joao Pedro Campos
