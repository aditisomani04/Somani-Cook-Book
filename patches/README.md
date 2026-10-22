# Dependency security patches

Run `pnpm test:security` after installing dependencies. The tests resolve packages
through their actual consumers and exercise both malicious inputs and normal use.
`pnpm install --frozen-lockfile` applies the committed patches automatically.

## Packages with no upstream patched release

As of 2026-10-22, the registry's latest `braces` (3.0.3) and `node-forge` (1.4.0)
remain affected. We patch the original packages rather than trust an unrelated
fork or upgrade the app to another Expo SDK.

- **braces / GHSA-vfj7-8cjw-p6xm**: bound parser nesting (including parentheses)
  and all recursive AST walkers to 256 levels. Excessive nesting throws an
  intentional `SyntaxError`, not a stack overflow. The cap cannot be disabled
  through options. Normal glob syntax and expansion remain unchanged.
- **node-forge / GHSA-86w9-cpqp-85rv**: reject extra nested DigestAlgorithm
  elements in RSA PKCS#1 v1.5 verification and reject nonempty NULL parameters.
  SHA-2 parameters may still be absent or empty NULL. Tests construct signed
  malformed DigestInfo structures to exercise the verification path.

Version-based scanners still report these two advisories because pnpm patches
do not change upstream version numbers. These findings are **locally patched**,
not suppressed or ignored. Remove each patch only after an upstream release fixes
the advisory and the regression tests pass with that release.

## Compatibility patch

**query-string 7.1.3** (used by Expo Router) expects a CommonJS function from
`decode-uri-component`. The secure decoder, 0.5.0, is ESM-only. The one-line
interop change unwraps its default export while retaining CommonJS compatibility.
Node 22.12+ / 24 supports synchronous `require()` of this ESM dependency, and
Metro handles the same default export. Tests cover Expo's actual query parser.

The workspace overrides retain security floors for patched transitive packages;
the Vite catalog stays on the compatible 7.3 series. The package-release-age
guard and existing platform exclusions remain enabled.
