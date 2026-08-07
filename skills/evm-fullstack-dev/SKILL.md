---
name: evm-fullstack-dev
description: Expert EVM full-stack development for Solidity contracts, Foundry tests, audits, gas optimization, L2 deployments, account abstraction, EIP-7702/4337 flows, viem/wagmi frontends, transaction UX, and production dApps. Use when building, reviewing, debugging, testing, deploying, or securing smart contracts and EVM-compatible applications.
---

# EVM Full-Stack Developer

Use this skill for secure, modern EVM application development from contract design to frontend transaction UX.

## First moves

1. Inspect the repo: compiler version, Foundry/Hardhat setup, OpenZeppelin/Solady versions, chain targets, deployment scripts, frontend stack, and tests.
2. Prefer the project's pinned versions. When exact APIs matter, verify against current package docs and lockfiles.
3. Identify the trust model before coding: who can move funds, upgrade contracts, pause systems, sign messages, bridge assets, or resolve disputes?
4. Security beats gas. Optimize only after correctness and test coverage are clear.

## Contract design defaults

- Prefer non-upgradeable contracts unless upgradeability is required and governance/operations can handle it safely.
- If upgradeable, define proxy pattern, admin ownership, storage layout tests, initialization protections, and upgrade runbooks.
- Use explicit roles and ownership transfer flows; avoid hidden super-admin powers.
- Use custom errors, NatSpec for public/external APIs, events for important state transitions, and typed structs/enums for clarity.
- Pin compiler version in production. Use a modern Solidity 0.8.x compiler compatible with dependencies and target chains.
- Model invariants early: conservation of funds, access boundaries, accounting sums, oracle assumptions, and withdrawal guarantees.

## Security checklist

Check every contract for:

- Reentrancy on external calls and callback hooks.
- Checks-Effects-Interactions or a justified alternative.
- Object-level authorization, not just function-level modifiers.
- Signature replay protection: EIP-712 domain, chain ID, nonce, deadline, signer intent, and contract address binding.
- Oracle freshness, decimals, manipulation resistance, and fallback behavior.
- Slippage/deadline controls for swaps and liquidity operations.
- Fee-on-transfer/rebasing/token callback quirks if arbitrary ERC20s are accepted.
- Rounding direction and precision loss in accounting.
- DoS via unbounded loops, griefing, storage bloat, or revert-heavy recipients.
- MEV/sandwich exposure in user-facing flows.
- Upgrade/admin key risk and timelock/multisig requirements.
- Cross-chain and L2 message authentication; never assume `msg.sender` is the original L1 user.

## Testing workflow

Use Foundry-first unless the project is already standardized elsewhere:

```bash
forge build
forge test
forge test -vvvv
forge test --gas-report
forge coverage
```

Add tests in layers:

1. Unit tests for each branch and failure mode.
2. Fuzz tests for input ranges and accounting.
3. Invariant tests for core protocol guarantees.
4. Fork tests for integrations with real deployed contracts.
5. Differential tests when matching a reference implementation.
6. Deployment/script tests for initialization and verification.

Security tooling to consider: Slither, Aderyn, Echidna/Medusa, Halmos, Foundry invariants, and manual review. Treat tool output as leads, not final truth.

## L2 and chain-specific guidance

- EIP-4844 changed L2 fee economics; calldata, blobs, and proof systems affect cost differently by chain.
- Base/OP Stack, Arbitrum, zkSync, Scroll, Linea, Polygon zkEVM, and appchains can differ in gas accounting, precompiles, bridging, CREATE2 behavior, finality, and verification tooling.
- For zkSync or non-standard EVM environments, verify compiler, opcode, account abstraction, and deployment differences before assuming mainnet Ethereum behavior.
- Cross-chain systems need explicit trust assumptions for bridges, relayers, message ordering, replay protection, and failure recovery.

## Account abstraction and wallet UX

- Distinguish ERC-4337 smart accounts, EIP-7702 EOA delegation, multisigs, session keys, passkeys, and embedded wallets.
- Simulate user operations/transactions before submission where possible.
- Display chain, asset, spender, allowance, deadline, and expected outcome clearly.
- Handle pending, replaced, reverted, dropped, and wrong-chain states.
- Avoid unlimited approvals unless the UX explains risk and offers safer defaults.

## Frontend integration

- Prefer viem + wagmi for type-safe EVM frontends; use generated ABIs/types where possible.
- Separate read state, write intent, simulation, submission, confirmation, and indexing/reconciliation.
- Use multicall/batching for reads, but handle partial failure.
- Format BigInt/token units carefully; never use floating point for token math.
- Implement SIWE/session security correctly if wallet auth is used.
- For complex apps, index events with a dedicated indexer rather than overloading RPC reads.

## Deployment checklist

- Environment variables and RPC keys are documented but not committed.
- Deployment scripts are deterministic and idempotent where possible.
- Constructor/initializer args are reviewed and recorded.
- Contracts are verified on target explorers.
- Owner/admin roles are transferred to the intended multisig/timelock.
- Emergency pause/upgrade/withdraw procedures are documented and tested.
- Monitoring exists for critical events, large withdrawals, oracle issues, and failed jobs.

## Output style

For implementation, provide patches plus tests. For audits/reviews, rank findings by severity and include exploit scenario, affected code, recommended fix, and verification test.
