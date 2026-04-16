# rac-syntax

Syntax highlighting packages for [RAC (Rules as Code)](https://rules.foundation) and related languages for encoding law.

Part of [The Axiom Foundation](https://rules.foundation) Rules Foundation tooling.

## Packages

This monorepo ships three packages:

| Package | Description |
| --- | --- |
| [`prism-rac`](./packages/prism-rac) | Prism.js grammar for the RAC DSL |
| [`prism-catala`](./packages/prism-catala) | Prism.js grammar for [Catala](https://catala-lang.org), a literate programming language for law |
| [`vscode-rac`](./packages/vscode-rac) | VS Code extension providing syntax highlighting and file icons for `.rac` files |

Each package has its own README with install and usage details.

## Repository layout

```
rac-syntax/
├── packages/
│   ├── prism-rac/        # Prism.js grammar for RAC
│   ├── prism-catala/     # Prism.js grammar for Catala
│   └── vscode-rac/       # VS Code extension for RAC
├── package.json          # bun workspaces root
└── tsconfig.json
```

Bun workspaces drive the build and test commands:

```bash
bun install
bun run test     # runs vitest (prism-*) and bun test (vscode-rac)
bun run build    # builds prism-rac and prism-catala via tsup
bun run lint     # tsc --noEmit for typed packages
```

## Keeping packages in sync

The RAC language is defined in three places:

1. **`packages/prism-rac/src/index.ts`** — canonical keyword and token list
2. **`packages/vscode-rac/syntaxes/rac.tmLanguage.json`** — TextMate grammar used by VS Code
3. Any downstream consumer that bundles Prism.js (`rules.foundation`, docs sites, etc.)

When the RAC language evolves, update `prism-rac` first, then mirror the change into the VS Code TextMate grammar. Tests in both packages should be extended to cover the new tokens. There is currently no single-source code generation step — this is a deliberate trade-off (see the `CONTRIBUTING.md` file for background).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local setup, test conventions, and the policy on coverage thresholds.

## License

[MIT](./LICENSE).
