# Contributing

Thanks for helping improve RAC syntax tooling.

## Local setup

```bash
bun install
bun run test
bun run build
```

Requires [Bun](https://bun.sh) — do not use npm, pnpm, or yarn here.

## Repo layout

See the [root README](./README.md). In short: three packages live under `packages/`, each with its own tests and build.

## Running tests

```bash
bun run test              # all packages
cd packages/prism-rac && bun run test:watch   # single package, watch mode
```

`prism-rac` and `prism-catala` use Vitest with V8 coverage. `vscode-rac` uses Bun's built-in test runner against fixture files.

## Coverage policy

The Vitest configs for `prism-rac` and `prism-catala` set coverage thresholds at 80% (statements, branches, functions, lines) rather than 100%. Rationale:

- The test suites already exceed 80% comfortably, and the full 100% target is not a meaningful quality signal for grammar code — Prism's tokenizer is regex-driven, and many "uncovered branches" reported by V8 are artefacts of generated RegExp alternations rather than real untested code paths.
- A hard 100% floor would block contributors from adding a single new keyword without also adding an incidental test to cover every alternation branch, which penalises small, otherwise-correct changes.
- We still review coverage in CI output — it just doesn't fail the build below 100%.

If you are adding new token classes, please still add tests that exercise the new tokens directly. Aim for the suite to cover every documented token.

## Keeping packages in sync

The RAC language is defined in two places: `packages/prism-rac/src/index.ts` (canonical keyword list) and `packages/vscode-rac/syntaxes/rac.tmLanguage.json` (TextMate grammar used by VS Code). When you change one, change the other and add a test in each package.

A comment at the top of `packages/prism-rac/src/index.ts` points at the files that need to stay aligned.

## Pull requests

- Branch from `origin/master`.
- Keep each PR scoped to one concern.
- Include tests for any grammar change.
- Use sentence case in PR titles and headings.

## License

By contributing, you agree that your contributions will be licensed under the MIT License (see [LICENSE](./LICENSE)).
