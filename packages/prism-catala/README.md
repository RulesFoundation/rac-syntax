# prism-catala

[Prism.js](https://prismjs.com/) syntax highlighting for [Catala](https://catala-lang.org) — a literate programming language for law developed by DGFIP and Inria.

Part of [The Axiom Foundation](https://rules.foundation) Rules Foundation tooling.

## Install

```bash
bun add prism-catala prismjs
# or: npm install prism-catala prismjs
```

## Usage

Import the package to register the `catala` language with Prism at module load time:

```ts
import Prism from 'prismjs'
import 'prism-catala'

const code = `declaration scope IncomeTax:
  input gross_income content money
  output tax content money

scope IncomeTax:
  definition tax equals gross_income * 20%
`

const html = Prism.highlight(code, Prism.languages.catala, 'catala')
```

You can also import the grammar directly and register it yourself:

```ts
import { catalaGrammar } from 'prism-catala'
import Prism from 'prismjs'

Prism.languages.catala = catalaGrammar
```

A dark theme CSS file is included:

```ts
import 'prism-catala/themes/dark.css'
```

## Supported tokens

The grammar recognises:

- **Keywords**: `scope`, `definition`, `rule`, `under condition`, `consequence`, `assertion`, `equals`, `if`, `then`, `else`, `match`, `with pattern`, `for`, `let`, `in`, `not`, `and`, `or`, `true`, `false`, `content`, `struct`, `enum`, `declaration`, `context`, `input`, `output`, `internal`, `state`, `condition`, `fulfilled`, `sum`, `exists`, `among`, `such that`, `fixed by`
- **Types**: `money`, `decimal`, `integer`, `boolean`, `date`, `duration`, `collection`
- **Document structure**: `@@Title@@`, `@Section@`
- Scope declarations, strings, numbers, percentages, operators, and comments (`#` line and `/* */` block)

Recognised file extensions: `.catala_en`, `.catala_fr`.

## Versioning

This package follows semantic versioning. Minor bumps for additive grammar changes; major bumps for breaking token-class renames. The grammar tracks the upstream [Catala language](https://github.com/CatalaLang/catala) loosely — upstream changes are integrated as needed rather than automatically.

## Keeping in sync

This repo also ships [`prism-rac`](../prism-rac) and [`vscode-rac`](../vscode-rac). See the [root README](../../README.md) for notes on keeping grammar definitions in sync across packages.

## License

MIT. See [LICENSE](../../LICENSE).
