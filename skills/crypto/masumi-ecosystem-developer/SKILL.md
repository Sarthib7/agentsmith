---
name: masumi-ecosystem-developer
description: Concise Masumi Network developer guide for decentralized AI-agent payments, identity, registry, marketplace, and Cardano-backed decision logging. Use when integrating Masumi Payment Service or Registry Service, implementing MIP-003 Agentic Service APIs, monetizing CrewAI/AutoGen/LangGraph/custom agents, deploying through Kodosumi, listing on Sokosumi, or troubleshooting A2A/H2A payment flows.
---

# Masumi Ecosystem Developer

Use this skill for Masumi Network work: AI agents that can request, receive, verify, and settle payments through Cardano-backed infrastructure.

Masumi evolves quickly. Before relying on exact API shapes, clone the relevant repo or check the latest docs/tags. Keep secrets, seed phrases, Blockfrost keys, and payment credentials out of git and logs.

## Core model

- **Your agentic service** exposes an API that accepts jobs and returns results.
- **Masumi Payment Service** handles wallet/payment operations and transaction monitoring.
- **Masumi Registry Service** supports agent discovery and metadata lookups.
- **Cardano** anchors payments, registry metadata, and decision/output hashes.
- **Sokosumi/Kodosumi** can provide marketplace/runtime paths depending on the project.

## First moves

1. Identify the flow: seller agent, buyer agent, marketplace listing, local test, or production mainnet.
2. Confirm environment: local, Cardano preprod, or mainnet.
3. Inspect the framework: CrewAI, AutoGen, LangGraph, Agno/PhiData, custom FastAPI, or another runtime.
4. Verify current Masumi docs/repo tags before writing exact commands.
5. Ask the user for missing manual inputs only when needed: Blockfrost key, funded wallet, API key, callback URL/domain, pricing, or marketplace credentials.

## MIP-003 implementation checklist

A Masumi-compatible agent should expose the required service endpoints for:

- input schema discovery
- availability/health
- starting a job
- polling job status
- providing additional input if the protocol flow needs it

Implementation guidance:

- Validate every incoming payload.
- Return stable job IDs and status values.
- Make job start idempotent where client retries are possible.
- Store enough state to recover after process restarts.
- Hash inputs/outputs exactly as the current MIP/hash standard requires.
- Separate public job APIs from admin/payment-service credentials.

## Local-to-production path

### 1. Local agent
- Run the agent without payments first.
- Add health checks, input validation, logging, and deterministic job status.
- Create one realistic example input and output.

### 2. Payment Service integration
- Run Payment Service with PostgreSQL.
- Configure environment variables locally; never commit them.
- Connect your agent callback/API endpoint.
- Test payment detection and job unlock flow on preprod.

### 3. Registry
- Prepare accurate metadata: name, description, endpoint, pricing, expected runtime, examples, terms/privacy links if public.
- Register on preprod first.
- Wait for registry indexing/sync before assuming failure.

### 4. Marketplace/runtime
- For Kodosumi, package the agent for the expected runtime and test cold start, dependencies, and logs.
- For Sokosumi, verify listing metadata, pricing, example output, support path, and availability checks.

### 5. Mainnet readiness
- Re-check all configuration points for mainnet.
- Use secure wallet practices and minimize hot-wallet balances.
- Add monitoring for uptime, job failures, payment detection, missed deadlines, and disputes.
- Document recovery procedures for node restart, DB restore, key rotation, and failed jobs.

## Payment and dispute safety

- Understand the payment timing fields before setting them: pay deadline, submit-result deadline, unlock/dispute windows, and external dispute unlock time.
- Do not overpromise processing time or output quality in registry/marketplace metadata.
- Persist decision/input/output hashes and the raw records needed to explain disputes without exposing private user data publicly.
- Make duplicate payment/job callbacks safe.
- Surface clear user-facing status when waiting for blockchain confirmation or registry sync.

## Common troubleshooting

| Symptom | Checks |
| --- | --- |
| Payment not detected | Network mismatch, unfunded wallet, wrong blockchain/payment identifier, Blockfrost/API key, Payment Service logs, confirmation delay |
| Agent not found | Registry sync delay, wrong environment, malformed agent identifier, registration transaction not confirmed |
| Job stuck | Agent health endpoint, callback URL reachable, deadline too short, worker crashed, DB state inconsistent |
| Hash/dispute issue | Input/output normalization, current MIP hashing rules, stored raw payload, mismatch between displayed and submitted result |
| DB/service startup failure | PostgreSQL reachable, migrations applied, env vars loaded, port conflicts, container volume state |

## Useful resources

- Masumi docs: `https://docs.masumi.network`
- Masumi GitHub: `https://github.com/masumi-network`
- MIPs: `https://github.com/masumi-network/masumi-improvement-proposals`
- Kodosumi docs: `https://docs.kodosumi.io`
- Sokosumi docs/app: `https://docs.sokosumi.com`, `https://app.sokosumi.com`

## Output style

For builds, provide a phased implementation with exact files to change, env vars the user must supply manually, and test commands. For debugging, provide likely root causes in priority order plus commands/logs to inspect.
