# Pact

A minimal primitive for machine-evaluable commitments.

---

## What is a Pact?

A **pact** is a structured commitment between parties that can be evaluated by external resolvers—human, AI, or programmatic.

Pacts are not smart contracts. Smart contracts encode deterministic conditions: "if X, then Y." Pacts encode *judgment-requiring* commitments: "if a resolver determines X was satisfied, then Y."

This makes pacts suitable for agreements that involve ambiguity, interpretation, or subjective evaluation—things traditional smart contracts can't handle.

---

## Why a Primitive?

Existing building blocks don't cover this:

| Mechanism | Conditions | Enforcement |
|-----------|------------|-------------|
| Legal contract | Human-interpretable | Human-enforced |
| Smart contract | Code-deterministic | Code-enforced |
| **Pact** | Machine-evaluable | Resolver-adjudicated |

A pact sits in the gap: structured enough for machines to evaluate, flexible enough for real-world agreements.

---

## Design Principles

1. **Minimal** — A pact is just a commitment structure. Resolution, enforcement, and storage are separate concerns.

2. **Resolver-agnostic** — Any resolver can evaluate a pact. AI, human panel, DAO vote, oracle. The pact doesn't care.

3. **Composable** — Pacts can trigger transfers, gate access, accrue reputation, or chain to other pacts.

4. **Portable** — A pact can live on-chain, off-chain, or hybrid. The spec doesn't mandate infrastructure.

---

## When to Use Pact

Pact is for commitments where **reasonable parties might disagree** on whether terms were satisfied.

**Use Pact when:**
- Criteria require interpretation ("deliver quality work", "complete the feature")
- Success is subjective or context-dependent
- Evidence needs to be evaluated by a human or AI judge
- Disputes are possible and arbitration may be needed
- You need structured agreements but can't reduce them to pure code

**Don't use Pact when:**
- Conditions are fully deterministic ("transfer X when block Y is mined")
- Success can be verified by on-chain data alone
- No interpretation is needed — a smart contract will do

```
Fully Deterministic              Fully Subjective
(Smart contracts)                (Legal system)
        │                              │
        │      ┌────────────┐          │
        └──────│    PACT    │──────────┘
               │            │
               │ Structured │
               │    for     │
               │ judgment   │
               └────────────┘
```

If your conditions are computable, use a smart contract or a system like Cicero. Pact exists for everything that requires judgment.

---

## Use Cases

- Freelance work agreements with AI arbitration
- Bounties with fuzzy success criteria
- Service-level agreements with automated monitoring
- Reputation systems based on commitment history
- Conditional access or content gating
- Milestone-based funding releases

---

## Related Work

Pact builds on ideas from existing structured agreement formats, but targets a different layer.

### Ricardian Contracts

Ricardian contracts link human-readable legal prose to machine-referenceable parameters via cryptographic hashes. They're designed for legal enforceability with cryptographic integrity.

**Difference:** Ricardian contracts focus on representing legal agreements. Pact focuses on structuring agreements for evaluation by resolvers (human or AI), not legal systems.

### Accord Project / Cicero

Cicero defines smart legal contract templates where clauses are bound to data models and executable logic (using the Ergo DSL). Contracts can be computed and validated systematically.

**Difference:** Cicero makes contracts computable. Pact explicitly handles agreements that *can't* be fully computed — where criteria require interpretation. If your logic is deterministic, use Cicero.

### Smart Contracts

Traditional smart contracts (Solidity, etc.) encode deterministic conditions: "if X, then Y." They execute automatically based on on-chain state.

**Difference:** Smart contracts can't handle ambiguity. "Deliver 3 distinct logo concepts" isn't computable. Pact structures these judgment-requiring commitments for external resolution.

### How Pact Differs

| System | Layer | Handles |
|--------|-------|---------|
| Smart Contracts | Execution | Deterministic conditions |
| Cicero/Accord | Execution | Computable legal logic |
| Ricardian | Representation | Legal prose + parameters |
| **Pact** | Arbitration | Judgment-requiring commitments |

Pact is not a replacement for these systems — it's complementary. Use smart contracts for deterministic triggers, Cicero for computable clauses, and Pact for everything that needs a judge.

---

## Get Started

- [Specification](/pact-spec/specification) — The complete schema
- [Examples](/pact-spec/examples) — Concrete pact instances
- [Resolvers](/pact-spec/resolvers) — How resolution works

---

## Contributing

This is an open specification. Feedback, issues, and PRs welcome.

[GitHub →](https://github.com/bayological/pact-spec)

---

## License

MIT
