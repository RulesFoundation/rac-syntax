# RuleSpec VS Code Extension

Syntax highlighting and file icons for [RuleSpec](https://axiom-foundation.org) files in VS Code.

Part of [The Axiom Foundation](https://axiom-foundation.org) tooling.

## Install

### From the Marketplace

Search for "RuleSpec" in the VS Code Extensions view, or install from the command line:

```bash
code --install-extension axiomfoundation.vscode-rulespec
```

### From a `.vsix` package

```bash
cd packages/vscode-rulespec
bun run package          # produces vscode-rulespec-<version>.vsix
code --install-extension vscode-rulespec-<version>.vsix
```

## Features

- **Syntax highlighting** for `.rulespec` files via a TextMate grammar (`syntaxes/rulespec.tmLanguage.json`)
- **Language configuration** for comments (`#`, `//`), brackets, and auto-closing pairs
- **File icons** (light and dark variants) for `.rulespec` files in the VS Code file explorer
- **Example files** included in the `examples/` directory:
  - `niit.rulespec.yaml` — Net Investment Income Tax (IRC §1411)
  - `snap.rulespec.yaml` — Supplemental Nutrition Assistance Program eligibility

## Screenshots

<!-- Screenshots of highlighted .rulespec files in light and dark themes go here. -->
<!-- TODO: add ./screenshots/light.png and ./screenshots/dark.png -->

## Keeping in sync with other packages

This extension ships its own TextMate grammar in `syntaxes/rulespec.tmLanguage.json`. The canonical RuleSpec keyword list lives in [`prism-rulespec/src/index.ts`](../prism-rulespec/src/index.ts). When adding language features, update both grammars together — see the [root README](../../README.md) for details.

## License

MIT. See [LICENSE](../../LICENSE).
