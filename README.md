# pact-spec

An open specification for machine-evaluable commitments.

**[Read the spec →](https://bayological.github.io/pact-spec)**

---

## What is Pact?

Pact is a minimal primitive for structuring agreements that require judgment to evaluate.

Smart contracts handle deterministic conditions. Legal contracts handle human interpretation. Pact sits in between: structured enough for machines (including AI) to evaluate, flexible enough for real-world agreements where disputes are possible.

```json
{
   "pact": {
      "version": "0.2",
      "parties": [
         { "id": "0xClient...", "role": "client" },
         { "id": "0xProvider...", "role": "provider" }
      ],
      "terms": {
         "description": "Design a logo",
         "acceptance_criteria": [
            "Delivers 3 distinct concepts",
            "Includes source files",
            "One round of revisions"
         ]
      },
      "resolver": {
         "type": "ai",
         "endpoint": "https://resolver.example.com"
      }
   }
}
```

## Why Pact?

| System          | Handles                        |
| --------------- | ------------------------------ |
| Smart Contracts | Deterministic conditions       |
| Cicero/Accord   | Computable legal logic         |
| **Pact**        | Judgment-requiring commitments |

If your criteria are fully computable, use a smart contract. If they require interpretation, "deliver quality work", "complete the feature", "act in good faith", use Pact.

## Spec Contents

- [Overview](https://bayological.github.io/pact-spec) — What Pact is and why
- [Specification](https://bayological.github.io/pact-spec/specification) — Full schema
- [Examples](https://bayological.github.io/pact-spec/examples) — Concrete pacts
- [Resolvers](https://bayological.github.io/pact-spec/resolvers) — How arbitration works

## Run Locally

```bash
# Clone
git clone https://github.com/bayological/pact-spec.git
cd pact-spec

# Install
npm install

# Dev server
npm run dev

# Build static site
npm run build

# Preview build
npx serve out
```

## Deploy

The site is a static Next.js export. To deploy to GitHub Pages:

```bash
npm run build
```

Then push the `out/` directory to the `gh-pages` branch, or use the included GitHub Action.

## Status

**Current version:** 0.1.0-draft

This is an early-stage specification. Feedback is welcome.

## Contributing

Feedback, issues, and PRs welcome.

1. Open an issue to discuss changes
2. Fork and create a branch
3. Submit a PR with a clear description

## Related Work

- [Ricardian Contracts](https://en.wikipedia.org/wiki/Ricardian_contract) — Legal prose + cryptographic hashes
- [Accord Project / Cicero](https://accordproject.org/) — Computable legal contracts

## License

[MIT](./LICENSE)
