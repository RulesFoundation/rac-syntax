# prism-rulespec

[Prism.js](https://prismjs.com/) syntax highlighting for RuleSpec — a YAML-structured DSL with Python-like formula expressions used to encode tax and benefit statutes.

Part of [The Axiom Foundation](https://axiom-foundation.org) Axiom Foundation tooling.

## Install

```bash
bun add prism-rulespec prismjs
# or: npm install prism-rulespec prismjs
```

## Usage

Import the package to register the `rulespec` language with Prism at module load time:

```ts
import Prism from 'prismjs'
import 'prism-rulespec'

const code = `module: income_tax
version: 2024

function:
  name: taxable_income
  period: Year
  dtype: Money
`

const html = Prism.highlight(code, Prism.languages.rulespec, 'rulespec')
```

You can also import the grammar directly if you prefer to register it yourself:

```ts
import { rulespecGrammar } from 'prism-rulespec'
import Prism from 'prismjs'

Prism.languages.rulespec = rulespecGrammar
```

A dark theme CSS file is included and can be loaded alongside Prism's own themes:

```ts
import 'prism-rulespec/themes/dark.css'
```

## Supported tokens

The grammar recognises the following token classes:

- **Section keywords**: `text`, `enum`, `function`, `versions`, `module`, `version`, `jurisdiction`, `import`, `references`
- **Attribute keys**: `description`, `unit`, `source`, `reference`, `entity`, `period`, `dtype`, `label`, `default`, `name`, `metadata`, `enacted_by`, `reverts_to`, `parameters`, `threshold`, `cap`, `defined_for`, `private`, `internal`, `imports`
- **Formula keywords**: `if`, `else`, `elif`, `return`, `for`, `break`, `and`, `or`, `not`, `in`, `as`, `True`, `False`, `None`, `let`, `match`, `case`, `from`
- **Builtins**: `max`, `min`, `abs`, `round`, `sum`, `len`, `interpolate`
- **Entity types**: `Person`, `TaxUnit`, `Household`, `Family`, `SPMUnit`
- **Period types**: `Year`, `Month`, `Day`, `Instant`
- **Data types**: `Money`, `Rate`, `Boolean`, `Integer`, `String`, `USD`
- Statute text blocks (`"""..."""`), import paths (`26/32#eitc`), dates (`YYYY-MM-DD`), strings, numbers, percentages, booleans, operators, and comments (`#` and `//`)

## Versioning

The RuleSpec grammar evolves alongside the [RuleSpec DSL](https://github.com/TheAxiomFoundation/rulespec). This package follows semantic versioning, with minor bumps for additive grammar changes and major bumps for breaking token-class renames.

## Keeping in sync

This repo also ships [`prism-catala`](../prism-catala) and [`vscode-rulespec`](../vscode-rulespec). The canonical RuleSpec keyword list lives in [`src/index.ts`](./src/index.ts). When adding keywords, update the VS Code TextMate grammar in `packages/vscode-rulespec/syntaxes/rulespec.tmLanguage.json` as well.

## License

MIT. See [LICENSE](../../LICENSE).
