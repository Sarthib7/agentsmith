# Project Learnings

> Managed by `/learn`. Append-only — latest entry wins on conflicts.

## Patterns

### nl-to-structured-json
- **Insight:** The atomic agent move is natural language to a typed JSON intent routed by your own switch statement; adopt this one step before adopting any framework
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/12-factor-agents.md
- **Date:** 2026-08-12

### unified-event-thread-state
- **Insight:** Keep one serializable event thread as the only state object and infer execution status from it; resume, fork, and replay then come for free
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/12-factor-agents.md
- **Date:** 2026-08-12

### research-plan-implement
- **Insight:** Split non-trivial work into research, plan, and implement phases, each starting a fresh context window seeded by the previous phase's markdown artifact
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/advanced-context-engineering.md
- **Date:** 2026-08-12

### intentional-compaction
- **Insight:** Before the window fills, compact to a file carrying the goal, approach, steps done, and current failure, then restart fresh from that artifact instead of arguing with a polluted window
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/advanced-context-engineering.md
- **Date:** 2026-08-12

### subagents-absorb-noise
- **Insight:** Sub-agents exist to burn their own window on search and read noise and return a distilled finding; keep the parent on synthesis and specify the return format (findings, file:line, open questions) in the brief
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/advanced-context-engineering.md
- **Date:** 2026-08-12

### vertical-slices-middle-out
- **Insight:** Build from the API contract with mock data outward (UI against mocks, then services, then storage), testing each 100-200 line slice; models default to horizontal stack-ordered plans and need steering away from them
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/advanced-context-engineering.md
- **Date:** 2026-08-12

### prefetch-known-context
- **Insight:** When you know the agent will call a tool, call it deterministically, put the result in context, and delete the tool from the schema
- **Confidence:** 7/10
- **Source:** learn
- **Files:** research/12-factor-agents.md
- **Date:** 2026-08-12

### gated-approval-workflow
- **Insight:** Gate feature work behind four sequential approvals (product, architecture, program design, slice plan) with a fixed approval question, only a clear yes counting, and formal backtracking that resets an earlier gate when a later one invalidates it
- **Confidence:** 7/10
- **Source:** learn
- **Files:** research/maciejdziuba-agentic-coding.md
- **Date:** 2026-08-12

### status-file-resume
- **Insight:** Keep a per-feature status file updated at every approval and slice, so a fresh session resumes from the docs folder alone; a decision that matters must never exist only in chat
- **Confidence:** 7/10
- **Source:** learn
- **Files:** research/maciejdziuba-agentic-coding.md
- **Date:** 2026-08-12

### least-confident-decisions
- **Insight:** End a design doc with a numbered list of the decisions you are least confident about and invite challenge while changing them is still free
- **Confidence:** 7/10
- **Source:** learn
- **Files:** research/maciejdziuba-agentic-coding.md
- **Date:** 2026-08-12

## Pitfalls

### long-loop-context-collapse
- **Insight:** Agents get lost past 10-20 turns as context grows, so scope each agent to 3-20 steps in one domain inside a deterministic pipeline
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/12-factor-agents.md
- **Date:** 2026-08-12

### wrong-context-beats-missing
- **Insight:** Context failure modes rank wrong information worst, then missing information, then noise; verify what you feed an agent before worrying about how much
- **Confidence:** 7/10
- **Source:** learn
- **Files:** research/advanced-context-engineering.md
- **Date:** 2026-08-12

### error-retry-cap
- **Insight:** Feed formatted (not raw) errors back into context so the model self-heals, but cap consecutive errors per tool at about 3 and escalate to a human, or the model spins on the identical error
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/12-factor-agents.md
- **Date:** 2026-08-12

### no-maintainability-reward
- **Insight:** Models are RL-trained against pass/fail verifiers with no penalty for eroding maintainability, so automated review raises the floor but not the ceiling; keep a human reading code (REPORTED claim, backed by SlopCodeBench complexity growth)
- **Confidence:** 7/10
- **Source:** learn
- **Files:** research/advanced-context-engineering.md
- **Date:** 2026-08-12

### lights-off-degrades
- **Insight:** Fully unattended agent pipelines produced codebases that resisted change within 3-6 months in the author's account; correlational data only, but plan for a human review step (REPORTED)
- **Confidence:** 6/10
- **Source:** learn
- **Files:** research/advanced-context-engineering.md
- **Date:** 2026-08-12

### plan-open-questions
- **Insight:** Never let an implementation plan ship with open questions in it; resolve them during planning or stop
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/advanced-context-engineering.md
- **Date:** 2026-08-12

### test-must-fail-first
- **Insight:** A test that passes against the pre-change code tests nothing; never ship one and never weaken or skip a test to get to green
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/maciejdziuba-agentic-coding.md
- **Date:** 2026-08-12

### process-size-gating
- **Insight:** Reserve the gated workflow for changes touching multiple files, adding an endpoint, table, or screen, or exceeding about 100 lines; one-shot renames, typos, copy tweaks, and obvious-repro bugs
- **Confidence:** 7/10
- **Source:** learn
- **Files:** research/maciejdziuba-agentic-coding.md
- **Date:** 2026-08-12

## Preferences

### own-the-four-surfaces
- **Insight:** Keep prompts, context format, control flow, and state in your own versioned code; reject any framework abstraction that hides the exact tokens sent or cannot interrupt between tool selection and tool invocation
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/12-factor-agents.md
- **Date:** 2026-08-12

### upstream-review-leverage
- **Insight:** Spend review budget on research and plans, not diffs: one bad line of research can become thousands of bad lines of code, and a 200 line plan is readable daily where 2000 lines of code is not
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/advanced-context-engineering.md
- **Date:** 2026-08-12

### context-utilization-band
- **Insight:** Keep context utilization around 40-60 percent and treat hitting the ceiling as a process failure to fix, not a normal event
- **Confidence:** 7/10
- **Source:** learn
- **Files:** research/advanced-context-engineering.md
- **Date:** 2026-08-12

## Architecture

### micro-agents-in-dag
- **Insight:** What works in production is small agent-shaped pockets inside a broader deterministic DAG, with LLM calls only where judgment is needed, not a goal plus a bag of tools looping until done
- **Confidence:** 8/10
- **Source:** learn
- **Files:** research/12-factor-agents.md
- **Date:** 2026-08-12

### human-contact-as-intent
- **Insight:** Make asking a human an explicit structured intent (question, context, urgency, answer format) that saves state and breaks the loop, with webhook resume keyed by thread id
- **Confidence:** 7/10
- **Source:** learn
- **Files:** research/12-factor-agents.md
- **Date:** 2026-08-12

## Tools

### workflow-as-skill-artifact
- **Insight:** Encode a working workflow as a self-contained skill file the agent can run without the pitch doc: trigger and anti-trigger in the description, a copy-ready template per gate, and the literal wording of questions to ask, not prose advice
- **Confidence:** 7/10
- **Source:** learn
- **Files:** research/maciejdziuba-agentic-coding.md
- **Date:** 2026-08-12

### research-agents-document-only
- **Insight:** Brief research agents to document what exists (where, how it works) and forbid critique, fixes, or root cause analysis unless asked; evaluation contaminates research artifacts
- **Confidence:** 7/10
- **Source:** learn
- **Files:** research/advanced-context-engineering.md
- **Date:** 2026-08-12
