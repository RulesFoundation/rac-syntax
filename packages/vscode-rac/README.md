# RAC — Rules as Code (VS Code extension)

Syntax highlighting and file icons for [RAC (Rules as Code)](https://rules.foundation) files in VS Code.

Part of [The Axiom Foundation](https://rules.foundation) Rules Foundation tooling.

## Install

### From the Marketplace

Search for "RAC - Rules as Code" in the VS Code Extensions view, or install from the command line:

```bash
code --install-extension rulesfoundation.vscode-rac
```

### From a `.vsix` package

```bash
cd packages/vscode-rac
bun run package          # produces vscode-rac-<version>.vsix
code --install-extension vscode-rac-<version>.vsix
```

## Features

- **Syntax highlighting** for `.rac` files via a TextMate grammar (`syntaxes/rac.tmLanguage.json`)
- **Language configuration** for comments (`#`, `//`), brackets, and auto-closing pairs
- **File icons** (light and dark variants) for `.rac` files in the VS Code file explorer
- **Example files** included in the `examples/` directory:
  - `niit.rac` — Net Investment Income Tax (IRC §1411)
  - `snap.rac` — Supplemental Nutrition Assistance Program eligibility

## Screenshots

<!-- Screenshots of highlighted .rac files in light and dark themes go here. -->
<!-- TODO: add ./screenshots/light.png and ./screenshots/dark.png -->

## Keeping in sync with other packages

This extension ships its own TextMate grammar in `syntaxes/rac.tmLanguage.json`. The canonical RAC keyword list lives in [`prism-rac/src/index.ts`](../prism-rac/src/index.ts). When adding language features, update both grammars together — see the [root README](../../README.md) for details.

## License

MIT. See [LICENSE](../../LICENSE).
