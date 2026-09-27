# Contributing

Keep each change limited to the part of the agent setup you want to improve.

## Choose the source

<!-- VERIFIED: rules/README.md and rules/sync.py define rules snapshot ownership. The linked workflows and config files define the other setup sources. -->

| Change | Source and contribution route |
|---|---|
| Rules | Propose wording against [rules/AGENTS.md](rules/AGENTS.md). The source owner regenerates this snapshot. |
| Workflows | Edit [orchestration](workflows/orchestration.md) or the [repository protocol](workflows/agentic-engineering.md). Keep their responsibilities distinct. |
| Harness configuration | Update the [OMP example](rules/omp-config.example.yml) or [Claude Code example](rules/settings.example.json). Record what you checked and remove private values. |
| Skills | Follow the ownership and catalog steps below. |

`rules/AGENTS.md` is generated from the maintainer's local rules file. If you maintain that source, follow the [rules sync instructions](rules/README.md#syncpy). Other contributors should describe the proposed policy change for the source owner.

For OMP changes, keep the model role examples consistent with the [operating workflow](workflows/orchestration.md). Describe configuration values as examples unless you tested them. Include evidence for claims about supported models or harness behavior.

## Add or update a skill

<!-- VERIFIED: AGENTS.md defines the ownership roots. scripts/build-index.py validates metadata and groups, then writes the catalog outputs below. -->

1. Put collected work in `skills/<name>/` or verified original work in `my-skills/<name>/`.
2. Include `name` and `description` in `SKILL.md` frontmatter. Add the skill to one catalog group in `scripts/build-index.py`.
3. Record its author, source, and license in `ATTRIBUTION.md` when known.
4. Regenerate and validate:

```bash
python3 -B scripts/build-index.py
python3 -B scripts/build-site.py
```

Commit the generated `SKILLS.md`, `skills.sh.json`, and README badge changes with the source change. Do not edit those generated sections by hand.

## Refresh collected skills

Compare the source with the repository before copying. Include supporting files, and preserve path changes needed by this repository. Keep existing skills unless their removal is part of the requested change.

Record source and license evidence in `ATTRIBUTION.md`. Exclude private examples, runtime credentials, caches, and machine-specific session bindings. A local snapshot match does not prove upstream freshness.

List the checkout's skills without installing them:

```bash
npx skills add . --full-depth --list
```

<!-- VERIFIED: Cached skills CLI 1.7.0 discovered all catalog names with --full-depth. Its default discovery omitted my-skills/. -->

Use `--full-depth` so discovery includes `my-skills/` as well as `skills/`. Check that install instructions include any required companion skills or shared files.

## Website changes

<!-- VERIFIED: site/index.html links the setup sources. site/skills.html contains the skill catalog tokens. scripts/build-site.py renders both pages. -->

[site/index.html](site/index.html) presents the whole setup. [site/skills.html](site/skills.html) provides the searchable skill catalog. Keep rules, workflows, and OMP configuration visible on the homepage.

<!-- VERIFIED: scripts/build-site.py writes _site/ and copies site/style.css, site/catalog.js, and site/icon.svg. .gitignore excludes _site/. -->

Edit `site/style.css` for shared styles. Edit `site/catalog.js` for skill search, filters, and copy controls. The builder writes public files to `_site/`, which Git ignores.

Preview both pages:

```bash
python3 -B scripts/build-site.py
python3 -m http.server 8000 --directory _site
```

1. Open `http://localhost:8000/`. Check the setup guide and its source links.
2. Open `http://localhost:8000/skills.html`. Check search, category filters, empty results, and copying an install command.
3. Check both pages with a narrow viewport and keyboard navigation.

## Before committing

Run:

```bash
python3 -B scripts/build-index.py
python3 -B scripts/build-site.py
python3 -B -m unittest discover -s tests -v
git diff --check
```

Review the generated diff and any changed source links.

<!-- VERIFIED: .github/workflows/validate.yml defines pull request checks. .github/workflows/pages.yml uploads _site/ as the Pages artifact. -->

Pull requests run [catalog and site checks](.github/workflows/validate.yml). The [Pages workflow](.github/workflows/pages.yml) builds the site and uploads only `_site/`.
