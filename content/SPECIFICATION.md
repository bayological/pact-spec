# Pact Specification

**Version:** 0.1.0-draft

---

## Overview

A pact is a data structure representing a commitment between parties, with defined terms, stakes, and a designated resolution mechanism.

This document defines the minimal required schema and optional extensions.

---

## Schema

### Core Structure

```json
{
  "pact": {
    "version": "0.1",
    "id": "string",

    "parties": [
      {
        "id": "string",
        "role": "string"
      }
    ],

    "terms": {
      "description": "string",
      "acceptance_criteria": [
        "string"
      ],
      "context": "string",
      "attachments": [
        {
          "hash": "string",
          "uri": "string",
          "type": "string"
        }
      ],
      "deadline": "timestamp"
    },

    "stakes": {
      "type": "string",
      "details": {}
    },

    "resolver": {
      "type": "string",
      "endpoint": "string",
      "config": {}
    },

    "state": "proposed | active | disputed | resolved",

    "evidence": [
      {
        "party": "string",
        "hash": "string",
        "uri": "string",
        "submitted_at": "timestamp"
      }
    ],

    "resolution": {
      "outcome": "fulfilled | breached | partial | void",
      "reasoning": "string",
      "resolved_by": "string",
      "resolved_at": "timestamp"
    },

    "metadata": {
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "chain": "string",
      "contract_address": "string"
    }
  }
}
```

---

## Terms

The `terms` object is the heart of a pact. It must balance human readability with machine evaluability.

### Acceptance Criteria

Inspired by software acceptance criteria, these are discrete conditions a resolver checks. They should be:

- **Specific** — Clear enough that two reasonable parties would agree on whether it's met
- **Observable** — Based on evidence that can be submitted
- **Independent** — Each criterion stands alone

**Good criteria:**
```json
{
  "acceptance_criteria": [
    "Delivers 3 distinct logo concepts in PNG format",
    "Source files provided (AI, PSD, or Figma)",
    "Final delivery within 7 days of project start"
  ]
}
```

**Bad criteria:**
```json
{
  "acceptance_criteria": [
    "Does good work",
    "Client is happy",
    "Professional quality"
  ]
}
```

### Context

Freeform information that helps interpret the criteria but isn't directly evaluated. This is where background, preferences, and nuance live.

```json
{
  "context": "This is for a climate tech podcast called \"Carbon Copy.\" Style preference: minimal, geometric, modern. Primary colors: greens and blues. See attached mood board for reference."
}
```

### Attachments

References to external materials. Store hashes for integrity verification.

```json
{
  "attachments": [
    {
      "hash": "sha256:a1b2c3...",
      "uri": "ipfs://Qm...",
      "type": "image"
    }
  ]
}
```

---

## Stakes

What's at risk if the pact is breached or fulfilled.

### Escrow

```json
{
  "stakes": {
    "type": "escrow",
    "details": {
      "amount": "500",
      "currency": "USDC",
      "contract": "0x...",
      "release_on": "fulfilled",
      "return_on": "breached"
    }
  }
}
```

### Reputation

```json
{
  "stakes": {
    "type": "reputation",
    "details": {
      "system": "pact-reputation-v1",
      "weight": 1.0
    }
  }
}
```

### Access

```json
{
  "stakes": {
    "type": "access",
    "details": {
      "resource": "premium-content-xyz",
      "grant_on": "fulfilled",
      "revoke_on": "breached"
    }
  }
}
```

### Composite

Stakes can be combined:

```json
{
  "stakes": {
    "type": "composite",
    "details": [
      {
        "type": "escrow",
        "details": { "amount": "500", "currency": "USDC" }
      },
      {
        "type": "reputation",
        "details": { "system": "pact-reputation-v1", "weight": 1.0 }
      }
    ]
  }
}
```

---

## Resolvers

A resolver is any mechanism that can evaluate a pact and return an outcome.

### Resolver Interface

Resolvers must accept a pact and evidence, and return a resolution:

```
resolve(pact, evidence) → resolution
```

Where resolution contains:
- `outcome`: "fulfilled" | "breached" | "partial" | "void"
- `reasoning`: Explanation of the decision
- `resolved_by`: Identifier of the resolver
- `resolved_at`: Timestamp

### Resolver Types

**AI Resolver**
```json
{
  "resolver": {
    "type": "ai",
    "endpoint": "https://resolver.example.com/evaluate",
    "config": {
      "model": "claude-3",
      "temperature": 0
    }
  }
}
```

**Human Resolver**
```json
{
  "resolver": {
    "type": "human",
    "endpoint": "https://arbitration.example.com/cases",
    "config": {
      "arbitrators": 3,
      "majority_required": true
    }
  }
}
```

**DAO Resolver**
```json
{
  "resolver": {
    "type": "dao",
    "config": {
      "contract": "0x...",
      "quorum": 0.1,
      "voting_period": "72h"
    }
  }
}
```

---

## State Machine

```
proposed → active → resolved
              ↓
          disputed → resolved
```

- **proposed**: Created but not yet accepted by all parties
- **active**: All parties have signed; execution in progress
- **disputed**: One or more parties have raised a dispute
- **resolved**: Resolver has issued a final outcome

---

## On-Chain Considerations

For on-chain implementations:

1. **Commit hash on-chain** — Store a hash of the full pact terms, keeping full content off-chain or encrypted
2. **Minimal on-chain state** — Only `id`, `parties`, `stakes`, `resolver`, `state`, `resolution`
3. **Events** — Emit events for state transitions
4. **Resolver integration** — Resolver can be a contract address with a standard interface

Example Solidity interface:

```solidity
interface IPact {
    function propose(bytes32 termsHash, address[] parties, address resolver) external returns (uint256 pactId);
    function activate(uint256 pactId) external;
    function dispute(uint256 pactId, bytes evidence) external;
    function resolve(uint256 pactId, Outcome outcome, string reasoning) external; // resolver only
}

enum Outcome { Fulfilled, Breached, Partial, Void }
```

---

## Extensions

The core schema is intentionally minimal. Extensions can add:

- **Milestones** — Multi-phase pacts with partial releases
- **Amendments** — Formal process for modifying active pacts
- **Templates** — Reusable pact structures for common use cases
- **Reputation scoring** — Algorithms for computing reputation from pact history

---

## Versioning

Pact specs follow semantic versioning. Breaking changes increment the major version.

Current: `0.1.0-draft`
