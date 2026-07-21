# Pact Examples

Concrete examples of pacts for common use cases. All examples conform to spec version 0.2.

---

## Example 1: Freelance Logo Design

A client commissions a designer for logo work, with escrow, optimistic resolution, and AI arbitration on dispute.

```json
{
  "pact": {
    "version": "0.2",
    "id": "pact_01JHXK7Q2M4N8P1R5T9V3W6Y0Z",

    "parties": [
      {
        "id": "eip155:8453:0xC11e17F00000000000000000000000000000c11e",
        "role": "client",
        "scheme": "eip155"
      },
      {
        "id": "eip155:8453:0xDe519e40000000000000000000000000000de519",
        "role": "provider",
        "scheme": "eip155"
      }
    ],

    "terms": {
      "description": "Logo design for Carbon Copy podcast",

      "acceptance_criteria": [
        "Delivers 3 distinct logo concepts",
        "Each concept provided in PNG (1024x1024) and SVG formats",
        "Includes editable source file (Figma, AI, or PSD)",
        "Provides one round of revisions on selected concept",
        "Final files delivered within 14 days of pact activation"
      ],

      "context": "Carbon Copy is a podcast about climate technology and sustainability. Target audience: tech-savvy professionals interested in cleantech. Style preference: minimal, geometric, modern. Color palette: greens, blues, white. No gradients. The logo should work at small sizes (favicon) and large (podcast cover).",

      "attachments": [
        {
          "hash": "sha256:9a1b2c3d...",
          "uri": "ipfs://QmMoodBoard...",
          "type": "image",
          "description": "Mood board with style references"
        }
      ],

      "deadline": "2026-02-15T00:00:00Z"
    },

    "stakes": {
      "type": "escrow",
      "details": {
        "asset": "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "amount": "500000000",
        "funder": "client",
        "beneficiary": "provider",
        "contract": "eip155:8453:0xEscrow...",
        "disposition": {
          "fulfilled": { "beneficiary": "1.0" },
          "breached": { "funder": "1.0" },
          "partial": "resolver",
          "void": { "funder": "1.0" },
          "indeterminate": { "funder": "1.0" }
        }
      }
    },

    "resolver": {
      "type": "ai",
      "endpoint": "https://pact-resolver.example.com/evaluate",
      "config": {
        "model": "claude-sonnet-5",
        "system_prompt_hash": "sha256:e5f6..."
      }
    },

    "resolution_policy": {
      "mode": "optimistic",
      "challenge_window": "P3D",
      "resolution_timeout": "P7D",
      "appeal": {
        "resolver": { "type": "human", "endpoint": "https://arbitration.example.com" },
        "window": "P3D",
        "max_rounds": 1
      }
    },

    "state": "active",

    "signatures": [
      {
        "party": "eip155:8453:0xC11e17F00000000000000000000000000000c11e",
        "scheme": "eip712",
        "commitment_hash": "sha256:4d5e6f...",
        "signature": "0x...",
        "signed_at": "2026-01-20T10:30:00Z"
      },
      {
        "party": "eip155:8453:0xDe519e40000000000000000000000000000de519",
        "scheme": "eip712",
        "commitment_hash": "sha256:4d5e6f...",
        "signature": "0x...",
        "signed_at": "2026-01-20T11:45:00Z"
      }
    ],

    "metadata": {
      "created_at": "2026-01-20T10:00:00Z",
      "updated_at": "2026-01-20T12:00:00Z",
      "chain": "eip155:8453"
    }
  }
}
```

The happy path here never touches the resolver: the designer delivers, asserts fulfilment with hash-committed evidence, the client lets the 3-day challenge window lapse (or affirms early), and escrow releases. The AI resolver exists only for the dispute case.

---

## Example 2: Code Bounty

An open bounty for fixing a bug, with partial fulfillment possible. The `hunter` slot is open; it is filled by the first valid signature into it.

```json
{
  "pact": {
    "version": "0.2",
    "id": "pact_01JHXM3R8S2T6V0X4Z7B1D5F9H",

    "parties": [
      {
        "id": "eip155:1:0xDA0000000000000000000000000000000000DA00",
        "role": "issuer",
        "scheme": "eip155"
      },
      {
        "id": "open",
        "role": "hunter"
      }
    ],

    "terms": {
      "description": "Fix memory leak in authentication service",

      "acceptance_criteria": [
        "Identifies root cause of memory leak in auth-service",
        "Provides pull request with fix",
        "Fix passes existing test suite",
        "Memory usage stable under load test (< 512MB after 1000 requests)",
        "No new security vulnerabilities introduced"
      ],

      "context": "The auth-service at github.com/example/auth-service has a memory leak that causes OOM crashes after ~4 hours in production. Reproduction: Run `npm run load-test` and monitor memory. Partial bounty available for root cause identification without fix.",

      "attachments": [
        {
          "hash": "sha256:7def456a...",
          "uri": "https://github.com/example/auth-service/issues/142",
          "type": "url",
          "description": "Snapshot of GitHub issue #142 (content hash-pinned at pact creation)"
        }
      ],

      "deadline": "2026-03-01T00:00:00Z"
    },

    "stakes": {
      "type": "escrow",
      "details": {
        "asset": "eip155:1/erc20:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "amount": "2000000000",
        "funder": "issuer",
        "beneficiary": "hunter",
        "contract": "eip155:1:0xBountyEscrow...",
        "disposition": {
          "fulfilled": { "beneficiary": "1.0" },
          "breached": { "funder": "1.0" },
          "partial": "resolver",
          "void": { "funder": "1.0" },
          "indeterminate": { "funder": "1.0" }
        },
        "partial_release": [
          { "criteria": [0], "fraction": "0.25" },
          { "criteria": [0, 1, 2, 3, 4], "fraction": "1.0" }
        ]
      }
    },

    "resolver": {
      "type": "human",
      "endpoint": "https://bounty-review.example.com",
      "config": {
        "reviewers": [
          "eip155:1:0x1111111111111111111111111111111111111111",
          "eip155:1:0x2222222222222222222222222222222222222222"
        ],
        "approval_threshold": 1
      }
    },

    "resolution_policy": {
      "mode": "optimistic",
      "challenge_window": "P5D",
      "resolution_timeout": "P14D"
    },

    "state": "active",

    "signatures": [
      {
        "party": "eip155:1:0xDA0000000000000000000000000000000000DA00",
        "scheme": "eip1271",
        "commitment_hash": "sha256:8a9b0c...",
        "signature": "0x...",
        "signed_at": "2026-01-15T09:00:00Z"
      }
    ],

    "metadata": {
      "created_at": "2026-01-15T00:00:00Z",
      "chain": "eip155:1"
    }
  }
}
```

The `partial_release` entry maps criteria index 0 (root cause identified) to a 25% release — the prose "partial bounty available" from context is now machine-resolvable.

---

## Example 3: Content Access Agreement

A creator grants course access contingent on a completion commitment — a "finish or pay" model. Both parties are AI-agent-compatible DIDs.

```json
{
  "pact": {
    "version": "0.2",
    "id": "pact_01JHXN9W5Y1Z3B7D2F6H0K4M8P",

    "parties": [
      {
        "id": "did:web:alice.example.com",
        "role": "creator",
        "scheme": "did"
      },
      {
        "id": "did:key:z6MkBobExample...",
        "role": "subscriber",
        "scheme": "did"
      }
    ],

    "terms": {
      "description": "Premium course access with completion commitment",

      "acceptance_criteria": [
        "Subscriber completes all 12 course modules",
        "Subscriber submits final project",
        "Completion within 90 days of activation"
      ],

      "context": "Finish-or-pay model: the subscriber's deposit is returned on completion; retained by the creator otherwise.",

      "deadline": "2026-04-15T00:00:00Z"
    },

    "stakes": {
      "type": "composite",
      "details": [
        {
          "type": "escrow",
          "details": {
            "asset": "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            "amount": "200000000",
            "funder": "subscriber",
            "beneficiary": "subscriber",
            "contract": "eip155:8453:0xEscrow...",
            "disposition": {
              "fulfilled": { "beneficiary": "1.0" },
              "breached": { "creator": "1.0" },
              "partial": { "creator": "1.0" },
              "void": { "beneficiary": "1.0" },
              "indeterminate": { "beneficiary": "1.0" }
            }
          }
        },
        {
          "type": "access",
          "details": {
            "resource": "course://advanced-solidity-2026",
            "grant_on": "active",
            "revoke_on": "breached"
          }
        }
      ]
    },

    "resolver": {
      "type": "oracle",
      "config": {
        "source": "course-platform-api",
        "endpoint": "https://courses.example.com/completion-status",
        "check": "modules_completed == 12 AND project_submitted == true"
      }
    },

    "resolution_policy": {
      "mode": "direct",
      "resolution_timeout": "P3D"
    },

    "state": "active",

    "signatures": [
      {
        "party": "did:web:alice.example.com",
        "scheme": "jws",
        "commitment_hash": "sha256:1f2e3d...",
        "signature": "eyJhbGciOiJFZERTQSJ9...",
        "signed_at": "2026-01-10T08:00:00Z"
      },
      {
        "party": "did:key:z6MkBobExample...",
        "scheme": "jws",
        "commitment_hash": "sha256:1f2e3d...",
        "signature": "eyJhbGciOiJFZERTQSJ9...",
        "signed_at": "2026-01-10T08:05:00Z"
      }
    ],

    "metadata": {
      "created_at": "2026-01-10T00:00:00Z"
    }
  }
}
```

---

## Example 4: SLA Monitoring

Automated service-level agreement with direct oracle resolution on a monthly cadence.

```json
{
  "pact": {
    "version": "0.2",
    "id": "pact_01JHXP5C9E3G7J1M4N8Q2S6T0W",

    "parties": [
      {
        "id": "eip155:137:0x5e1c000000000000000000000000000000005e1c",
        "role": "provider",
        "scheme": "eip155"
      },
      {
        "id": "eip155:137:0xC0570000000000000000000000000000000c0570",
        "role": "customer",
        "scheme": "eip155"
      }
    ],

    "terms": {
      "description": "API uptime SLA for Q1 2026",

      "acceptance_criteria": [
        "API uptime >= 99.9% measured monthly",
        "P95 response time <= 200ms",
        "No more than 2 incidents with >5 minute downtime per month"
      ],

      "context": "Monitoring via UptimeRobot and Datadog. Endpoint: https://api.example.com/health. Measurement period: monthly, evaluated on the 1st of the following month. The oracle sources and query below are the agreed measurement — no other source is admissible.",

      "deadline": "2026-04-01T00:00:00Z"
    },

    "stakes": {
      "type": "escrow",
      "details": {
        "asset": "eip155:137/erc20:0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        "amount": "10000000000",
        "funder": "customer",
        "beneficiary": "provider",
        "contract": "eip155:137:0xSLAEscrow...",
        "disposition": {
          "fulfilled": { "beneficiary": "1.0" },
          "breached": { "beneficiary": "0.7", "funder": "0.3" },
          "partial": "resolver",
          "void": { "funder": "1.0" },
          "indeterminate": { "funder": "1.0" }
        }
      }
    },

    "resolver": {
      "type": "oracle",
      "config": {
        "sources": [
          { "name": "uptimerobot", "endpoint": "https://api.uptimerobot.com/v2/getMonitors" },
          { "name": "datadog", "endpoint": "https://api.datadoghq.com/api/v1/slo" }
        ],
        "evaluation": "uptime >= 0.999 AND p95_latency <= 200 AND long_incidents <= 2",
        "frequency": "monthly"
      }
    },

    "resolution_policy": {
      "mode": "direct",
      "resolution_timeout": "P3D",
      "appeal": {
        "resolver": { "type": "human", "endpoint": "https://arbitration.example.com" },
        "window": "P3D",
        "max_rounds": 1
      }
    },

    "state": "active",

    "signatures": [
      {
        "party": "eip155:137:0x5e1c000000000000000000000000000000005e1c",
        "scheme": "eip712",
        "commitment_hash": "sha256:6a7b8c...",
        "signature": "0x...",
        "signed_at": "2026-01-01T00:10:00Z"
      },
      {
        "party": "eip155:137:0xC0570000000000000000000000000000000c0570",
        "scheme": "eip712",
        "commitment_hash": "sha256:6a7b8c...",
        "signature": "0x...",
        "signed_at": "2026-01-01T00:12:00Z"
      }
    ],

    "metadata": {
      "created_at": "2026-01-01T00:00:00Z",
      "chain": "eip155:137"
    }
  }
}
```

These criteria are fully measurable, so a plain smart contract could enforce them — the pact form earns its place here through the appeal path (a human panel reviews contested oracle readings) and the standardized record it leaves for the provider's reputation.

---

## Example 5: Reputation-Only Commitment

A simple commitment with no financial stakes, peer-resolved with AI escalation.

```json
{
  "pact": {
    "version": "0.2",
    "id": "pact_01JHXQ1F5H9K3M7P0R4T8V2X6Z",

    "parties": [
      {
        "id": "eip155:1:0xA11ce00000000000000000000000000000000a11",
        "role": "promisor",
        "scheme": "eip155"
      },
      {
        "id": "eip155:1:0xB0b0000000000000000000000000000000000b0b",
        "role": "promisee",
        "scheme": "eip155"
      }
    ],

    "terms": {
      "description": "Review and provide feedback on draft article",

      "acceptance_criteria": [
        "Provides written feedback (minimum 200 words)",
        "Feedback delivered within 5 days",
        "Addresses structure, clarity, and argument strength"
      ],

      "context": "Bob is writing a blog post about zk-SNARKs for a general audience. Looking for feedback on whether it's accessible to non-technical readers.",

      "deadline": "2026-01-25T00:00:00Z"
    },

    "stakes": {
      "type": "reputation",
      "details": {
        "system": "pact-reputation-v1",
        "weight": 1.0,
        "public": true
      }
    },

    "resolver": {
      "type": "peer",
      "config": {
        "resolved_by": "promisee",
        "dispute_escalation": {
          "type": "ai",
          "endpoint": "https://resolver.example.com/evaluate"
        }
      }
    },

    "resolution_policy": {
      "mode": "optimistic",
      "challenge_window": "P2D",
      "resolution_timeout": "P5D"
    },

    "state": "proposed",

    "signatures": [
      {
        "party": "eip155:1:0xA11ce00000000000000000000000000000000a11",
        "scheme": "eip712",
        "commitment_hash": "sha256:3c4d5e...",
        "signature": "0x...",
        "signed_at": "2026-01-20T09:00:00Z"
      }
    ],

    "metadata": {
      "created_at": "2026-01-20T00:00:00Z"
    }
  }
}
```

Only the promisor has signed, so the pact is still `proposed` — it activates when the promisee's signature lands.

---

## Composition Patterns

### Chained Pacts

Pact B activates only when Pact A resolves to "fulfilled":

```json
{
  "pact": {
    "id": "pact_01JHXR7K1M5P9S3V6Y0B4D8F2H",
    "terms": {
      "description": "Phase 2: Implementation (contingent on Phase 1 approval)"
    },
    "activation": {
      "requires": [
        {
          "pact_id": "pact_01JHXK7Q2M4N8P1R5T9V3W6Y0Z",
          "commitment_hash": "sha256:4d5e6f...",
          "outcome": "fulfilled"
        }
      ]
    }
  }
}
```

Referencing the predecessor's `commitment_hash` alongside its id pins exactly which version of Phase 1 the contingency refers to.

### Pact-Gated Access

Resource access tied to pact status:

```json
{
  "access_rule": {
    "resource": "private-repo-xyz",
    "condition": {
      "type": "pact_status",
      "pact_id": "pact_01JHXS3N7Q1T5W9Z2C6E0G4J8M",
      "required_state": "active",
      "required_party_role": "contributor"
    }
  }
}
```

### Reputation Aggregation

Compute reputation from pact history:

```json
{
  "reputation": {
    "party": "eip155:1:0xA11ce00000000000000000000000000000000a11",
    "computed_from": {
      "pacts_fulfilled": 47,
      "pacts_breached": 2,
      "pacts_disputed": 3,
      "disputes_won": 2,
      "disputes_lost": 1
    },
    "score": 0.94,
    "last_updated": "2026-01-20T00:00:00Z"
  }
}
```

Reputation entries computed from resolution attestations (e.g. EAS) are independently recomputable — any platform can verify a score rather than trust it.
