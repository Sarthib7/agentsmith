# RPC Provider Guide

Choosing and configuring a Solana RPC provider for production.

## Provider Comparison

| Provider | Best For | Pricing | Extras |
|----------|---------|---------|--------|
| Helius | Full-stack (RPC + DAS + webhooks) | Free tier + paid | DAS API, webhooks, enhanced APIs |
| QuickNode | High-throughput apps | Per-request pricing | Marketplace add-ons |
| Triton | Dedicated infrastructure | Fixed pricing | Dedicated nodes |
| Chainstack | Enterprise | Per-request | Global regions |

## Recommended Setup

### Primary: Helius
```
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
HELIUS_API_KEY=YOUR_KEY
```

### Fallback: QuickNode or public RPC
```
FALLBACK_RPC_URL=https://your-quicknode-endpoint.com
```

### In Code
```typescript
const connection = new Connection(
  process.env.HELIUS_RPC_URL || process.env.FALLBACK_RPC_URL,
  { commitment: "confirmed" }
);
```

## Configuration Tips

- **Commitment level**: Use `confirmed` for most reads, `finalized` for critical operations
- **Preflight checks**: Enable for mainnet (`skipPreflight: false`)
- **Retry logic**: Implement exponential backoff for 429 (rate limit) responses
- **Connection pooling**: Reuse Connection objects, don't create per-request
- **WebSockets**: Use separate WS endpoint for subscriptions, HTTP for RPC calls

## Rate Limits

- Free tiers: ~10-50 requests/second
- Paid tiers: 100-1000+ requests/second
- Burst handling: Queue requests, don't fire-and-forget
- Monitor usage: Most providers have dashboards

## Cost Estimation

For a typical dApp with 1,000 daily active users:
- ~50,000 RPC calls/day
- Most free tiers can handle this
- Scale to paid when you hit rate limits consistently
