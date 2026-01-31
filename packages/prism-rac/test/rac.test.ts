import { describe, it, expect, beforeAll } from 'vitest'
import Prism from 'prismjs'

// Import the grammar registration side effect
import '../src/index'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type PrismToken = Prism.Token | string

/**
 * Flatten nested Prism token arrays into a flat list of { type, content } objects.
 * String tokens get type "plain".
 */
function flattenTokens(tokens: PrismToken[]): Array<{ type: string; content: string }> {
  const result: Array<{ type: string; content: string }> = []
  for (const token of tokens) {
    if (typeof token === 'string') {
      if (token.trim()) {
        result.push({ type: 'plain', content: token })
      }
    } else {
      if (Array.isArray(token.content)) {
        result.push(...flattenTokens(token.content as PrismToken[]))
      } else {
        result.push({ type: token.type, content: String(token.content) })
      }
    }
  }
  return result
}

/**
 * Find all tokens of a specific type in the tokenized output.
 */
function findTokensByType(tokens: PrismToken[], type: string): Array<{ type: string; content: string }> {
  return flattenTokens(tokens).filter((t) => t.type === type)
}

/**
 * Check if tokenization produces at least one token of the given type
 * containing the expected content.
 */
function hasToken(code: string, type: string, content: string): boolean {
  const tokens = Prism.tokenize(code, Prism.languages.rac)
  const matching = findTokensByType(tokens, type)
  return matching.some((t) => t.content === content)
}

/**
 * Tokenize a string with the RAC grammar and return all tokens flattened.
 */
function tokenize(code: string): Array<{ type: string; content: string }> {
  const tokens = Prism.tokenize(code, Prism.languages.rac)
  return flattenTokens(tokens)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('prism-rac grammar registration', () => {
  it('should register the rac grammar on Prism.languages', () => {
    expect(Prism.languages.rac).toBeDefined()
    expect(typeof Prism.languages.rac).toBe('object')
  })

})

describe('top-level declarations / section keywords', () => {
  const declarations = [
    'text',
    'parameter',
    'variable',
    'input',
    'enum',
    'function',
    'versions',
    'module',
    'version',
    'jurisdiction',
    'import',
    'references',
  ]

  for (const keyword of declarations) {
    it(`should tokenize "${keyword}" as a section keyword`, () => {
      const code = `${keyword} some_name:`
      expect(hasToken(code, 'section-keyword', keyword)).toBe(true)
    })
  }
})

describe('declaration names', () => {
  it('should tokenize the name after "parameter" as a declaration-name', () => {
    const code = 'parameter niit_rate:'
    expect(hasToken(code, 'declaration-name', 'niit_rate')).toBe(true)
  })

  it('should tokenize the name after "variable" as a declaration-name', () => {
    const code = 'variable earned_income_credit:'
    expect(hasToken(code, 'declaration-name', 'earned_income_credit')).toBe(true)
  })

  it('should tokenize the name after "input" as a declaration-name', () => {
    const code = 'input filing_status:'
    expect(hasToken(code, 'declaration-name', 'filing_status')).toBe(true)
  })

  it('should tokenize the name after "function" as a declaration-name', () => {
    const code = 'function calculate_tax:'
    expect(hasToken(code, 'declaration-name', 'calculate_tax')).toBe(true)
  })

  it('should tokenize the name after "text" as a declaration-name', () => {
    const code = 'text section_title:'
    expect(hasToken(code, 'declaration-name', 'section_title')).toBe(true)
  })

  it('should tokenize the name after "enum" as a declaration-name', () => {
    const code = 'enum FilingStatus:'
    expect(hasToken(code, 'declaration-name', 'FilingStatus')).toBe(true)
  })
})

describe('attribute keys', () => {
  const attributes = [
    'description',
    'unit',
    'source',
    'reference',
    'values',
    'imports',
    'entity',
    'period',
    'dtype',
    'label',
    'default',
    'formula',
    'tests',
    'name',
    'inputs',
    'expect',
    'metadata',
    'enacted_by',
    'reverts_to',
    'parameters',
    'threshold',
    'cap',
    'defined_for',
    'private',
    'internal',
  ]

  for (const attr of attributes) {
    it(`should tokenize "${attr}:" as an attr-name`, () => {
      const code = `  ${attr}: some_value`
      expect(hasToken(code, 'attr-name', attr)).toBe(true)
    })
  }
})

describe('formula keywords', () => {
  const keywords = [
    'if',
    'else',
    'elif',
    'return',
    'for',
    'break',
    'and',
    'or',
    'not',
    'in',
    'as',
    'True',
    'False',
    'None',
    'let',
    'match',
    'case',
  ]

  for (const kw of keywords) {
    it(`should tokenize "${kw}" as a keyword`, () => {
      // Use the keyword in a formula-like context
      const code = `  formula: ${kw}`
      expect(hasToken(code, 'keyword', kw)).toBe(true)
    })
  }
})

describe('formula builtins', () => {
  const builtins = ['max', 'min', 'abs', 'round', 'sum', 'len', 'interpolate']

  for (const fn of builtins) {
    it(`should tokenize "${fn}" as a builtin`, () => {
      const code = `  formula: ${fn}(x, y)`
      expect(hasToken(code, 'builtin', fn)).toBe(true)
    })
  }
})

describe('entity types', () => {
  const entities = ['Person', 'TaxUnit', 'Household', 'Family', 'SPMUnit']

  for (const entity of entities) {
    it(`should tokenize "${entity}" as an entity-type`, () => {
      const code = `  entity: ${entity}`
      expect(hasToken(code, 'entity-type', entity)).toBe(true)
    })
  }
})

describe('period types', () => {
  const periods = ['Year', 'Month', 'Day', 'Instant']

  for (const period of periods) {
    it(`should tokenize "${period}" as a period-type`, () => {
      const code = `  period: ${period}`
      expect(hasToken(code, 'period-type', period)).toBe(true)
    })
  }
})

describe('data types', () => {
  const dtypes = ['Money', 'Rate', 'Boolean', 'Integer', 'String', 'USD']

  for (const dtype of dtypes) {
    it(`should tokenize "${dtype}" as a dtype`, () => {
      const code = `  dtype: ${dtype}`
      expect(hasToken(code, 'dtype', dtype)).toBe(true)
    })
  }
})

describe('comments', () => {
  it('should tokenize # comments', () => {
    const code = '# This is a comment'
    expect(hasToken(code, 'comment', '# This is a comment')).toBe(true)
  })

  it('should tokenize // comments', () => {
    const code = '// This is a comment'
    expect(hasToken(code, 'comment', '// This is a comment')).toBe(true)
  })

  it('should tokenize inline # comments', () => {
    const code = '  value: 100  # inline comment'
    expect(hasToken(code, 'comment', '# inline comment')).toBe(true)
  })
})

describe('strings', () => {
  it('should tokenize double-quoted strings', () => {
    const code = '  description: "A tax credit"'
    expect(hasToken(code, 'string', '"A tax credit"')).toBe(true)
  })

  it('should tokenize single-quoted strings', () => {
    const code = "  label: 'Tax rate'"
    expect(hasToken(code, 'string', "'Tax rate'")).toBe(true)
  })
})

describe('numbers', () => {
  it('should tokenize integers', () => {
    const code = '  default: 1000'
    expect(hasToken(code, 'number', '1000')).toBe(true)
  })

  it('should tokenize floats', () => {
    const code = '  default: 0.038'
    expect(hasToken(code, 'number', '0.038')).toBe(true)
  })

  it('should tokenize percentages', () => {
    const code = '  value: 34%'
    expect(hasToken(code, 'number', '34%')).toBe(true)
  })

  it('should tokenize negative numbers', () => {
    const code = '  value: -500'
    expect(hasToken(code, 'number', '-500')).toBe(true)
  })

  it('should tokenize hex numbers', () => {
    const code = '  value: 0xFF'
    expect(hasToken(code, 'number', '0xFF')).toBe(true)
  })
})

describe('dates', () => {
  it('should tokenize YYYY-MM-DD dates', () => {
    const code = '  date: 2024-01-01'
    expect(hasToken(code, 'date', '2024-01-01')).toBe(true)
  })

  it('should tokenize dates in values context', () => {
    const code = '    2023-12-31: 1000'
    expect(hasToken(code, 'date', '2023-12-31')).toBe(true)
  })
})

describe('import paths', () => {
  it('should tokenize import paths with section references', () => {
    const code = '  - 26/1411/c#net_investment_income'
    expect(hasToken(code, 'import-path', '26/1411/c#net_investment_income')).toBe(true)
  })

  it('should tokenize import paths with "as" alias', () => {
    const code = '  - 26/32#eitc as federal_eitc'
    const tokens = tokenize(code)
    // The import path should be tokenized, though the "as" may be separate
    const importTokens = tokens.filter((t) => t.type === 'import-path')
    expect(importTokens.length).toBeGreaterThan(0)
  })
})

describe('block scalars', () => {
  it('should tokenize | as a block-scalar indicator', () => {
    const code = '  formula: |'
    expect(hasToken(code, 'block-scalar', '|')).toBe(true)
  })

  it('should tokenize > as a block-scalar indicator', () => {
    const code = '  description: >'
    expect(hasToken(code, 'block-scalar', '>')).toBe(true)
  })
})

describe('operators', () => {
  const operators = ['==', '!=', '<=', '>=', '=>', '+', '-', '*', '/', '<', '>', '=', '?']

  for (const op of operators) {
    it(`should tokenize "${op}" as an operator`, () => {
      const code = `  formula: x ${op} y`
      expect(hasToken(code, 'operator', op)).toBe(true)
    })
  }
})

describe('punctuation', () => {
  it('should tokenize various punctuation marks', () => {
    const code = '  formula: foo(x, y)'
    const tokens = tokenize(code)
    const punctuation = tokens.filter((t) => t.type === 'punctuation')
    expect(punctuation.length).toBeGreaterThan(0)
  })

  it('should tokenize brackets', () => {
    const code = '  formula: arr[0]'
    const tokens = tokenize(code)
    const punctuation = tokens.filter((t) => t.type === 'punctuation')
    expect(punctuation.some((t) => t.content === '[')).toBe(true)
    expect(punctuation.some((t) => t.content === ']')).toBe(true)
  })

  it('should tokenize braces', () => {
    const code = '  formula: {a: 1}'
    const tokens = tokenize(code)
    const punctuation = tokens.filter((t) => t.type === 'punctuation')
    expect(punctuation.some((t) => t.content === '{')).toBe(true)
    expect(punctuation.some((t) => t.content === '}')).toBe(true)
  })
})

describe('YAML booleans', () => {
  it('should tokenize "true" as a boolean', () => {
    const code = '  private: true'
    expect(hasToken(code, 'boolean', 'true')).toBe(true)
  })

  it('should tokenize "false" as a boolean', () => {
    const code = '  internal: false'
    expect(hasToken(code, 'boolean', 'false')).toBe(true)
  })

  it('should tokenize "True" as a keyword (Python boolean)', () => {
    const code = '  formula: True'
    expect(hasToken(code, 'keyword', 'True')).toBe(true)
  })

  it('should tokenize "False" as a keyword (Python boolean)', () => {
    const code = '  formula: False'
    expect(hasToken(code, 'keyword', 'False')).toBe(true)
  })
})

describe('full RAC example', () => {
  it('should highlight a complete RAC file without errors', () => {
    const code = `# Net Investment Income Tax (NIIT)
# IRC Section 1411

parameter niit_rate:
  description: "Net Investment Income Tax rate"
  unit: Rate
  entity: TaxUnit
  period: Year
  values:
    2013-01-01: 0.038

variable net_investment_income_tax:
  description: "Net investment income tax amount"
  entity: TaxUnit
  period: Year
  dtype: Money
  defined_for: TaxUnit
  formula: |
    if agi > threshold:
      return min(nii, agi - threshold) * niit_rate
    else:
      return 0

  tests:
    - name: "Basic NIIT calculation"
      inputs:
        agi: 250000
        nii: 50000
      expect:
        net_investment_income_tax: 1900

import:
  imports:
    - 26/1411/c#net_investment_income
    - 26/32#eitc as federal_eitc
`

    const tokens = Prism.tokenize(code, Prism.languages.rac)
    expect(tokens).toBeDefined()
    expect(Array.isArray(tokens)).toBe(true)
    expect(tokens.length).toBeGreaterThan(0)

    const flat = flattenTokens(tokens)

    // Verify key tokens are present
    expect(flat.some((t) => t.type === 'section-keyword' && t.content === 'parameter')).toBe(true)
    expect(flat.some((t) => t.type === 'section-keyword' && t.content === 'variable')).toBe(true)
    expect(flat.some((t) => t.type === 'section-keyword' && t.content === 'import')).toBe(true)
    expect(flat.some((t) => t.type === 'declaration-name' && t.content === 'niit_rate')).toBe(true)
    expect(
      flat.some((t) => t.type === 'declaration-name' && t.content === 'net_investment_income_tax')
    ).toBe(true)
    expect(flat.some((t) => t.type === 'attr-name' && t.content === 'description')).toBe(true)
    expect(flat.some((t) => t.type === 'attr-name' && t.content === 'formula')).toBe(true)
    expect(flat.some((t) => t.type === 'string')).toBe(true)
    expect(flat.some((t) => t.type === 'number')).toBe(true)
    expect(flat.some((t) => t.type === 'comment')).toBe(true)
    expect(flat.some((t) => t.type === 'keyword' && t.content === 'if')).toBe(true)
    expect(flat.some((t) => t.type === 'keyword' && t.content === 'return')).toBe(true)
    expect(flat.some((t) => t.type === 'builtin' && t.content === 'min')).toBe(true)
    expect(flat.some((t) => t.type === 'entity-type' && t.content === 'TaxUnit')).toBe(true)
    expect(flat.some((t) => t.type === 'period-type' && t.content === 'Year')).toBe(true)
    expect(flat.some((t) => t.type === 'dtype' && t.content === 'Money')).toBe(true)
    expect(flat.some((t) => t.type === 'date')).toBe(true)
    expect(flat.some((t) => t.type === 'import-path')).toBe(true)
    expect(flat.some((t) => t.type === 'block-scalar')).toBe(true)
  })
})

describe('edge cases', () => {
  it('should handle empty input', () => {
    const tokens = Prism.tokenize('', Prism.languages.rac)
    expect(tokens).toBeDefined()
    expect(Array.isArray(tokens)).toBe(true)
  })

  it('should handle whitespace-only input', () => {
    const tokens = Prism.tokenize('   \n\n  ', Prism.languages.rac)
    expect(tokens).toBeDefined()
  })

  it('should not confuse attribute keys outside indented context', () => {
    // "description" at start of line should not match as attr-name
    // since it's not indented — but it could also be a section keyword
    // Test that the tokenizer handles it gracefully
    const tokens = Prism.tokenize('description: hello', Prism.languages.rac)
    expect(tokens).toBeDefined()
  })

  it('should handle declaration without colon gracefully', () => {
    const tokens = Prism.tokenize('parameter standalone', Prism.languages.rac)
    expect(tokens).toBeDefined()
  })
})
