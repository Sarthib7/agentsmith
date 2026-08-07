#!/usr/bin/env bash

set -u

usage() {
  printf 'Usage: %s [branch-or-id]\n' "$(basename "$0")" >&2
}

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

warn() {
  printf 'WARN: %s\n' "$1" >&2
  warnings=$((warnings + 1))
}

canonicalize() {
  (
    unset CDPATH
    cd -P -- "$1" 2>/dev/null && pwd -P
  )
}

if [ "$#" -gt 1 ]; then
  usage
  exit 1
fi

command -v git >/dev/null 2>&1 || fail "git not found in PATH"
git rev-parse --git-dir >/dev/null 2>&1 || fail "not inside a Git repository"
git gtr version >/dev/null 2>&1 || fail "git gtr not found or not runnable"

records=$(git worktree list --porcelain 2>/dev/null) || fail "cannot read Git worktree registry"
warnings=0

if [ "$#" -eq 0 ]; then
  printf '%s\n' "$records"
  exit 0
fi

target_id="$1"
target_path=$(git gtr go "$target_id") || fail "cannot resolve worktree: $target_id"
target_path=$(canonicalize "$target_path") || fail "resolved path does not exist: $target_path"

main_path=""
while IFS= read -r line; do
  case "$line" in
    "worktree "*)
      main_path=${line#worktree }
      break
      ;;
  esac
done <<EOF
$records
EOF

[ -n "$main_path" ] || fail "main worktree missing from Git registry"
main_path=$(canonicalize "$main_path") || fail "main worktree path does not exist: $main_path"

if [ "$target_path" = "$main_path" ]; then
  warn "target is the main worktree and must not be removed"
fi

target_registered=0
target_locked=0
target_prunable=0
in_target=0
while IFS= read -r line; do
  case "$line" in
    "worktree "*)
      registered_path=${line#worktree }
      registered_path=$(canonicalize "$registered_path" || printf '%s' "$registered_path")
      if [ "$registered_path" = "$target_path" ]; then
        in_target=1
        target_registered=1
      else
        in_target=0
      fi
      ;;
    locked*)
      [ "$in_target" -eq 1 ] && target_locked=1
      ;;
    prunable*)
      [ "$in_target" -eq 1 ] && target_prunable=1
      ;;
  esac
done <<EOF
$records
EOF

[ "$target_registered" -eq 1 ] || fail "target is absent from Git worktree registry"
[ "$target_locked" -eq 0 ] || warn "worktree is locked"
[ "$target_prunable" -eq 0 ] || warn "worktree registry entry is prunable"

branch=$(git -C "$target_path" branch --show-current 2>/dev/null || true)
if [ -z "$branch" ]; then
  branch=$(git -C "$target_path" rev-parse --abbrev-ref HEAD 2>/dev/null || true)
fi

if [ -z "$branch" ] || [ "$branch" = "HEAD" ]; then
  warn "target has detached HEAD"
  branch="(detached)"
fi

branch_count=0
if [ "$branch" != "(detached)" ]; then
  while IFS= read -r line; do
    if [ "$line" = "branch refs/heads/$branch" ]; then
      branch_count=$((branch_count + 1))
    fi
  done <<EOF
$records
EOF

  if [ "$branch_count" -gt 1 ]; then
    warn "branch is checked out in $branch_count worktrees: $branch"
  fi
fi

status=$(git -C "$target_path" status --porcelain 2>/dev/null) || fail "cannot inspect worktree status"
if [ -n "$status" ]; then
  warn "worktree has tracked or untracked changes"
fi

printf 'path: %s\n' "$target_path"
printf 'branch: %s\n' "$branch"
printf 'branch_worktrees: %s\n' "$branch_count"
if [ -n "$status" ]; then
  printf 'status:\n%s\n' "$status"
else
  printf 'status: clean\n'
fi

if [ "$warnings" -gt 0 ]; then
  printf 'result: review required (%s warning(s))\n' "$warnings" >&2
  exit 2
fi

printf 'result: clean and uniquely checked out\n'
