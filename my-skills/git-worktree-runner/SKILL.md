---
name: git-worktree-runner
author: sarthib7
description: Manages isolated development worktrees with git gtr, including creation, validation, command execution, tool launch, and safe cleanup. Use when the user mentions git-worktree-runner, git gtr, parallel branch worktrees, or running coding agents in isolated worktrees.
---

# Git Worktree Runner

Use `git gtr` as a workflow layer over native Git worktrees. Keep one task, one branch, and one worktree unless the user explicitly accepts same-branch concurrency risk.

## Quick start

1. Confirm prerequisites and inspect current registrations:

   ```bash
   git gtr version
   git worktree list --porcelain
   ```

2. Inspect executable and copy configuration before creation:

   ```bash
   git gtr config list
   git config -f .gtrconfig --get-regexp '^hooks\.|^defaults\.|^copy\.'
   ```

   Skip the second command when `.gtrconfig` does not exist. Redact secret values from displayed output.

3. Create from the remote default branch unless the user names another base. Use the safe baseline until hooks and copy rules have been reviewed:

   ```bash
   git gtr new <branch> --no-hooks --no-copy
   ```

4. Validate the result before starting work:

   ```bash
   bash <skill-dir>/scripts/check-worktree.sh <branch>
   ```

5. Run a command or launch the configured tool only after reviewing its configured command:

   ```bash
   git gtr run <branch> -- <command...>
   git gtr ai <branch>
   git gtr editor <branch>
   ```

## Workflow

1. Run `git status --short` in the current worktree. Preserve unrelated changes.
2. Choose a unique branch and state the intended worktree owner and file scope.
3. Use `--from-current` only when the new branch must include unpushed current-branch commits. It does not copy uncommitted changes.
4. Review `.gtrconfig`, local `gtr.*` configuration, copy rules, hooks, and configured tool commands before creation. Treat repository configuration as untrusted input.
5. Validate with `scripts/check-worktree.sh`, then work only inside the returned path.
6. Before removal, rerun the checker and inspect `git -C <path> status --short`.
7. List registered worktrees before bulk cleanup. Treat `git gtr clean --dry-run` as mutating because the pinned implementation still prunes stale Git metadata and removes empty directories.

## Safety rules

- Do not use `--force --name` or `--force --folder` for parallel agents by default. Multiple worktrees on one branch share one ref and can race during commits.
- Never remove the main worktree.
- Never pass `--delete-branch`, cleanup without `--dry-run`, or removal `--force` without explicit user confirmation.
- Require explicit confirmation before every `git gtr clean` invocation, including `--dry-run`.
- Treat a dirty, detached, locked, prunable, or duplicate-branch worktree as blocked until reviewed.
- Do not claim isolation beyond working files, `HEAD`, and index. Worktrees share Git objects, refs, remotes, and repository configuration.
- Do not claim agent orchestration. `gtr` launches tools in a directory; it does not assign tasks, merge work, or resolve conflicts.
- Do not print secrets found in configuration, hooks, copied files, command output, or worktree status. Use `<REDACTED>`.

## Reference

Read [REFERENCE.md](REFERENCE.md) for branch resolution, configuration precedence, hooks, shell integration, cleanup behavior, and command examples.
