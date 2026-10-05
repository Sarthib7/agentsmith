# Agent orchestration

How one lead agent turns a request into parallel work in this setup.

The mechanics below are native to Oh My Pi (`omp`), the primary harness. OMP loads the same global rules file as every other harness, plus the skills under the shared skills directory, so the policy layer does not change when the harness does. The [repository protocol](agentic-engineering.md) remains the durable coordination layer. This file covers the live, in-session mechanics: delegation, parallel agents, and coordination between them. The last section maps each mechanic to a plain equivalent for people who do not use OMP.

## The shape: one lead, many typed subagents

The session's main agent is the lead. It owns the plan. It reads the request, splits it into independent slices, and fixes the cross-slice contracts before any delegation. Planning itself is never delegated. A spawned planner starts blank and knows less than the lead.

Delegation happens in batches. One `task` call carries an array of task items. Each item spawns one subagent with its own instructions and acceptance criteria. The batch also carries a shared context block with the goal, the constraints, and the contracts every slice must honor.

Subagents are typed. The lead picks the narrowest type that fits:

| Agent | Use |
|---|---|
| `scout` | Read-only research on a fast model. Codebase exploration and pattern searches. Never edits. |
| `task` | General-purpose work: investigate and edit in one pass. |
| `sonic` | Low-reasoning mechanical updates and data collection. |
| `reviewer` | Code review for quality and security. |
| `security-reviewer` | Read-only, evidence-backed vulnerability discovery. |
| `designer` | UI and UX implementation and review. |
| `librarian` | External library and API research by reading source. |

Installed plugins can add more specialists to this roster. Four custom profiles add implementation and testing roles: `proxy-fix-builder`, `proxy-verifier`, `sonnet-builder` and `sonnet-tester`. Builders write code in an assigned worktree. Testers and verifiers run the real program, never edit what they test, and report evidence. Their prompts are in [`rules/agent-profiles.example.md`](../rules/agent-profiles.example.md).

Subagents start blank. They inherit no chat history. Every assignment must be self-contained: exact files and symbols, the change to make, and an observable acceptance criterion. A one-line task is a defect in the delegation, not in the subagent.

## Delegation rules

- **Parallel means independent.** Only slices with no shared state fan out together. A depends on B only when A strictly needs B's output. A small missing piece is no reason to serialize: the slices run in parallel and ask each other for the piece.
- **Ownership is by file.** Two agents must not edit the same file in one batch. Concurrent same-file edits do not merge. Siblings coordinate before touching a shared file, and one named owner integrates the shared boundary.
- **Contracts come first.** Interfaces between slices (types, schemas, function signatures) are decided by the lead and written into the shared batch context. They are never left for siblings to negotiate mid-flight.
- **No mid-flight validation.** Parallel tasks skip formatters, linters, and project-wide test suites, because a full check mid-batch trips over sibling edits. The lead validates once, at the end, on the merged state.
- **Research goes to `scout`.** Read-only questions never occupy a writing agent.
- **Concurrency is capped.** About 32 subagents run at once; excess queues.

## Coordination while running

A message hub connects the lead and all live subagents:

- **Peer messages.** Agents address each other by ID. Sends are fire-and-forget with delivery receipts; a blocking wait exists for the rare case where nothing else can proceed. An agent that needs a fact from a sibling's territory asks the sibling instead of guessing.
- **Background jobs.** Spawned work reports back automatically when it settles. The lead keeps working instead of polling.
- **Supervised processes.** Dev servers, watchers, debuggers, and REPLs run under stable names, scoped to the project directory, with readiness checks, logs, and stdin access. Any agent in the project can read their logs or drive them.

Context passes by reference, not by paste. Bulk payloads travel as shared local files. A finished subagent leaves a result artifact and a readable transcript, and both stay addressable after it exits.

## Model roles

Each role in the harness maps to its own model in `~/.omp/agent/config.yml`. The current mapping is snapshotted at [`rules/omp-config.example.yml`](../rules/omp-config.example.yml). The `default` role drives the main session. `plan` and `task` roles cover planning and task subagents, with dedicated roles for commits, vision, design and small utility calls. Task overrides pin `reviewer`, `scout` and `security-reviewer` to their own models. The lead's default model and the reviewer's model come from different vendors, so a review is a second opinion from a second model family, not the same model grading itself.

## Advisors

Three read-only advisors watch the main session. `astra` checks correctness, invariants and security. `fable` checks architecture, API design and YAGNI. `grok` checks obvious regressions and test gaps. The name `grok` is a label for the advisor, not a statement about which model runs it. Never attach advisors to subagents or tasks: they run unadvised, and worker attachment multiplies subscription cost. The roster is [`rules/omp-advisors.example.yml`](../rules/omp-advisors.example.yml). The shared defaults are four notes per update and three immune turns.

## Work pattern

1. The lead plans and fixes the contracts. Steering messages reach a running agent one at a time.
2. Every delegated item starts a fresh agent, so no slice inherits another's context.
3. Builders prove a failing-first test in their own worktree. Testers and verifiers run the real thing and mark what they observed versus inferred.
4. The lead validates once on the merged state. Sharpshooter memory keeps decisions across sessions, and autolearn is on.

## Without OMP

The invariants are harness-neutral. Only the transport changes.

| OMP mechanic | Plain equivalent |
|---|---|
| Typed subagent batch | One harness session per slice, each in its own git worktree (`git-worktree-runner` skill) |
| Blank-start task items | Self-contained task briefs committed to the repository |
| Hub peer messages | `status.md`, `agents/blockers.md`, and handoff entries per the [repository protocol](agentic-engineering.md) |
| Shared batch context | A contract section in `docs/interfaces.md` written before work starts |
| Result artifacts | Files and reports committed by each session |
| Model roles | Per-session model choice in each harness's own config |

Whatever the transport, keep the same rules: one owner per task, contracts fixed before parallel edits, no cross-slice validation mid-flight, one validation pass on the merged result, and durable records in the repository.
