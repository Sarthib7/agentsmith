---
name: janitor
description: Performs a read-only, platform-aware audit of cache and temporary storage, then reports cleanup candidates with measured sizes and risk notes. Use when disk space is low or the user asks what cache or temporary files they can clean safely.
author: sarthib7
---

# Janitor

Find cleanup candidates without changing the filesystem.

## Quick start

1. Detect the host platform and available Python 3 launcher.
2. Run `python3 scripts/scan.py` from this skill directory. On Windows, use the available Python 3 launcher.
3. Report free space, then rank results by measured bytes.
4. Explain that cache entries are normally recreated and temporary entries may belong to running processes.
5. Leave cleanup to the user. If they later ask for commands or execution, handle that as a separate destructive task with a new confirmation gate.

The scanner reads filesystem metadata only. It never opens file contents, deletes files, or changes files.

## Hard safety rules

- Never inspect file contents, browser profiles, documents, repositories, credentials, or shell history.
- Never use `sudo` for cleanup.
- Never delete as part of this skill's workflow.
- Never clear an entire home directory, workspace, `/Library`, `~/Library`, or `~/Library/Caches`.
- Never put `/`, the home directory, a workspace root, or an unresolved variable in a deletion command.
- Never use scanner output as an automatic deletion list.
- Treat symlinks, missing paths, permission failures, and unknown paths as blocked. Do not follow or delete them.
- Do not label an entry safe only because its name contains `cache` or `tmp`.
- Report permission failures and unreadable paths instead of treating them as empty.

## Risk classes

- `cache`: entries under an operating-system cache root or a known package/build cache. Usually recreated, but the agent must identify the owning tool before recommending cleanup.
- `temp`: entries under the current user's temporary directory. A running process may still need them.
- `blocked`: symlink, permission failure, different filesystem, or unreadable entry. Do not recommend it.

## Report format

State:

- current free space;
- largest cache candidates with exact paths and measured sizes;
- largest temporary candidates with exact paths and measured sizes;
- blocked entries and scan blind spots;
- paths intentionally excluded, including projects, browser profiles, containers, simulators, and Trash.

Sizes are observations, not promised recovery. Sparse files, snapshots, filesystem compression, and concurrent writes can change actual reclaimed space.

## Example report

```text
Free: 553 MiB
Cache: /Users/me/.gradle/caches, 13.6 GiB, Gradle-owned; dependencies download again
Temp: /private/var/folders/.../T/build, 420 MiB, ownership verified; close owning process first
Blocked: /Users/me/Library/Caches/example, permission denied
Excluded: Docker data, browser profiles, projects, simulators, Trash
```
