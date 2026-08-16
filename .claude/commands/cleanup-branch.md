---
name: Cleanup Branch
description: Delete a merged feature branch safely and prune stale remote refs.
category: Development
tags: [git, cleanup, workflow]
---

You are cleaning up after a PR merge. The branch to clean up is: $ARGUMENTS

**Guardrail**

Never delete a branch that hasn't actually been merged — always use `-d`, never `-D`, unless the user has explicitly confirmed the commits are no longer needed.

**Steps**

1. **Verify the PR merged**:

   ```
   gh pr view <number>   # confirm state is MERGED
   ```

2. **Update `main`**:

   ```
   git checkout main
   git pull   # if this fails, stop and resolve before deleting anything
   ```

3. **Delete the branch**:

   ```
   git branch -d feat/xxx   # -d, not -D — refuses if not actually merged
   git remote prune origin  # clear stale remote-tracking refs
   ```

   If `-d` errors with "not fully merged," your local `main` likely hasn't seen the merge yet:

   ```
   git fetch origin && git pull
   git branch -d feat/xxx
   ```

   Only reach for `-D` if you're certain the branch's commits are no longer needed — check what you'd lose first:

   ```
   git log main..feat/xxx
   ```

4. **Remote branch**: this repo has **Automatically delete head branches** enabled on GitHub, so the remote branch is already gone after merge — `git remote prune origin` handles the local stale ref. If that setting is ever off, delete it manually: `git push origin --delete feat/xxx`.
