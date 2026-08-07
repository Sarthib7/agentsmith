# Git Worktree Runner Reference

## Mechanism

`git gtr` is a Bash dispatcher around native `git worktree` commands. A linked worktree has its own checkout, `HEAD`, and index. It shares the repository object database, refs, remotes, and most configuration.

`git gtr new <branch>` performs this sequence:

1. Finds the main repository through `git rev-parse --git-common-dir`.
2. Resolves worktree base directory. Default is `<repo-parent>/<repo-name>-worktrees`.
3. Fetches the selected remote unless `--no-fetch` is set.
4. Selects existing remote branch, existing local branch, or creates a new branch from the resolved base commit.
5. Calls `git worktree add`.
6. Copies configured files and directories.
7. Runs trusted `postCreate` hooks.
8. Optionally opens an editor or starts an AI CLI inside the worktree.

Default new-branch base is the selected remote's default branch. Use `--from-current` for current branch or `--from <ref>` for an explicit base.

## Configuration

Single-value precedence:

```text
local .git/config
.gtrconfig
global or system Git config
environment variable
built-in fallback
```

Multi-value settings merge local, `.gtrconfig`, global, and system values with duplicates removed.

Relevant keys:

```text
gtr.worktrees.dir
gtr.worktrees.prefix
gtr.defaultBranch
gtr.defaultRemote
gtr.copy.include
gtr.copy.exclude
gtr.copy.includeDirs
gtr.copy.excludeDirs
gtr.hook.postCreate
gtr.hook.preRemove
gtr.hook.postRemove
gtr.hook.postCd
gtr.editor.default
gtr.ai.default
```

`.gtrconfig` hooks plus editor and AI defaults require trust. Trust binds canonical repository path to a hash of executable definitions. Any definition change requires review and renewed trust.

Review configuration before `git gtr new`. A previously trusted repository may run `postCreate` hooks during creation. Copy rules can also duplicate ignored credentials or dependency caches. Use `--no-hooks --no-copy` until both sets of rules are accepted.

## Common commands

```bash
# Inspect
git gtr list
git worktree list --porcelain
git gtr config list

# Create
git gtr new feature/auth
git gtr new feature/auth --from-current
git gtr new feature/auth --from release/2
git gtr new feature/auth --no-copy --no-hooks

# Work
git gtr go feature/auth
git gtr run feature/auth -- npm test
git gtr ai feature/auth -- --help
git gtr editor feature/auth

# Review shared executable configuration
git config -f .gtrconfig --get-regexp '^hooks\.|^defaults\.editor$|^defaults\.ai$'
git gtr trust

# Read-only cleanup inventory
git worktree list --porcelain
```

`git gtr clean --dry-run` is not fully read-only at inspected commit `ad7a3c5`. It runs `git worktree prune` and removes empty directories before applying dry-run behavior to merged or closed worktree removal. Treat every `git gtr clean` call as a destructive action that needs explicit confirmation.

`git gtr go` prints a path. Raw `git gtr cd` cannot change the parent shell. Enable shell integration when direct navigation is needed:

```bash
eval "$(git gtr init zsh)"
gtr cd feature/auth
```

## Removal review

Before `git gtr rm <branch>`:

1. Resolve path with `git gtr go <branch>`.
2. Confirm it is not the main worktree.
3. Inspect tracked and untracked changes with `git -C <path> status --short`.
4. Confirm required commits exist elsewhere when branch deletion is requested.
5. Run configured `preRemove` hooks unless user explicitly authorizes bypass.

Redact credentials, tokens, private keys, raw payment data, and sensitive path components from captured configuration or command output.

`git gtr rm` removes the linked worktree. Branch deletion is separate. `--force` can remove dirty worktrees, and `--delete-branch` can force-delete the branch. Both require explicit confirmation.

## Sources

- Upstream repository: https://github.com/coderabbitai/git-worktree-runner
- Inspected implementation: https://github.com/coderabbitai/git-worktree-runner/tree/ad7a3c534fc36e6adfee44c480b03c2f7f959502
- Native worktree model: https://git-scm.com/docs/git-worktree
