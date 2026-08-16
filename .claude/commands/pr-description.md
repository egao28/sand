---
name: PR Description
description: Fill out this repo's PR template from the actual diff and open the pull request.
category: Development
tags: [pr, github, template]
---

You are opening a pull request for this Vite + React portfolio site. The change to describe is: $ARGUMENTS

**Guardrail**

Write the description from the actual diff, not from memory of what you intended to do. Read the real changes before filling in any section.

**Steps**

1. **Review what changed**:

   ```
   git status
   git diff main...HEAD
   git log main..HEAD --oneline
   ```

2. **Write the body with these sections** (no repo template file — compose this structure directly):
   - **Summary** — 1-3 sentences on what and why, grounded in the diff you just read.
   - **Changes** — one bullet per real change; don't pad the list.
   - **Testing** — check off only what you actually ran: `npm run lint`, `npm run format:check`, `npm run build`, and manual verification via `npm run dev`.
   - **Frontend Checklist** — check off only what you actually verified (responsive, accessibility, no console errors, routes/links).
   - **Breaking Changes** — `None` unless something genuinely breaks existing behavior.
   - **Related Issues** — one closing keyword per issue, e.g. `Closes #12, closes #13` — `Closes #12, #13` only closes the first one.

3. **Open the PR**, passing the body via heredoc:
   ```
   git push -u origin <branch-name>
   gh pr create --title "feat: <short description>" --base main --body "$(cat <<'EOF'
   ## Summary


   ## Changes
   -

   ## Testing
   - [ ] Lint passes: `npm run lint`
   - [ ] Format check passes: `npm run format:check`
   - [ ] Build succeeds: `npm run build`
   - [ ] Manually verified in the browser

   ## Frontend Checklist
   - [ ] Responsive (mobile/tablet/desktop)
   - [ ] Accessibility (alt text, labels, keyboard nav)
   - [ ] No console errors
   - [ ] Routes/links verified

   ## Breaking Changes
   None

   ## Related Issues
   Closes #
   EOF
   )"
   ```
