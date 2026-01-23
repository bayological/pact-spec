# Resolvers

How pacts get evaluated and resolved.

---

## Overview

A **resolver** is any mechanism that can evaluate whether a pact's terms have been satisfied. The pact primitive is deliberately resolver-agnostic—it defines what needs to be evaluated, not how.

This separation is key: it allows different resolvers to compete on quality, cost, and speed while maintaining a standard commitment format.

---

## Resolver Interface

Every resolver implements a standard interface. This enables interoperability — any resolver can evaluate any pact.

### JSON-RPC Specification

Resolvers SHOULD expose a JSON-RPC 2.0 compatible endpoint.

**Method:** `pact.resolve`

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "pact.resolve",
  "params": {
    "pact": {
      "id": "pact_01HXYZ123456",
      "version": "0.1",
      "terms": {},
      "parties": [],
      "stakes": {}
    },
    "evidence": [
      {
        "party": "0xProvider...",
        "items": [
          {
            "hash": "sha256:abc123...",
            "uri": "ipfs://Qm...",
            "type": "deliverable",
            "description": "Final logo files",
            "submitted_at": "2025-01-25T10:00:00Z"
          }
        ]
      }
    ]
  },
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "outcome": "fulfilled",
    "reasoning": "All acceptance criteria met. Evidence shows 3 distinct concepts delivered on Jan 20, source files provided via Figma link, revision completed on Jan 24.",
    "criteria_evaluation": [
      {
        "criterion": "Delivers 3 distinct logo concepts",
        "met": true,
        "confidence": 0.95,
        "notes": "Evidence contains 3 PNG files with visually distinct designs"
      },
      {
        "criterion": "Includes editable source file",
        "met": true,
        "confidence": 0.90,
        "notes": "Figma link provided and verified accessible"
      }
    ],
    "resolved_by": "resolver.pact.example",
    "resolved_at": "2025-01-25T12:00:00Z",
    "confidence": 0.92
  },
  "id": 1
}
```

**Error Response:**

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Insufficient evidence",
    "data": {
      "missing": ["Proof of source file delivery"]
    }
  },
  "id": 1
}
```

### Error Codes

| Code | Message | Meaning |
|------|---------|---------|
| -32001 | Insufficient evidence | Cannot evaluate without additional evidence |
| -32002 | Invalid pact format | Pact does not conform to schema |
| -32003 | Resolver unavailable | Resolver cannot process at this time |
| -32004 | Outside jurisdiction | Resolver does not handle this pact type |
| -32005 | Conflict of interest | Resolver has relationship with a party |

### Outcome Values

| Outcome | Meaning |
|---------|---------|
| `fulfilled` | All acceptance criteria met |
| `breached` | One or more criteria clearly not met |
| `partial` | Some criteria met; may trigger partial stake release |
| `void` | Pact cannot be evaluated (force majeure, both parties at fault, etc.) |
| `indeterminate` | Evidence insufficient to make a judgment |

### Confidence Scores

Resolvers MAY include confidence scores (0.0 to 1.0) at both the overall and per-criterion level. This is particularly useful for AI resolvers and enables escalation logic:

```json
{
  "escalation_rule": "if confidence < 0.8 then escalate to human resolver"
}
```

### Webhook Variant

For async resolution, resolvers MAY accept a callback URL:

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "pact.resolve.async",
  "params": {
    "pact": {},
    "evidence": [],
    "callback_url": "https://client.example.com/resolution-webhook"
  },
  "id": 1
}
```

**Immediate Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "status": "accepted",
    "resolution_id": "res_789xyz",
    "estimated_completion": "2025-01-25T14:00:00Z"
  },
  "id": 1
}
```

**Webhook Payload (when complete):**

```json
{
  "resolution_id": "res_789xyz",
  "pact_id": "pact_01HXYZ123456",
  "outcome": "fulfilled",
  "reasoning": "...",
  "resolved_at": "2025-01-25T13:45:00Z"
}
```

---

## Resolver Types

### AI Resolver

An LLM evaluates the pact terms against submitted evidence.

**Strengths**: Fast, cheap, available 24/7, consistent.
**Weaknesses**: May miss nuance, limited to evaluating digital evidence.

```json
{
  "resolver": {
    "type": "ai",
    "endpoint": "https://resolver.example.com/evaluate",
    "config": {
      "model": "claude-3-opus",
      "temperature": 0,
      "system_prompt": "You are evaluating whether a pact has been fulfilled. Assess each acceptance criterion against the evidence. Be strict but fair. If evidence is ambiguous, note it."
    }
  }
}
```

**Implementation sketch**:

```python
def resolve_with_ai(pact, evidence):
    prompt = f"""
    Evaluate this pact:

    Terms: {pact.terms.description}

    Acceptance Criteria:
    {format_criteria(pact.terms.acceptance_criteria)}

    Evidence Submitted:
    {format_evidence(evidence)}

    For each criterion, determine if it was met based on the evidence.
    Return your evaluation as JSON.
    """

    response = llm.complete(prompt)
    return parse_resolution(response)
```

### Human Resolver

A human or panel of humans reviews the pact and evidence.

**Strengths**: Handles nuance, can evaluate subjective quality, trusted.
**Weaknesses**: Slow, expensive, limited availability.

```json
{
  "resolver": {
    "type": "human",
    "endpoint": "https://arbitration.example.com/submit",
    "config": {
      "arbitrator_count": 3,
      "selection": "random_from_pool",
      "majority_required": true,
      "max_resolution_time": "72h",
      "fee": "50 USDC"
    }
  }
}
```

**Flow**:
1. Dispute raised → case created
2. Arbitrators assigned (random or selected)
3. Each arbitrator reviews pact + evidence independently
4. Votes submitted
5. Majority outcome becomes resolution

### DAO Resolver

Token holders vote on the outcome.

**Strengths**: Decentralized, community-governed, transparent.
**Weaknesses**: Slow, may lack domain expertise, vulnerable to coordination.

```json
{
  "resolver": {
    "type": "dao",
    "config": {
      "contract": "0xDAOResolver...",
      "token": "0xGovernanceToken...",
      "quorum": 0.1,
      "voting_period": "72h",
      "options": ["fulfilled", "breached", "partial", "void"]
    }
  }
}
```

### Oracle Resolver

Automated resolution based on external data sources.

**Strengths**: Instant, objective, no human judgment needed.
**Weaknesses**: Only works for measurable criteria, depends on data source reliability.

```json
{
  "resolver": {
    "type": "oracle",
    "config": {
      "sources": [
        {
          "type": "api",
          "endpoint": "https://api.uptimerobot.com/v2/getMonitors",
          "auth": "env:UPTIMEROBOT_KEY"
        },
        {
          "type": "chainlink",
          "feed": "0x..."
        }
      ],
      "evaluation": "uptime >= 0.999 AND p95_latency <= 200"
    }
  }
}
```

### Hybrid Resolver

Combines multiple resolver types.

```json
{
  "resolver": {
    "type": "hybrid",
    "config": {
      "primary": {
        "type": "ai",
        "endpoint": "..."
      },
      "escalation": {
        "type": "human",
        "trigger": "confidence < 0.8 OR party_disputes"
      },
      "final": {
        "type": "dao",
        "trigger": "human_deadlock"
      }
    }
  }
}
```

---

## Resolver Selection

When creating a pact, parties agree on a resolver upfront. Considerations:

| Factor | AI | Human | DAO | Oracle |
|--------|-----|-------|-----|--------|
| Speed | Fast | Slow | Slow | Instant |
| Cost | Low | High | Medium | Low |
| Nuance handling | Medium | High | Medium | None |
| Objectivity | High | Variable | Variable | High |
| Best for | Standard agreements | Complex disputes | Community decisions | Measurable SLAs |

---

## Building a Resolver

Want to build a resolver? Implement this interface:

### HTTP API

```
POST /resolve
Content-Type: application/json

{
  "pact": { ... },
  "evidence": [ ... ]
}

Response:
{
  "outcome": "fulfilled",
  "reasoning": "...",
  "criteria_evaluation": [ ... ],
  "resolved_by": "resolver-id",
  "resolved_at": "2025-01-25T12:00:00Z"
}
```

### Smart Contract

```solidity
interface IResolver {
    function resolve(
        uint256 pactId,
        bytes32 termsHash,
        bytes calldata evidence
    ) external returns (
        Outcome outcome,
        string memory reasoning
    );
}

enum Outcome { Fulfilled, Breached, Partial, Void }
```

---

## Trust and Verification

How do parties trust a resolver?

1. **Reputation** — Resolvers build track records. Query past resolutions.
2. **Staking** — Resolvers stake collateral, slashed for provably bad decisions.
3. **Appeals** — Resolutions can be appealed to a higher-tier resolver.
4. **Transparency** — Reasoning is public; community can audit.

```json
{
  "resolver_profile": {
    "id": "resolver.pact.example",
    "type": "ai",
    "stats": {
      "total_resolutions": 1247,
      "appeal_rate": 0.03,
      "overturn_rate": 0.01
    },
    "stake": "10000 USDC",
    "created": "2024-06-01"
  }
}
```

---

## Open Questions

- How should resolver fees be structured?
- What's the appeals process for AI resolutions?
- How do we prevent resolver collusion in high-stakes pacts?
- Should there be a resolver registry / marketplace?
