---
name: CI Debug
description: Debug a failing GitHub Actions run for this repo's build-and-audit job.
category: Troubleshooting
tags: [ci, github-actions, debugging]
---

You are debugging a failing CI run. This repo has one workflow, one job (`.github/workflows/ci.yml` → `build-and-audit`): `npm ci` → `npm audit --audit-level=critical` → `npm run lint` → `npm run format:check` → `npm run build`.

**Steps**

1. **Find what failed**:

   ```
   gh pr checks <PR_NUMBER>
   gh run list --limit 5
   gh run view <RUN_ID> --log-failed
   ```

2. **Reproduce locally** (same order CI runs them in):

   ```
   export CI=true
   npm ci
   npm audit --audit-level=critical
   npm run lint
   npm run format:check
   npm run build
   ```

3. **Match the symptom to the fix**:

   | Symptom                      | Fix                                                                               |
   | ---------------------------- | --------------------------------------------------------------------------------- |
   | `npm audit` fails            | Known CVE in a dependency — try `npm audit fix`, else update the package directly |
   | `npm run lint` fails         | `npm run lint:fix`, then resolve whatever's left by hand                          |
   | `npm run format:check` fails | `npm run format` to auto-fix                                                      |
   | `npm run build` fails        | Read the Vite error directly — usually a bad import or syntax error               |

4. **If it passes locally but fails in CI**: your local `node_modules` is probably stale relative to `package-lock.json` (CI always does a clean `npm ci`). Reproduce clean:
   ```
   rm -rf node_modules .vite && npm ci
   ```
