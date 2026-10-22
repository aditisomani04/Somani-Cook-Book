---
name: Locally patched dependencies
description: How to interpret audit findings when an upstream package has no fixed release.
---

Do not treat an unchanged version-based audit finding as proof that a committed
pnpm security patch is ineffective. Also do not call the audit clean or suppress
the advisory just because a local patch exists.

**Why:** Some upstream packages had no patched release. Replacing them with an
unrelated fork only to remove an audit warning adds supply-chain risk, and changing
the Expo SDK just to remove a transitive dependency introduces unrelated changes.
The chosen approach is a small, reproducible patch to the original package,
backed by exploit regression tests, with the remaining scanner warnings disclosed.

**How to apply:** Read `patches/README.md` for current patches, run the security
regressions through actual dependency consumers, and check for an upstream fix.
Remove a patch only when the fixed upstream release passes those tests. Keep
release-age protections enabled.
