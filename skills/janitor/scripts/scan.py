#!/usr/bin/env python3
"""Read-only cache and temporary-storage inventory for macOS, Linux, and Windows."""

from __future__ import annotations

import json
import os
import platform
import shutil
import sys
import argparse
from pathlib import Path


def emit(**record: object) -> None:
    print(json.dumps(record, ensure_ascii=True, sort_keys=True))


def allocated_size(path: Path, root_device: int) -> tuple[int, int]:
    total = 0
    errors = 0
    stack = [path]
    while stack:
        current = stack.pop()
        try:
            stat = current.lstat()
            if current.is_symlink() or stat.st_dev != root_device:
                errors += 1
                continue
            total += getattr(stat, "st_blocks", 0) * 512 or stat.st_size
            if current.is_dir():
                with os.scandir(current) as entries:
                    stack.extend(Path(entry.path) for entry in entries)
        except (OSError, PermissionError):
            errors += 1
    return total, errors


def inventory_root(
    kind: str, root: Path, own_entries_only: bool
) -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    source = root.expanduser()
    if source.is_symlink():
        records.append(
            dict(kind=kind, status="blocked", path=str(source), bytes=0, errors=1)
        )
        return records
    try:
        resolved = source.resolve(strict=True)
        root_stat = resolved.lstat()
    except (OSError, PermissionError):
        records.append(
            dict(kind=kind, status="blocked", path=str(root), bytes=0, errors=1)
        )
        return records

    if not resolved.is_dir():
        records.append(
            dict(kind=kind, status="blocked", path=str(resolved), bytes=0, errors=1)
        )
        return records

    try:
        entries = list(resolved.iterdir())
    except (OSError, PermissionError):
        records.append(
            dict(kind=kind, status="blocked", path=str(resolved), bytes=0, errors=1)
        )
        return records

    current_uid = os.getuid() if hasattr(os, "getuid") else None
    for entry in entries:
        try:
            stat = entry.lstat()
        except (OSError, PermissionError):
            records.append(
                dict(kind=kind, status="blocked", path=str(entry), bytes=0, errors=1)
            )
            continue
        if entry.is_symlink() or stat.st_dev != root_stat.st_dev:
            records.append(
                dict(kind=kind, status="blocked", path=str(entry), bytes=0, errors=1)
            )
            continue
        if own_entries_only and current_uid is not None and stat.st_uid != current_uid:
            continue
        size, errors = allocated_size(entry, root_stat.st_dev)
        records.append(
            dict(
                kind=kind,
                status="measured" if errors == 0 else "partial",
                path=str(entry),
                bytes=size,
                errors=errors,
            )
        )
    return records


def add_root(
    roots: list[tuple[str, Path, bool]],
    seen: set[str],
    kind: str,
    path: Path,
    own_only: bool = False,
) -> None:
    expanded = path.expanduser()
    key = os.path.normcase(os.path.abspath(expanded))
    if key not in seen and expanded.is_dir():
        roots.append((kind, expanded, own_only))
        seen.add(key)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--limit",
        type=int,
        default=25,
        help="largest entries reported per category (default: 25, maximum: 200)",
    )
    args = parser.parse_args()
    if not 1 <= args.limit <= 200:
        parser.error("--limit must be between 1 and 200")

    home = Path.home()
    if str(home) in ("", ".", os.path.sep):
        emit(kind="error", status="blocked", path=str(home), bytes=0, errors=1)
        return 2

    system = platform.system()
    usage = shutil.disk_usage(home)
    emit(
        kind="volume",
        status="info",
        path=str(home),
        bytes=usage.free,
        errors=0,
        platform=system,
    )

    roots: list[tuple[str, Path, bool]] = []
    seen: set[str] = set()
    if system == "Darwin":
        add_root(roots, seen, "cache", home / "Library/Caches")
    elif system == "Windows":
        local = os.environ.get("LOCALAPPDATA")
        if local:
            add_root(roots, seen, "cache", Path(local) / "npm-cache")
    else:
        cache_home = Path(os.environ.get("XDG_CACHE_HOME", home / ".cache"))
        add_root(roots, seen, "cache", cache_home)

    for path in (
        home / ".gradle/caches",
        home / ".npm/_npx",
        home / ".npm/_cacache",
        home / ".bun/install/cache",
        home / ".yarn/berry/cache",
        home / ".cargo/registry",
    ):
        add_root(roots, seen, "cache", path)

    temp_value = (
        os.environ.get("TMPDIR")
        or os.environ.get("TEMP")
        or os.environ.get("TMP")
    )
    if temp_value:
        add_root(roots, seen, "temp", Path(temp_value), own_only=True)
    elif system != "Windows":
        add_root(roots, seen, "temp", Path("/tmp"), own_only=True)

    records: list[dict[str, object]] = []
    for kind, root, own_only in roots:
        records.extend(inventory_root(kind, root, own_only))

    for kind in ("cache", "temp"):
        candidates = [
            record
            for record in records
            if record["kind"] == kind and record["status"] != "blocked"
        ]
        candidates.sort(key=lambda record: int(record["bytes"]), reverse=True)
        emit(
            kind="summary",
            category=kind,
            status="info",
            path="",
            bytes=sum(int(record["bytes"]) for record in candidates),
            errors=sum(int(record["errors"]) for record in candidates),
            candidates=len(candidates),
            reported=min(len(candidates), args.limit),
        )
        for record in candidates[: args.limit]:
            emit(**record)

    blocked = [record for record in records if record["status"] == "blocked"]
    for record in blocked[: args.limit]:
        emit(**record)
    if blocked:
        emit(
            kind="summary",
            category="blocked",
            status="info",
            path="",
            bytes=0,
            errors=len(blocked),
            candidates=len(blocked),
            reported=min(len(blocked), args.limit),
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
