---
name: backend-specialist
description: Expert backend engineering playbook for APIs, databases, auth, distributed systems, observability, performance, and production hardening. Use when designing or reviewing server-side code, building REST/GraphQL/gRPC/WebSocket APIs, debugging database or latency issues, choosing monolith vs services, adding auth/authorization, scaling queues/workers, integrating AI backends, or preparing backend systems for production.
---

# Backend Specialist

Use this skill to make backend work production-grade, boringly reliable, and easy for future agents or humans to maintain.

## First moves

1. Inspect the project before prescribing stack changes: framework, package manager, lockfiles, database/migration tooling, test setup, deployment target, and existing conventions.
2. Ask only the missing questions that materially change the design: expected traffic, consistency needs, tenancy model, auth model, data retention/privacy requirements, external integrations, and failure tolerance.
3. Prefer the smallest architecture that satisfies the current product. Start modular-monolith unless independent deployment, scaling, compliance, or team ownership clearly justify microservices.
4. When exact library/API syntax matters, verify against the project lockfile or current docs before coding.

## Modern backend defaults

- **API contracts:** OpenAPI for REST, GraphQL schema discipline, AsyncAPI for events, protobuf for gRPC. Validate requests and responses at boundaries.
- **Runtime choices:** TypeScript/Node with Fastify, NestJS, Hono, or Express when already present; Python with FastAPI/Django; Go for latency/simple ops; Java/Kotlin with Spring for enterprise domains.
- **Data:** PostgreSQL by default for durable relational data. Use Redis for cache/ephemeral coordination, queues for async work, object storage for blobs, and search/vector stores only when their query model is required.
- **Migrations:** Every schema change gets a migration, rollback/forward plan, and data backfill strategy when needed.
- **Auth:** Prefer proven providers/protocols. Separate authentication from authorization. Model authorization explicitly at route, service, and data-access boundaries.
- **Observability:** Structured logs, metrics, traces, correlation/request IDs, useful error codes, and health/readiness probes.
- **Background work:** Idempotent jobs, retry policy with backoff, dead-letter handling, dedupe keys, and visibility into queue depth/failures.

## Design checklist

Before implementing or approving a backend design, check:

- Data model supports the product language and future queries.
- Critical operations are transactional or intentionally eventually consistent.
- External calls have timeouts, retries where safe, circuit-breaker/backoff behavior, and clear error mapping.
- Mutating endpoints are idempotent where clients may retry.
- Pagination, filtering, sorting, and rate limits are explicit.
- Secrets are not committed, logged, sent to clients, or embedded in frontend bundles.
- Multi-tenant data access cannot cross tenant boundaries.
- Failure modes are designed: degraded mode, retries, alerts, and user-visible messages.

## Security baseline

Apply OWASP API Top 10 thinking by default:

- Validate and normalize all untrusted input.
- Enforce authorization on every object-level access, not just routes.
- Use parameterized queries/ORM safe APIs; watch raw SQL carefully.
- Protect against SSRF in URL fetchers, webhooks, metadata extraction, and file importers.
- Set secure cookie flags, CORS allowlists, CSRF protection where cookie auth is used, and strict JWT/session verification.
- Hash passwords with Argon2id/bcrypt via a mature auth system; never invent crypto.
- Scrub PII/secrets from logs and traces.
- Add rate limits and abuse controls to login, signup, reset, webhooks, expensive AI calls, and public APIs.

## Performance workflow

1. Measure first: logs, traces, database query plans, flamegraphs, or synthetic benchmarks.
2. Fix the highest-leverage bottleneck: indexes, N+1 queries, unnecessary serialization, over-fetching, slow external calls, or lock contention.
3. Cache only with a clear invalidation strategy and correctness boundary.
4. Add load tests for the critical path if scale is the concern.
5. Document the observed baseline and expected improvement.

## Implementation standards

- Keep business logic out of HTTP handlers when it improves testability.
- Use typed domain/service boundaries and narrow interfaces.
- Return consistent error shapes; do not leak internals to clients.
- Include unit tests for pure/domain logic, integration tests for DB/API boundaries, and contract tests for external providers when useful.
- Prefer readable, explicit code over clever abstractions.
- Update README/API docs/env examples when behavior or setup changes.

## Output style

When giving guidance, produce the most useful artifact for the situation:

- **Design:** architecture sketch, data model, API contract, tradeoffs, and rollout plan.
- **Debugging:** reproduction path, root cause, fix, verification, and prevention.
- **Code review:** prioritized findings with severity, file paths, and concrete fixes.
- **Implementation:** small patch, tests, migration, and notes for manual env/secrets/RPC/API setup.
