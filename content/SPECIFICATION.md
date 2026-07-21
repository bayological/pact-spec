# Pact Specification

**Version:** 0.2.0-draft

The key words "MUST", "MUST NOT", "REQUIRED", "SHOULD", "SHOULD NOT", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

---

## Overview

A pact is a signed data structure representing a commitment between parties, with defined terms, stakes, and a designated resolution mechanism.

This document defines:

1. The pact schema and field semantics
2. Canonical serialization and hashing
3. Signatures and party acceptance
4. The lifecycle state machine, including the optimistic resolution path
5. Stake semantics
6. Resolution and appeals

A machine-validatable [JSON Schema](https://github.com/bayological/pact-spec/blob/main/schema/pact.schema.json) accompanies this document. A pact instance MUST validate against it.

---

## Identifiers and Versioning

- `pact.id` MUST be a [ULID](https://github.com/ulid/spec) prefixed with `pact_` (e.g. `pact_01HXYZ123456789ABCDEFGHJKM`). ULIDs are sortable by creation time and collision-resistant without coordination.
- `pact.version` MUST be the spec version the instance conforms to, as `MAJOR.MINOR` (e.g. `"0.2"`).
- The specification itself follows semantic versioning. Breaking schema changes increment the major version.

---

## Schema

### Core Structure

```json
{
  "pact": {
    "version": "0.2",
    "id": "pact_01HXYZ123456789ABCDEFGHJKM",

    "parties": [
      {
        "id": "string",
        "role": "string",
        "scheme": "eip155 | did | email"
      }
    ],

    "terms": {
      "description": "string",
      "acceptance_criteria": ["string"],
      "context": "string",
      "attachments": [
        {
          "hash": "string",
          "uri": "string",
          "type": "string",
          "description": "string"
        }
      ],
      "deadline": "timestamp"
    },

    "stakes": {
      "type": "escrow | reputation | access | composite",
      "details": {}
    },

    "resolver": {
      "type": "ai | human | dao | oracle | peer | hybrid",
      "endpoint": "string",
      "config": {}
    },

    "resolution_policy": {
      "mode": "optimistic | direct",
      "challenge_window": "duration",
      "resolution_timeout": "duration",
      "appeal": {
        "resolver": {},
        "window": "duration",
        "max_rounds": 1
      }
    },

    "state": "proposed | active | asserted | disputed | resolved | expired | cancelled",

    "signatures": [
      {
        "party": "string",
        "scheme": "eip712 | eip1271 | jws",
        "commitment_hash": "string",
        "signature": "string",
        "signed_at": "timestamp"
      }
    ],

    "evidence": [
      {
        "party": "string",
        "hash": "string",
        "uri": "string",
        "type": "string",
        "description": "string",
        "submitted_at": "timestamp"
      }
    ],

    "resolutions": [
      {
        "round": 0,
        "outcome": "fulfilled | breached | partial | void | indeterminate",
        "reasoning": "string",
        "criteria_evaluation": [],
        "disposition": {},
        "resolved_by": "string",
        "resolved_at": "timestamp",
        "final": false
      }
    ],

    "metadata": {
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "chain": "string",
      "contract_address": "string"
    }
  }
}
```

### Required Fields

| Field | Required | Notes |
|-------|----------|-------|
| `version`, `id` | REQUIRED | See Identifiers |
| `parties` | REQUIRED | At least two entries, or one plus an `open` slot |
| `terms.description` | REQUIRED | One-line summary |
| `terms.acceptance_criteria` | REQUIRED | At least one criterion |
| `terms.deadline` | REQUIRED | RFC 3339 UTC timestamp |
| `stakes` | REQUIRED | Use `reputation` for stake-free social commitments |
| `resolver` | REQUIRED | Agreed before activation |
| `resolution_policy` | REQUIRED | See Lifecycle for defaults |
| `state` | REQUIRED | |
| `signatures` | REQUIRED once `state != proposed` | One per non-open party |
| `terms.context`, `terms.attachments`, `evidence`, `resolutions`, `metadata` | OPTIONAL | |

All timestamps MUST be RFC 3339 UTC (`2026-02-15T00:00:00Z`). All durations MUST be ISO 8601 (`P3D`, `PT72H`).

### Party Identifiers

`parties[].id` MUST be one of:

- **`eip155`** — a [CAIP-10](https://chainagnostic.org/CAIPs/caip-10) account ID (`eip155:8453:0xAbc...`). Bare `0x` addresses are NOT permitted: without a chain reference, signatures and escrow references are ambiguous across chains.
- **`did`** — a [DID](https://www.w3.org/TR/did-core/) (`did:key:z6Mk...`, `did:web:agent.example.com`). This is the RECOMMENDED scheme for AI agents; implementations targeting agent-to-agent commerce SHOULD support [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) agent identifiers expressed as DIDs or CAIP-10 accounts.
- **`email`** — a mailto URI, for consumer-facing deployments where a platform custodies keys. Platforms using this scheme MUST maintain an auditable mapping from the email identity to the key that actually signs.

The literal id `"open"` designates an unfilled slot (e.g. a bounty hunter). A pact with an open slot MAY activate; the slot is filled when a party signs into it (see Signatures).

---

## Canonical Serialization and Hashing

Machine evaluation requires that all parties agree on exactly which bytes they committed to.

- The **canonical form** of a pact object is its [RFC 8785 (JCS)](https://www.rfc-editor.org/rfc/rfc8785) serialization.
- The **commitment hash** is defined as:

```
commitment_hash = sha256(JCS({ version, id, parties, terms, stakes, resolver, resolution_policy }))
```

Mutable fields — `state`, `signatures`, `evidence`, `resolutions`, `metadata` — are excluded from the commitment hash. Everything the parties are agreeing to is inside it.

- The commitment hash MUST be encoded as `sha256:<lowercase-hex>`.
- Any change to a committed field after any party has signed produces a different commitment hash and therefore a different pact. Amendment of an active pact is out of scope for core (see Extensions); the base rule is: **committed fields are immutable**.
- `attachments[].hash` MUST be the sha256 of the attachment content. Attachments and evidence are committed **by hash**; the URI is only a retrieval hint (see Security Considerations).

---

## Signatures and Acceptance

A pact is a commitment only insofar as it is signed. Each non-open party MUST produce a signature over the commitment hash.

### Signature Schemes

| Scheme | For | Payload |
|--------|-----|---------|
| `eip712` | EOA wallets (`eip155` ids) | [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data, domain `{ name: "pact", version: "0.2", chainId }`, message `{ commitmentHash, partyId, role }` |
| `eip1271` | Contract wallets / smart accounts | As `eip712`, verified via [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271) `isValidSignature` |
| `jws` | DID parties | Compact [JWS](https://www.rfc-editor.org/rfc/rfc7515) over `{ commitment_hash, party_id, role, signed_at }`, verification key resolved from the DID document |

Binding `partyId` and `role` into the signed payload prevents a signature from being replayed into a different slot of the same pact. Binding `chainId` (via the EIP-712 domain) prevents cross-chain replay.

### Acceptance Rules

- A pact in `proposed` becomes `active` when every non-open party's signature over the current commitment hash is present and valid, and stakes are funded.
- A party signs into an `open` slot by producing a signature carrying its own id and the open slot's role. The first valid signature fills the slot; implementations MUST reject later attempts.
- A signature whose `commitment_hash` does not match the pact is invalid.
- Verifiers MUST validate signatures before acting on any state transition, escrow operation, or resolution.

---

## Terms

The `terms` object is the heart of a pact. It must balance human readability with machine evaluability.

### Acceptance Criteria

Discrete conditions a resolver checks. They should be:

- **Specific** — Clear enough that two reasonable parties would agree on whether each is met
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

Criteria are referenced elsewhere (partial release, criteria evaluation) **by array index**.

### Context

Freeform information that helps interpret the criteria but isn't directly evaluated — background, preferences, nuance.

`context` is authored by the pact creator and is inside the commitment: the counterparty accepts it by signing. Resolvers MUST treat it as interpretive guidance for the criteria, never as instructions to the resolver (see the threat model in [Resolvers](/resolvers)).

### Attachments

References to external materials, committed by content hash:

```json
{
  "attachments": [
    {
      "hash": "sha256:a1b2c3...",
      "uri": "ipfs://Qm...",
      "type": "image",
      "description": "Mood board with style references"
    }
  ]
}
```

---

## Stakes

What's at risk when the pact resolves.

### Escrow

```json
{
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
      },
      "partial_release": [
        { "criteria": [0], "fraction": "0.25" },
        { "criteria": [0, 1, 2, 3, 4], "fraction": "1.0" }
      ]
    }
  }
}
```

Semantics:

- `asset` is a [CAIP-19](https://chainagnostic.org/CAIPs/caip-19) asset ID. `amount` is an integer string in the asset's base units — no decimals ambiguity (`500000000` = 500 USDC at 6 decimals).
- `funder` and `beneficiary` reference party **roles**.
- The escrow MUST be funded before the pact activates. Implementations MUST verify funding as an activation precondition alongside signatures.
- `disposition` maps every outcome to a distribution. Fractions per recipient MUST sum to 1.0. The value `"resolver"` delegates the split to the resolution's `disposition` field, constrained by `partial_release` when present.
- `partial_release` maps sets of satisfied criteria (by index into `acceptance_criteria`) to release fractions. A resolver producing a `partial` outcome MUST reference the matching entry in its reasoning.
- Resolver and protocol fees, if any, MUST appear inside `disposition` as recipients (e.g. `"resolver_fee": "0.02"`) so the full distribution is visible at signing time.

### Reputation

```json
{
  "stakes": {
    "type": "reputation",
    "details": {
      "system": "pact-reputation-v1",
      "weight": 1.0,
      "public": true
    }
  }
}
```

Reputation stakes make outcome history attributable to party identities. Implementations SHOULD emit resolutions as verifiable attestations (e.g. [EAS](https://attest.org)) so reputation is portable across platforms rather than siloed in one marketplace.

### Access

```json
{
  "stakes": {
    "type": "access",
    "details": {
      "resource": "course://advanced-solidity-2026",
      "grant_on": "active",
      "revoke_on": "breached"
    }
  }
}
```

`grant_on` and `revoke_on` reference pact states or resolution outcomes.

### Composite

Stakes can be combined:

```json
{
  "stakes": {
    "type": "composite",
    "details": [
      { "type": "escrow", "details": { "...": "..." } },
      { "type": "reputation", "details": { "...": "..." } }
    ]
  }
}
```

---

## Lifecycle

### States

```
                      ┌────────────┐
 proposed ──────────► │   active   │ ─────────► expired
    │                 └─────┬──────┘   (deadline, no assertion)
    │                       │
    ▼                       │ a party asserts an outcome
 cancelled                  ▼
                      ┌────────────┐  challenge window elapses
                      │  asserted  │ ─────────────────────────► resolved
                      └─────┬──────┘        (as asserted)
                            │ any party challenges
                            ▼
                      ┌────────────┐  resolver returns outcome
                      │  disputed  │ ─────────────────────────► resolved
                      └────────────┘  (appealable per policy)
```

| State | Meaning |
|-------|---------|
| `proposed` | Created; not yet signed by all parties |
| `active` | All signatures valid, stakes funded; execution in progress |
| `asserted` | A party has asserted an outcome with evidence; challenge window open (optimistic mode) |
| `disputed` | A party has challenged, or `mode: direct` evaluation is in progress |
| `resolved` | Binding outcome recorded; stakes disposed |
| `expired` | Deadline passed with no assertion; disposed as `breached` unless the parties mutually void |
| `cancelled` | Withdrawn before activation, or voided by mutual signed consent while active |

### Transition Authorization

| Transition | Who may trigger |
|------------|-----------------|
| `proposed → active` | Automatic when all signatures present and stakes funded |
| `proposed → cancelled` | The proposer, unilaterally |
| `active → asserted` | Any party, by submitting an assertion with evidence |
| `active → expired` | Anyone, after `terms.deadline` |
| `asserted → resolved` | Automatic when `challenge_window` elapses unchallenged |
| `asserted → disputed` | Any party, within the challenge window |
| `disputed → resolved` | The designated resolver only |
| `active → cancelled` | All parties, by mutual signed consent |

### Resolution Policy

```json
{
  "resolution_policy": {
    "mode": "optimistic",
    "challenge_window": "P3D",
    "resolution_timeout": "P7D",
    "appeal": {
      "resolver": { "type": "human", "endpoint": "https://arbitration.example.com" },
      "window": "P3D",
      "max_rounds": 1
    }
  }
}
```

- **`optimistic`** (RECOMMENDED default) — the resolver is invoked only on challenge. The happy path costs nothing: assert, wait out the window, resolve. This shrinks the trusted-resolver surface to disputes only.
- **`direct`** — every pact goes to the resolver for evaluation. Appropriate for oracle-checked SLAs, or wherever parties want a neutral record regardless of agreement.
- **`resolution_timeout`** — if the resolver fails to produce a resolution within this duration of a dispute being raised, any party MAY escalate to the appeal resolver; if none is configured, the outcome defaults to `indeterminate`. This bounds the worst case: **stakes can never be locked indefinitely by an unresponsive resolver.**
- An `indeterminate` disposition defaults to returning escrow to the funder unless `disposition` says otherwise. Choose this default deliberately.

### Appeals

- Each resolution is appended to `resolutions[]` with an incrementing `round`.
- A non-final resolution MAY be appealed by any party within `appeal.window`, at most `appeal.max_rounds` times, to the configured appeal resolver.
- The binding resolution is the one with the highest round, or the first marked `final: true`. Stake disposition MUST occur only on the binding resolution.
- Appeal resolvers SHOULD be of a different type than the original (e.g. AI first, human panel on appeal).

---

## Resolution Object

```json
{
  "round": 0,
  "outcome": "partial",
  "reasoning": "Criteria 0 and 1 met; criterion 2 (delivery within 14 days) missed by 2 days. Disposition per partial_release entry for criteria [0].",
  "criteria_evaluation": [
    { "criterion": 0, "met": true, "confidence": 0.95, "notes": "..." },
    { "criterion": 1, "met": true, "confidence": 0.90, "notes": "..." },
    { "criterion": 2, "met": false, "confidence": 0.99, "notes": "..." }
  ],
  "disposition": { "beneficiary": "0.25", "funder": "0.75" },
  "resolved_by": "resolver.pact.example",
  "resolved_at": "2026-02-17T12:00:00Z",
  "final": false
}
```

| Outcome | Meaning |
|---------|---------|
| `fulfilled` | All acceptance criteria met |
| `breached` | One or more criteria clearly not met |
| `partial` | Some criteria met; disposition per `partial_release` |
| `void` | Pact cannot be meaningfully evaluated (force majeure, mutual fault) |
| `indeterminate` | Evidence insufficient to judge; disposition per policy default |

`criteria_evaluation[].criterion` is the index into `terms.acceptance_criteria`. Resolvers MUST evaluate every criterion. The full resolver interface — request/response format, confidence scores, error codes — is defined in [Resolvers](/resolvers).

---

## On-Chain Considerations

For on-chain implementations:

1. **Commit the hash on-chain** — store `commitment_hash`; keep full content off-chain or encrypted. The chain needs the hash, parties, stakes, state, and resolutions — not the prose.
2. **Enforce the state machine in the contract** — transitions, authorization, the challenge window, and the resolution timeout belong in code, not goodwill.
3. **Events** — emit an event for every state transition and resolution round.
4. **Domain separation** — signatures carry `chainId` via the EIP-712 domain; the escrow contract MUST verify it is the contract referenced in the committed stakes.

```solidity
interface IPact {
    enum State { Proposed, Active, Asserted, Disputed, Resolved, Expired, Cancelled }
    enum Outcome { Fulfilled, Breached, Partial, Void, Indeterminate }

    function propose(bytes32 commitmentHash, address[] calldata parties, address resolver) external returns (uint256 pactId);
    function accept(uint256 pactId, bytes calldata signature) external;
    function assertOutcome(uint256 pactId, Outcome outcome, bytes32 evidenceHash) external;
    function challenge(uint256 pactId, bytes32 evidenceHash) external;
    function resolve(uint256 pactId, Outcome outcome, uint16[] calldata criteriaMet, string calldata reasoning) external; // designated resolver only
    function claimExpired(uint256 pactId) external;   // after deadline, no assertion
    function claimTimeout(uint256 pactId) external;   // resolver missed resolution_timeout

    event StateChanged(uint256 indexed pactId, State from, State to);
    event Resolved(uint256 indexed pactId, uint8 round, Outcome outcome, address resolver);
}
```

---

## Privacy

Commercial terms are sensitive. Because pacts commit by hash:

- Full pact content MAY be stored encrypted, with keys shared among the parties and released to the resolver on dispute.
- The public record needs only hashes, states, outcomes, and reasoning summaries.
- Implementations SHOULD NOT put plaintext terms in public storage (IPFS, chains) by default.

---

## Security Considerations

- **Canonicalization is load-bearing.** Verify signatures against the JCS form only. Accepting near-miss serializations reintroduces hash ambiguity.
- **Replay.** Party id, role, and chain are bound into every signature; verifiers MUST check all three.
- **Mutable evidence.** A URI is a hint; the hash is the evidence. Resolvers MUST NOT evaluate content whose hash does not match the submitted hash, and MUST NOT fetch live, unpinned URLs as evidence.
- **Adversarial evidence and prompt injection** (AI resolvers): see the threat model in [Resolvers](/resolvers).
- **Resolver incentives.** Optimistic mode, appeals, resolution timeouts, and staked resolvers each remove a class of failure; high-stakes pacts SHOULD use all four. Dispute-market design has substantial prior art — [Kleros](https://kleros.io), [UMA's optimistic oracle](https://uma.xyz), [Reality.eth](https://reality.eth.limo) — and Pact deliberately standardizes the commitment format while delegating dispute-market mechanics to resolvers.

---

## Extensions

The core schema is intentionally minimal. Extensions can add:

- **Milestones** — multi-phase pacts with staged deadlines and releases
- **Amendments** — a mutual re-signing flow producing a superseding pact that references its predecessor's `commitment_hash`
- **Templates** — reusable structures for common agreement types
- **Reputation scoring** — algorithms over resolution attestations
- **Legal bridge** — Ricardian-style pairing of a pact with an enforceable legal document sharing the same commitment hash

---

## Changelog

### 0.2.0-draft

- Added canonical serialization (RFC 8785 JCS) and the commitment hash
- Added the signature envelope (EIP-712 / EIP-1271 / JWS) and acceptance rules
- Added optimistic resolution mode with challenge window
- Added `asserted`, `expired`, and `cancelled` states, plus a transition-authorization table
- Added `resolution_timeout` — stakes can no longer be locked by an unresponsive resolver
- Added appeals: `resolutions[]` rounds with a binding-resolution rule
- Added the `indeterminate` outcome (aligns spec with the resolver interface)
- Defined escrow semantics: CAIP-19 assets, base-unit amounts, funding as activation precondition, full disposition map, indexed partial release
- Defined party identifier schemes (CAIP-10 / DID / email); removed bare `0x` addresses
- Registered `peer` and `hybrid` resolver types
- Added privacy and security considerations
- Published the JSON Schema

### 0.1.0-draft

- Initial sketch
