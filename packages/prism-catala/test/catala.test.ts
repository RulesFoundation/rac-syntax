import { describe, it, expect } from 'vitest'
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
  const tokens = Prism.tokenize(code, Prism.languages.catala)
  const matching = findTokensByType(tokens, type)
  return matching.some((t) => t.content === content)
}

/**
 * Tokenize a string with the Catala grammar and return all tokens flattened.
 */
function tokenize(code: string): Array<{ type: string; content: string }> {
  const tokens = Prism.tokenize(code, Prism.languages.catala)
  return flattenTokens(tokens)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('prism-catala grammar registration', () => {
  it('should register the catala grammar on Prism.languages', () => {
    expect(Prism.languages.catala).toBeDefined()
    expect(typeof Prism.languages.catala).toBe('object')
  })
})

describe('catala-title tokens', () => {
  it('should tokenize @@Title@@ as catala-title', () => {
    const code = '@@Article 1@@'
    expect(hasToken(code, 'catala-title', '@@Article 1@@')).toBe(true)
  })

  it('should tokenize title with special characters', () => {
    const code = '@@Income Tax Act - Part I@@'
    expect(hasToken(code, 'catala-title', '@@Income Tax Act - Part I@@')).toBe(true)
  })
})

describe('catala-section tokens', () => {
  it('should tokenize @Section@ as catala-section', () => {
    const code = '@Definitions@'
    expect(hasToken(code, 'catala-section', '@Definitions@')).toBe(true)
  })

  it('should tokenize section with spaces', () => {
    const code = '@Tax computation@'
    expect(hasToken(code, 'catala-section', '@Tax computation@')).toBe(true)
  })

  it('should not confuse section with title (double @@)', () => {
    const code = '@@Title@@'
    // This should be a title, not a section
    expect(hasToken(code, 'catala-title', '@@Title@@')).toBe(true)
    // The section pattern should not match inside a title
    const tokens = tokenize(code)
    const sectionTokens = tokens.filter((t) => t.type === 'catala-section')
    expect(sectionTokens.length).toBe(0)
  })
})

describe('keywords', () => {
  // Type names (money, decimal, etc.) are tested separately in the "type names" section
  const singleWordKeywords = [
    'scope', 'definition', 'rule', 'consequence',
    'assertion', 'equals', 'if', 'then', 'else', 'match',
    'for', 'let', 'in', 'not', 'and', 'or', 'true', 'false',
    'content', 'struct', 'enum', 'declaration', 'context',
    'input', 'output', 'internal', 'state', 'condition', 'fulfilled',
    'sum', 'exists', 'among',
  ]

  for (const kw of singleWordKeywords) {
    it(`should tokenize "${kw}" as a keyword`, () => {
      const code = `  ${kw}`
      expect(hasToken(code, 'keyword', kw)).toBe(true)
    })
  }

  it('should tokenize multi-word keyword "under condition"', () => {
    const code = '  under condition x'
    expect(hasToken(code, 'keyword', 'under condition')).toBe(true)
  })

  it('should tokenize multi-word keyword "with pattern"', () => {
    const code = '  match x with pattern'
    expect(hasToken(code, 'keyword', 'with pattern')).toBe(true)
  })

  it('should tokenize multi-word keyword "such that"', () => {
    const code = '  exists x among y such that z'
    expect(hasToken(code, 'keyword', 'such that')).toBe(true)
  })

  it('should tokenize multi-word keyword "fixed by"', () => {
    const code = '  fixed by param'
    expect(hasToken(code, 'keyword', 'fixed by')).toBe(true)
  })
})

describe('scope names', () => {
  it('should tokenize the name after "scope" as a scope-name', () => {
    const code = 'scope IncomeTax'
    expect(hasToken(code, 'scope-name', 'IncomeTax')).toBe(true)
  })

  it('should tokenize the name after "declaration scope" as a scope-name', () => {
    const code = 'declaration scope TaxComputation'
    expect(hasToken(code, 'scope-name', 'TaxComputation')).toBe(true)
  })
})

describe('type names', () => {
  const types = ['money', 'decimal', 'integer', 'boolean', 'date', 'duration', 'collection']

  for (const typeName of types) {
    it(`should tokenize "${typeName}" as a type-name`, () => {
      const code = `  content ${typeName}`
      expect(hasToken(code, 'type-name', typeName)).toBe(true)
    })
  }
})

describe('comments', () => {
  it('should tokenize # line comments', () => {
    const code = '# This is a comment'
    expect(hasToken(code, 'comment', '# This is a comment')).toBe(true)
  })

  it('should tokenize inline # comments', () => {
    const code = '  scope Foo # inline comment'
    expect(hasToken(code, 'comment', '# inline comment')).toBe(true)
  })

  it('should tokenize /* */ block comments', () => {
    const code = '/* This is a block comment */'
    expect(hasToken(code, 'comment', '/* This is a block comment */')).toBe(true)
  })

  it('should tokenize multiline block comments', () => {
    const code = `/* This is
a multiline
comment */`
    expect(hasToken(code, 'comment', `/* This is\na multiline\ncomment */`)).toBe(true)
  })
})

describe('strings', () => {
  it('should tokenize double-quoted strings', () => {
    const code = '  "a tax credit"'
    expect(hasToken(code, 'string', '"a tax credit"')).toBe(true)
  })

  it('should tokenize single-quoted strings', () => {
    const code = "  'tax rate'"
    expect(hasToken(code, 'string', "'tax rate'")).toBe(true)
  })

  it('should handle escaped quotes in strings', () => {
    const code = '  "he said \\"hello\\""'
    expect(hasToken(code, 'string', '"he said \\"hello\\""')).toBe(true)
  })
})

describe('numbers', () => {
  it('should tokenize integers', () => {
    const code = '  1000'
    expect(hasToken(code, 'number', '1000')).toBe(true)
  })

  it('should tokenize floats', () => {
    const code = '  0.038'
    expect(hasToken(code, 'number', '0.038')).toBe(true)
  })

  it('should tokenize percentages', () => {
    const code = '  34%'
    expect(hasToken(code, 'number', '34%')).toBe(true)
  })

  it('should tokenize negative numbers', () => {
    const code = '  -500'
    expect(hasToken(code, 'number', '-500')).toBe(true)
  })

  it('should tokenize negative floats', () => {
    const code = '  -3.14'
    expect(hasToken(code, 'number', '-3.14')).toBe(true)
  })

  it('should tokenize negative percentages', () => {
    const code = '  -10%'
    expect(hasToken(code, 'number', '-10%')).toBe(true)
  })
})

describe('operators', () => {
  const operators = ['==', '!=', '<=', '>=', '--', '->', '+', '-', '*', '/', '<', '>', '=', '!']

  for (const op of operators) {
    it(`should tokenize "${op}" as an operator`, () => {
      const code = `  x ${op} y`
      expect(hasToken(code, 'operator', op)).toBe(true)
    })
  }
})

describe('punctuation', () => {
  it('should tokenize various punctuation marks', () => {
    const code = '  foo(x, y)'
    const tokens = tokenize(code)
    const punctuation = tokens.filter((t) => t.type === 'punctuation')
    expect(punctuation.length).toBeGreaterThan(0)
  })

  it('should tokenize brackets', () => {
    const code = '  arr[0]'
    const tokens = tokenize(code)
    const punctuation = tokens.filter((t) => t.type === 'punctuation')
    expect(punctuation.some((t) => t.content === '[')).toBe(true)
    expect(punctuation.some((t) => t.content === ']')).toBe(true)
  })

  it('should tokenize braces', () => {
    const code = '  {a: 1}'
    const tokens = tokenize(code)
    const punctuation = tokens.filter((t) => t.type === 'punctuation')
    expect(punctuation.some((t) => t.content === '{')).toBe(true)
    expect(punctuation.some((t) => t.content === '}')).toBe(true)
  })

  it('should tokenize colons and semicolons', () => {
    const code = '  x: 1; y: 2'
    const tokens = tokenize(code)
    const punctuation = tokens.filter((t) => t.type === 'punctuation')
    expect(punctuation.some((t) => t.content === ':')).toBe(true)
    expect(punctuation.some((t) => t.content === ';')).toBe(true)
  })
})

describe('full Catala example', () => {
  it('should highlight a complete Catala snippet without errors', () => {
    const code = `@@Income tax@@

@Taxable income@

# Compute the income tax for a given individual

declaration scope IncomeTax:
  context individual content Person
  context tax_rate content decimal
  context income content money
  context tax_amount content money

scope IncomeTax:
  definition tax_rate equals 0.30
  definition tax_amount under condition
    income > $10000
  consequence equals
    income * tax_rate

  assertion tax_amount >= $0

  rule tax_rate under condition
    not (income > $100000)
  consequence fulfilled

  definition income equals $50000

/* This is a block comment
   explaining the tax computation */
`

    const tokens = Prism.tokenize(code, Prism.languages.catala)
    expect(tokens).toBeDefined()
    expect(Array.isArray(tokens)).toBe(true)
    expect(tokens.length).toBeGreaterThan(0)

    const flat = flattenTokens(tokens)

    // Verify key tokens are present
    expect(flat.some((t) => t.type === 'catala-title' && t.content === '@@Income tax@@')).toBe(true)
    expect(flat.some((t) => t.type === 'catala-section' && t.content === '@Taxable income@')).toBe(true)
    expect(flat.some((t) => t.type === 'comment')).toBe(true)
    expect(flat.some((t) => t.type === 'keyword' && t.content === 'scope')).toBe(true)
    expect(flat.some((t) => t.type === 'keyword' && t.content === 'declaration')).toBe(true)
    expect(flat.some((t) => t.type === 'keyword' && t.content === 'definition')).toBe(true)
    expect(flat.some((t) => t.type === 'keyword' && t.content === 'equals')).toBe(true)
    expect(flat.some((t) => t.type === 'keyword' && t.content === 'under condition')).toBe(true)
    expect(flat.some((t) => t.type === 'keyword' && t.content === 'consequence')).toBe(true)
    expect(flat.some((t) => t.type === 'keyword' && t.content === 'assertion')).toBe(true)
    expect(flat.some((t) => t.type === 'keyword' && t.content === 'rule')).toBe(true)
    expect(flat.some((t) => t.type === 'keyword' && t.content === 'not')).toBe(true)
    expect(flat.some((t) => t.type === 'keyword' && t.content === 'content')).toBe(true)
    expect(flat.some((t) => t.type === 'scope-name' && t.content === 'IncomeTax')).toBe(true)
    expect(flat.some((t) => t.type === 'type-name' && t.content === 'decimal')).toBe(true)
    expect(flat.some((t) => t.type === 'type-name' && t.content === 'money')).toBe(true)
    expect(flat.some((t) => t.type === 'number')).toBe(true)
    expect(flat.some((t) => t.type === 'operator')).toBe(true)
  })
})

describe('edge cases', () => {
  it('should handle empty input', () => {
    const tokens = Prism.tokenize('', Prism.languages.catala)
    expect(tokens).toBeDefined()
    expect(Array.isArray(tokens)).toBe(true)
  })

  it('should handle whitespace-only input', () => {
    const tokens = Prism.tokenize('   \n\n  ', Prism.languages.catala)
    expect(tokens).toBeDefined()
  })

  it('should handle plain text without any Catala constructs', () => {
    const tokens = Prism.tokenize('This is just some legal text without any code.', Prism.languages.catala)
    expect(tokens).toBeDefined()
    expect(Array.isArray(tokens)).toBe(true)
  })

  it('should handle adjacent titles and sections', () => {
    const code = `@@Title@@
@Section@`
    const flat = tokenize(code)
    expect(flat.some((t) => t.type === 'catala-title')).toBe(true)
    expect(flat.some((t) => t.type === 'catala-section')).toBe(true)
  })
})
