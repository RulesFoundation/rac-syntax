# rulespec-syntax

Syntax highlighting packages for [RuleSpec](https://axiom-foundation.org) and related languages for encoding law.

Part of [The Axiom Foundation](https://axiom-foundation.org) Axiom Foundation tooling.

## Packages

This monorepo ships three packages:

| Package | Description |
| --- | --- |
| [`prism-rulespec`](./packages/prism-rulespec) | Prism.js grammar for the RuleSpec DSL |
| [`prism-catala`](./packages/prism-catala) | Prism.js grammar for [Catala](https://catala-lang.org), a literate programming language for law |
| [`vscode-rulespec`](./packages/vscode-rulespec) | VS Code extension providing syntax highlighting and file icons for `.rulespec` files |

Each package has its own README with install and usage details.

## Repository layout

```
rulespec-syntax/
├── packages/
│   ├── prism-rulespec/        # Prism.js grammar for RuleSpec
│   ├── prism-catala/     # Prism.js grammar for Catala
│   └── vscode-rulespec/       # VS Code extension for RuleSpec
├── package.json          # bun workspaces root
└── tsconfig.json
```

Bun workspaces drive the build and test commands:

```bash
bun install
bun run test     # runs vitest (prism-*) and bun test (vscode-rulespec)
bun run build    # builds prism-rulespec and prism-catala via tsup
bun run lint     # tsc --noEmit for typed packages
```

## Keeping packages in sync

The RuleSpec language is defined in three places:

1. **`packages/prism-rulespec/src/index.ts`** — canonical keyword and token list
2. **`packages/vscode-rulespec/syntaxes/rulespec.tmLanguage.json`** — TextMate grammar used by VS Code
3. Any downstream consumer that bundles Prism.js (`axiom-foundation.org`, docs sites, etc.)

When the RuleSpec language evolves, update `prism-rulespec` first, then mirror the change into the VS Code TextMate grammar. Tests in both packages should be extended to cover the new tokens. There is currently no single-source code generation step — this is a deliberate trade-off (see the `CONTRIBUTING.md` file for background).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local setup, test conventions, and the policy on coverage thresholds.

## License

[MIT](./LICENSE).
