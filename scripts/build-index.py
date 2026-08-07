#!/usr/bin/env python3
"""Move skills into skills/<section>/<name>/ and regenerate skills.sh.json + SKILLS.md.

Sections are a catalog layout the skills CLI walks one extra level deep for.
Validates that every skill on disk is assigned exactly once before moving anything.
"""
import json, os, re, shutil, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS_DIR = os.path.join(REPO, "skills")

SECTIONS = {
    "rules": "Rules",
    "coding": "Coding",
    "crypto": "Crypto",
    "writing": "Writing",
    "product": "Product",
}

SECTION_BLURB = {
    "rules": "Always on, or about the setup itself. Never invoked by name.",
    "coding": "Writing, reviewing, and shipping code. Chain-agnostic.",
    "crypto": "Blockchain work: Solana, EVM, and agent payment rails.",
    "writing": "Prose that ships, and stripping the AI tells out of it.",
    "product": "Deciding what to build, then getting people to use it.",
}

GROUPS = [
    # ---- rules ----
    ("rules", "Output rules",
     "How the agent talks. Compression and ordering, applied to every response.",
     ["caveman", "caveman-commit", "caveman-review", "caveman-compress", "caveman-help",
      "caveman-stats", "cavecrew", "i-have-adhd", "adhd"]),

    ("rules", "Session control",
     "Finding the right skill, widening the frame, carrying state between sessions.",
     ["skill-menu", "navigate-skills", "using-superpowers", "zoom-out", "handoff", "learn"]),

    ("rules", "Skill authoring",
     "Writing and maintaining skills themselves.",
     ["skill-creator", "write-a-skill", "setup-matt-pocock-skills"]),

    # ---- coding ----
    # `spec-build` is the `build` skill. The skills CLI skips nested dirs literally
    # named `build` (treats them as build output), so the dir is renamed and the
    # frontmatter still declares `name: build`.
    ("coding", "Spec-driven development",
     "SPEC.md as source of truth: distill it, build against it, check drift, feed every bug back in.",
     ["spec", "spec-build", "check", "backprop", "wayfinder"]),

    ("coding", "Review and verification",
     "Catching what you got wrong before someone else does, and proving fixes actually hold.",
     ["review", "followup-review", "review-and-iterate", "prove-it", "bench-it",
      "fresh-eyes", "cso", "diagnose", "improve", "improve-codebase-architecture",
      "tdd"]),

    ("coding", "Planning and issue tracking",
     "Stress-testing a plan before writing code, then turning it into trackable work.",
     ["grill-me", "grill-with-docs", "to-prd", "to-issues", "triage", "prototype", "wizard"]),

    ("coding", "Frontend",
     "React and Next.js architecture, plus interface craft.",
     ["frontend-architect", "frontend-design-guidelines"]),

    ("coding", "Backend and databases",
     "APIs, Postgres, and Supabase.",
     ["backend-specialist", "supabase", "supabase-postgres-best-practices"]),

    ("coding", "Deployment",
     "Render and Railway. Blueprints, services, domains, and what to do when a deploy fails.",
     ["use-railway", "render-deploy", "render-blueprints", "render-web-services",
      "render-background-workers", "render-cron-jobs", "render-workflows", "render-postgres",
      "render-keyvalue", "render-disks", "render-docker", "render-domains", "render-env-vars",
      "render-networking", "render-private-services", "render-scaling", "render-static-sites",
      "render-monitor", "render-debug", "render-cli", "render-mcp",
      "render-migrate-from-heroku"]),

    ("coding", "Documentation lookup",
     "Fetching current API docs instead of guessing from training data.",
     ["find-docs", "openai-docs"]),

    ("coding", "Tooling",
     "Hooks, pre-commit, migrations, and the tools the agent drives outside a codebase.",
     ["git-guardrails-claude-code", "setup-pre-commit", "migrate-to-shoehorn",
      "scaffold-exercises", "agent-browser", "obsidian-vault", "collab-canvas", "janitor"]),

    # ---- crypto ----
    ("crypto", "Solana engineering",
     "Program development, debugging, and the road to mainnet.",
     ["solana-dev", "solana-dev-expert", "solana-beginner", "virtual-solana-incubator",
      "debug-program", "deploy-to-mainnet"]),

    ("crypto", "Solana build guides",
     "Walkthrough playbooks that decide what to build and in what order.",
     ["build-defi-protocol", "build-data-pipeline", "build-mobile", "build-with-claude",
      "scaffold-project", "launch-token"]),

    ("crypto", "EVM",
     "Solidity, Foundry, and EVM protocol work.",
     ["ethskills", "evm-fullstack-dev"]),

    ("crypto", "Agent payment rails",
     "Agents that pay: Masumi on Cardano, MPP and x402, paid APIs, confidential inference.",
     ["masumi", "masumi-ecosystem-developer", "pay", "mppx", "temprouter", "tempo-request"]),

    ("crypto", "Ecosystem research",
     "Reading the market before committing to a build.",
     ["defillama-research", "colosseum-copilot", "find-next-crypto-idea",
      "submit-to-hackathon"]),

    # ---- writing ----
    ("writing", "Drafting",
     "Turning fragments and notes into something publishable.",
     ["writing-fragments", "writing-beats", "writing-shape", "edit-article"]),

    ("writing", "De-slopping",
     "The detector and the rewriter. Run on anything that ships.",
     ["avoid-ai-writing", "humanizer"]),

    # ---- product ----
    ("product", "Validation",
     "Pressure-testing an idea before you commit to it.",
     ["validate-idea", "competitive-landscape", "roast-my-product", "product-review"]),

    ("product", "Go to market",
     "Pitching, funding, branding, and telling people it exists.",
     ["create-pitch-deck", "apply-grant", "brand-design", "devrel-strategist",
      "marketing-video"]),
]


def frontmatter(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        text = f.read()
    m = re.match(r"^---\n(.*?)\n---", text, re.S)
    if not m:
        return None, None
    fm = m.group(1)

    def field(key):
        mm = re.search(rf"^{key}:[ \t]*(.*)$", fm, re.M)
        if not mm:
            return None
        head = mm.group(1).strip()
        rest = fm[mm.end():].lstrip("\n").splitlines()
        if re.fullmatch(r"[|>][-+]?\d*", head):
            body = []
            for line in rest:
                if line.strip() and not line[:1].isspace():
                    break
                body.append(line.strip())
            return " ".join(b for b in body if b).strip().strip("'\"")
        cont = []
        for line in rest:
            if not line.strip() or not line[:1].isspace():
                break
            cont.append(line.strip())
        return " ".join([head] + cont).strip().strip("'\"")

    return field("name"), field("description")


def first_sentence(desc, limit=180):
    if not desc:
        return ""
    desc = " ".join(desc.split())
    cut = desc
    for end in (". ", "? "):
        i = desc.find(end)
        if i != -1 and i < limit:
            cut = desc[: i + 1]
            break
    if len(cut) > limit:
        cut = cut[: limit - 1].rsplit(" ", 1)[0] + "…"
    return cut.strip()


def current_dirs():
    """Skill dirs, whether still flat or already sectioned."""
    found = {}
    for entry in os.listdir(SKILLS_DIR):
        p = os.path.join(SKILLS_DIR, entry)
        if not os.path.isdir(p):
            continue
        if os.path.isfile(os.path.join(p, "SKILL.md")):
            found[entry] = p
        else:
            for sub in os.listdir(p):
                sp = os.path.join(p, sub)
                if os.path.isfile(os.path.join(sp, "SKILL.md")):
                    found[sub] = sp
    return found


# Skills I wrote, surfaced as the first section on the skills.sh repo page.
# Manifest-only: each of these still lives in its real GROUPS entry, and the
# skills.sh schema puts no constraint on a skill appearing in two groupings.
FEATURED = (
    "Written here",
    "Mine. Written for this setup, not collected from anywhere.",
    ["bench-it", "fresh-eyes", "prove-it"],
)

BADGE = "https://img.shields.io/badge"


def render_box(rules_n, ondemand_n, inner=55):
    body = [
        "",
        "a g e n t s m i t h",
        "",
        f"{rules_n:<4} rules    always on, never invoked by name",
        f"{ondemand_n:<4} skills   load when the task matches",
        "",
    ]
    out = ["╭" + "─" * inner + "╮"]
    out += ["│" + ("    " + line).ljust(inner) + "│" for line in body]
    out.append("╰" + "─" * inner + "╯")
    return "\n".join(out)


def readme_counts(counts, total):
    """Rewrite the generated header box and badge row in README.md.

    Counts written by hand go stale the first time a skill is added. These are
    the only numbers in the README, and this owns both of them.
    """
    path = os.path.join(REPO, "README.md")
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as f:
        text = f.read()

    rules_n = counts.get("rules", 0)
    box = render_box(rules_n, total - rules_n)
    text, n_box = re.subn(r"```\n╭─[^`]*?╯\n```", "```\n" + box + "\n```", text, count=1)

    badges = [
        f"![skills]({BADGE}/skills-{total}-1a1a1a"
        "?style=flat-square&labelColor=1a1a1a&color=FF51FF)"
    ]
    badges += [
        f"![{sec}]({BADGE}/{sec}-{counts.get(sec, 0)}-1a1a1a?style=flat-square)"
        for sec in SECTIONS
    ]
    text, n_badge = re.subn(
        r"(<!-- counts:start -->\n).*?(\n<!-- counts:end -->)",
        lambda m: m.group(1) + "\n".join(badges) + m.group(2),
        text,
        flags=re.S,
        count=1,
    )

    if not (n_box and n_badge):
        print(f"WARN README markers missing (box={n_box}, badges={n_badge})", file=sys.stderr)

    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def main():
    on_disk = current_dirs()
    listed = [s for _, _, _, skills in GROUPS for s in skills]

    dupes = {s for s in listed if listed.count(s) > 1}
    missing = set(on_disk) - set(listed)
    ghosts = set(listed) - set(on_disk)
    if dupes or missing or ghosts:
        for label, bad in (("listed twice", dupes), ("ungrouped", missing), ("not on disk", ghosts)):
            if bad:
                print(f"ERROR {label}: {sorted(bad)}", file=sys.stderr)
        sys.exit(1)

    # move into sections
    moved = 0
    for section, _, _, skills in GROUPS:
        dest_dir = os.path.join(SKILLS_DIR, section)
        os.makedirs(dest_dir, exist_ok=True)
        for s in skills:
            src = on_disk[s]
            dest = os.path.join(dest_dir, s)
            if os.path.abspath(src) == os.path.abspath(dest):
                continue
            shutil.move(src, dest)
            moved += 1

    on_disk = current_dirs()
    meta = {d: frontmatter(os.path.join(p, "SKILL.md")) for d, p in on_disk.items()}

    # skills.sh.json keys on the declared frontmatter name
    feat_title, feat_desc, feat_skills = FEATURED
    stray = [s for s in feat_skills if s not in meta]
    if stray:
        print(f"ERROR FEATURED not on disk: {sorted(stray)}", file=sys.stderr)
        sys.exit(1)

    groupings = []
    if feat_skills:
        groupings.append({
            "title": feat_title,
            "description": feat_desc,
            "skills": sorted((meta[s][0] or s) for s in feat_skills),
        })
    groupings += [
        {
            "title": f"{section.capitalize()} · {title}",
            "description": desc,
            "skills": sorted((meta[s][0] or s) for s in skills),
        }
        for section, title, desc, skills in GROUPS
    ]

    manifest = {
        "$schema": "https://skills.sh/schemas/skills.sh.schema.json",
        "notGrouped": "bottom",
        "groupings": groupings,
    }
    with open(os.path.join(REPO, "skills.sh.json"), "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")

    # SKILLS.md
    lines = [
        "# Skill index",
        "",
        f"{len(on_disk)} skills across four sections: **core**, **coding**, **product**, **runtime**.",
        "Generated from `skills/*/*/SKILL.md`, do not edit by hand.",
        "",
        "Install one by its declared name:",
        "",
        "```bash",
        "npx skills add Sarthib7/agentsmith --skill <name>",
        "```",
        "",
        "Read one without installing it:",
        "",
        "```bash",
        "npx skills use Sarthib7/agentsmith@<name>",
        "```",
        "",
    ]
    for section, heading in SECTIONS.items():
        total = sum(len(sk) for s, _, _, sk in GROUPS if s == section)
        lines += [f"## {heading} <sub>({total})</sub>", "", SECTION_BLURB[section], ""]
        for gsection, title, desc, skills in GROUPS:
            if gsection != section:
                continue
            count = len(skills)
            lines += [f"### {title} <sub>({count})</sub>", "", desc, "",
                      "| Skill | What it does |", "|---|---|"]
            for s in sorted(skills):
                name, d = meta[s]
                name = name or s
                blurb = first_sentence(d).replace("|", "\\|")
                label = f"`{name}`" if name == s else f"`{name}` <sub>(dir `{s}`)</sub>"
                lines.append(f"| [{label}](skills/{section}/{s}/SKILL.md) | {blurb} |")
            lines.append("")

    with open(os.path.join(REPO, "SKILLS.md"), "w") as f:
        f.write("\n".join(lines))

    counts = {sec: sum(len(sk) for s, _, _, sk in GROUPS if s == sec) for sec in SECTIONS}
    readme_counts(counts, len(on_disk))
    print(f"OK moved {moved} dirs; {len(on_disk)} skills total")
    print("   " + ", ".join(f"{k}={v}" for k, v in counts.items()))


if __name__ == "__main__":
    main()
