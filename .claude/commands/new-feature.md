---
name: New Feature
description: Simplified branch → implement → check → PR → merge workflow for this repo.
category: Development
tags: [feature, git, workflow]
---

You are working on a simple Vite + React portfolio site (no backend, no TypeScript, no test framework — but ESLint/Prettier are configured). The user's feature request is: $ARGUMENTS

**Guardrail**

Never edit files directly on `main`. Always create a feature branch first. If you are currently on `main`, STOP before making any changes and create a branch per Step 2.

**Steps**

1. **Describe the work** — write (or have the user confirm) a one-paragraph description of what the feature is and why. Optionally file it as a GitHub issue:

   ```
   gh issue create --title "Add dark mode toggle" --body "Users want a way to switch themes without a page reload."
   ```

2. **Create a branch from `main`**:

   ```
   git checkout main
   git pull
   git checkout -b feat/dark-mode-toggle
   git branch --show-current   # confirm you're off main
   ```

3. **Implement** the change on this branch.

4. **Local checks** — run before opening the PR:

   ```
   npm run lint         # ESLint, must pass
   npm run format:check # Prettier, must pass (or run `npm run format` to auto-fix)
   npm run build        # must succeed
   npm run dev           # manually click through the change in the browser
   ```

   The pre-commit hook (Husky + lint-staged) also runs ESLint/Prettier on staged files automatically.

5. **Open the PR** (see `/pr-description` for composing the body):

   ```
   git add <files>
   git commit -m "feat: add dark mode toggle"
   git push -u origin feat/dark-mode-toggle
   gh pr create --title "feat: add dark mode toggle" --base main
   ```

6. **Merge** once approved:

   ```
   gh pr merge --squash
   ```

7. **Clean up** once the PR shows as merged (see `/cleanup-branch`).
