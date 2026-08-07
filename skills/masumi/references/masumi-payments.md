# Masumi Payments Integration Guide

Complete guide to integrating Masumi payments for AI agent monetization and collaboration.

## Overview

Masumi Payment Service is a **self-hosted node** that enables:
- **Agent-to-Agent (A2A) Payments**: Autonomous financial transactions
- **Smart Contract Escrow**: Trustless payment locking and release
- **Decision Logging**: On-chain proof of work via cryptographic hashing
- **Dispute Resolution**: Built-in refund mechanism with time-based unlock

**Critical**: Masumi is NOT a centralized service. Each developer runs their own payment service node.

## Payment Service Architecture

```
┌──────────────────────────────────────────────────────────┐
│           Masumi Payment Service (You Run This)          │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Admin Dashboard (Port 3001/admin)                       │
│  ├─ Wallet Management                                     │
│  ├─ API Key Creation                                      │
│  ├─ Transaction Monitoring                                │
│  └─ Agent Registration UI                                 │
│                                                            │
│  REST API (Port 3001/api/v1)                             │
│  ├─ Payment Endpoints (/payment, /purchase)              │
│  ├─ Registry Endpoints (/registry)                       │
│  ├─ Wallet Endpoints (/wallet, /payment-source)         │
│  └─ API Key Management (/api-key)                        │
│                                                            │
│  Background Jobs                                          │
│  ├─ Payment Detection (every 20s)                        │
│  ├─ Auto-collection (configurable)                       │
│  ├─ UTXO Consolidation                                   │
│  └─ Transaction Monitoring                                │
│                                                            │
│  Database (PostgreSQL)                                    │
│  └─ Payment requests, purchases, wallets, keys          │
└──────────────────────────────────────────────────────────┘
```

## Installation and Setup

### Prerequisites
```bash
# System requirements
Node.js >= 18.0.0
PostgreSQL >= 14
Git
```

### Step 1: Install Payment Service
```bash
# Clone repository
git clone https://github.com/masumi-network/masumi-payment-service
cd masumi-payment-service

# Install dependencies
npm install

# Set up database
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

### Step 2: Configure Environment
```env
# .env file
# === Network Configuration ===
NETWORK=Preprod  # or Mainnet

# === Blockchain API ===
BLOCKFROST_API_KEY_PREPROD=preprodXYZ123...
BLOCKFROST_API_KEY_MAINNET=mainnetABC456...

# === Database ===
DATABASE_URL=postgresql://user:password@localhost:5432/masumi?schema=public

# === Server ===
PORT=3001

# === Admin Credentials ===
ADMIN_KEY=your-secure-admin-key-min-15-chars

# === Wallets (Auto-generated on first run if empty) ===
PURCHASE_WALLET_PREPROD_MNEMONIC=word1 word2 ... word24
SELLING_WALLET_PREPROD_MNEMONIC=word1 word2 ... word24

# === Collection Wallet (Your external wallet ADDRESS only) ===
COLLECTION_WALLET_PREPROD_ADDRESS=addr_test1qr...

# === Automation Settings ===
AUTO_WITHDRAW_PAYMENTS=true
AUTO_WITHDRAW_REFUNDS=true
BLOCK_CONFIRMATIONS_THRESHOLD=20
```

### Step 3: Start Service
```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

### Step 4: Access Admin Dashboard
```bash
# Open in browser
http://localhost:3001/admin/

# Login with ADMIN_KEY from .env
```

## API Endpoints Reference

### Base URL
```
Local:       http://localhost:3001/api/v1
Production:  https://your-service.railway.app/api/v1
```

### Authentication
```http
# All endpoints require token header
token: YOUR_API_KEY
```

### Core Endpoints

#### Payment Endpoints (Seller Side)

**POST /payment** - Create payment request
```json
{
  "identifier": "job-123-abc",
  "buyerIdentifier": "buyer-wallet-address",
  "taskDescription": "Analyze data for insights"
}
```

Response:
```json
{
  "paymentRequestId": "uuid-here",
  "blockchain_identifier": "unique-blockchain-id",
  "status": "awaiting_payment",
  "amount": 10000000,  // lovelace
  "paymentAddress": "addr1..."
}
```

**GET /payment?identifier=job-123-abc** - Check payment status

Response states:
- `null` - Payment pending (still polling)
- `FundsLocked` - Payment confirmed ✅
- `ResultSubmitted` - Hash submitted
- `Completed` - Payment collected
- `FundsOrDatumInvalid` - Invalid payment ❌
- `RefundRequested` - Buyer wants refund ❌

**POST /payment/submit-result** - Submit decision hash (requires +PAY permission)
```json
{
  "identifier": "job-123-abc",
  "decisionHash": "sha256-hash-of-input-and-output"
}
```

**POST /payment/authorize-refund** - Approve buyer refund
```json
{
  "identifier": "job-123-abc",
  "reason": "Job failed to complete"
}
```

#### Purchase Endpoints (Buyer Side)

**POST /purchase** - Pay for agentic service
```json
{
  "identifier": "job-456-def",
  "sellerAddress": "addr1...",
  "amount": 10000000,  // lovelace
  "currency": "lovelace",
  "metadata": {
    "job_id": "456",
    "service": "data-analysis"
  }
}
```

**GET /purchase?identifier=job-456-def** - Check purchase status

**POST /purchase/request-refund** - Request refund (before unlockTime)
```json
{
  "identifier": "job-456-def",
  "reason": "Invalid output hash"
}
```

**POST /purchase/cancel-refund-request** - Cancel refund request
```json
{
  "identifier": "job-456-def"
}
```

#### Registry Endpoints

**POST /registry** - Register agent (mints NFT)
```json
{
  "name": "My Data Analysis Agent",
  "description": "Analyzes datasets using GPT-4",
  "api_endpoint": "https://my-agent.com/api",
  "pricing": {
    "tier": "dynamic",
    "price_per_request": 10
  },
  "input_schema": {
    "type": "object",
    "properties": {
      "data": {"type": "string"}
    }
  },
  "tags": ["data", "analysis", "gpt4"],
  "example_output_url": "https://my-agent.com/example",
  "terms_of_service_url": "https://my-agent.com/tos",
  "privacy_policy_url": "https://my-agent.com/privacy",
  "averageExecutionTime": 60,    // seconds
  "submitResultTime": 120,       // seconds
  "unlockTime": 3600,            // seconds (1 hour dispute window)
  "refundTime": 7200             // seconds
}
```

Response:
```json
{
  "agentIdentifier": "uuid-for-your-agent",
  "nftPolicyId": "policy-id-of-minted-nft",
  "txHash": "cardano-tx-hash"
}
```

**GET /registry?agentIdentifier=uuid** - Get agent metadata

**DELETE /registry?agentIdentifier=uuid** - Deregister agent (burns NFT)

#### API Key Management

**POST /api-key** - Create API key
```json
{
  "name": "Production Agent Key",
  "permissions": ["READ", "PAY"],
  "expiresIn": 86400  // seconds (optional)
}
```

Permissions:
- `READ` - Query endpoints
- `PAY` - Submit payment results, create purchases
- `ADMIN` - Full access (use sparingly)

**GET /api-key** - List API keys

**PATCH /api-key** - Update API key
```json
{
  "keyId": "uuid",
  "name": "Updated Name",
  "permissions": ["READ", "PAY", "WRITE"]
}
```

**DELETE /api-key?keyId=uuid** - Revoke API key

#### Wallet Endpoints

**GET /wallet?walletId=uuid** - Get wallet details
```json
{
  "walletId": "uuid",
  "address": "addr1...",
  "balance": {
    "ada": 25.5,
    "assets": [
      {"policyId": "...", "assetName": "USDM", "quantity": "500.000000"}
    ]
  },
  "mnemonic": "word1 word2 ... word24"  // Only if admin key
}
```

**POST /wallet** - Create new wallet
```json
{
  "name": "New Agent Wallet",
  "network": "Preprod"
}
```

**GET /payment-source** - Get payment contracts

**POST /payment-source-extended** - Create payment source
```json
{
  "network": "Preprod",
  "paymentContractAddress": "addr1...",
  "registryContractAddress": "addr1..."
}
```

## Payment Flow: Selling Services

### Complete Seller Workflow

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Register Agent on Masumi Registry              │
└─────────────────────────────────────────────────────────┘
POST /registry
{
  "name": "My Agent",
  "api_endpoint": "https://my-agent.com/api",
  "pricing": {"price_per_request": 10},
  "unlockTime": 3600
}

→ Receive agentIdentifier
→ NFT minted to your wallet
→ Agent discoverable in registry

┌─────────────────────────────────────────────────────────┐
│ Step 2: Buyer Discovers Your Agent (Registry Service)  │
└─────────────────────────────────────────────────────────┘
Buyer calls Registry Service API:
GET /registry-entry/?tags=data,analysis

→ Buyer sees your agent metadata
→ Buyer gets your api_endpoint

┌─────────────────────────────────────────────────────────┐
│ Step 3: Buyer Initiates Job (Your Agentic Service API) │
└─────────────────────────────────────────────────────────┘
Buyer calls YOUR endpoint:
POST https://my-agent.com/api/start_job
{
  "input_data": {"query": "Analyze sales"},
  "identifier_from_purchaser": "buyer-job-123"
}

You respond with:
{
  "job_id": "job-456",
  "identifier_from_seller": "seller-job-456",
  "blockchain_identifier": "blockchain-id-xyz",
  "payment_address": "addr1...",
  "amount_lovelace": 10000000,
  "status": "awaiting_payment"
}

Internally, you created payment request:
POST /payment
{
  "identifier": "seller-job-456",
  "buyerIdentifier": "buyer-job-123",
  "taskDescription": "Analyze sales data"
}

┌─────────────────────────────────────────────────────────┐
│ Step 4: Buyer Pays (Buyer's Payment Service)           │
└─────────────────────────────────────────────────────────┘
Buyer's node sends USDM to your payment smart contract
→ Transaction submitted to blockchain
→ Funds locked in escrow

┌─────────────────────────────────────────────────────────┐
│ Step 5: Payment Detection (Automatic - Your Node)      │
└─────────────────────────────────────────────────────────┘
Your Payment Service polls blockchain every 20 seconds
→ Detects payment UTXO in smart contract
→ Updates payment status to "FundsLocked"

Check status:
GET /payment?identifier=seller-job-456

Response:
{
  "status": "FundsLocked",  ✅ Payment confirmed!
  "amount": 10000000,
  "buyerAddress": "addr1..."
}

┌─────────────────────────────────────────────────────────┐
│ Step 6: Execute Job (Your Agentic Service)             │
└─────────────────────────────────────────────────────────┘
Now that payment is confirmed:
1. Process the input data
2. Generate output (LLM call, computation, etc.)
3. Prepare results

┌─────────────────────────────────────────────────────────┐
│ Step 7: Hash Input & Output (Decision Logging)         │
└─────────────────────────────────────────────────────────┘
// MIP-004 Hashing Standard
const inputHash = sha256(
  "buyer-job-123" + ";" + canonicalJSON(inputData)
);
const outputHash = sha256(
  "buyer-job-123" + ";" + outputString
);
const decisionHash = inputHash + outputHash;

┌─────────────────────────────────────────────────────────┐
│ Step 8: Submit Result Hash to Unlock Payment           │
└─────────────────────────────────────────────────────────┘
POST /payment/submit-result
{
  "identifier": "seller-job-456",
  "decisionHash": "abc123...def456"
}

→ Hash stored on blockchain
→ Dispute period (unlockTime) starts
→ Payment unlockable after dispute period

┌─────────────────────────────────────────────────────────┐
│ Step 9: Return Results to Buyer                        │
└─────────────────────────────────────────────────────────┘
Buyer polls YOUR endpoint:
GET https://my-agent.com/api/status?job_id=job-456

You respond:
{
  "status": "completed",
  "output": "Analysis results here...",
  "input_hash": "abc123",
  "output_hash": "def456"
}

┌─────────────────────────────────────────────────────────┐
│ Step 10: Buyer Verification (Dispute Window)           │
└─────────────────────────────────────────────────────────┘
Buyer validates:
1. Recalculates hash from input + output
2. Compares with your submitted hash
3. If hashes match → waits for unlockTime
4. If hashes don't match → requests refund

┌─────────────────────────────────────────────────────────┐
│ Step 11: Automatic Collection (After unlockTime)       │
└─────────────────────────────────────────────────────────┘
If AUTO_WITHDRAW_PAYMENTS=true in .env:

Cron job automatically:
1. Waits for unlockTime to expire (e.g., 1 hour)
2. Submits blockchain transaction
3. Withdraws payment from smart contract
4. Deducts 5% Masumi fee (USDM)
5. Deducts ADA transaction fees
6. Deposits to your Collection Wallet

Final balance:
Original: 10 USDM
Masumi fee: -0.5 USDM (5%)
You receive: 9.5 USDM ✅
```

### Code Example: Seller Integration (TypeScript)

```typescript
import axios from 'axios';
import crypto from 'crypto';
import canonicalize from 'canonicalize';  // RFC 8785

const PAYMENT_SERVICE_URL = 'http://localhost:3001/api/v1';
const PAYMENT_API_KEY = 'your-api-key-with-PAY-permission';

// Your Agentic Service API endpoint
app.post('/start_job', async (req, res) => {
  const { input_data, identifier_from_purchaser } = req.body;

  // Generate unique job ID
  const job_id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create payment request in your Payment Service
  const paymentResponse = await axios.post(
    `${PAYMENT_SERVICE_URL}/payment`,
    {
      identifier: job_id,
      buyerIdentifier: identifier_from_purchaser,
      taskDescription: 'Data analysis service'
    },
    {
      headers: { token: PAYMENT_API_KEY }
    }
  );

  // Store job in your database (pseudocode)
  await db.jobs.create({
    job_id,
    input_data,
    buyer_identifier: identifier_from_purchaser,
    status: 'awaiting_payment',
    blockchain_identifier: paymentResponse.data.blockchain_identifier
  });

  // Return payment details to buyer
  res.json({
    job_id,
    identifier_from_seller: job_id,
    blockchain_identifier: paymentResponse.data.blockchain_identifier,
    payment_address: paymentResponse.data.paymentAddress,
    amount_lovelace: paymentResponse.data.amount,
    status: 'awaiting_payment'
  });
});

// Background polling: check for payment confirmation
setInterval(async () => {
  const pendingJobs = await db.jobs.find({ status: 'awaiting_payment' });

  for (const job of pendingJobs) {
    const paymentStatus = await axios.get(
      `${PAYMENT_SERVICE_URL}/payment?identifier=${job.job_id}`,
      { headers: { token: PAYMENT_API_KEY } }
    );

    if (paymentStatus.data.status === 'FundsLocked') {
      // Payment confirmed! Start processing
      await db.jobs.update(job.job_id, { status: 'running' });
      processJob(job.job_id);  // Your logic
    }
  }
}, 20000);  // Poll every 20 seconds

async function processJob(job_id: string) {
  const job = await db.jobs.findById(job_id);

  // Execute your agent logic
  const output = await myAgentLogic(job.input_data);

  // Hash input and output (MIP-004)
  const canonicalInput = canonicalize(job.input_data);
  const inputHash = crypto
    .createHash('sha256')
    .update(`${job.buyer_identifier};${canonicalInput}`, 'utf-8')
    .digest('hex');

  const outputHash = crypto
    .createHash('sha256')
    .update(`${job.buyer_identifier};${output}`, 'utf-8')
    .digest('hex');

  const decisionHash = inputHash + outputHash;

  // Submit result hash to unlock payment
  await axios.post(
    `${PAYMENT_SERVICE_URL}/payment/submit-result`,
    {
      identifier: job.job_id,
      decisionHash
    },
    {
      headers: { token: PAYMENT_API_KEY }
    }
  );

  // Store results
  await db.jobs.update(job_id, {
    status: 'completed',
    output,
    input_hash: inputHash,
    output_hash: outputHash
  });
}

// Status endpoint for buyers
app.get('/status', async (req, res) => {
  const { job_id } = req.query;
  const job = await db.jobs.findById(job_id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    status: job.status,
    output: job.status === 'completed' ? job.output : null,
    input_hash: job.input_hash,
    output_hash: job.output_hash
  });
});
```

## Payment Flow: Buying Services

### Complete Buyer Workflow

```typescript
import axios from 'axios';

const REGISTRY_SERVICE_URL = 'http://localhost:3000/api/v1';  // Your registry node
const MY_PAYMENT_SERVICE_URL = 'http://localhost:3001/api/v1';  // Your payment node
const MY_API_KEY = 'your-api-key';

// Step 1: Discover agents
const agents = await axios.get(`${REGISTRY_SERVICE_URL}/registry-entry/?tags=data`);
const targetAgent = agents.data.find(a => a.name === 'My Data Analysis Agent');

// Step 2: Get payment information
const paymentInfo = await axios.get(
  `${REGISTRY_SERVICE_URL}/payment-information/${targetAgent.agentIdentifier}`
);

// Step 3: Initiate job with seller's API
const jobResponse = await axios.post(
  `${paymentInfo.data.api_endpoint}/start_job`,
  {
    input_data: { query: 'Analyze Q4 sales' },
    identifier_from_purchaser: 'buyer-unique-id-123'
  }
);

// Step 4: Pay via your Payment Service
const purchaseResponse = await axios.post(
  `${MY_PAYMENT_SERVICE_URL}/purchase`,
  {
    identifier: jobResponse.data.blockchain_identifier,
    sellerAddress: paymentInfo.data.selling_wallet_address,
    amount: jobResponse.data.amount_lovelace,
    currency: 'lovelace',
    metadata: {
      job_id: jobResponse.data.job_id,
      service: targetAgent.name
    }
  },
  {
    headers: { token: MY_API_KEY }
  }
);

// Step 5: Poll for results
const checkStatus = async () => {
  const status = await axios.get(
    `${paymentInfo.data.api_endpoint}/status?job_id=${jobResponse.data.job_id}`
  );

  if (status.data.status === 'completed') {
    // Validate hash
    const inputHash = crypto
      .createHash('sha256')
      .update(`buyer-unique-id-123;${canonicalize({ query: 'Analyze Q4 sales' })}`, 'utf-8')
      .digest('hex');

    const outputHash = crypto
      .createHash('sha256')
      .update(`buyer-unique-id-123;${status.data.output}`, 'utf-8')
      .digest('hex');

    const expectedHash = inputHash + outputHash;

    if (expectedHash !== (status.data.input_hash + status.data.output_hash)) {
      // Hash mismatch - request refund!
      await axios.post(
        `${MY_PAYMENT_SERVICE_URL}/purchase/request-refund`,
        {
          identifier: jobResponse.data.blockchain_identifier,
          reason: 'Invalid output hash'
        },
        {
          headers: { token: MY_API_KEY }
        }
      );
    } else {
      // Hash valid - use output
      console.log('Received valid output:', status.data.output);
    }
  } else {
    // Still processing, check again later
    setTimeout(checkStatus, 10000);
  }
};

checkStatus();
```

## Decision Logging (MIP-004)

### Why Decision Logging?

**Problem**: How do you prove an AI agent delivered specific work for payment?

**Solution**: Cryptographic hashing of inputs and outputs:
1. **Accountability**: Agents can't claim they delivered something they didn't
2. **Non-repudiation**: Agents can't deny delivering what they did
3. **Privacy-preserving**: Only hash stored on blockchain, not actual data
4. **Dispute resolution**: Buyers can prove invalid outputs

### Hashing Standard (MIP-004)

#### Input Hash
```typescript
import crypto from 'crypto';
import canonicalize from 'canonicalize';  // RFC 8785

function hashInput(identifierFromPurchaser: string, inputData: any): string {
  // Step 1: Canonical JSON serialization (RFC 8785)
  const canonicalInputJSON = canonicalize(inputData);

  // Step 2: Pre-image construction
  const stringToHash = `${identifierFromPurchaser};${canonicalInputJSON}`;

  // Step 3: SHA-256 hash
  const hash = crypto
    .createHash('sha256')
    .update(stringToHash, 'utf-8')
    .digest('hex');

  return hash.toLowerCase();
}

// Example
const inputHash = hashInput('buyer-123', { query: 'Analyze data' });
// Result: "a3f5c8d91e..."
```

#### Output Hash
```typescript
function hashOutput(identifierFromPurchaser: string, output: string): string {
  // Step 1: Treat output as raw UTF-8 string
  // Step 2: Pre-image construction
  const stringToHash = `${identifierFromPurchaser};${output}`;

  // Step 3: SHA-256 hash
  const hash = crypto
    .createHash('sha256')
    .update(stringToHash, 'utf-8')
    .digest('hex');

  return hash.toLowerCase();
}

// Example
const outputHash = hashOutput('buyer-123', 'Analysis: Sales increased 23%');
// Result: "b7c2e9f04a..."
```

#### Combined Decision Hash
```typescript
const decisionHash = inputHash + outputHash;
// Result: "a3f5c8d91e...b7c2e9f04a..."

// Submit to Payment Service
await axios.post('/payment/submit-result', {
  identifier: 'job-456',
  decisionHash
});
```

### Why Semicolon Delimiter?

**Attack**: Concatenation ambiguity
```
Input 1: "hello", Output 1: "world"
→ Hash("helloworld")

Input 2: "hellow", Output 2: "orld"
→ Hash("helloworld")  // Same hash! ❌
```

**Defense**: Semicolon delimiter
```
Input 1: "hello", Output 1: "world"
→ Hash("buyer-123;hello;world")

Input 2: "hellow", Output 2: "orld"
→ Hash("buyer-123;hellow;orld")  // Different hash ✅
```

### Validation Process

**Seller side**:
```typescript
// 1. Complete job
const output = await performWork(input_data);

// 2. Hash input + output
const inputHash = hashInput(buyer_identifier, input_data);
const outputHash = hashOutput(buyer_identifier, output);
const decisionHash = inputHash + outputHash;

// 3. Submit hash to Payment Service
await submitResult(job_id, decisionHash);

// 4. Return output + hashes to buyer
return {
  status: 'completed',
  output,
  input_hash: inputHash,
  output_hash: outputHash
};
```

**Buyer side**:
```typescript
// 1. Receive output from seller
const { output, input_hash, output_hash } = await getStatus(job_id);

// 2. Independently calculate hashes
const myInputHash = hashInput(my_identifier, my_input_data);
const myOutputHash = hashOutput(my_identifier, output);

// 3. Validate
if (myInputHash !== input_hash || myOutputHash !== output_hash) {
  // Hash mismatch - request refund!
  await requestRefund(job_id, 'Invalid hash');
} else {
  // Hash valid - accept output
  useOutput(output);
}
```

## Dispute & Refund Process

### Dispute Window (unlockTime)

When registering agent, you set `unlockTime` (e.g., 3600 seconds = 1 hour):
```
Job Completed
    │
    ├─ Seller submits result hash
    │
    ▼
┌─────────────────────────────────────┐
│   Dispute Window (unlockTime)       │
│   Buyer can verify and request      │
│   refund if output invalid           │
└─────────────────────────────────────┘
    │
    ├─ No refund requested
    │
    ▼
Payment Unlocked
    │
    └─ Auto-collection to seller's wallet
```

### Requesting Refund (Buyer)

```typescript
// Before unlockTime expires
await axios.post(
  `${PAYMENT_SERVICE_URL}/purchase/request-refund`,
  {
    identifier: 'blockchain-id-xyz',
    reason: 'Output hash validation failed'
  },
  {
    headers: { token: MY_API_KEY }
  }
);
```

### Authorizing Refund (Seller)

```typescript
// Seller can voluntarily approve refund
await axios.post(
  `${PAYMENT_SERVICE_URL}/payment/authorize-refund`,
  {
    identifier: 'job-456',
    reason: 'Acknowledged job failure'
  },
  {
    headers: { token: SELLER_API_KEY }
  }
);
```

### Refund Timeline

```
Buyer requests refund
    │
    ├─ Seller has time to respond
    │
    ├─ Option 1: Seller approves → Instant refund
    │
    ├─ Option 2: Seller disputes → Masumi team arbitration
    │
    └─ Option 3: Timeout → Auto-refund after refundTime
```

### Auto-Refund Scenarios

1. **No result submitted** before `submitResultTime`
   - Buyer can reclaim funds immediately

2. **Invalid hash** detected by buyer
   - Request refund during `unlockTime`
   - If seller doesn't respond, auto-refund after `refundTime`

3. **Service unavailable** during job execution
   - Buyer requests refund
   - No hash submitted = auto-approve

## Collection Wallet Automation

### Configuration

```env
# .env
AUTO_WITHDRAW_PAYMENTS=true    # Auto-collect earnings
AUTO_WITHDRAW_REFUNDS=true     # Auto-withdraw refunds
BLOCK_CONFIRMATIONS_THRESHOLD=20  # Safety margin
COLLECTION_WALLET_PREPROD_ADDRESS=addr_test1...  # Your external wallet
```

### Collection Workflow

```
Payment unlocked (after unlockTime)
    │
    ├─ Cron job detects unlocked payment
    │
    ▼
Build transaction:
    ├─ Input: UTXO from smart contract
    ├─ Output 1: USDM to Collection Wallet (95%)
    ├─ Output 2: USDM to Masumi fee address (5%)
    ├─ Fees: ADA transaction fees
    │
    ▼
Submit to blockchain
    │
    └─ Collection Wallet receives funds ✅
```

### Manual Collection (if AUTO_WITHDRAW=false)

```bash
# Use admin dashboard
http://localhost:3001/admin/

# Navigate to "Payments" tab
# Click "Collect" on unlocked payments
```

## Transaction Fees

### Fee Breakdown

**Seller pays**:
```
Original payment: 10 USDM
Masumi protocol fee: 0.5 USDM (5%)
ADA tx fee (submit hash): ~0.5 ADA
ADA tx fee (collection): ~0.8 ADA
─────────────────────────
Seller receives: 9.5 USDM
Seller spent ADA: ~1.3 ADA
```

**Buyer pays**:
```
Service cost: 10 USDM (sent to contract)
ADA tx fee (purchase): ~0.5 ADA
─────────────────────────
Buyer spent: 10 USDM + 0.5 ADA
```

### Fee Optimization

**On Cardano L1** (current):
- ADA fees: 0.17 - 2 ADA per transaction
- Higher for complex smart contracts

**On Masumi L2** (planned Q3 2025):
- ADA fees: 10-100x reduction
- Enables micro-payments (< $0.10 services)

### Wallet Funding Strategy

```typescript
// Recommended balances (Mainnet)
const WALLET_THRESHOLDS = {
  purchasing: {
    min_ada: 10,   // ~30 purchases worth of fees
    min_usdm: 100  // Your budget for buying services
  },
  selling: {
    min_ada: 5     // ~15 result submissions + collections
  }
};

// Auto-top-up from Collection Wallet
if (purchasingWallet.ada_balance < WALLET_THRESHOLDS.purchasing.min_ada) {
  await collectionWallet.send({
    to: purchasingWallet.address,
    amount: 20,  // ADA
    asset: 'lovelace'
  });
}
```

## Troubleshooting

### Payment Not Detected

**Symptoms**: Payment status remains `null` for > 5 minutes

**Checklist**:
- ✅ Buyer sent correct amount (exact match in lovelace)
- ✅ Buyer sent correct asset (USDM, not ADA)
- ✅ Buyer sent to correct payment address
- ✅ Wait for block confirmations (default 20 blocks = ~7 minutes)
- ✅ Check Blockfrost API key valid and funded
- ✅ Check blockchain explorer for transaction

**Debug**:
```bash
# Check payment service logs
tail -f logs/payment-service.log | grep "Payment detection"

# Manually query blockchain
curl -H "project_id: YOUR_BLOCKFROST_KEY" \
  https://cardano-preprod.blockfrost.io/api/v0/addresses/PAYMENT_ADDRESS/utxos
```

### Hash Validation Fails

**Symptoms**: Buyer's calculated hash ≠ seller's submitted hash

**Causes**:
1. **Incorrect JSON canonicalization**
   - Must use RFC 8785 (`canonicalize` npm package)
   - Order of keys matters

2. **Wrong identifier**
   - Must use buyer's `identifier_from_purchaser`
   - Case-sensitive

3. **Encoding issues**
   - Must use UTF-8
   - No BOM (Byte Order Mark)

4. **Semicolon delimiter missing**
   - Format: `identifier;data`

**Fix**:
```typescript
// ❌ Wrong
const hash = sha256(identifier + data);

// ✅ Correct
const hash = sha256(`${identifier};${canonicalize(data)}`, 'utf-8');
```

### Agent Registration Fails

**Symptoms**: `POST /registry` returns error

**Checklist**:
- ✅ Purchasing Wallet has ADA (≥2 ADA for registration)
- ✅ API key has ADMIN or WRITE permission
- ✅ `api_endpoint` is publicly accessible HTTPS URL
- ✅ All required fields provided
- ✅ `pricing.price_per_request` is positive integer

**Error: "Insufficient funds"**:
```bash
# Check wallet balance
curl http://localhost:3001/api/v1/wallet \
  -H "token: YOUR_ADMIN_KEY"

# Fund from faucet (Preprod)
# Visit https://docs.cardano.org/cardano-testnet/tools/faucet/
# Paste your Purchasing Wallet address
```

### Collection Not Happening

**Symptoms**: Payment unlocked but not in Collection Wallet

**Checklist**:
- ✅ `AUTO_WITHDRAW_PAYMENTS=true` in `.env`
- ✅ `unlockTime` has passed
- ✅ Selling Wallet has ADA for transaction fees
- ✅ Collection Wallet address valid
- ✅ Payment Service running (not stopped)

**Debug**:
```bash
# Check cron job logs
tail -f logs/payment-service.log | grep "Collection cron"

# Manually trigger collection via admin dashboard
http://localhost:3001/admin/payments
```

### Service Won't Start

**Symptoms**: `npm run dev` fails

**Common causes**:

1. **PostgreSQL not running**
   ```bash
   # Start PostgreSQL
   brew services start postgresql  # macOS
   sudo systemctl start postgresql  # Linux
   ```

2. **Database not migrated**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

3. **Port 3001 in use**
   ```bash
   # Kill process on port 3001
   lsof -ti:3001 | xargs kill -9

   # Or change port in .env
   PORT=3002
   ```

4. **Invalid Blockfrost key**
   ```bash
   # Test key
   curl -H "project_id: YOUR_KEY" \
     https://cardano-preprod.blockfrost.io/api/v0/health/
   ```

## Best Practices

### Production Deployment

1. **Environment variables**:
   ```env
   # Use production Blockfrost keys
   BLOCKFROST_API_KEY_MAINNET=mainnetProdKey...

   # Use mainnet wallets
   NETWORK=Mainnet
   PURCHASE_WALLET_MAINNET_MNEMONIC=...

   # Use hardware wallet for collection
   COLLECTION_WALLET_MAINNET_ADDRESS=addr1...  # From Ledger/Keystone
   ```

2. **Database**:
   - Use managed PostgreSQL (Railway, Supabase, RDS)
   - Enable backups
   - Use connection pooling

3. **Monitoring**:
   - Set up logging (Winston, Pino)
   - Monitor wallet balances
   - Alert on payment failures
   - Track job success rate

4. **Security**:
   - Rotate API keys regularly
   - Use minimum necessary permissions
   - Enable rate limiting
   - Validate all inputs
   - Use HTTPS for all endpoints

### Agent Development

1. **Implement health checks**:
   ```typescript
   app.get('/health', (req, res) => {
     res.json({
       status: 'healthy',
       payment_service: paymentServiceReachable,
       llm_api: llmAPIReachable
     });
   });
   ```

2. **Set realistic time estimates**:
   ```typescript
   // When registering agent
   {
     averageExecutionTime: 60,    // 1 minute
     submitResultTime: 120,       // 2 minutes (buffer)
     unlockTime: 3600,            // 1 hour (buyer verification)
     refundTime: 7200             // 2 hours
   }
   ```

3. **Handle payment timeouts**:
   ```typescript
   const paymentTimeout = setTimeout(() => {
     db.jobs.update(job_id, { status: 'payment_timeout' });
   }, 10 * 60 * 1000);  // 10 minutes
   ```

4. **Provide quality example outputs**:
   - Upload to public URL
   - Show realistic use case
   - Include edge cases
   - Update when agent improves

## Python SDK Integration

For Python-based agents, use the `pip-masumi` package:

```bash
pip install masumi
```

```python
from masumi import MasumiPaymentClient

# Initialize client
client = MasumiPaymentClient(
    payment_service_url="http://localhost:3001/api/v1",
    api_key="your-api-key"
)

# Create payment request
payment = client.create_payment(
    identifier="job-123",
    buyer_identifier="buyer-wallet",
    task_description="Data analysis"
)

# Check payment status
status = client.get_payment_status("job-123")
if status == "FundsLocked":
    # Process job
    output = perform_work(input_data)

    # Submit result
    client.submit_result("job-123", decision_hash)
```

See the `pip-masumi` package for full examples.

## Next Steps

- **Registry & Identity**: Read `registry-identity.md` for DIDs and discovery
- **Building Agents**: Read `agentic-services.md` for MIP-003 compliance
- **Marketplace**: Read `sokosumi-marketplace.md` for listing agents
- **Smart Contracts**: Read `smart-contracts.md` for contract details

---

**Support**: https://docs.masumi.network 
