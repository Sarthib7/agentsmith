#!/usr/bin/env python3
"""Build the setup homepage and skill browser from repository sources."""

import html
import importlib.util
from pathlib import Path
import re
import shutil
import sys

REPO = Path(__file__).resolve().parent.parent
SOURCE_URL = "https://github.com/Sarthib7/agentsmith/blob/main/"


def render_card(skill, short_description):
    """Escape source metadata before it enters HTML text or attributes."""
    name = html.escape(skill["name"], quote=True)
    section = html.escape(skill["section"], quote=True)
    group = html.escape(skill["group"], quote=True)
    search = html.escape(" ".join([
        skill["name"], skill["description"], skill["section"], skill["group"],
    ]), quote=True)
    description = html.escape(short_description, quote=True)
    source = html.escape(SOURCE_URL + skill["path"], quote=True)
    authored = "true" if skill["authored"] else "false"
    badge = '<span class="skill-author">By sarthib7</span>' if skill["authored"] else ""
    command = f"npx skills add Sarthib7/agentsmith --full-depth --skill {name}"
    return f'''<article class="skill-card" data-name="{name}" data-section="{section}" data-group="{group}" data-search="{search}" data-authored="{authored}">
  <p class="skill-group">{group}</p>
  <h3 class="skill-name"><a href="{source}">{name}</a></h3>
  {badge}
  <p class="skill-description">{description}</p>
  <div class="skill-actions">
    <a class="skill-source" href="{source}">Read skill</a>
    <button type="button" class="copy-button" data-copy="{command}" aria-label="Copy install command for {name}">Copy install</button>
  </div>
</article>'''


def render_template(template, replacements):
    """Replace template tokens without treating skill text as template source."""
    for token in replacements:
        if token not in template:
            raise ValueError(f"missing site template token: {token}")
    pattern = "|".join(re.escape(token) for token in replacements)
    return re.sub(pattern, lambda match: replacements[match.group(0)], template)


def main():
    spec = importlib.util.spec_from_file_location("build_index", REPO / "scripts/build-index.py")
    index = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(index)
    try:
        catalog = index.load_catalog()
    except (ValueError, OSError) as error:
        print(f"ERROR {error}", file=sys.stderr)
        return 1

    cards = "\n".join(
        render_card(skill, index.first_sentence(skill["description"], limit=220))
        for skill in sorted(catalog, key=lambda skill: skill["name"])
    )
    filters = []
    for section, label in index.SECTIONS.items():
        count = sum(skill["section"] == section for skill in catalog)
        filters.append(
            f'<button type="button" class="filter-button" data-section-filter="{html.escape(section)}" '
            f'aria-pressed="false">{html.escape(label)} <span>{count}</span></button>'
        )

    replacements = {
        "{{SKILL_CARDS}}": cards,
        "{{SECTION_FILTERS}}": "\n".join(filters),
        "{{SKILL_COUNT}}": str(len(catalog)),
    }
    try:
        pages = {
            "index.html": render_template(
                (REPO / "site/index.html").read_text(encoding="utf-8"),
                {"{{SKILL_COUNT}}": str(len(catalog))},
            ),
            "skills.html": render_template(
                (REPO / "site/skills.html").read_text(encoding="utf-8"), replacements,
            ),
        }
    except (ValueError, OSError) as error:
        print(f"ERROR {error}", file=sys.stderr)
        return 1

    output = REPO / "_site"
    output.mkdir(exist_ok=True)
    for name, content in pages.items():
        (output / name).write_text(content, encoding="utf-8")
    for name in ("style.css", "catalog.js", "icon.svg"):
        shutil.copyfile(REPO / "site" / name, output / name)
    (output / ".nojekyll").write_text("", encoding="utf-8")
    print(f"OK website: setup homepage and {len(catalog)} skills in _site/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
