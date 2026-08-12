# Advanced Context Engineering for Coding Agents

Source: https://github.com/humanlayer/advanced-context-engineering-for-coding-agents
Date fetched: 2026-08-12
Author of source material: Dex Horthy (HumanLayer)

Provenance: REPORTED. Distilled from the source repo; claims are the authors', not independently verified.

## TLDR

The repo argues that a coding agent turn is a stateless function call, so the contents of the context window are the only lever you have on output quality, and therefore the entire development process (not just the prompt) should be designed around context management. The practical form of this is "frequent intentional compaction": split work into research, plan, and implement phases, write each phase's output to a durable markdown artifact, start each phase with a fresh context window seeded by that artifact, and keep context utilization in the 40 to 60 percent band. The second, later half of the repo pushes back on its own optimism: no amount of harness engineering fixes the fact that models are trained against pass/fail verifiers with no penalty for eroding maintainability, so the fully automated "lights-off" factory where no human reads code does not hold up over months. The recommended settlement is to put human review back, but move it upstream to the highest leverage artifacts (product intent, architecture, program design) where one bad line costs thousands of bad lines of code instead of one.

## Repo contents

Five markdown files, no README:

- `ace-fca.md`: the original context engineering essay (research/plan/implement, compaction, sub-agents, human leverage).
- `wsff.md`: "Why Software Factories Fail", the longer and more recent argument about why lights-off automation degrades codebases, plus the four upfront planning phases that replace it.
- `benchmarking-opus-5-on-slop-code-bench.md`: measured run of three Claude models on SlopCodeBench.
- `benchmarking-sol-fable-kimi-on-slop-code-bench.md`: second run adding Fable 5, GPT-5.6 Sol, and Kimi K3.
- `side-quests/where-does-the-time-go.md`: the 80/20 curve on upfront effort versus expected rework.

## Concept: the context window is the only lever

Core rule: treat every agent turn as a stateless function whose only input you control is the context window, and optimize that window deliberately.

Why: the source leans on the 12-factor-agents framing that LLMs are stateless functions. Without training or tuning the model, the only thing that changes output quality is input quality. Using an agent is the same discipline as building one, just with a smaller problem space.

Optimize the window along four axes: correctness, completeness, size, and trajectory. The failure modes, worst first, are: incorrect information, then missing information, then too much noise. Note the ordering. Wrong context is worse than absent context, which is worse than bloated context.

Do:
- Track how full the window is and treat filling it as a process failure, not a normal event.
- Keep utilization roughly in the 40 to 60 percent range, adjusted for problem complexity.
- Cite the Geoff Huntley constraint: you have roughly 170k usable tokens, and the more of it you use, the worse the outcome.

Don't:
- Don't treat the agent as a chatbot you argue with until it apologizes or runs out of room.
- Don't assume a bigger window solves the problem. The repo treats window size as a budget to underspend, not a capacity to fill.

## Concept: intentional compaction

Core rule: when the window fills, do not let the harness auto-compact for you; deliberately distill the session into a structured artifact and start fresh from it.

Why: what actually eats context is mechanical (file search, tracing code flow, applying edits, test and build logs, large JSON tool responses). Those are all high-token, low-signal once their conclusion is known. Compaction is distilling them into a written artifact that carries the conclusion without the transcript.

The prompt shape the repo gives: "Write everything we did so far to progress.md, ensure to note the end goal, the approach we're taking, the steps we've done so far, and the current failure we're working on."

Do:
- Write compaction output to a file, so the next session starts from a document rather than a summary buried in history.
- Include the goal, the approach, the steps completed, and the current failure. All four.
- Use commit messages as a compaction surface too.

Don't:
- Don't restart a derailed session by re-prompting inside the same polluted window. Start over with a fresh window and better steering.

## Concept: sub-agents are context control, not roleplay

Core rule: use sub-agents to keep search and read noise out of the parent window, not to simulate a team of personas.

Why: the repo is blunt that sub-agents are "not about playing house and anthropomorphizing roles." The value is that a sub-agent burns its own fresh window on Glob, Grep, and Read calls and returns only a distilled finding, so the parent can start work with a clean window.

Do:
- Send discovery, search, and summarization to sub-agents; keep synthesis in the parent.
- Aim the sub-agent's return format at the same shape as a good compaction artifact (goal, findings, file:line references, open questions).
- Run multiple sub-agents in parallel when they are searching for different things.

Don't:
- Don't expect a good sub-agent return for free. The repo notes explicitly that getting a sub-agent to return the ideal compact artifact is not trivial and needs prompt work.
- Don't have the parent agent do the deep file reading. Keep the parent focused on synthesis.

## Concept: frequent intentional compaction (research, plan, implement)

Core rule: design the whole workflow, not just individual prompts, around compaction, by splitting each unit of work into three phases with a written artifact handed between them.

Why: a single artifact-free session accumulates noise until quality collapses. Splitting into phases gives you a natural compaction boundary at each transition, and each artifact is a human review point that is cheaper to read than the code it will produce.

The phases:

1. Research. Understand the codebase, which files are relevant, how information flows, and possible causes of the problem. Output is a research document.
2. Plan. Enumerate the exact steps, the files to edit and how, and be precise about testing and verification per phase. Output is an implementation plan.
3. Implement. Step through the plan phase by phase. For complex work, compact status back into the plan file after each verified phase.

The repo notes the flow is flexible: sometimes research is skipped and planning starts directly, sometimes several compacted research passes are needed before implementation. Only the implement step needs a git worktree; research and planning happen on main.

Concrete evidence offered: a bug fix PR on BAML (a 300k LOC Rust codebase the author had never touched) approved by the maintainer the next morning, and 35k LOC adding cancellation and WASM support in roughly 7 hours (3 hours research and planning, 4 hours implementing) for two features estimated at 3 to 5 days each for a senior engineer on that team.

Counter-evidence the repo publishes about itself: a 7 hour attempt to remove Hadoop dependencies from parquet-java failed, because the research did not go deep enough through the dependency tree and assumed classes could be moved without dragging nested dependencies along. The stated lesson is that you likely need at least one person who is an expert in the codebase.

## Concept: human leverage sits upstream of code

Core rule: spend human attention on research and plans, not on reading every line of generated code.

Why: the stated multiplier is that a bad line of code is one bad line, a bad line of a plan can produce hundreds of bad lines of code, and a bad line of research (a wrong belief about how the codebase works) can produce thousands. Review effort applied at the research layer is therefore worth orders of magnitude more than the same effort applied at the diff.

Do:
- Read the research before allowing planning to start; throw out research that is wrong. The repo describes discarding a first research pass because the agent concluded the bug was invalid, then re-running with more steering.
- Read the plan carefully. A 200 line implementation plan is readable daily in a way that 2000 lines of Go is not.
- Stay engaged. The repo is explicit that there is no magic prompt and that the technique fails if you disengage.

Don't:
- Don't take a plan produced without research as equivalent. The repo ran both and reports that both "would have worked" but only the research-backed plan fixed the problem in the right place and tested in line with codebase conventions.

## Concept: code review is for mental alignment

Core rule: keep an engineering process whose job is keeping the team current on how the code is changing and why, because AI throughput makes unfamiliarity the default state.

Why: borrowing Blake Smith's framing, the most important function of code review is mental alignment rather than defect catching. When everyone ships far more code, a much larger share of the codebase is unfamiliar to any given engineer at any moment. The author reports that the biggest source of team friction from very productive AI coders was not correctness, it was losing touch with what the product was and how it worked.

Do:
- Pick whatever artifact your team can actually keep up with (PRs and internal docs for most teams, specs, research, and plans for this one) and make it the alignment surface.
- Require that the process also lets someone learn an unfamiliar part of the codebase quickly.

Don't:
- Don't assume research/plan/implement is right for every team. The repo says outright it probably is not, and that the two requirements above are the thing that generalizes.

## Concept: the lights-off software factory does not hold

Core rule: do not remove the human code review step from your pipeline, however much automated testing and review you add around it.

Why: the repo describes going fully lights-off in July 2025 and hitting problems no prompting or workflow could solve, at which point someone has to go read a codebase nobody has read in three months, while the site is down. After the third occurrence, the cofounder spent two weeks rewriting the patterns by hand in a plain editor. Supporting external signal cited: a Faros AI report showing review comments up 25 percent, comment length up 22.7 percent, 31.3 percent of PRs skipping review entirely, incidents per PR up 242.7 percent, and bugs per developer up 54 percent. The repo labels this correlational, not a smoking gun.

The specific model shortcoming named: models cannot maintain and improve codebase quality over time without human steering. That is shotgun surgery, where changing one part of the codebase keeps breaking another.

Do:
- Assume an agent-built codebase starts to resist change after roughly three to six months, and that the way you add things has to change at that point.
- Treat "improving codebase quality over time" as a dimension that has barely moved between model generations, unlike one-off problem solving which has moved a lot.

Don't:
- Don't read benchmark gains as evidence that models stopped degrading codebases.
- Don't accept "you're holding it wrong" as the explanation for poor results at scale. The repo's thesis is that this is a training and verification problem, not a skill problem.

## Concept: there is no penalty for bad design

Core rule: understand that models are optimized against fast pass/fail verifiers, so nothing in their training rewards maintainability.

Why: reinforcement learning on coding traces needs a fast, reliable oracle. Tests give a verdict in seconds. The cost of bad architecture shows up in weeks to years, the first time someone opens a file for a one line change and finds they have to make the same edit in eleven places. There is no way to backpropagate an incident months later to the design decision that caused it. On SWE-bench Multilingual the reward is one or zero on FAIL_TO_PASS plus PASS_TO_PASS. How the model got there does not matter, which is how you get try/catch around everything and lazy type casts that defeat the type system.

The repo's sharpest formulation: if a model could reliably tell good code from bad, it might have written the good version to begin with. So a judge model as verifier has a ceiling.

Efforts the repo credits as pointed the right way: SWE-Marathon (very long tasks with a compound reward instead of one bit), DeepSWE (large tasks on repos that were never actually built, so they cannot be in the training set), and Frontier Code (multi-PR tasks that penalize tests which do not fail against the pre-patch code, plus a judge model over the diff against code quality rules).

Do:
- Add review agents and linters, understanding that they raise the floor by catching dumb mistakes.

Don't:
- Don't expect automated review to raise the ceiling. The ceiling is whatever RL taught the model, and good design is not in there.

## Concept: measured evidence from SlopCodeBench

Core rule: use long-horizon, incrementally-divulged benchmarks as the signal for whether a model can be trusted unattended, and do not trust one-shot benchmarks for that question.

Why: SlopCodeBench (March 2026, Gabe Orlanski's lab at UW Madison) gives each challenge multiple checkpoints where the model does not see later requirements, so it has to evolve a codebase as new requirements arrive. That matches real work in a way that benchmarks disclosing the whole problem up front do not. The metric used is "strict pass": everything new is green, including every regression test inherited from earlier checkpoints, judged by held-out black-box tests run against the produced entrypoint.

Reported numbers (REPORTED, from the author's own subset runs, explicitly described as directional and not statistically significant):

- Original paper: GPT-5.4 at 11 percent, Opus 4.6 at 17 percent strict pass.
- Run one (3 problems, 17 checkpoints): Opus 5 at 24 percent (4 of 17), Opus 4.8 and Sonnet 5 at 6 percent (1 of 17 each). No model reached the final checkpoint of any problem cleanly, including the one labeled easy.
- Run two (6 challenges, 30 checkpoints): Fable 5 and GPT-5.6 Sol tied at 33.3 percent (10 of 30), Kimi K3 at 26.7 percent (Modal) and 23.3 percent (Baseten). Fable took the tiebreak on isolated passes, 16 to 14.
- Every model increased mean cyclomatic complexity across checkpoints. Opus 4.8 went from 4.6 percent to 16.8 percent duplicated lines over eight checkpoints, with an inflection where new requirements start fighting the initial design.
- 79 to 98 percent of written lines tripped at least one of the benchmark's slop rules, which the author reads as partly evidence that the rules are over-aggressive rather than pure proof of bad code.

Do:
- Prefer verifiers that measure iteration over time. The repo's stated bar is that it would trust lights-off operation at 80 percent or better on a well-held-out benchmark of this kind.
- Note the proposed better oracle: have a frontier model build checkpoints 1 through N, then hand the codebase to a smaller, cheaper model for checkpoint N+1. Whether the small model can continue is a measure of the quality the big model left behind.

Don't:
- Don't treat deterministic code quality metrics as ground truth. The author likes that they are repeatable and model-free, but says the link between any one of them and "is this codebase easy to change" is not established, and that models can reward hack any of them.

## Concept: the four upfront phases (lights back on)

Core rule: front-load alignment across product requirements, system architecture, program design, and vertical slices, because 30 minutes of planning saves hours of review.

Why: this is the pre-AI insight that building and reviewing both take hours or days, so aligning first cuts both rework and review time. With agents, building drops to minutes or hours while review stays at hours or days, which makes review the bottleneck; front-loading is what actually shortens it. A well-done PR reviews fast. A PR needing even 20 percent rework (and the author estimates AI one-shot PRs trend closer to 50 percent) is both an intellectual and emotional burden on submitter and reviewer.

**1. Product review.** A short doc pinning down what you are building and why. Two things get settled: the problem to solve in the user's terms, and what success looks like as something readable after shipping (a user outcome, an error rate, a latency number, or support tickets about X stopping). Keep it in product space; jot technical detail down for later phases instead of drifting into it. Mock up screens in rough HTML rather than describing them, because a mockup settles an argument three paragraphs would prolong.

**2. System architecture.** Align on how services, endpoints, schemas, queues, and stores talk to each other, without dropping into code shape. Use visualizations for human/agent bandwidth: sequence diagrams, contract and endpoint shapes with request and response types, data models with the new table DDL and new query shapes. The caution given: mermaid can be overkill and can lure you into a false sense of alignment, and architecture alone is insufficient to produce high-quality code.

**3. Program design.** The phase the repo calls criminally underemphasized: before anyone writes implementation, specify the shape of the code. What works is light visualization in pseudocode rather than diagrams:
- Call-stack trees for any orchestration or control flow change, in diff syntax when the interesting part is what changes.
- File-tree diffs with NEW and MODIFIED annotations, so you stay in touch with where things live.
- Types and method signatures for the key new functions, the internals too small for an architecture doc but that an agent can still get wrong.
Each of these is a decision you would otherwise make implicitly during code review, at the most expensive possible moment to change your mind.

**4. Vertical slices (tracer bullets).** Models default to "horizontal plans" in stack order (migrations, then services, then API, then frontend), which leaves nothing you can touch until the end. Build outward from the middle instead: API contract serving mock data testable with curl, then frontend against the mock, then wire the API to services, then migrations and real database, then business logic, then error handling. Test and review at each step. Checking 100 to 200 lines and re-steering is far cheaper than arriving at 2000 lines with no idea what is broken. Most frontier models will not plan this way without human steering.

Reported distribution across tasks: roughly 40 percent get one-shot or one-shot with one or two rounds of light feedback; medium tasks get product and system design combined into one plan document with no phase breakdown; large things get all four steps, skipping the product phase where it does not apply (big refactors). Copy tweaks, one-off scripts, and bugs with obvious repros go straight to the agent.

Review practice: author-opt-in reviews. Pick the person who would review the PR and walk them through the product and technical specs before the coding starts.

## Concept: the 80/20 curve on upfront effort

Core rule: match planning effort to expected pain, and stop climbing the curve once the cheap wins are taken.

Why: expected pain equals the probability you will have to change it multiplied by how painful the change is. Plotting effort against expected pain gives an inverse curve. A two sentence prompt lands around a 50 percent rework chance; an afternoon hand-writing a detailed spec drops it to roughly 10 percent; writing every line by hand takes it to zero while giving up all the leverage. Roughly 80 percent of the expected pain disappears in the first few minutes of planning. The failure to avoid is spending six hours planning a task where ten minutes would have removed most of the risk.

Related time argument: even before AI, only 25 to 50 percent of the time to ship a feature was writing code. If AI only accelerates the coding, a two day feature loses 2 to 4 hours of coding and gains nothing on aligning, reviewing, or verifying. Using AI to help plan and align is what gets you to 2 to 3x.

## Workflow artifacts: the actual prompts

These three prompts are linked from `ace-fca.md` and live in the humanlayer/humanlayer repo at `.claude/commands/`. Fetched for this report because they are the operational form of the workflow.

**research_codebase.md.** The dominant instruction is that research documents, not evaluates: no improvement suggestions, no root cause analysis, no critique, no refactoring recommendations unless explicitly asked. Only what exists, where, how it works, and how components interact. Mechanics: read any user-mentioned files fully in the main context (never with limit or offset) before spawning anything; decompose the question; spawn parallel specialized sub-agents (locator agents to find where things are, analyzer agents to explain how they work, pattern-finder agents to find existing examples); wait for all of them before synthesizing; write a document with YAML frontmatter carrying date, git commit, branch, and repository, plus a Code References section of file:line entries and an Open Questions section. The parent agent stays on synthesis and does not do deep file reading.

**create_plan.md.** Interactive and skeptical by design. Read mentioned files fully first, spawn parallel research agents, read every file they identify fully, then present your understanding along with only the questions that code investigation genuinely cannot answer. If the user corrects you, do not just accept it; spawn research to verify before proceeding. Get agreement on the phase outline before writing details. The plan template includes Current State Analysis, Desired End State, Key Discoveries with file:line references, an explicit "What We're NOT Doing" section for scope control, then per-phase changes. Success criteria are always split into Automated Verification (a runnable command per line) and Manual Verification (UI behavior, performance under load, edge cases). Hard rule: no open questions in the final plan; if one appears, stop and resolve it before writing.

**implement_plan.md.** Read the plan completely and check existing checkmarks, read the originating ticket and every file the plan mentions fully, then implement phase by phase. Follow the plan's intent while adapting to reality. On a mismatch, stop and present Expected / Found / Why this matters and ask how to proceed rather than improvising. After each phase, run the success criteria, tick off items in the plan file itself, then pause and tell the human which automated checks passed and which manual steps are theirs. Never tick a manual item without user confirmation. Use sub-tasks sparingly here, mainly for targeted debugging. On resume, trust completed checkmarks and pick up at the first unchecked item.

## Rules to adopt

1. Treat the context window as the only quality lever you have, and design the whole workflow around it rather than tuning prompts in isolation.
2. Keep context utilization in the 40 to 60 percent band and treat hitting the ceiling as a process failure to fix, not a normal event to ride out.
3. Rank your context failures correctly: wrong information hurts more than missing information, which hurts more than noise.
4. Compact deliberately into a file before the window fills, capturing the end goal, the approach, the steps completed, and the current failure.
5. Restart derailed sessions in a fresh window seeded by an artifact, instead of arguing with a polluted one.
6. Use sub-agents to absorb search and read noise, and keep the parent agent on synthesis only.
7. Write sub-agent briefs that specify the return format (findings, file:line references, open questions), because a useful compact return does not happen by default.
8. Split every non-trivial task into research, plan, and implement, with a durable markdown artifact handed between phases.
9. Read the research before any planning starts, and throw out research that reached the wrong conclusion rather than patching it.
10. Never let a plan ship with open questions in it; resolve them during planning or stop.
11. Split every success criterion into automated verification (a command anyone can run) and manual verification (what a human must look at).
12. Spend your review budget upstream: one bad line of research can become thousands of bad lines of code.
13. Instruct research agents to document what exists and forbid them from critiquing, proposing fixes, or doing root cause analysis unless asked.
14. Read files fully in the main context before spawning sub-agents, and never partially read a file the user explicitly named.
15. Do the research and planning on main, and reserve worktrees for the implement phase.
16. Build in vertical slices from the middle outward (contract, then UI against mocks, then services, then storage), and reject the model's default stack-ordered horizontal plan.
17. Review 100 to 200 lines at a time between slices instead of arriving at a 2000 line diff with nothing verified.
18. Do a program design pass before implementation: call-stack trees in diff syntax, file-tree diffs, and the key type and method signatures.
19. Mock up screens in rough HTML during product review rather than describing them in prose.
20. Pick the eventual PR reviewer and walk them through the product and technical specs before coding starts.
21. Match planning depth to expected pain, and stop once the cheap 80 percent of the risk is gone; one-shot the copy tweaks and obvious-repro bugs.
22. Keep a human reading the code. Automated review and linters raise the floor, they do not raise the ceiling.
23. Assume the codebase degrades under unsteered agents, and expect an agent-built codebase to start resisting change within three to six months.
24. Do not read benchmark gains as evidence that models stopped eroding maintainability; judge that with long-horizon, incrementally-divulged evals instead.
25. Maintain an engineering process whose explicit job is keeping the team aligned on how the code is changing and letting anyone learn an unfamiliar area fast, whatever artifact you use for it.
