import { describe, it, expect, beforeAll } from "bun:test";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dir, "..");
const GRAMMAR_PATH = join(ROOT, "syntaxes", "rac.tmLanguage.json");
const LANG_CONFIG_PATH = join(ROOT, "language-configuration.json");
const PACKAGE_JSON_PATH = join(ROOT, "package.json");

interface TmPattern {
  match?: string;
  begin?: string;
  end?: string;
  name?: string;
  captures?: Record<string, { name: string }>;
  beginCaptures?: Record<string, { name: string }>;
  endCaptures?: Record<string, { name: string }>;
  patterns?: TmPattern[];
  include?: string;
}

interface TmGrammar {
  $schema?: string;
  name: string;
  scopeName: string;
  fileTypes: string[];
  patterns: TmPattern[];
  repository: Record<
    string,
    {
      patterns: TmPattern[];
    }
  >;
}

let grammar: TmGrammar;

function getAllPatterns(grammar: TmGrammar): TmPattern[] {
  const patterns: TmPattern[] = [...grammar.patterns];
  for (const [, repo] of Object.entries(grammar.repository)) {
    if (repo.patterns) {
      patterns.push(...repo.patterns);
    }
  }
  return patterns;
}

function findPatternsWithScope(
  grammar: TmGrammar,
  scopeSubstring: string
): TmPattern[] {
  const results: TmPattern[] = [];
  const allPatterns = getAllPatterns(grammar);
  for (const pattern of allPatterns) {
    if (pattern.name && pattern.name.includes(scopeSubstring)) {
      results.push(pattern);
    }
    if (pattern.captures) {
      for (const [, cap] of Object.entries(pattern.captures)) {
        if (cap.name && cap.name.includes(scopeSubstring)) {
          results.push(pattern);
        }
      }
    }
    if (pattern.beginCaptures) {
      for (const [, cap] of Object.entries(pattern.beginCaptures)) {
        if (cap.name && cap.name.includes(scopeSubstring)) {
          results.push(pattern);
        }
      }
    }
    if (pattern.endCaptures) {
      for (const [, cap] of Object.entries(pattern.endCaptures)) {
        if (cap.name && cap.name.includes(scopeSubstring)) {
          results.push(pattern);
        }
      }
    }
  }
  return results;
}

function testRegexCompiles(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

function testRegexMatches(pattern: string, input: string): boolean {
  try {
    const re = new RegExp(pattern);
    return re.test(input);
  } catch {
    return false;
  }
}

describe("Extension files exist", () => {
  it("package.json exists", () => {
    expect(existsSync(PACKAGE_JSON_PATH)).toBe(true);
  });

  it("language-configuration.json exists", () => {
    expect(existsSync(LANG_CONFIG_PATH)).toBe(true);
  });

  it("rac.tmLanguage.json exists", () => {
    expect(existsSync(GRAMMAR_PATH)).toBe(true);
  });

  it("example files exist", () => {
    expect(existsSync(join(ROOT, "examples", "niit.rac"))).toBe(true);
    expect(existsSync(join(ROOT, "examples", "snap.rac"))).toBe(true);
  });

  it("icon files exist", () => {
    expect(existsSync(join(ROOT, "icons", "rac-light.svg"))).toBe(true);
    expect(existsSync(join(ROOT, "icons", "rac-dark.svg"))).toBe(true);
  });
});

describe("package.json structure", () => {
  let pkg: any;

  beforeAll(() => {
    pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8"));
  });

  it("has correct name", () => {
    expect(pkg.name).toBe("vscode-rac");
  });

  it("registers rac language", () => {
    const langs = pkg.contributes.languages;
    expect(langs).toBeArray();
    expect(langs.length).toBeGreaterThanOrEqual(1);
    const rac = langs.find((l: any) => l.id === "rac");
    expect(rac).toBeDefined();
    expect(rac.extensions).toContain(".rac");
  });

  it("registers grammar for rac language", () => {
    const grammars = pkg.contributes.grammars;
    expect(grammars).toBeArray();
    const racGrammar = grammars.find((g: any) => g.language === "rac");
    expect(racGrammar).toBeDefined();
    expect(racGrammar.scopeName).toBe("source.rac");
  });
});

describe("language-configuration.json structure", () => {
  let config: any;

  beforeAll(() => {
    config = JSON.parse(readFileSync(LANG_CONFIG_PATH, "utf-8"));
  });

  it("defines line comments with #", () => {
    expect(config.comments).toBeDefined();
    expect(config.comments.lineComment).toBe("#");
  });

  it("defines bracket pairs", () => {
    expect(config.brackets).toBeDefined();
    const brackets = config.brackets.map((b: string[]) => b.join(""));
    expect(brackets).toContain("()");
    expect(brackets).toContain("[]");
    expect(brackets).toContain("{}");
  });

  it("defines auto-closing pairs", () => {
    expect(config.autoClosingPairs).toBeDefined();
    expect(config.autoClosingPairs.length).toBeGreaterThan(0);
  });

  it("defines surrounding pairs", () => {
    expect(config.surroundingPairs).toBeDefined();
    expect(config.surroundingPairs.length).toBeGreaterThan(0);
  });
});

describe("TextMate Grammar structure", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has correct scopeName", () => {
    expect(grammar.scopeName).toBe("source.rac");
  });

  it("has correct fileTypes", () => {
    expect(grammar.fileTypes).toContain("rac");
  });

  it("has patterns array", () => {
    expect(grammar.patterns).toBeArray();
    expect(grammar.patterns.length).toBeGreaterThan(0);
  });

  it("has repository with expected groups", () => {
    const expectedGroups = [
      "comments",
      "statute-text",
      "declarations",
      "attributes",
      "types",
      "keywords",
      "builtins",
      "strings",
      "block-scalars",
      "numbers",
      "dates",
      "percentages",
      "imports",
      "operators",
      "booleans",
      "punctuation",
    ];
    for (const group of expectedGroups) {
      expect(grammar.repository[group]).toBeDefined();
      expect(grammar.repository[group].patterns).toBeArray();
    }
  });

  it("top-level patterns reference all repository groups", () => {
    const referencedGroups = grammar.patterns
      .map((p) => p.include?.replace("#", ""))
      .filter(Boolean);
    const repositoryKeys = Object.keys(grammar.repository);
    for (const key of repositoryKeys) {
      expect(referencedGroups).toContain(key);
    }
  });
});

describe("All regex patterns compile", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("all match patterns compile as valid regex", () => {
    const allPatterns = getAllPatterns(grammar);
    const failures: string[] = [];
    for (const pattern of allPatterns) {
      if (pattern.match && !testRegexCompiles(pattern.match)) {
        failures.push(`match: ${pattern.match}`);
      }
      if (pattern.begin && !testRegexCompiles(pattern.begin)) {
        failures.push(`begin: ${pattern.begin}`);
      }
      if (pattern.end && !testRegexCompiles(pattern.end)) {
        failures.push(`end: ${pattern.end}`);
      }
    }
    if (failures.length > 0) {
      throw new Error(
        `Failed to compile regexes:\n${failures.join("\n")}`
      );
    }
  });
});

describe("1. Comments get comment.line scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns for # comments with comment.line.number-sign.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "comment.line.number-sign.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("# comment regex matches '# This is a comment'", () => {
    const patterns = findPatternsWithScope(grammar, "comment.line.number-sign.rac");
    const matched = patterns.some(
      (p) => p.match && testRegexMatches(p.match, "# This is a comment")
    );
    expect(matched).toBe(true);
  });

  it("has patterns for // comments with comment.line.double-slash.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "comment.line.double-slash.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("// comment regex matches '// This is a comment'", () => {
    const patterns = findPatternsWithScope(grammar, "comment.line.double-slash.rac");
    const matched = patterns.some(
      (p) => p.match && testRegexMatches(p.match, "// This is a comment")
    );
    expect(matched).toBe(true);
  });
});

describe("2. Declaration keywords get keyword.declaration scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with keyword.declaration.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "keyword.declaration.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("does NOT match 'parameter niit_rate:' as keyword.declaration (removed in unified syntax)", () => {
    const patterns = findPatternsWithScope(grammar, "keyword.declaration.rac");
    const matched = patterns.some(
      (p) =>
        (p.match && testRegexMatches(p.match, "parameter niit_rate:")) ||
        (p.begin && testRegexMatches(p.begin, "parameter niit_rate:"))
    );
    expect(matched).toBe(false);
  });

  it("does NOT match 'variable net_investment_income_tax:' as keyword.declaration (removed in unified syntax)", () => {
    const patterns = findPatternsWithScope(grammar, "keyword.declaration.rac");
    const matched = patterns.some(
      (p) =>
        (p.match && testRegexMatches(p.match, "variable net_investment_income_tax:")) ||
        (p.begin && testRegexMatches(p.begin, "variable net_investment_income_tax:"))
    );
    expect(matched).toBe(false);
  });

  it("matches all declaration keywords", () => {
    const declarationKeywords = [
      "text:",
      "enum qux:",
      "function quux:",
      "versions:",
      "module m:",
      "version v:",
      "jurisdiction j:",
      "import i:",
      "references:",
    ];
    const patterns = findPatternsWithScope(grammar, "keyword.declaration.rac");
    const unmatched: string[] = [];
    for (const kw of declarationKeywords) {
      const matched = patterns.some(
        (p) =>
          (p.match && testRegexMatches(p.match, kw)) ||
          (p.begin && testRegexMatches(p.begin, kw))
      );
      if (!matched) unmatched.push(kw);
    }
    expect(unmatched).toEqual([]);
  });
});

describe("3. Declaration names get entity.name.function scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with entity.name.function.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "entity.name.function.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });
});

describe("4. Attribute keys get support.type.property-name scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with support.type.property-name.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "support.type.property-name.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("matches indented 'description:'", () => {
    const patterns = findPatternsWithScope(grammar, "support.type.property-name.rac");
    const matched = patterns.some(
      (p) => p.match && testRegexMatches(p.match, "  description:")
    );
    expect(matched).toBe(true);
  });

  it("does NOT match indented 'formula:' (removed in unified syntax)", () => {
    const patterns = findPatternsWithScope(grammar, "support.type.property-name.rac");
    const matched = patterns.some(
      (p) => p.match && testRegexMatches(p.match, "  formula:")
    );
    expect(matched).toBe(false);
  });

  it("matches all known attribute keys", () => {
    const attrKeys = [
      "description", "unit", "source", "reference",
      "imports", "entity", "period", "dtype", "label", "default",
      "name", "metadata",
      "enacted_by", "reverts_to", "parameters", "threshold", "cap",
      "defined_for", "private", "internal",
    ];
    const patterns = findPatternsWithScope(grammar, "support.type.property-name.rac");
    const unmatched: string[] = [];
    for (const key of attrKeys) {
      const testStr = `  ${key}:`;
      const matched = patterns.some(
        (p) => p.match && testRegexMatches(p.match, testStr)
      );
      if (!matched) unmatched.push(key);
    }
    expect(unmatched).toEqual([]);
  });
});

describe("5. Types get support.type scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with support.type.rac scope (not property-name)", () => {
    const patterns = findPatternsWithScope(grammar, "support.type.rac");
    // Filter out property-name patterns
    const typePatterns = patterns.filter(
      (p) =>
        (p.name && p.name === "support.type.rac") ||
        (p.captures &&
          Object.values(p.captures).some((c) => c.name === "support.type.rac"))
    );
    expect(typePatterns.length).toBeGreaterThan(0);
  });

  it("matches entity and data types", () => {
    const types = [
      "Person", "TaxUnit", "Household", "Family", "SPMUnit",
      "Year", "Month", "Day", "Instant",
      "Money", "Rate", "Boolean", "Integer", "String", "USD",
    ];
    // Find patterns that specifically target support.type.rac (not property-name)
    const allPatterns = getAllPatterns(grammar);
    const unmatched: string[] = [];
    for (const type of types) {
      const matched = allPatterns.some((p) => {
        if (p.name === "support.type.rac" && p.match) {
          return testRegexMatches(p.match, type);
        }
        return false;
      });
      if (!matched) unmatched.push(type);
    }
    expect(unmatched).toEqual([]);
  });
});

describe("6. Formula keywords get keyword.control scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with keyword.control.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "keyword.control.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("matches control flow keywords", () => {
    const keywords = [
      "if", "else", "elif", "return", "for", "break",
      "and", "or", "not", "in", "as",
      "True", "False", "None", "let", "match", "case", "from",
    ];
    const patterns = findPatternsWithScope(grammar, "keyword.control.rac");
    const unmatched: string[] = [];
    for (const kw of keywords) {
      const matched = patterns.some(
        (p) => p.match && testRegexMatches(p.match, kw)
      );
      if (!matched) unmatched.push(kw);
    }
    expect(unmatched).toEqual([]);
  });
});

describe("7. Builtins get support.function.builtin scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with support.function.builtin.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "support.function.builtin.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("matches builtin functions", () => {
    const builtins = ["max", "min", "abs", "round", "sum", "len", "interpolate"];
    const patterns = findPatternsWithScope(grammar, "support.function.builtin.rac");
    const unmatched: string[] = [];
    for (const fn of builtins) {
      const matched = patterns.some(
        (p) => p.match && testRegexMatches(p.match, fn)
      );
      if (!matched) unmatched.push(fn);
    }
    expect(unmatched).toEqual([]);
  });
});

describe("8. Strings get string.quoted scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns for double-quoted strings", () => {
    const patterns = findPatternsWithScope(grammar, "string.quoted.double.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("has patterns for single-quoted strings", () => {
    const patterns = findPatternsWithScope(grammar, "string.quoted.single.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("double-quoted string regex matches '\"hello world\"'", () => {
    const patterns = findPatternsWithScope(grammar, "string.quoted.double.rac");
    const matched = patterns.some((p) => {
      if (p.match) return testRegexMatches(p.match, '"hello world"');
      if (p.begin) return testRegexMatches(p.begin, '"hello world"');
      return false;
    });
    expect(matched).toBe(true);
  });

  it("single-quoted string regex matches \"'hello world'\"", () => {
    const patterns = findPatternsWithScope(grammar, "string.quoted.single.rac");
    const matched = patterns.some((p) => {
      if (p.match) return testRegexMatches(p.match, "'hello world'");
      if (p.begin) return testRegexMatches(p.begin, "'hello world'");
      return false;
    });
    expect(matched).toBe(true);
  });
});

describe("9. Numbers get constant.numeric scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with constant.numeric scope", () => {
    const patterns = findPatternsWithScope(grammar, "constant.numeric");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("matches integers like '42'", () => {
    const patterns = findPatternsWithScope(grammar, "constant.numeric");
    const matched = patterns.some(
      (p) => p.match && testRegexMatches(p.match, "42")
    );
    expect(matched).toBe(true);
  });

  it("matches floats like '0.038'", () => {
    const patterns = findPatternsWithScope(grammar, "constant.numeric");
    const matched = patterns.some(
      (p) => p.match && testRegexMatches(p.match, "0.038")
    );
    expect(matched).toBe(true);
  });
});

describe("10. Dates get constant.numeric.date scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with constant.numeric.date.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "constant.numeric.date.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("matches dates like '2024-01-01'", () => {
    const patterns = findPatternsWithScope(grammar, "constant.numeric.date.rac");
    const matched = patterns.some(
      (p) => p.match && testRegexMatches(p.match, "2024-01-01")
    );
    expect(matched).toBe(true);
  });

  it("matches dates like '2013-01-01'", () => {
    const patterns = findPatternsWithScope(grammar, "constant.numeric.date.rac");
    const matched = patterns.some(
      (p) => p.match && testRegexMatches(p.match, "2013-01-01")
    );
    expect(matched).toBe(true);
  });
});

describe("11. Import paths get string.unquoted.import-path scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with string.unquoted.import-path.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "string.unquoted.import-path.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("matches import paths like '26/1411/c#net_investment_income'", () => {
    const patterns = findPatternsWithScope(grammar, "string.unquoted.import-path.rac");
    const matched = patterns.some(
      (p) => p.match && testRegexMatches(p.match, "26/1411/c#net_investment_income")
    );
    expect(matched).toBe(true);
  });
});

describe("12. Operators get keyword.operator scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with keyword.operator.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "keyword.operator.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("matches all operator patterns", () => {
    const ops = ["==", "!=", "<=", ">=", "=>", "+", "-", "*", "/", "<", ">", "=", "!", "%", "?"];
    const patterns = findPatternsWithScope(grammar, "keyword.operator.rac");
    const unmatched: string[] = [];
    for (const op of ops) {
      const matched = patterns.some(
        (p) => p.match && testRegexMatches(p.match, op)
      );
      if (!matched) unmatched.push(op);
    }
    expect(unmatched).toEqual([]);
  });
});

describe("13. Booleans get constant.language.boolean scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with constant.language.boolean.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "constant.language.boolean.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("matches 'true' and 'false'", () => {
    const patterns = findPatternsWithScope(grammar, "constant.language.boolean.rac");
    const matchesTrue = patterns.some(
      (p) => p.match && testRegexMatches(p.match, "true")
    );
    const matchesFalse = patterns.some(
      (p) => p.match && testRegexMatches(p.match, "false")
    );
    expect(matchesTrue).toBe(true);
    expect(matchesFalse).toBe(true);
  });
});

describe("14. Percentages get constant.numeric.percentage scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with constant.numeric.percentage.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "constant.numeric.percentage.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("matches '34%'", () => {
    const patterns = findPatternsWithScope(grammar, "constant.numeric.percentage.rac");
    const matched = patterns.some(
      (p) => p.match && testRegexMatches(p.match, "34%")
    );
    expect(matched).toBe(true);
  });
});

describe("15. Block scalar operators get keyword.operator.block-scalar scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with keyword.operator.block-scalar.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "keyword.operator.block-scalar.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("matches pipe character after colon", () => {
    const patterns = findPatternsWithScope(grammar, "keyword.operator.block-scalar.rac");
    const matched = patterns.some(
      (p) => p.match && testRegexMatches(p.match, ": |")
    );
    expect(matched).toBe(true);
  });

  it("matches > character after colon", () => {
    const patterns = findPatternsWithScope(grammar, "keyword.operator.block-scalar.rac");
    const matched = patterns.some(
      (p) => p.match && testRegexMatches(p.match, ": >")
    );
    expect(matched).toBe(true);
  });
});

describe("15b. Statute text (triple-quoted) gets string.quoted.triple scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with string.quoted.triple.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "string.quoted.triple.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("has begin/end captures for triple-quoted strings", () => {
    const patterns = findPatternsWithScope(
      grammar,
      "punctuation.definition.string.begin.rac"
    );
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("has end captures for triple-quoted strings", () => {
    const patterns = findPatternsWithScope(
      grammar,
      "punctuation.definition.string.end.rac"
    );
    expect(patterns.length).toBeGreaterThan(0);
  });
});

describe("15c. String escape characters get constant.character.escape scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with constant.character.escape.rac scope", () => {
    const allPatterns = getAllPatterns(grammar);
    // Escape patterns are nested inside string patterns
    const stringPatterns = allPatterns.filter(
      (p) =>
        p.name === "string.quoted.double.rac" ||
        p.name === "string.quoted.single.rac"
    );
    const hasEscape = stringPatterns.some(
      (p) =>
        p.patterns &&
        p.patterns.some(
          (inner) => inner.name === "constant.character.escape.rac"
        )
    );
    expect(hasEscape).toBe(true);
  });

  it("escape regex matches backslash-n", () => {
    const allPatterns = getAllPatterns(grammar);
    const stringPatterns = allPatterns.filter(
      (p) => p.name === "string.quoted.double.rac"
    );
    const escapePattern = stringPatterns
      .flatMap((p) => p.patterns || [])
      .find((p) => p.name === "constant.character.escape.rac");
    expect(escapePattern).toBeDefined();
    expect(escapePattern!.match).toBeDefined();
    expect(testRegexMatches(escapePattern!.match!, "\\n")).toBe(true);
  });
});

describe("16. Punctuation gets punctuation scope", () => {
  beforeAll(() => {
    grammar = JSON.parse(readFileSync(GRAMMAR_PATH, "utf-8"));
  });

  it("has patterns with punctuation.rac scope", () => {
    const patterns = findPatternsWithScope(grammar, "punctuation.rac");
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("matches various punctuation characters", () => {
    const chars = ["{", "}", "[", "]", "(", ")", ",", ":", "."];
    const patterns = findPatternsWithScope(grammar, "punctuation.rac");
    const unmatched: string[] = [];
    for (const ch of chars) {
      const matched = patterns.some(
        (p) => p.match && testRegexMatches(p.match, ch)
      );
      if (!matched) unmatched.push(ch);
    }
    expect(unmatched).toEqual([]);
  });
});

describe("Example files are valid RAC content", () => {
  it("niit.rac contains expected RAC constructs", () => {
    const content = readFileSync(join(ROOT, "examples", "niit.rac"), "utf-8");
    expect(content).toContain("parameter");
    expect(content).toContain("variable");
    expect(content).toContain("formula");
    expect(content).toContain("tests");
    expect(content).toContain("imports");
  });

  it("snap.rac contains expected RAC constructs", () => {
    const content = readFileSync(join(ROOT, "examples", "snap.rac"), "utf-8");
    expect(content).toContain("parameter");
    expect(content).toContain("variable");
    expect(content).toContain("formula");
    expect(content).toContain("tests");
  });
});
