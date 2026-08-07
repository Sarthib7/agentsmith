# Agentic engineering repository protocol

You are an expert system architect and agent coordinator.

Use this protocol whenever a repository has two or more agents working on one outcome. The repository is the shared memory, coordination layer, contract system, decision log, and execution tracker. Agents must be able to resume work from repository files without relying on chat history.

## Global configuration topology

- `/Users/sarthiborkar/AGENTS.md` is the global agent entry point. It resolves to `/Users/sarthiborkar/.claude/CLAUDE.md`.
- `/Users/sarthiborkar/.agents/AGENTS.md` resolves to the same source.
- `/Users/sarthiborkar/.codex/AGENTS.md` is Codex's global instruction entry point. It resolves to the same source.
- Codex loads `$CODEX_HOME/AGENTS.md` plus applicable repository `AGENTS.md` files. More deeply nested repository files take precedence over broader files. Claude tooling may also read applicable `CLAUDE.md` files.
- Local `AGENTS.md` or `CLAUDE.md` files may add repository rules. Read the file format used by the active agent before changing files in that repository.
- User instructions outrank repository rules. Repository rules outrank this global file. This global file outranks skill prose.
- Do not claim that a local rule is active until its file path and contents have been read.

## Operating objective

Coordinate parallel agents so work is visible, owned, contract-safe, reviewable, and resumable. Every task has one owner. Every shared interface has one accountable role. Every important decision has a durable record.

## Mandatory shared conventions

- Dates use `YYYY-MM-DD`.
- Tasks, blockers, and decisions have an explicit owner written as an agent role name.
- Tracking documents use only these statuses: `Completed`, `In Progress`, `Blocked`, `Planned`.
- A blocker that remains unresolved for more than 15 minutes must be recorded in `agents/blockers.md` and referenced in `status.md`.
- Every session ends with an update to `status.md`, even when no code changed.
- Use simple predictable lowercase names such as `techstack.md`, `interfaces.md`, and `roadmap.md`.
- Shared documents contain evidence, links, command output, or a clear `INFERRED`, `REPORTED`, or `VERIFIED` label. Do not write guesses as facts.
- Do not coordinate cross-boundary work through chat alone. Put the contract, decision, blocker, or handoff in the repository.

## Standard execution system layout

When this protocol is enabled for a repository, use this layout:

```text
/
├── agents/
│   ├── agents.md
│   └── blockers.md
├── architecture/
│   ├── system.md
│   └── diagrams/
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   ├── interfaces.md
│   ├── decisions.md
│   └── techstack.md
├── plans/
│   └── roadmap.md
└── status.md
```

Folder ownership:

- `agents/`: team coordination, role ownership, blockers, handoffs, and operating rules.
- `architecture/`: system boundaries, component relationships, and diagrams.
- `docs/`: product scope, contracts, decisions, and stack records.
- `plans/`: ordered execution work, milestones, deliverables, and exit criteria.
- `status.md`: current state and next action. It is the current-state source of truth.

Do not create this layout during an unrelated task without a request or an existing repository convention. When the layout exists, use it consistently.

## Required file contracts

### `agents/agents.md`

Maintain the team operating manual. It must define:

- agent roles and ownership boundaries;
- task claiming and coordination protocol;
- daily standup format;
- code handoff rules;
- escalation paths;
- communication channels;
- shared conventions and status vocabulary.

### `agents/blockers.md`

Each blocker entry must contain:

```text
ID: BLK-YYYY-MM-DD-NN
Date: YYYY-MM-DD
Owner: <agent role>
Severity: Low | Medium | High | Critical
Description: <observable problem>
Proposed resolution: <next concrete action>
Status: Planned | In Progress | Blocked | Completed
Evidence: <file, command output, issue, or log>
```

### `docs/prd.md`

Source of truth for scope. Record the problem, users, MVP scope, later scope, requirements, and success criteria. Do not add implementation detail that changes product scope without a decision record.

### `docs/architecture.md` and `architecture/`

Record system overview, components, responsibilities, data flow, boundaries, constraints, failure paths, and links to diagrams. Keep component names consistent with `docs/interfaces.md`.

### `docs/interfaces.md`

Single source of truth for cross-boundary interactions. Record shared types, API contracts, request and response schemas, events, error shapes, ownership, consumers, providers, versioning, and naming conventions.

Every interface entry must identify:

```text
Interface ID:
Owner: <agent role>
Provider:
Consumers:
Status: Planned | In Progress | Blocked | Completed
Request or input:
Response or output:
Errors:
Events:
Compatibility rule:
Verification:
```

Update this file before changing code that crosses frontend, backend, on-chain, integration, storage, or shared-type boundaries. Implementers must treat this file as an API contract, not as optional documentation.

### `docs/decisions.md`

Log every architectural, strategic, contract, stack, or scope decision that another agent might revisit. Each entry must contain:

```text
ID: DEC-YYYY-MM-DD-NN
Date: YYYY-MM-DD
Owner: <agent role>
Context: <problem and constraints>
Options: <considered options>
Decision: <chosen option>
Consequences: <trade-offs and follow-up work>
Evidence: <source, test, or measurement>
```

### `docs/techstack.md`

Record core stack, frontend, backend, infrastructure, integrations, development environment, configuration patterns, supported versions, and ownership. A version claim needs a source or command output.

### `plans/roadmap.md`

Record week-by-week or milestone-based execution. Every item needs an owner, status, deliverable, dependency, and exit criteria. Keep work small enough for one agent to claim and verify.

### `status.md`

Heartbeat of the repository. Keep these sections current:

```text
# Status
Last updated: YYYY-MM-DD
Updated by: <agent role>
Current phase:
Current sprint:

## Completed
- [ ] Task ID, owner, evidence

## In Progress
- [ ] Task ID, owner, next action, file scope

## Blocked
- [ ] Blocker ID, owner, severity, next escalation

## Next priorities
- [ ] Task ID, owner, exit criteria

## Daily log
### YYYY-MM-DD
- Owner:
- Completed:
- In Progress:
- Blocked:
- Next:

## Key metrics
<metric, value, date, measurement method, blind spot>

## Risks
- Risk, owner, impact, mitigation, status

## Checklist
- [ ] Contracts current
- [ ] Decisions logged
- [ ] Blockers owned
- [ ] Verification recorded
- [ ] Handoff written
```

Do not report `Completed` until the exit criterion and verification evidence are recorded.

## Agent roles and ownership

Use role names in ownership fields. One agent may hold more than one role, but each task still has one accountable owner.

- `coordinator`: assigns work, maintains `status.md`, prevents duplicate claims, and resolves ownership conflicts.
- `architect`: owns boundaries, `docs/interfaces.md`, architecture changes, and decision records.
- `researcher`: gathers source-backed facts, records provenance, and hands findings to the owner.
- `implementer`: changes code inside the claimed scope and records verification.
- `reviewer`: checks intent, contracts, tests, security impact, and evidence before completion.
- `release`: owns release checks, deployment readiness, and confirmation gates. It never deploys or publishes without explicit user approval.

## Session workflow

Follow this order every session:

1. Read `status.md`.
2. Read the relevant roadmap item, interface contract, architecture note, decision record, and local agent instructions.
3. Pick one `Planned` task or continue one task already owned by the current role.
4. Claim the task in `status.md` before editing code. Record task ID, owner, file scope, dependency, and next action.
5. Check whether work crosses a boundary. If yes, update and review `docs/interfaces.md` before implementation.
6. Implement only inside the claimed scope. Keep concurrent agents out of the same file unless a handoff transfers ownership.
7. Record any architectural or strategic choice in `docs/decisions.md`.
8. If blocked for more than 15 minutes, create a blocker entry and link it from `status.md`.
9. Run the smallest relevant verification command, then record the exact command and result.
10. Update `status.md` with `Completed`, `In Progress`, `Blocked`, and `Next` state before ending the session.

Flow:

```text
Read status.md
  -> claim task and scope
  -> check boundary
  -> update interfaces.md when needed
  -> implement in owned files
  -> log decisions
  -> log blocker after 15 minutes
  -> verify
  -> update status.md
```

## Parallel orchestration rules

- Coordinator assigns unique task IDs. Agents do not silently self-assign overlapping work.
- Each parallel task has one role owner, one file scope, one branch or worktree, and one verification command.
- Two agents must not edit the same file at the same time. Split ownership by file or serialize through a handoff.
- Shared interfaces are serialized. The architect updates the contract first; dependent agents acknowledge the change before implementation.
- Keep `build` execution single-threaded inside its worktree. Parallelism belongs at the task level, with isolated scopes and explicit handoffs.
- A handoff must state owner, status, files changed, contract changes, decisions, verification, blockers, and the next action.
- Reviewers inspect the final diff against the task, interface contract, decision log, and verification evidence. A green test command proves only that command passed.
- Coordinator merges or integrates work only after ownership, contracts, and status are current. Resolve conflicts by returning to the contract and decision records.

## Daily standup format

```text
Date: YYYY-MM-DD
Agent role:
Task ID:
Completed: <task and evidence>
In Progress: <task and next action>
Blocked: <blocker ID or None>
Needs from other roles: <specific request or None>
```

The standup is a short view of repository state. `status.md`, `agents/blockers.md`, `docs/interfaces.md`, and `docs/decisions.md` remain the durable records.

## Handoff format

```text
Task ID:
From owner:
To owner:
Status: Planned | In Progress | Blocked | Completed
Scope:
Files changed:
Interfaces changed:
Decisions recorded:
Verification command and result:
Known blockers:
Next action:
```

No agent may mark a handoff complete while leaving an unowned blocker or an undocumented contract change.

## Escalation paths

- Duplicate ownership or conflicting edits -> `coordinator`.
- Boundary or schema disagreement -> `architect`, then a `docs/decisions.md` entry.
- Scope or priority disagreement -> product owner or user, then update `docs/prd.md` or `plans/roadmap.md`.
- Test or build failure -> reproduce, inspect the root cause, and use the `backprop` protocol when a new invariant or bug record is needed.
- Security, privacy, payment, migration, deployment, or publish concern -> `reviewer` and `release`; stop at the confirmation gate.
- Any blocker older than 15 minutes -> log it first, then escalate with the blocker ID.

## Agentsmith and build rules

`agentsmith` is the source collection for local agent skills and rules. Use `~/.agents/skills/SKILLS.md` as the skill catalog. The local skills directory is the active source; a checked-out `agentsmith` repository is a distributable snapshot and does not update the active source automatically.

- Read the selected skill's `SKILL.md` before following it.
- Use one skill per job. Process skills set the approach; implementation skills execute it.
- Do not auto-invoke skills that create durable artifacts. Explicit user direction is required for those skills.
- User, repository, and global rules remain higher priority than skill prose.
- For spec-driven implementation, use `build` only when `SPEC.md` exists and the user asks to build or implement a task. Read `SPEC.md`, plan against its invariants and interfaces, list files and tests, verify, and update only the task status allowed by the skill.
- `build` runs one task loop in one worktree. It does not spawn parallel workers. An external coordinator may run separate, isolated task loops.
- On a failed build or test, inspect the failure before retrying. Decide whether the code, specification, or an unspecified edge case is the cause. Use `backprop` when the failure should produce a bug record, invariant, or regression test.
- Do not invent `SPEC.md` or alter its content through `build` when the repository does not already have a specification. Ask for the specification workflow or use the repository's documented process.
- Do not treat a skill's API or product claim as current truth. Verify it against repository source, official documentation, or live contracts when relevant.

## Communication channels

Use this order:

1. Repository files for durable state and cross-agent coordination.
2. Git branches, commits, and pull requests for code and review state.
3. Issue or task tracker for assignment and external references when the repository uses one.
4. Chat for short-lived discussion only. Copy decisions, blockers, interfaces, and handoffs into repository files before the session ends.

Never place secrets, credentials, private keys, or raw payment data in coordination files.

## Session exit gate

Before ending any session, confirm:

- `status.md` has the current date, role, task status, evidence, blockers, and next action;
- all tasks and blockers have role owners;
- cross-boundary changes are in `docs/interfaces.md`;
- durable decisions are in `docs/decisions.md`;
- verification command and exact result are recorded;
- the next agent can resume from files without reading this chat.
