# Deployment Checklist

Pre-flight checks before deploying to Solana mainnet.

## Security (must pass ALL)

- [ ] No private keys or seed phrases in source code
- [ ] `.env` is in `.gitignore`
- [ ] All signer checks verified (run security-basics checklist)
- [ ] Program tested on devnet with realistic scenarios
- [ ] No `console.log` of sensitive data in production builds
- [ ] Dependencies audited — no known vulnerabilities in `pnpm audit`

## Infrastructure

- [ ] Mainnet RPC endpoint configured (Helius, QuickNode, or Triton)
- [ ] RPC rate limits understood and sufficient for expected traffic
- [ ] Fallback RPC configured (different provider)
- [ ] WebSocket endpoint configured (if using subscriptions)
- [ ] API keys are production keys, not trial/devnet keys

## Program Deployment (if applicable)

- [ ] Program builds deterministically (`anchor build` produces same hash)
- [ ] Program authority wallet is secure (hardware wallet or multisig recommended)
- [ ] Upgrade authority plan decided (keep upgradeable vs. freeze)
- [ ] Sufficient SOL in deployer wallet for deployment + rent
- [ ] Program ID recorded and documented

## Frontend (if applicable)

- [ ] Wallet adapter configured for mainnet
- [ ] Network selector defaults to mainnet (or is removed)
- [ ] Error messages don't leak internal details
- [ ] Loading states for all async operations
- [ ] Mobile responsive

## Monitoring

- [ ] Transaction monitoring set up (Helius webhooks or custom)
- [ ] Error alerting configured (Sentry, PagerDuty, or Discord webhook)
- [ ] Program logs accessible
- [ ] SOL balance monitoring on critical wallets

## Go-Live

- [ ] Domain/hosting configured (Vercel, Railway, etc.)
- [ ] SSL certificate active
- [ ] CORS configured correctly
- [ ] README updated with production URLs
- [ ] Team has rollback plan documented
