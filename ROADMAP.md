# Roadmap

This file lists the planned work for the project. Each item comes from a real gap in the current codebase or from the open items in [PROJECT_STATUS.md](PROJECT_STATUS.md) ("Próximos Passos" and "Problemas Conhecidos"). Hour estimates are rough and cover implementation, tests and docs.

**Total estimate: about 128 hours** across 9 phases.

---

## Phase 1: Test suite (about 20 h)

There are no automated tests today. `npm test` is a placeholder, and the nine `__tests__/*.spec.ts` files under `src/modules/` are empty.

- [ ] Choose a runner (Vitest or Jest with ts-jest) and support the `~/` path alias. Replace the `npm test` stub. **(2 h)**
- [ ] Domain unit tests for the `User`, `Orb` and `VerificationSession` entities and domain errors. **(3 h)**
- [ ] Application tests for `UserService`, `OrbService` and `VerificationSessionService` with in-memory repository fakes. Cover DTO validation, duplicate email, missing user/orb, and completing an already completed session. **(5 h)**
- [ ] Repository integration tests against a real PostgreSQL (Testcontainers or a dedicated Compose service), with migrations applied per run. **(5 h)**
- [ ] GraphQL end-to-end tests with `fastify.inject()`: queries, mutations, error `extensions.code` values, and a check that DataLoader batches nested `user` / `orb` lookups. **(4 h)**
- [ ] Coverage reporting and a minimum threshold. **(1 h)**

## Phase 2: CI and developer experience (about 10 h)

- [ ] GitHub Actions workflow: install, `npm run check`, tests with a PostgreSQL service container, and `npm run build`. **(3 h)**
- [ ] Fix the production build. `tsc` emits `~/...` imports unchanged, so `node dist/app.js` cannot resolve them. Add `tsc-alias` or register `tsconfig-paths` at runtime, and check this in CI. **(2 h)**
- [ ] Line up `.env.example` with `docker-compose.yml` (port 5433, password, `DATABASE_URL` for migrations). Remove the empty placeholder files (`src/config/env.ts`, `src/database/connection.ts`, `verification-session.repository.ts`) or implement them. **(1 h)**
- [ ] Validate environment variables at startup with a typed config module, and fail fast on missing values. **(2 h)**
- [ ] Seed script (`src/database/seeds/`) with fictional sample users, orbs and sessions for local exploration. **(2 h)**

## Phase 3: API completeness (about 18 h)

- [ ] **Cursor-based pagination** (from PROJECT_STATUS) for `verificationSessionsByUser`, plus new `users`, `orbs` and `verificationSessions` list queries, using Relay-style connections (`edges`, `pageInfo`). **(6 h)**
- [ ] **Filtering and sorting**: orbs by status and country, sessions by status and date range. **(4 h)**
- [ ] Missing CRUD operations: `updateUser`, `deleteUser`, `updateOrb` (location / serial number), `cancelVerificationSession`. **(4 h)**
- [ ] Enforce valid session state transitions in the domain (for example, no `FAILED → IN_PROGRESS`) instead of accepting any status. **(2 h)**
- [ ] **Additional DTO validation** (from PROJECT_STATUS): email format, coordinate ranges, serial number format, UUID arguments. **(2 h)**

## Phase 4: GraphQL schema quality and DataLoader coverage (about 14 h)

- [ ] Add a `DateTime` custom scalar in place of the ISO-string `String` fields, and remove the manual `toISOString()` conversions in resolvers. **(3 h)**
- [ ] Reverse relationships with DataLoaders: `User.verificationSessions`, `Orb.verificationSessions`, and a session loader keyed by user and orb. **(4 h)**
- [ ] Remove the remaining `any` / type assertions on resolver context (listed under PROJECT_STATUS "Problemas Conhecidos"). Consider generating resolver types with GraphQL Code Generator. **(4 h)**
- [ ] Move typeDefs into `.graphql` files and add schema linting. **(3 h)**

## Phase 5: Security (about 18 h)

- [ ] **JWT authentication** (from PROJECT_STATUS): verify the token in the Mercurius context and expose `currentUser`. **(6 h)**
- [ ] Authorization rules: users can only read their own sessions, and orb management is restricted to an operator role. **(4 h)**
- [ ] **Query depth and complexity limits** (from PROJECT_STATUS) to stop abusive nested queries. **(3 h)**
- [ ] Rate limiting (`@fastify/rate-limit`), CORS and security headers (`@fastify/helmet`). Disable GraphiQL and introspection in production. **(3 h)**
- [ ] Stop logging the full GraphQL context on every error (`app.ts`), and redact sensitive fields. **(2 h)**

## Phase 6: Error handling and observability (about 14 h)

- [ ] Map PostgreSQL errors to domain errors: unique violation → `DUPLICATE_ENTRY`, FK violation → validation error, connection failure → `DATABASE_ERROR`. **(3 h)**
- [ ] Replace message-substring matching in `getErrorCode` with typed validation errors. Add the missing status mapping for `VERIFICATION_SESSION_*` codes. **(2 h)**
- [ ] Dedicated `/health` and `/ready` endpoints (with a DB check) for the ALB health check, instead of probing `/graphql`. **(2 h)**
- [ ] Structured logging with request IDs and per-operation timing. **(3 h)**
- [ ] OpenTelemetry tracing (Fastify, pg, GraphQL resolvers) and basic metrics. **(4 h)**

## Phase 7: Real-time features (about 10 h)

- [ ] **GraphQL subscriptions** through Mercurius (WebSocket): `verificationSessionUpdated(userId)` and `orbStatusChanged`. **(6 h)**
- [ ] Use PostgreSQL `LISTEN/NOTIFY` (or Redis) as the pub/sub backend so subscriptions work across multiple Fargate tasks. **(4 h)**

## Phase 8: Infrastructure hardening (about 18 h)

- [ ] HTTPS on the ALB (ACM certificate, HTTP → HTTPS redirect). The current listener is HTTP on port 80 only. **(3 h)**
- [ ] Run migrations as part of deploy, as a one-off ECS task or a custom resource. **(4 h)**
- [ ] Restrict the RDS security group to the ECS security group instead of the whole VPC CIDR. Enable RDS backups, deletion protection and environment-specific removal policies. **(3 h)**
- [ ] ECS autoscaling, a multi-stage slim Dockerfile running as non-root, and per-environment configuration (dev and prod stacks). **(4 h)**
- [ ] CDK assertion tests for the three stacks, plus a CI deploy pipeline using GitHub OIDC (no long-lived AWS keys). **(4 h)**

## Phase 9: Documentation (about 6 h)

- [ ] Translate ARCHITECTURE.md, CHEATSHEET.md, EXAMPLES.md, RELATIONSHIPS*.md, INFRASTRUCTURE.md and PROJECT_STATUS.md from Portuguese to English. **(4 h)**
- [ ] Update INFRASTRUCTURE.md to match the deployed design: it still describes API Gateway + Lambda and a security stack, but the code uses ECS Fargate + ALB. **(1 h)**
- [ ] Publish the GraphQL schema reference and an example query collection. **(1 h)**

---

| Phase | Estimate |
| --- | --- |
| 1. Test suite | 20 h |
| 2. CI and DX | 10 h |
| 3. API completeness | 18 h |
| 4. Schema quality and DataLoaders | 14 h |
| 5. Security | 18 h |
| 6. Errors and observability | 14 h |
| 7. Subscriptions | 10 h |
| 8. Infrastructure hardening | 18 h |
| 9. Documentation | 6 h |
| **Total** | **128 h** |
