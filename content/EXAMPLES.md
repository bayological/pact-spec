# Pact Examples

Concrete examples of pacts for common use cases.

---

## Example 1: Freelance Logo Design

A client commissions a designer for logo work, with escrow and AI arbitration.

```json
{
  "pact": {
    "version": "0.1",
    "id": "pact_01HXYZ123456",

    "parties": [
      {
        "id": "0xClient123...",
        "role": "client"
      },
      {
        "id": "0xDesigner456...",
        "role": "provider"
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
          "hash": "sha256:abc123...",
          "uri": "ipfs://QmMoodBoard...",
          "type": "image",
          "description": "Mood board with style references"
        }
      ],

      "deadline": "2025-02-15T00:00:00Z"
    },

    "stakes": {
      "type": "escrow",
      "details": {
        "amount": "500",
        "currency": "USDC",
        "contract": "0xEscrow...",
        "release_on": "fulfilled",
        "return_on": "breached"
      }
    },

    "resolver": {
      "type": "ai",
      "endpoint": "https://pact-resolver.example.com/evaluate",
      "config": {
        "model": "claude-3",
        "evaluation_criteria": "Check each acceptance criterion against submitted evidence"
      }
    },

    "state": "active",

    "metadata": {
      "created_at": "2025-01-20T10:00:00Z",
      "updated_at": "2025-01-20T12:00:00Z",
      "chain": "base"
    }
  }
}
```

---

## Example 2: Code Bounty

An open bounty for fixing a bug, with partial fulfillment possible.

```json
{
  "pact": {
    "version": "0.1",
    "id": "pact_bounty_789",

    "parties": [
      {
        "id": "0xProjectDAO...",
        "role": "issuer"
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
          "hash": "sha256:def456...",
          "uri": "https://github.com/example/auth-service/issues/142",
          "type": "url",
          "description": "GitHub issue with details"
        }
      ],

      "deadline": "2025-03-01T00:00:00Z"
    },

    "stakes": {
      "type": "escrow",
      "details": {
        "amount": "2000",
        "currency": "USDC",
        "contract": "0xBountyEscrow...",
        "partial_release": [
          {
            "condition": "Root cause identified only",
            "amount": "500"
          },
          {
            "condition": "Full fix merged",
            "amount": "2000"
          }
        ]
      }
    },

    "resolver": {
      "type": "human",
      "endpoint": "https://bounty-review.example.com",
      "config": {
        "reviewers": ["0xMaintainer1...", "0xMaintainer2..."],
        "approval_threshold": 1
      }
    },

    "state": "active",

    "metadata": {
      "created_at": "2025-01-15T00:00:00Z",
      "chain": "ethereum"
    }
  }
}
```

---

## Example 3: Content Access Agreement

A creator grants access to premium content contingent on a pact.

```json
{
  "pact": {
    "version": "0.1",
    "id": "pact_access_abc",

    "parties": [
      {
        "id": "did:creator:alice",
        "role": "creator"
      },
      {
        "id": "did:subscriber:bob",
        "role": "subscriber"
      }
    ],

    "terms": {
      "description": "Premium course access with completion commitment",

      "acceptance_criteria": [
        "Subscriber completes all 12 course modules",
        "Subscriber submits final project",
        "Completion within 90 days of activation"
      ],

      "context": "This is a \"finish or pay\" model. Subscriber gets free access if they complete the course. If they don't complete, the deposit is retained by the creator."
    },

    "stakes": {
      "type": "composite",
      "details": [
        {
          "type": "escrow",
          "details": {
            "amount": "200",
            "currency": "USDC",
            "release_to": "subscriber",
            "release_on": "fulfilled",
            "release_to_on_breach": "creator"
          }
        },
        {
          "type": "access",
          "details": {
            "resource": "course://advanced-solidity-2025",
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

    "state": "active",

    "metadata": {
      "created_at": "2025-01-10T00:00:00Z",
      "chain": "off-chain"
    }
  }
}
```

---

## Example 4: SLA Monitoring

Automated service-level agreement with programmatic resolution.

```json
{
  "pact": {
    "version": "0.1",
    "id": "pact_sla_xyz",

    "parties": [
      {
        "id": "0xServiceProvider...",
        "role": "provider"
      },
      {
        "id": "0xCustomer...",
        "role": "customer"
      }
    ],

    "terms": {
      "description": "API uptime SLA for Q1 2025",

      "acceptance_criteria": [
        "API uptime >= 99.9% measured monthly",
        "P95 response time <= 200ms",
        "No more than 2 incidents with >5 minute downtime per month"
      ],

      "context": "Monitoring via UptimeRobot and Datadog. Endpoint: https://api.example.com/health. Measurement period: Monthly, evaluated on 1st of following month.",

      "deadline": "2025-04-01T00:00:00Z"
    },

    "stakes": {
      "type": "escrow",
      "details": {
        "amount": "10000",
        "currency": "USDC",
        "schedule": "monthly",
        "breach_penalty": "1000",
        "contract": "0xSLAEscrow..."
      }
    },

    "resolver": {
      "type": "oracle",
      "config": {
        "sources": [
          {
            "name": "uptimerobot",
            "endpoint": "https://api.uptimerobot.com/v2/getMonitors"
          },
          {
            "name": "datadog",
            "endpoint": "https://api.datadoghq.com/api/v1/slo"
          }
        ],
        "evaluation": "automated",
        "frequency": "monthly"
      }
    },

    "state": "active",

    "metadata": {
      "created_at": "2025-01-01T00:00:00Z",
      "chain": "polygon"
    }
  }
}
```

---

## Example 5: Reputation-Only Commitment

A simple commitment with no financial stakes, just reputation.

```json
{
  "pact": {
    "version": "0.1",
    "id": "pact_rep_simple",

    "parties": [
      {
        "id": "alice.eth",
        "role": "promisor"
      },
      {
        "id": "bob.eth",
        "role": "promisee"
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

      "deadline": "2025-01-25T00:00:00Z"
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
        "dispute_escalation": "ai"
      }
    },

    "state": "proposed",

    "metadata": {
      "created_at": "2025-01-20T00:00:00Z",
      "chain": "off-chain"
    }
  }
}
```

---

## Composition Patterns

### Chained Pacts

Pact B activates only when Pact A resolves to "fulfilled":

```json
{
  "pact": {
    "id": "pact_phase_2",
    "terms": {
      "description": "Phase 2: Implementation (contingent on Phase 1 approval)"
    },
    "activation": {
      "requires": [
        {
          "pact_id": "pact_phase_1",
          "outcome": "fulfilled"
        }
      ]
    }
  }
}
```

### Pact-Gated Access

Resource access tied to pact status:

```json
{
  "access_rule": {
    "resource": "private-repo-xyz",
    "condition": {
      "type": "pact_status",
      "pact_id": "pact_contributor_agreement",
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
    "party": "alice.eth",
    "computed_from": {
      "pacts_fulfilled": 47,
      "pacts_breached": 2,
      "pacts_disputed": 3,
      "disputes_won": 2,
      "disputes_lost": 1
    },
    "score": 0.94,
    "last_updated": "2025-01-20T00:00:00Z"
  }
}
```
