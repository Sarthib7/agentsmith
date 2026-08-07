---
name: temprouter
description: >-
  Call tempRouter — a payable, end-to-end-encrypted LLM inference endpoint on MPP (Tempo).
  Pay per inference in pathUSD stablecoin AFTER your agent verifies (Intel DCAP) that the
  prompt runs inside a real Phala Intel TDX enclave that can't read it. Use when a prompt
  holds secrets/PII (API keys sk-…, private keys 0x…, seed phrases, JWTs, passwords,
  customer data) that must never reach a public model host. Verify-before-pay: a failed
  attestation pays nothing; the relay is blind (ciphertext only).
---

# tempRouter — payable confidential inference (entrypoint)

**Live endpoint:** `https://temprouter.onrender.com`
- `POST /v1/chat/completions/stream` — the payable inference endpoint (MPP 402 → pay → SSE)
- `GET /tee/attestation` — enclave attestation (verify before you pay)
- `GET /openapi.json` · `GET /llms.txt` — MPP service discovery

## Quick start

Three fastest ways to try tempRouter right now:

### 1. Verify-only (free, no payment)
```bash
temprouter verify
# or: curl https://temprouter.onrender.com/tee/attestation | jq
```
Fetches the live enclave attestation report and runs DCAP verification. Costs nothing —
just confirms the enclave is real. Good for kicking the tires.

### 2. Single inference (end-to-end)
```bash
temprouter infer "sanitize this key before rotation: sk-proj-abc123"
```
Runs the full lane: detect → verify → encrypt → pay → stream → decrypt. Requires a
funded Tempo testnet wallet (`account` env var or `--account` flag).

### 3. Detect sensitivity (client-side, no network)
```bash
temprouter detect "my password is hunter2 and my key is 0xdeadbeef"
# → { sensitive: true, matched: ["password", "private-key"] }
```
Pure local check — classifies whether a prompt needs the private lane. Zero network,
zero cost. Use as a pre-filter in your agent pipeline.

---

## What it is
A **payable inference endpoint on MPP**: your agent pays per response-chunk in **pathUSD**
on Tempo for an LLM answer that is **end-to-end encrypted** to a real **Phala Intel TDX
enclave**. Before any money moves, the agent runs **Intel DCAP** on the live enclave quote;
a failed check signs **zero vouchers**. tempRouter is a **blind relay** — it forwards only
ciphertext and never holds a key, so plaintext is seen only by your agent and the enclave.

## When to use
Route a prompt here when it contains anything that must never reach a third-party model host:
- API key (`sk-…`, `sk-proj-…`), provider token
- Private key (`0x…` 64-hex), seed phrase / mnemonic
- JWT, session token, password / credential
- AWS / cloud access key
- Customer or personal PII; confidential business data, private contracts, proprietary source

Not sensitive? Use a normal public/frontier model (cheaper, more capable). The private lane
runs an **OSS model (`gpt-oss:20b`)** in the enclave — it's the *confidential* lane, not a
frontier-model replacement. Decide with `detectSensitive(prompt).sensitive`.

## How to use
Pick a surface; all run the same dance (**verify → encrypt → pay per chunk → decrypt**):

### SDK
```ts
import { TempRouter, detectSensitive } from '@temprouter/sdk'

const client = new TempRouter({
  serverUrl: 'https://temprouter.onrender.com',
  account: process.env.AGENT_PRIVATE_KEY as `0x${string}`, // funded Tempo testnet wallet
})
if (detectSensitive(prompt).sensitive) {
  const { answer, units, paid } = await client.infer(prompt) // throws AttestationError on a failed gate
}
```

### CLI
```bash
temprouter infer "<prompt>" [--model <m>]   # verify → pay → decrypt
temprouter verify                            # pre-pay gate only (free, no payment)
temprouter detect "<text>"                   # is it sensitive?
```

### MCP (local stdio — encryption + wallet stay in your process)
- `private_inference({ prompt, model? })` → decrypted answer + attestation verdict + units paid
- `verify_enclave()` → pre-pay attestation report (free, never pays)
- `detect_sensitive(text)` → classify whether the text needs the private lane

## Rate & cost expectations

This is a **testnet** service. Payments settle in **pathUSD**, a Tempo testnet token — **free
test funds, no real money**. There is **no subscription, no API-key fee, no minimum**.

| Environment | Cost | Notes |
|---|---|---|
| **Tempo Moderato testnet** (chain `42431`) | **Free** — pathUSD test funds | `PRICE_PER_UNIT` default `0.0002` pathUSD per chunk; prod bills **one charge per inference** (`CHUNK_COUNT=1`). |
| **Mainnet** | **Not enabled yet** (future) | No mainnet deployment exists today. Real-currency pricing would be decided when/if mainnet ships — do not assume a number. |

- You pay per chunk via an MPP **session** (SSE stream), settled in ~2 on-chain transactions.
- The `units` field in the response tells you exactly how many chunks were charged.
- Get test pathUSD from the Tempo testnet faucet (https://explore.testnet.tempo.xyz).

## Common errors & troubleshooting

### `AttestationError: DCAP verification failed`
The enclave quote didn't pass Intel DCAP verification. This means either:
- The enclave is not genuine (unlikely on the hosted endpoint)
- The TCB (Trusted Computing Base) is outdated — the enclave needs a vendor update
- You're connecting to a spoofed endpoint

**Action:** Do not pay. The SDK refuses to sign vouchers automatically. If this persists,
check `temprouter verify` output for the specific failure (cert chain, TCB level, or
measurement mismatch).

### `InsufficientBalance`
Your Tempo testnet wallet doesn't have enough pathUSD to cover the first chunk voucher.

**Action:** Request test pathUSD from the Tempo testnet faucet (https://explore.testnet.tempo.xyz),
then retry.

### `EnclaveMismatch: measurement mismatch`
The enclave's measured `mrtd` doesn't match `EXPECTED_MEASUREMENT` in your config. This is
expected if the enclave was recently updated/redeployed.
- If you pinned `EXPECTED_MEASUREMENT`: update it to the new value from `temprouter verify`.
- If you didn't pin: remove the env var / config key to use soft-pin mode (the default).

### Session timeout (`payment channel timeout`)
The MPP session expired before the response completed. This can happen with very long
responses or network latency.

**Action:** Retry. The SDK creates a fresh session per call. No double-charge is possible —
unsettled sessions cost nothing.

### Key-binding failure (`key binding failed`)
The response was encrypted to a different key than the one your client derived from the
attestation. This indicates a potential MITM or enclave swap mid-session.

**Action:** Do not trust the response. Re-run `verify` and retry. Report if persistent.

## The guarantee
- The agent runs **Intel DCAP** on the enclave quote **before signing any voucher**.
- A failed gate signs **zero** vouchers — you never pay a host that can't prove it's blind.
- A swapped enclave **can't decrypt** the prompt (it's encrypted to the attested key), so
  plaintext is only ever seen by your agent + the genuine enclave.

## Honest scope
- The payment↔enclave binding ships as an unenforced **label** (`meta.enclaveKey`), not a
  settlement gate — the real guarantee is verify-before-pay + encryption-to-the-attested-key.
- Verification = DCAP cert-chain + key binding + enclave ed25519 signature. **Code-measurement
  pinning is opt-in** (`EXPECTED_MEASUREMENT`); default is soft-pin ("same enclave the service
  advertised"), not "trusted reproducible build."
- Currently **Tempo Moderato testnet** (chain `42431`), currency **pathUSD**; one charge per inference.

## Install this skill
```bash
npx skills add Router-Labs/tempRouter
```
Or read it live at `https://temprouter.onrender.com/SKILL.md`.
