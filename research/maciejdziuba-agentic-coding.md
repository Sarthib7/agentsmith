# The Software Factory Playbook: Dex Horthy's 4-gate workflow as a skill

Source: https://gist.githubusercontent.com/Maciejdziuba/88890d7e0eeefa5a8738bbe9fd5e20b8/raw/112d6ba3d533bd07895774e37d169ce585f6317d/README.md
Companion file in the same gist (fetched): `SKILL.md` at https://gist.githubusercontent.com/Maciejdziuba/88890d7e0eeefa5a8738bbe9fd5e20b8/raw/112d6ba3d533bd07895774e37d169ce585f6317d/SKILL.md
Both files were fetched (HTTP 200 each) and the gist API confirms the gist holds exactly these two files. README.md is 41 lines; SKILL.md is 168 lines. The pinned-revision SKILL.md URL above and the unpinned `/raw/SKILL.md` URL returned byte-identical content (sha1 463cf295357b6fa67445f4dbc9bafe92440730e0 for both). README.md and SKILL.md are treated here as one source set.
Date fetched: 2026-08-12
Author: Maciejdziuba (packaging a workflow attributed to Dex Horthy of HumanLayer, from an episode of David Ondrej's podcast)

Provenance: REPORTED. Distilled from the source gist; claims are the author's, not independently verified.

## TLDR

The gist packages a four-gate feature workflow as an installable Claude Code Agent Skill (`software-factory`). Its argument: coding agents default to building horizontally (all the backend, then all the frontend), which dumps a 2,000-line diff on the human at the end, when every decision inside it is expensive to change. The fix is to force every decision that matters to happen before implementation code exists, through four gates that each stop for explicit human approval: Product, Architecture, Program Design, and Vertical Slices. Each gate writes a fixed-template doc to `docs/plans/<feature>/`, with a `00-status.md` state file recording which gates are approved and which slices are done, so decisions survive context compaction and a fresh session resumes from the files alone. The supporting idea is context engineering: the author quotes Horthy that "the sessions that generate design docs are context-light" and that "you get the most model intelligence when you do the hard thinking early," so the hard thinking goes at the front of the context window and gets compacted into docs at every boundary.

## The core thesis: decide before the code exists

Core rule: make every important decision before implementation code exists, where changing it costs a sentence instead of a rewrite.

Why: once a model has written thousands of lines, changing direction means a rewrite rather than an edit. Review cost lands entirely on the human at the end, and by then the human has lost touch with the codebase. The gist frames the default agent behavior (horizontal building) as the thing to defeat.

Do:
- Run the full workflow for anything that creates or changes multiple files, adds an endpoint, table, or screen, or would produce a diff around 100 lines or more.
- Ask once when the size is ambiguous: offer the 4-gate workflow or the fast version, and respect the answer.

Don't:
- Don't run four gates on a rename, typo, copy change, style tweak, or one-line config edit.
- Don't run the process when the user says to skip it ("just vibe it", "quick and dirty") or says the code is throwaway or pure prototyping.

## Gate 1: Product, with no tech talk

Core rule: state the user problem, the success metric, and the announcement before anyone names a table or an endpoint.

Why: if the feature cannot be announced to users in a few sentences, it is the wrong feature. Keeping technology out of this stage stops the conversation from collapsing into implementation before the problem is agreed on.

Do:
- Write `01-product.md` with four sections: Problem (in the end user's words, not the developer's), Success metric (one real business number, plus how it is measured), Announcement (3 to 6 sentences, the blog post written before the feature), Screens (one line per mockup file, or "no UI").
- For anything with a UI, produce one plain HTML file per screen in `mockups/`: no framework, no build step, throwaway by design.
- Iterate on the mockups with the user until they say yes to the shape.

Don't:
- Don't mention databases, schemas, endpoints, architecture, or file names here. If technology comes up, push it to Gate 2.

## Gate 2: Architecture

Core rule: describe how the feature fits the system that already exists, after reading that system's code.

Why: designing against an imagined codebase produces plans that do not survive contact with the repository. This gate fixes the seams (which modules, which routes, which tables, which call order) while they are still prose.

Do:
- Read the relevant existing code before writing the doc.
- Write `02-architecture.md` with: Fit (which services or modules this touches and how), Endpoints (route, verb, purpose, one line each, or "none"), Data (new or changed tables and collections, with outlines of the queries that will hit them), Flow (the end-to-end call order for the main path), External (third-party APIs, webhooks, and environment variable names).

Don't:
- Don't put environment variable values in the doc. Names only.

## Gate 3: Program Design, the step everyone skips

Core rule: write down the decisions the agent would otherwise make silently mid-implementation, including the ones it is least sure about.

Why: the gist singles this out as the commonly skipped gate. Types, signatures, file placement, and test assertions are the decisions that get baked into a large diff invisibly; surfacing them as a short readable artifact lets a human say "right" or "wrong" in seconds rather than during review of 2,000 lines.

Do:
- Write `03-program-design.md` with: Files (every file created or changed, one line each on why it lives there), Types and signatures (code blocks with no implementation bodies), Call stack (what calls what, top to bottom, per main flow), Test plan (test case names and what each asserts, written before the tests exist), Least confident decisions (a numbered list of the calls most worth challenging now, while changing them is free).
- Keep the types and signatures block short enough to read at a glance.

Don't:
- Don't include implementation bodies in this gate. Signatures only.
- Don't hide low-confidence choices. The point of the last section is to invite challenge before the cost of reversal rises.

## Gate 4: Vertical slices and tracer bullets

Core rule: build a thin end-to-end slice that actually runs first, then add real logic one testable slice at a time.

Why: a slice that runs end to end proves the wiring and gives the human something to steer against. Re-steering after a slice is cheap; re-steering after a horizontal build is a rewrite.

Do:
- Write the slice plan as `04-slices.md` first (one line per slice in build order) and get it approved before writing code.
- Make Slice 1 the tracer bullet: a mocked or hardcoded endpoint plus a stubbed UI (or a curl-able response), wired end to end. It does almost nothing, but it runs and the user can see it.
- Make Slice 2 replace the mocks with real logic for the single happy path.
- Give Slice 3 and beyond one capability each: a business rule, error handling, an edge case, polish. Each slice ends in a working, testable state.
- After every slice: prove it works by running it, curling it, or browser-testing it and showing the result; check the slice off in `00-status.md`; then ask whether to continue to the next slice or re-steer.

Don't:
- Don't build horizontally (all of the database, then all services, then all the API, then all the frontend) with nothing testable until the end.
- Don't keep adding code when the trajectory is already wrong. Fix direction at the slice boundary.

## The approval protocol

Core rule: every gate ends with a written doc, a short summary, and one explicit approval question.

Why: approval has to be a discrete event with a recorded outcome, otherwise the workflow drifts back into continuous generation. Summarizing instead of pasting keeps the reviewing human's attention on decisions rather than prose.

Do (the six steps, in order):
1. Write the gate doc to disk.
2. Present at most 5 to 10 bullet decisions plus the doc path. Do not paste the whole doc into chat.
3. Ask exactly: "Approve Gate N, or what should change?"
4. Treat only a clear yes, approve, or continue as approval. Anything else means revise the doc to address the answer, then re-ask.
5. On approval, mark the gate APPROVED in `00-status.md` and move on.
6. Backtrack properly: if a later gate reveals an earlier approved decision is wrong, stop, update the earlier doc, set that gate back to "in progress", and get re-approval before continuing.

Don't:
- Don't merge gates.
- Don't write implementation code before the Gate 4 slice plan is approved.
- Don't redo an approved gate unless the user asks or a later gate invalidated it.

## State on disk, and the resume rule

Core rule: the plan folder, not the chat, is the state of the work.

Why: chat context is lost to compaction and session boundaries. Files are not. The gist's claim is that a fresh session should pick up exactly where the last one stopped, using only the docs.

Workflow shape:

```
docs/plans/<feature-slug>/
  00-status.md          state file: gate approvals + slice checklist
  01-product.md
  mockups/              Gate 1 screen mockups, plain HTML, one file per screen
  02-architecture.md
  03-program-design.md
  04-slices.md
```

`00-status.md` is created first, before Gate 1, and holds four gate lines (pending, in progress, or APPROVED with a date), a slice checklist, and a "Notes for a fresh session" section for anything decided in chat that a new session must know.

Do:
- At the start of any session, if a `00-status.md` exists for the feature under discussion, read every doc in that folder before doing anything, then continue from the first unapproved gate or the first unchecked slice.
- Update `00-status.md` at every gate approval and every slice completion.

Don't:
- Don't let an important decision live only in chat.

## The dumb-zone rule and context engineering

Core rule: do the hard thinking early in the context window, compact it into docs at every gate and slice boundary, then restart fresh.

Why: the gist's framing is that model intelligence available to a task is highest when context is light, and design sessions are naturally context-light. As a session fills with generated code and tool output, quality of judgment falls, which is the zone the rule is named for. Compacting at boundaries converts perishable context into durable files.

Do:
- At the end of every gate and every slice, confirm the docs contain everything decided.
- Tell the user when a point is safe for starting a fresh session.
- Compact immediately, wherever you are, if the harness warns that context is running low.

Don't:
- Don't carry decisions forward in context and hope they survive.

## Keeping the human in the loop

Core rule: keep diffs small enough that the human still reads them.

Why: the gist argues that losing touch with the codebase costs weeks, and that the cost arrives at the worst moment, when the agent hits a bug it cannot solve and the human has no mental model to debug with.

Do:
- Keep slices small.
- Nudge the user at a slice boundary if they have not looked at code in a long stretch.

## Test discipline

Core rule: a test that cannot fail tests nothing.

Why: the fastest way to a green suite is a test that passes against the unchanged code, which converts verification into decoration.

Do:
- Verify that a new test fails against the pre-change code.

Don't:
- Don't comment out, skip, or weaken a test to reach green.

## Durable context in the codebase

Core rule: write down anything an agent would otherwise have to rediscover, and keep it in the repository.

Why: the gist's phrasing is that files on disk are free context, so every future session starts smarter than the last.

Do:
- When a gate produces a decision that outlives the feature, offer to record it as an ADR at `docs/adr/NNNN-<slug>.md` with context, decision, and consequences.
- Record things that live outside the repo but that an agent needs to know exist (environment variable names, payment setup, test accounts, third-party dashboards) in `docs/external/`.
- Supersede old ADRs with new ones.

Don't:
- Don't rewrite an existing ADR in place.

## SKILL.md: the operational form, and how it relates to README.md

The two files are not two arguments. README.md is the pitch and the install page: it names the source (Dex Horthy on David Ondrej's podcast), states the problem (agents build horizontally and hand you a 2,000-line diff), lists the four gates in one line each, and gives a curl command. It contains no template, no approval wording, and no slice rules. Every operational detail in this report comes from SKILL.md.

SKILL.md is a standalone skill definition, written as instructions addressed to the agent rather than to the reader. It is self-contained: an agent that has only this file can run the whole workflow without the README. Its structure:

- YAML frontmatter with `name: software-factory` and a description that carries both the trigger condition (a new feature, a new project, or any task expected to change several files or produce a large diff) and the anti-trigger (trivial tweaks such as renames, copy changes, one-line config edits). That one field is what makes automatic activation selective, so the skill does not fire on a button-color change.
- A "when to run the gates" section with a size threshold (roughly 100 lines or more, or a new endpoint, table, or screen), three explicit skip conditions, and a single clarifying question to ask when the size is ambiguous.
- The exact directory layout for `docs/plans/<feature-slug>/`, plus a copy-ready `00-status.md` template and the resume rule.
- A six-step approval protocol, including the literal question to ask and what counts as approval.
- Four gate sections, each with a markdown document template the agent fills in, and per-gate rules (no tech talk in Gate 1, read existing code before Gate 2, no implementation bodies in Gate 3, tracer bullet first in Gate 4).
- A "standing rules" section that is always on: compact at every boundary, keep diffs reviewable, real tests only.
- An optional closing section on ADRs and `docs/external/`.

Relationship in one line: the README argues why the workflow exists and how to install it; SKILL.md is the executable form of that argument, and it is stricter than the README (it adds the size threshold, the skip conditions, the exact approval sentence, the backtracking procedure, and the test-integrity rule, none of which appear in the README).

Distribution shape: a single markdown file installed to `~/.claude/skills/software-factory/SKILL.md` via curl, activated by restarting Claude Code, invocable as `/software-factory`. The gist states it works in any agent supporting the SKILL.md format and names Claude Code and Amp.

## Rules to adopt

1. Run a gated workflow for any change touching multiple files, adding an endpoint, table, or screen, or producing a diff over roughly 100 lines.
2. Skip the process entirely for renames, typos, copy changes, style tweaks, and one-line config edits.
3. Ask once when the size is ambiguous, offer the full workflow or the fast version, and respect the answer.
4. Write the user problem, the success metric, and a 3-to-6-sentence user-facing announcement before naming a single table or endpoint.
5. Refuse to write the announcement paragraph as a formality: if it cannot be written, treat that as evidence the feature is wrong.
6. Produce one plain HTML mockup per screen, with no framework and no build step, and iterate until the user approves the shape.
7. Read the relevant existing code before writing any architecture document.
8. Record endpoints, data changes with query outlines, the end-to-end call order, and external dependencies by environment variable name, never by value.
9. Write out file placement, types, and method signatures with no implementation bodies, so a human can judge them in seconds.
10. Write the test plan (case names and what each asserts) before any test exists.
11. List the decisions you are least confident about as a numbered section, and invite the user to challenge them while changing them is free.
12. Plan slices in build order and get the slice plan approved before writing implementation code.
13. Make the first slice a tracer bullet: mocked endpoint, stubbed UI, wired end to end, and actually running.
14. Replace mocks with real happy-path logic in the second slice, then add one capability per slice after that.
15. End every slice in a working, testable state and prove it by running, curling, or browser-testing it in front of the user.
16. Ask after every slice whether to continue or re-steer, and fix direction before adding more code.
17. Never build horizontally: no whole-database-then-whole-API sequencing with nothing testable until the end.
18. Present at most 5 to 10 bullet decisions plus a file path at each gate instead of pasting the document into chat.
19. Ask for approval in one fixed sentence and treat only a clear yes as approval.
20. Create the status file before the first gate, and update it at every approval and every completed slice.
21. Read the whole plan folder at the start of any session that touches an in-flight feature, then resume at the first unapproved gate or unchecked slice.
22. Backtrack formally when a later gate invalidates an earlier one: update the earlier doc, reset its status, and get re-approval.
23. Compact everything decided into the docs at every gate and slice boundary, and compact immediately if the harness warns that context is low.
24. Never let a decision that matters exist only in chat.
25. Never ship a test that passes against the pre-change code, and never weaken or skip a test to get to green.
26. Record decisions that outlive the feature as ADRs, supersede rather than rewrite them, and keep out-of-repo facts in a dedicated external-context folder.
27. Encode a workflow you want followed as a skill file the agent reads, not as advice in a README a human reads once.
28. Put both the trigger and the anti-trigger in a skill's description field, so it activates on real features and stays silent on trivial edits.
29. Make the skill self-contained: it should carry its own templates, thresholds, and exact wording, so an agent holding only that file can run the workflow end to end.
30. Give each gate a copy-ready document template rather than a prose instruction, so the output shape is fixed and comparable across features.
31. Write the process instructions to the agent in the imperative, including the literal question to ask, instead of describing the process in the third person.
