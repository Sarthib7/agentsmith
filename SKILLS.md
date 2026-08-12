# Skill index

125 skills across 5 catalog sections.
Generated from `skills/*/SKILL.md` and `my-skills/*/SKILL.md`. Do not edit by hand.

Install one by its declared name:

```bash
npx skills add Sarthib7/agentsmith --skill <name>
```

Read one without installing it:

```bash
npx skills use Sarthib7/agentsmith@<name>
```

## Rules <sub>(24)</sub>

Always on, or about the setup itself. Never invoked by name.

### Output rules <sub>(9)</sub>

How the agent talks. Compression and ordering, applied to every response.

| Skill | What it does |
|---|---|
| [`adhd`](my-skills/adhd/SKILL.md) | Parallel divergent ideation for coding agents. |
| [`cavecrew`](skills/cavecrew/SKILL.md) | Decision guide for delegating to caveman-style subagents. |
| [`caveman`](skills/caveman/SKILL.md) | Ultra-compressed communication mode. |
| [`caveman-commit`](skills/caveman-commit/SKILL.md) | Ultra-compressed commit message generator. |
| [`caveman-compress`](skills/caveman-compress/SKILL.md) | Compress natural language memory files (CLAUDE.md, todos, preferences) into caveman format to save input tokens. |
| [`caveman-help`](skills/caveman-help/SKILL.md) | Quick-reference card for all caveman modes, skills, and commands. |
| [`caveman-review`](skills/caveman-review/SKILL.md) | Ultra-compressed code review comments. |
| [`caveman-stats`](skills/caveman-stats/SKILL.md) | Show real token usage and estimated savings for the current session. |
| [`i-have-adhd`](skills/i-have-adhd/SKILL.md) | Shape output for a reader with ADHD: lead with the next action, number multi-step work, restate state across turns, suppress tangents, give specific time estimates, make wins… |

### Code minimalism <sub>(6)</sub>

YAGNI enforced on every coding task. What gets built, not how the agent talks.

| Skill | What it does |
|---|---|
| [`ponytail`](skills/ponytail/SKILL.md) | Forces the laziest solution that actually works, simplest, shortest, most minimal. |
| [`ponytail-audit`](skills/ponytail-audit/SKILL.md) | Whole-repo audit for over-engineering. |
| [`ponytail-debt`](skills/ponytail-debt/SKILL.md) | Harvest every `ponytail:` comment in the codebase into a debt ledger, so the deliberate shortcuts and deferrals ponytail leaves behind get tracked instead of rotting into "later… |
| [`ponytail-gain`](skills/ponytail-gain/SKILL.md) | Show ponytail's measured impact as a compact scoreboard: less code, less cost, more speed, from the benchmark medians. |
| [`ponytail-help`](skills/ponytail-help/SKILL.md) | Quick-reference card for all ponytail modes, skills, and commands. |
| [`ponytail-review`](skills/ponytail-review/SKILL.md) | Code review focused exclusively on over-engineering. |

### Session control <sub>(6)</sub>

Finding the right skill, widening the frame, carrying state between sessions.

| Skill | What it does |
|---|---|
| [`handoff`](skills/handoff/SKILL.md) | Compact the current conversation into a handoff document for another agent to pick up. |
| [`learn`](skills/learn/SKILL.md) | Manage project learnings across sessions. |
| [`research-url`](skills/research-url/SKILL.md) | Research a URL with one dedicated subagent per URL: fixed-format distilled report plus learnings entries, with a parent-side landing check. |
| [`navigate-skills`](skills/navigate-skills/SKILL.md) | Meta skill — browse all installed solana-new skills, repos, and MCPs to find the right tool for any task |
| [`skill-menu`](skills/skill-menu/SKILL.md) | Use when the user asks to list, choose, or explicitly invoke skills with skill:<name>; loads local skill files on demand. |
| [`using-superpowers`](skills/using-superpowers/SKILL.md) | Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions |
| [`zoom-out`](skills/zoom-out/SKILL.md) | Tell the agent to zoom out and give broader context or a higher-level perspective. |

### Skill authoring <sub>(3)</sub>

Writing and maintaining skills themselves.

| Skill | What it does |
|---|---|
| [`setup-matt-pocock-skills`](skills/setup-matt-pocock-skills/SKILL.md) | Sets up an `## Agent skills` block in AGENTS.md/CLAUDE.md and `docs/agents/` so the engineering skills know this repo's issue tracker (GitHub or local markdown), triage label… |
| [`skill-creator`](skills/skill-creator/SKILL.md) | Create new skills, modify and improve existing skills, and measure skill performance. |
| [`write-a-skill`](skills/write-a-skill/SKILL.md) | Create new agent skills with proper structure, progressive disclosure, and bundled resources. |

## Coding <sub>(62)</sub>

Writing, reviewing, and shipping code. Chain-agnostic.

### Spec-driven development <sub>(5)</sub>

SPEC.md as source of truth: distill it, build against it, check drift, feed every bug back in.

| Skill | What it does |
|---|---|
| [`backprop`](skills/backprop/SKILL.md) | Bug → spec protocol. |
| [`check`](skills/check/SKILL.md) | Read-only drift detector. |
| [`spec`](skills/spec/SKILL.md) | Create, amend, or backprop bugs into SPEC.md at repo root. |
| [`build` <sub>(dir `spec-build`)</sub>](skills/spec-build/SKILL.md) | Plan-then-execute implementation against SPEC.md. |
| [`wayfinder`](skills/wayfinder/SKILL.md) | Plan a huge chunk of work — more than one agent session can hold — as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the… |

### Review and verification <sub>(12)</sub>

Catching what you got wrong before someone else does, and proving fixes actually hold.

| Skill | What it does |
|---|---|
| [`bench-it`](my-skills/bench-it/SKILL.md) | Benchmark a product claim against a named baseline or competitor. |
| [`cso`](skills/cso/SKILL.md) | Chief Security Officer mode. |
| [`deterministic-code-review`](my-skills/deterministic-code-review/SKILL.md) | Reviews code changes with deterministic scope selection, isolated review units, evidence-backed findings, exact line anchoring, and a final falsification pass. |
| [`diagnose`](skills/diagnose/SKILL.md) | Disciplined diagnosis loop for hard bugs and performance regressions. |
| [`followup-review`](my-skills/followup-review/SKILL.md) | Re-review a pull request after the author has pushed fixes for your earlier findings. |
| [`fresh-eyes`](my-skills/fresh-eyes/SKILL.md) | Get a second opinion from a subagent that has none of your context, either to independently corroborate a diagnosis or to adversarially break your work. |
| [`improve`](skills/improve/SKILL.md) | Survey any codebase as a senior advisor and produce prioritized, self-contained implementation plans for OTHER models/agents to execute. |
| [`improve-codebase-architecture`](skills/improve-codebase-architecture/SKILL.md) | Find deepening opportunities in a codebase, informed by the domain language in CONTEXT.md and the decisions in docs/adr/. |
| [`prove-it`](my-skills/prove-it/SKILL.md) | Verify a change in both directions before claiming it works. |
| [`review`](skills/review/SKILL.md) | Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's documented coding standards?) and Spec… |
| [`review-and-iterate`](skills/review-and-iterate/SKILL.md) | Review Solana project code for quality, security, and production readiness. |
| [`tdd`](skills/tdd/SKILL.md) | Test-driven development with red-green-refactor loop. |

### Planning and issue tracking <sub>(7)</sub>

Stress-testing a plan before writing code, then turning it into trackable work.

| Skill | What it does |
|---|---|
| [`grill-me`](skills/grill-me/SKILL.md) | Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. |
| [`grill-with-docs`](skills/grill-with-docs/SKILL.md) | Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates documentation (CONTEXT.md, ADRs) inline as decisions crystallise. |
| [`prototype`](skills/prototype/SKILL.md) | Build a throwaway prototype to flesh out a design before committing to it. |
| [`to-issues`](skills/to-issues/SKILL.md) | Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices. |
| [`to-prd`](skills/to-prd/SKILL.md) | Turn the current conversation context into a PRD and publish it to the project issue tracker. |
| [`triage`](skills/triage/SKILL.md) | Triage issues through a state machine driven by triage roles. |
| [`wizard`](skills/wizard/SKILL.md) | Generate an interactive bash wizard that walks a human through a manual procedure — third-party setup, a one-off migration, an A→B state transition — opening URLs, capturing… |

### Frontend <sub>(2)</sub>

React and Next.js architecture, plus interface craft.

| Skill | What it does |
|---|---|
| [`frontend-architect`](skills/frontend-architect/SKILL.md) | Expert frontend architecture and UI engineering for React, Next.js/App Router, TypeScript, Tailwind, shadcn/ui, accessibility, performance, design systems, Web3 transaction UX,… |
| [`frontend-design-guidelines`](skills/frontend-design-guidelines/SKILL.md) | Apply high-quality web interface design rules when building, reviewing, or styling frontend code. |

### Backend and databases <sub>(3)</sub>

APIs, Postgres, and Supabase.

| Skill | What it does |
|---|---|
| [`backend-specialist`](skills/backend-specialist/SKILL.md) | Expert backend engineering playbook for APIs, databases, auth, distributed systems, observability, performance, and production hardening. |
| [`supabase`](skills/supabase/SKILL.md) | Use when doing ANY task involving Supabase. |
| [`supabase-postgres-best-practices`](skills/supabase-postgres-best-practices/SKILL.md) | Postgres performance optimization and best practices from Supabase. |

### Deployment <sub>(22)</sub>

Render and Railway. Blueprints, services, domains, and what to do when a deploy fails.

| Skill | What it does |
|---|---|
| [`render-background-workers`](skills/render-background-workers/SKILL.md) | Sets up and configures background workers on Render for queue-based job processing. |
| [`render-blueprints`](skills/render-blueprints/SKILL.md) | Authors and validates render.yaml Blueprints for Render infrastructure. |
| [`render-cli`](skills/render-cli/SKILL.md) | Installs and uses the Render CLI for deploys, logs, SSH, psql, Blueprint validation, and automation. |
| [`render-cron-jobs`](skills/render-cron-jobs/SKILL.md) | Configures and troubleshoots scheduled tasks on Render using cron job services. |
| [`render-debug`](skills/render-debug/SKILL.md) | Debug failed Render deployments by analyzing logs, metrics, and database state. |
| [`render-deploy`](skills/render-deploy/SKILL.md) | Deploy applications to Render by analyzing codebases, generating render.yaml Blueprints, and providing Dashboard deeplinks. |
| [`render-disks`](skills/render-disks/SKILL.md) | Attaches and manages persistent disks on Render services—mount paths, sizing, snapshots, file transfers, and single-instance constraints. |
| [`render-docker`](skills/render-docker/SKILL.md) | Builds and deploys Docker containers on Render—Dockerfiles, multi-stage builds, Blueprint Docker fields, private registries, layer caching, and platform constraints. |
| [`render-domains`](skills/render-domains/SKILL.md) | Configures custom domains and TLS certificates on Render—DNS setup, CNAME records, apex domains, wildcard domains, and certificate troubleshooting. |
| [`render-env-vars`](skills/render-env-vars/SKILL.md) | Configures environment variables, secrets, and env groups on Render. |
| [`render-keyvalue`](skills/render-keyvalue/SKILL.md) | Provisions and configures Render Key Value (Redis-compatible Valkey 8) instances for caching, session storage, and job queues. |
| [`render-mcp`](skills/render-mcp/SKILL.md) | Connects and configures the Render MCP server for AI coding tools—setup per tool (Cursor, Claude Code, Codex), authentication, workspace selection, tool catalog, and… |
| [`render-migrate-from-heroku`](skills/render-migrate-from-heroku/SKILL.md) | Migrate from Heroku to Render by reading local project files and generating equivalent Render services. |
| [`render-monitor`](skills/render-monitor/SKILL.md) | Monitor Render services in real-time. |
| [`render-networking`](skills/render-networking/SKILL.md) | Connects Render services over the private network—internal DNS, service discovery, and cross-service communication. |
| [`render-postgres`](skills/render-postgres/SKILL.md) | Sets up and optimizes Managed PostgreSQL on Render—connection strings (internal vs external), creation constraints, storage autoscaling, connection limits, high availability,… |
| [`render-private-services`](skills/render-private-services/SKILL.md) | Configures Render private services—internal-only apps that accept traffic exclusively from other Render services over the private network. |
| [`render-scaling`](skills/render-scaling/SKILL.md) | Scales Render services—configures autoscaling targets, chooses instance types, sets manual instance counts, and optimizes cost. |
| [`render-static-sites`](skills/render-static-sites/SKILL.md) | Deploys and configures static sites on Render's global CDN—build commands, publish paths, SPA routing, redirects, custom headers, and PR previews. |
| [`render-web-services`](skills/render-web-services/SKILL.md) | Configures Render web services—port binding, TLS, health checks, custom domains, auto-deploy, PR previews, persistent disks, and deploy lifecycle. |
| [`render-workflows`](skills/render-workflows/SKILL.md) | Sets up, develops, tests, and deploys Render Workflows. |
| [`use-railway`](skills/use-railway/SKILL.md) | Operate Railway infrastructure: create projects, provision services and databases, manage object storage buckets, deploy code, configure environments and variables, manage… |

### Documentation lookup <sub>(2)</sub>

Fetching current API docs instead of guessing from training data.

| Skill | What it does |
|---|---|
| [`find-docs`](skills/find-docs/SKILL.md) | Retrieves up-to-date documentation, API references, and code examples for any developer technology. |
| [`openai-docs`](skills/openai-docs/SKILL.md) | Use when the user asks how to build with OpenAI products or APIs and needs up-to-date official documentation with citations (for example: Codex, Responses API, Chat Completions,… |

### Tooling <sub>(9)</sub>

Hooks, pre-commit, migrations, and the tools the agent drives outside a codebase.

| Skill | What it does |
|---|---|
| [`agent-browser`](skills/agent-browser/SKILL.md) | Browser automation CLI for AI agents. |
| [`collab-canvas`](skills/collab-canvas/SKILL.md) | Control Collaborator's spatial canvas from the terminal using the collab-canvas CLI. |
| [`git-guardrails-claude-code`](skills/git-guardrails-claude-code/SKILL.md) | Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, branch -D, etc.) before they execute. |
| [`git-worktree-runner`](my-skills/git-worktree-runner/SKILL.md) | Manages isolated development worktrees with git gtr, including creation, validation, command execution, tool launch, and safe cleanup. |
| [`janitor`](skills/janitor/SKILL.md) | Performs a read-only, platform-aware audit of cache and temporary storage, then reports cleanup candidates with measured sizes and risk notes. |
| [`migrate-to-shoehorn`](skills/migrate-to-shoehorn/SKILL.md) | Migrate test files from `as` type assertions to @total-typescript/shoehorn. |
| [`obsidian-vault`](skills/obsidian-vault/SKILL.md) | Search, create, and manage notes in the Obsidian vault with wikilinks and index notes. |
| [`scaffold-exercises`](skills/scaffold-exercises/SKILL.md) | Create exercise directory structures with sections, problems, solutions, and explainers that pass linting. |
| [`setup-pre-commit`](skills/setup-pre-commit/SKILL.md) | Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and tests in the current repo. |

## Crypto <sub>(24)</sub>

Blockchain work: Solana, EVM, and agent payment rails.

### Solana engineering <sub>(6)</sub>

Program development, debugging, and the road to mainnet.

| Skill | What it does |
|---|---|
| [`debug-program`](skills/debug-program/SKILL.md) | Help a developer debug a failing Solana program or transaction. |
| [`deploy-to-mainnet`](skills/deploy-to-mainnet/SKILL.md) | Guide a Solana project from devnet to mainnet production deployment. |
| [`solana-beginner`](skills/solana-beginner/SKILL.md) | Teach Solana fundamentals to developers new to the ecosystem. |
| [`solana-dev`](skills/solana-dev/SKILL.md) | Use when user asks to "build a Solana dapp", "write an Anchor program", "create a token", "debug Solana errors", "set up wallet connection", "test my Solana program", "deploy to… |
| [`solana-dev-expert`](skills/solana-dev-expert/SKILL.md) | Expert guidance on Solana blockchain development including Anchor framework, SPL token creation, NFT minting (Metaplex Core, cNFTs, Token-2022), DeFi protocol integration, wallet… |
| [`virtual-solana-incubator`](skills/virtual-solana-incubator/SKILL.md) | Deep technical Solana bootcamp — SVM architecture, Rust patterns, program development. |

### Solana build guides <sub>(6)</sub>

Walkthrough playbooks that decide what to build and in what order.

| Skill | What it does |
|---|---|
| [`build-data-pipeline`](skills/build-data-pipeline/SKILL.md) | Guide a developer through building a Solana data pipeline or indexer. |
| [`build-defi-protocol`](skills/build-defi-protocol/SKILL.md) | Guide a developer through building a DeFi protocol on Solana. |
| [`build-mobile`](skills/build-mobile/SKILL.md) | Guide a developer through building a Solana mobile app. |
| [`build-with-claude`](skills/build-with-claude/SKILL.md) | Guide a developer through building their Solana MVP step by step using Claude Code. |
| [`launch-token`](skills/launch-token/SKILL.md) | Guide a developer through launching a token on Solana. |
| [`scaffold-project`](skills/scaffold-project/SKILL.md) | Set up a complete Solana project workspace from a validated idea. |

### EVM <sub>(2)</sub>

Solidity, Foundry, and EVM protocol work.

| Skill | What it does |
|---|---|
| [`ethskills`](skills/ethskills/SKILL.md) | Use when a request involves Ethereum, the EVM, or blockchain systems. |
| [`evm-fullstack-dev`](skills/evm-fullstack-dev/SKILL.md) | Expert EVM full-stack development for Solidity contracts, Foundry tests, audits, gas optimization, L2 deployments, account abstraction, EIP-7702/4337 flows, viem/wagmi frontends,… |

### Agent payment rails <sub>(6)</sub>

Agents that pay: Masumi on Cardano, MPP and x402, paid APIs, confidential inference.

| Skill | What it does |
|---|---|
| [`masumi`](skills/masumi/SKILL.md) | Build AI agents with decentralized payments, identity, and marketplace integration on Masumi Network (Cardano blockchain). |
| [`masumi-ecosystem-developer`](skills/masumi-ecosystem-developer/SKILL.md) | Concise Masumi Network developer guide for decentralized AI-agent payments, identity, registry, marketplace, and Cardano-backed decision logging. |
| [`mppx`](skills/mppx/SKILL.md) | TypeScript SDK for the Payment HTTP Authentication Scheme. |
| [`pay`](skills/pay/SKILL.md) | User-authorized paid HTTP/API access for agents through the Pay MCP server and a locally approved payment wallet. |
| [`tempo` <sub>(dir `tempo-request`)</sub>](skills/tempo-request/SKILL.md) | Use this skill when the user wants to call an API, make an HTTP request, discover available services, or access external data with automatic payments. |
| [`temprouter`](skills/temprouter/SKILL.md) | Call tempRouter — a payable, end-to-end-encrypted LLM inference endpoint on MPP (Tempo). |

### Ecosystem research <sub>(4)</sub>

Reading the market before committing to a build.

| Skill | What it does |
|---|---|
| [`colosseum-copilot`](skills/colosseum-copilot/SKILL.md) | Search and analyze 5,400+ Solana hackathon projects using Colosseum Copilot. |
| [`defillama-research`](skills/defillama-research/SKILL.md) | Research DeFi protocols and market opportunities using DefiLlama data. |
| [`find-next-crypto-idea`](skills/find-next-crypto-idea/SKILL.md) | Interview users sharply to discover, rank, or validate what they should build in crypto. |
| [`submit-to-hackathon`](skills/submit-to-hackathon/SKILL.md) | Prepare and optimize a hackathon submission for a Solana project. |

## Writing <sub>(6)</sub>

Prose that ships, and stripping the AI tells out of it.

### Drafting <sub>(4)</sub>

Turning fragments and notes into something publishable.

| Skill | What it does |
|---|---|
| [`edit-article`](skills/edit-article/SKILL.md) | Edit and improve articles by restructuring sections, improving clarity, and tightening prose. |
| [`writing-beats`](skills/writing-beats/SKILL.md) | Shape an article as a journey of beats, choose-your-own-adventure style. |
| [`writing-fragments`](skills/writing-fragments/SKILL.md) | Grilling session that mines the user for fragments — heterogeneous nuggets of writing (claims, vignettes, sharp sentences, half-thoughts) — and appends them to a single document… |
| [`writing-shape`](skills/writing-shape/SKILL.md) | Take a markdown file of raw material and shape it into an article through a conversational session — drafting candidate openings, growing the piece paragraph by paragraph,… |

### De-slopping <sub>(2)</sub>

The detector and the rewriter. Run on anything that ships.

| Skill | What it does |
|---|---|
| [`avoid-ai-writing`](skills/avoid-ai-writing/SKILL.md) | Audit and rewrite content to remove AI writing patterns ("AI-isms"). |
| [`humanizer`](skills/humanizer/SKILL.md) | Remove signs of AI-generated writing from text. |

## Product <sub>(9)</sub>

Deciding what to build, then getting people to use it.

### Validation <sub>(4)</sub>

Pressure-testing an idea before you commit to it.

| Skill | What it does |
|---|---|
| [`competitive-landscape`](skills/competitive-landscape/SKILL.md) | Map the competitive landscape for a crypto product idea. |
| [`product-review`](skills/product-review/SKILL.md) | Product quality review — UX flows, onboarding, feature completeness, and user value. |
| [`roast-my-product`](skills/roast-my-product/SKILL.md) | Harsh, honest product critique — find every weakness before users do. |
| [`validate-idea`](skills/validate-idea/SKILL.md) | Run a structured validation sprint on a crypto startup idea. |

### Go to market <sub>(5)</sub>

Pitching, funding, branding, and telling people it exists.

| Skill | What it does |
|---|---|
| [`apply-grant`](skills/apply-grant/SKILL.md) | Prepare an Agentic Engineering Grant application by gathering project data, git history, and context files, then presenting all fields needed to fill the Solana Earn grant form. |
| [`brand-design`](skills/brand-design/SKILL.md) | Generate, preview, and apply a brand color palette (plus typography, gradients, and tone/voice) to a frontend project. |
| [`create-pitch-deck`](skills/create-pitch-deck/SKILL.md) | Create a structured pitch deck for a crypto project. |
| [`devrel-strategist`](skills/devrel-strategist/SKILL.md) | Modern Developer Relations strategy for 2025-2026. |
| [`marketing-video`](skills/marketing-video/SKILL.md) | Create marketing videos for Solana projects using Remotion (code-driven) and Renoise (AI-generated). |
