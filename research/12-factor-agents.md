# 12-Factor Agents: principles for building reliable LLM applications

Source: https://github.com/humanlayer/12-factor-agents (author: Dex Horthy / HumanLayer)
Date fetched: 2026-08-12
Pages read: README.md, brief-history-of-software.md, factor-01 through factor-12, appendix-13-pre-fetch.md (14 content files, all HTTP 200)
Provenance: REPORTED. Distilled from the source repo; claims are the authors', not independently verified.

## TLDR

The repo argues that good agents are mostly ordinary software with LLM calls placed at a few well-chosen points, not a goal plus a bag of tools looping until done. The "loop until you solve it" pattern fails for one reason: as the context window grows the model gets lost and repeats the same broken approach, and a 90% success rate is not shippable for customer-facing features. The fix is to take back ownership of the four pieces a framework normally hides (the prompt, the context window, the control flow, and the state), keep each agent scoped to roughly 3 to 20 steps, and treat tool calls as plain structured JSON that your own switch statement interprets. Twelve factors (plus a thirteenth in the appendix) formalize this so the patterns can be dropped into an existing product incrementally instead of forcing a greenfield rewrite onto a framework.

## Background: how the author got here (brief-history-of-software.md)

Software is a directed graph. DAG orchestrators (Airflow, Prefect, Dagster, Inngest, Windmill) added observability, retries, and modularity to that graph. When ML got useful, people sprinkled model steps into those DAGs, and it was still deterministic software. The promise of agents was to throw the DAG away: give the LLM the edges and let it pick the nodes.

The author's stated verdict is that this does not work. Agents get lost when the context window gets long, and that single failure is enough to kneecap the approach. Most builders he spoke to pushed the tool-calling loop aside once they found that more than 10 to 20 turns becomes a mess the model cannot recover from. What works in the wild is micro agents: small agent-shaped pockets inside a broader deterministic DAG.

His worked example is a real deployment bot: a human merges a PR, deterministic code deploys to staging and runs e2e tests, then hands a small context ("deploy SHA 4af9ec0 to production") to an agent whose only real job is parsing human plaintext feedback and proposing the next action. Every actual deploy goes through a deterministic human-approval step. The LLM never holds a huge pile of tools.

His definition of an agent, reduced to parts: a prompt, a switch statement, accumulated context, and a for loop.

Common failure path he describes for teams: pick a framework to move fast, hit 70 to 80% quality, discover 80% is not good enough, discover that getting past 80% means reverse-engineering the framework's prompts and flow, start over.

## Factor 1: Natural Language to Tool Calls

Core rule: the atomic useful move is translating a natural-language phrase into a structured object that deterministic code executes.

Why: this single translation is where most of the value sits, and it is separable from the full agent loop. You can adopt it without adopting anything else. The model produces a payload; your code decides what to do with the payload.

Do:
- Turn a request such as "create a payment link for $750 to Terri" into a JSON object naming a function and its parameters.
- Have deterministic code pick up the payload and act on it.
- Fetch or supply the real ids (customers, products, prices) the payload needs, either by listing them in earlier steps or by placing them in the context window. The author notes these two are close to the same thing.

Don't:
- Assume you must complete the full loop (feed the result back, produce prose) to get value from step one.

Code shape: `nextStep = await llm.determineNextStep(prompt)` followed by a branch on `nextStep.function`, including an explicit else branch for when the model calls something you do not recognize.

## Factor 2: Own your prompts

Core rule: do not outsource prompt engineering to a framework; write prompts as first-class code.

Why: black-box `Agent(role=..., goal=..., tools=[...])` constructors ship excellent starter prompts but are hard to tune or reverse-engineer when you need exact tokens in the model. Prompts are the primary interface between your application logic and the LLM, so hiding them hides the main tuning surface. The author's repeated line: he does not know the best prompt, but you want the freedom to try everything.

Do:
- Keep the prompt in your repo, versioned, testable, with evals like any other code.
- Use a prompt tool if you like (his example is BAML) or hand-template it.
- Exploit nonstandard uses of user, assistant, and system roles when the API allows it.

Don't:
- Accept a framework abstraction that prevents you from seeing or editing the exact tokens sent.

Stated benefits: full control, testing and evals, fast iteration, transparency, and role hacking.

## Factor 3: Own your context window

Core rule: you do not have to use the standard role-and-message format; build whatever context representation gets the most out of the model per token.

Why: LLMs are stateless functions turning inputs into outputs, so output quality is bounded by input quality. At any point your input is "here is what has happened so far, what is the next step". Standard message arrays are fine for most cases, but token efficiency and attention efficiency are yours to optimize only if you control the format. This factor is the one the author points at when people ask about context engineering.

What counts as context: the prompt and instructions, retrieved documents (RAG), past state and tool calls and results, messages from related but separate histories (memory), and instructions about what structured output to emit.

Do:
- Consider packing the entire history into a single user message using your own markup. His example uses XML-like tags: `<slack_message>`, `<list_git_tags>`, `<list_git_tags_result>`, `<error>`, `<human_response>`.
- Model the history as a typed event list and render it: `Thread` holds `List[Event]`, each `Event` has a `type` and `data`, `event_to_prompt` wraps the YAML-ified data in tags, `thread_to_prompt` joins them.
- Filter sensitive data out of what reaches the model.
- Consider hiding errors and failed calls from the context once they are resolved.
- Roll the "what is the next step" question into the template even though tool schemas often imply it.

Don't:
- Treat the message array as the only option, or assume what you store must equal what you send.

Stated benefits: information density, error handling that helps recovery, safety, format flexibility, and token efficiency. Out of scope for this guide: temperature and other sampling parameters, training your own models, fine-tuning.

## Factor 4: Tools are just structured outputs

Core rule: a tool is nothing more than model-emitted JSON that triggers deterministic code, so stop treating tools as special machinery.

Why: asking a model to "use one of several tools" is asking it to emit JSON you can parse into one of several typed objects. That framing gives a clean split: the LLM decides what to do, your code decides how it is done. A tool call does not obligate you to run one fixed function the same way every time.

Do:
- Define tools as plain classes or schemas with an `intent` discriminator, for example `CreateIssue` with `intent: "create_issue"` and `SearchIssues` with `intent: "search_issues"`.
- Route on intent with a switch statement, capture results, feed them back into context.
- Include a field like `what_youre_looking_for` next to a raw `query` when it helps the model express itself.

Don't:
- Assume the next step must be a pure function call returning a value. Combine this factor with factor 8 to make some intents break the loop instead.

The author explicitly declines to rank plain prompting versus tool calling versus JSON mode, and links out to Schema Aligned Parsing and related write-ups instead.

## Factor 5: Unify execution state and business state

Core rule: keep one thread of events as the single state object instead of maintaining separate execution and business state.

Why: execution state (current step, next step, waiting status, retry counts) is usually just metadata about what already happened, and what already happened is exactly the business state (messages, tool calls, results). Splitting them adds abstraction that may be worth it in general infrastructure but is often overkill here. If you engineer for it, all execution state is inferable from the context window.

Do:
- Store one serializable thread and derive status from it.
- Add new state by adding new event types.
- Minimize the things that genuinely cannot live in the context window (session ids, password contexts).

Don't:
- Build a separate step tracker, retry-count store, and status machine by default.

Stated benefits: one source of truth, trivial serialization, whole history visible for debugging, easy extension, resume from any point, fork a thread by copying a subset into a new state id, and easy rendering to markdown or a web UI.

## Factor 6: Launch, Pause, Resume with simple APIs

Core rule: agents are programs, so give them the plain lifecycle APIs you expect from programs (launch, query, resume, stop).

Why: users, apps, pipelines, and other agents all need to start an agent without ceremony. Long-running operations require pausing, and external triggers such as webhooks should resume the run without deep integration into your orchestrator. This is closely related to factors 5 and 8 but can be implemented on its own.

Do:
- Expose a simple launch API and a resume path keyed by thread id.
- Let webhooks resume a paused run from where it stopped.

Don't:
- Accept an orchestrator that can pause and resume, but not between tool selection and tool execution. The author calls this gap out specifically as the thing most tooling gets wrong.

## Factor 7: Contact humans with tool calls

Core rule: make "ask a human" an explicit structured intent rather than relying on the model to emit prose.

Why: LLM APIs force a high-stakes first-token choice between plaintext and structured data. Having the model always emit JSON and declare intent through names such as `request_human_input` or `done_for_now` removes that coin flip. The author is careful to say you might see no gain from this, and that the point is having the freedom to test it.

Do:
- Define a `RequestHumanInput` type carrying `question`, `context`, and `options` (urgency low/medium/high, format free_text/yes_no/multiple_choice, plus choices).
- On that intent: append the event, save state, notify the human, and return out of the loop.
- Resume from a webhook that loads the thread by id, pushes a `response_from_human` event, and continues.
- Do not block the web worker while resuming.

Don't:
- Assume the conversation always starts Human to Agent. Cron jobs, events, and outages can start an Agent to Human flow.

Stated benefits: clearer instructions per contact type, support for outer-loop workflows, coordination across multiple humans, a natural extension to Agent to Agent requests, and durability when combined with factor 6.

## Factor 8: Own your control flow

Core rule: write your own loop and switch so that specific intents can break, pause, retry, or continue on your terms.

Why: owning the control flow is what lets you interrupt between the moment of tool selection and the moment of tool invocation. Without that granularity you are stuck choosing between blocking in memory (and restarting from scratch if the process dies), restricting the agent to low-stakes work, or letting it run and hoping.

Do:
- Branch per intent: `request_clarification` saves the thread, messages the human, and breaks; `fetch_open_issues` runs the call, appends the result, and continues; `create_issue` requests approval, saves, and breaks.
- Build in the extras you need: summarization or caching of tool results, LLM-as-judge on structured output, context compaction and memory management, logging and tracing and metrics, client-side rate limiting, durable sleep and wait-for-event.

Don't:
- Rely on a framework loop you cannot interrupt at the point that matters.

## Factor 9: Compact errors into the context window

Core rule: feed formatted errors back into the thread so the model can self-heal, but cap the retries.

Why: good models can read an error or stack trace and fix the next tool call. That gives short tasks a real self-healing property and keeps the agent running when one call fails. Overdone, the same model spins out and repeats the identical error.

Do:
- Catch the exception, append an `error` event with a formatted message, and loop.
- Track `consecutive_errors`, reset it on success, and stop at roughly 3 attempts for a single tool.
- On hitting the threshold, escalate to a human, either by model decision or by deterministic takeover of control flow.
- Restructure how the error is represented rather than pasting the raw trace, and remove earlier events when that helps.

Don't:
- Retry without a counter, and do not assume the raw error text is the best thing to show the model.

The author names the primary defense against error spin-outs: keep agents small (factor 10).

## Factor 10: Small, focused agents

Core rule: build small agents that do one thing over a 3 to 10, maybe 20 step horizon, as components inside a mostly deterministic system.

Why: the bigger the task, the more steps, the longer the context, and as context grows LLMs get lost and lose focus. Keeping scope small keeps context manageable and performance high. Everything else (testing, debugging, clear responsibility) follows from that.

Do:
- Give each agent a well-defined domain and a step budget.
- Grow the scope deliberately, only in ways that hold quality, as models improve.
- Aim for the edge of model capability, quoting the NotebookLM team: the most magical AI moments come from working right at the boundary of what the model can do.

Don't:
- Build a monolithic agent that tries to do everything, and do not assume smarter models make this unnecessary. The author's answer to "what if LLMs get smarter" is yes, you still need this: better models mean the same approach covers more of a larger DAG, and small scope is what gets you results today.

## Factor 11: Trigger from anywhere, meet users where they are

Core rule: let agents be triggered from Slack, email, SMS, cron, or events, and let them answer through the same channels.

Why: agents that live where users already are feel like digital coworkers rather than another tab. Non-human triggers (crons, outages, webhooks) enable outer-loop agents that work for 5, 20, or 90 minutes and then contact a human at the critical moment. Fast access to a variety of humans is also what makes higher-stakes tools defensible, since approvals and clear standards give you auditability.

Do:
- Build entry points per channel and reply through the originating channel.
- Use the human contact path (factor 7) plus pause and resume (factor 6) as the foundation; the author states those two are the prerequisites for this one.

Don't:
- Assume the chat window is the only interface.

## Factor 12: Make your agent a stateless reducer

Core rule: treat the agent as a pure fold over the event history: new state equals reduce(previous events, new event).

Why: this is the functional restatement of factors 3, 5, and 8 combined. If the whole thread is the state and the agent is a stateless function from thread to next step, then serialization, resumption, forking, and testing all fall out for free.

Caveat on provenance: the factor-12 page is 12 lines long and contains only the title, two images (`1c0-stateless-reducer.png` and `1c5-agent-foldl.png`, the latter implying a foldl over events), the author's aside that "this one is mostly just for fun", and navigation links. The "why" paragraph above is INFERRED from the title, the images' filenames, and the loop code shown elsewhere in the repo, not quoted from the page.

## Factor 13 (appendix): Pre-fetch all the context you might need

Core rule: if you already know the model will probably call a tool, call it yourself and put the result in the context instead of spending a round trip asking.

Why: a prompt that says "you will likely want to fetch the list of git tags" plus a `list_git_tags` intent costs an extra model call, an extra parse, and an extra chance to go off course. Fetching deterministically removes the intent from the schema entirely and lets the model do the part that actually needs judgment: using the output.

Do:
- Fetch the likely data before the first `determine_next_step` call and pass it in, either as a template variable or as a synthetic pair of events (`list_git_tags` request plus `list_git_tags_result`) appended to the thread.
- Delete the now-unneeded intent from the prompt's list of allowed outputs and its case from the switch statement.

Don't:
- Keep a tool in the schema purely because the data is needed, when you could have fetched it unconditionally.

The author's summary line: if you already know what tools you want the model to call, call them deterministically and let the model do the hard part of figuring out how to use their outputs.

## Rules to adopt

1. Start by extracting one natural-language-to-structured-JSON step; do not adopt a whole framework to get value.
2. Keep prompts in your own repo as versioned, testable code, and never accept an abstraction that hides the exact tokens sent to the model.
3. Write evals for prompts the same way you write tests for functions.
4. Build your own context format instead of defaulting to the standard message array, and measure it on tokens as well as quality.
5. Model history as a typed event list and render it to a prompt with an explicit function you control.
6. Decide separately what you store and what you send; they do not have to match.
7. Strip secrets and sensitive fields at the render step, not at the storage step.
8. Drop resolved errors and dead-end branches out of the rendered context once they no longer inform the next step.
9. Define tools as typed objects with an `intent` discriminator and route them through your own switch statement.
10. Do not assume a tool call means running one fixed function; some intents should pause, escalate, or fork instead.
11. Keep one unified thread as the single state object and infer execution status from it rather than tracking it separately.
12. Make the thread trivially serializable so you can resume, fork, and render it to a human-readable view.
13. Expose simple launch, query, resume, and stop APIs so any caller (user, cron, webhook, another agent) can drive the agent.
14. Require the ability to interrupt between tool selection and tool invocation, and reject tooling that cannot do it.
15. Make "ask a human" an explicit structured intent carrying question, context, urgency, and answer format.
16. Resume from webhooks keyed by thread id, and never block the request worker while the agent continues.
17. Append formatted errors to the context so the model can self-heal on the next turn.
18. Cap consecutive errors per tool at around 3, reset the counter on success, then escalate to a human or reset the context.
19. Rewrite an error into a useful representation rather than pasting a raw stack trace back into the context.
20. Scope every agent to 3 to 20 steps in one domain, and split anything larger into separate agents inside a deterministic pipeline.
21. Grow an agent's scope only when quality holds at the new size, and treat the edge of model capability as the target, not the ceiling.
22. Keep the surrounding system deterministic and place LLM calls only where judgment is genuinely needed.
23. Let agents be triggered from Slack, email, SMS, crons, and events, and have them respond on the same channel.
24. Pre-fetch data the model will almost certainly need, then delete the corresponding tool from the schema and the switch.
25. Treat the agent as a stateless reducer over events so resumption, forking, and replay come for free.
