"""Check the site builder's input and output contracts."""

from contextlib import redirect_stderr
from html.parser import HTMLParser
import importlib.util
from io import StringIO
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import urljoin, urlsplit


spec = importlib.util.spec_from_file_location(
    "build_site", Path(__file__).resolve().parents[1] / "scripts/build-site.py",
)
site = importlib.util.module_from_spec(spec)
spec.loader.exec_module(site)


DIAGRAM_BASENAMES = (
    "system-overview",
    "worker-farms",
    "configuration-flow",
    "approval-flow",
    "site-build",
    "whole-architecture",
)

SITE_TEMPLATES = (
    "site/index.html", "site/skills.html", "site/architecture.html",
    "site/rules.html", "site/workflows.html", "site/omp.html",
)
SITE_ASSETS = (
    "site/style.css", "site/catalog.js", "site/icon.svg",
    "site/architecture-viewer.mjs",
)


def make_site_fixture(
    root, *, missing_page=None, missing_diagram=None, missing_asset=None,
):
    (root / "scripts").mkdir()
    (root / "scripts/build-index.py").write_text(
        "SECTIONS = {}\n"
        "def load_catalog():\n    return []\n"
        "def first_sentence(description, limit):\n    return description[:limit]\n",
        encoding="utf-8",
    )
    for relative in SITE_TEMPLATES:
        if relative == missing_page:
            continue
        source = site.REPO / relative
        destination = root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
    for relative in SITE_ASSETS:
        if relative == missing_asset:
            continue
        source = site.REPO / relative
        destination = root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
    for basename in DIAGRAM_BASENAMES:
        if basename == missing_diagram:
            continue
        relative = f"docs/diagrams/{basename}.svg"
        source = site.REPO / relative
        destination = root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)


class References(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.references = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for attribute in ("href", "src"):
            if attrs.get(attribute):
                self.references.append((tag, attribute, attrs[attribute]))


class Elements(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.elements = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))


class Anchors(HTMLParser):
    """Collect anchors with the text a visitor sees, skipping aria-hidden glyphs."""

    def __init__(self, text):
        super().__init__()
        self.anchors = []
        self._current = None
        self._hidden_depth = 0
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a":
            self._current = {"attrs": attrs, "text": []}
            self._hidden_depth = 0
        elif self._current is not None and attrs.get("aria-hidden") == "true":
            self._hidden_depth += 1

    def handle_endtag(self, tag):
        if tag == "a" and self._current is not None:
            text = " ".join("".join(self._current["text"]).split())
            self.anchors.append({**self._current["attrs"], "label": text})
            self._current = None
        elif self._current is not None and self._hidden_depth:
            self._hidden_depth -= 1

    def handle_data(self, data):
        if self._current is not None and not self._hidden_depth:
            self._current["text"].append(data)



class SiteTests(unittest.TestCase):
    def test_metadata_stays_text_in_cards(self):
        description = '<img src=x onerror="alert(1)"> & {{SECTION_FILTERS}}'
        skill = {
            "name": "safe-skill", "description": description,
            "path": 'skills/quoted"folder/SKILL.md', "section": "coding",
            "group": '<script>alert("group")</script>', "authored": False,
        }
        markup = site.render_card(skill, description)
        elements = Elements(markup).elements
        self.assertFalse(any(tag in ("img", "script") for tag, _ in elements))
        self.assertFalse(any(key.startswith("on") for _, attrs in elements for key in attrs))
        article = next(attrs for tag, attrs in elements if tag == "article")
        self.assertIn(description, article["data-search"])
        button = next(attrs for tag, attrs in elements if tag == "button")
        self.assertEqual(button["data-copy"],
                         "npx skills add Sarthib7/agentsmith --full-depth --skill safe-skill")

    def test_skill_text_cannot_introduce_template_markup(self):
        template = "{{SKILL_CARDS}}\n{{SECTION_FILTERS}}\n{{SKILL_COUNT}}"
        result = site.render_template(template, {
            "{{SKILL_CARDS}}": "<p>Explain {{SECTION_FILTERS}} and {{SKILL_COUNT}}.</p>",
            "{{SECTION_FILTERS}}": "<button>All</button>",
            "{{SKILL_COUNT}}": "1",
        })
        self.assertEqual(result, "<p>Explain {{SECTION_FILTERS}} and {{SKILL_COUNT}}.</p>\n<button>All</button>\n1")

    def test_missing_template_token_is_an_error(self):
        with self.assertRaisesRegex(ValueError, "missing site template token"):
            site.render_template("<p>Broken template</p>", {"{{SKILL_CARDS}}": ""})

    def test_rendered_homepage_links_to_contact_and_omp_docs(self):
        with tempfile.TemporaryDirectory(dir=site.REPO.parent) as directory:
            root = Path(directory)
            make_site_fixture(root)
            with patch.object(site, "REPO", root):
                self.assertEqual(site.main(), 0)
            markup = (root / "_site/index.html").read_text(encoding="utf-8")
            anchors = Anchors(markup).anchors
            by_label = {anchor["label"]: anchor for anchor in anchors}
            self.assertNotIn("Sarthiii.me", by_label)
            self.assertFalse(
                any(anchor.get("href") == "https://sarthiii.me/" for anchor in anchors)
            )
            self.assertEqual(by_label["Book a call"]["href"], "https://cal.com/sarthi")
            self.assertNotIn("aria-label", by_label["Book a call"])
            hrefs = {anchor["href"] for anchor in anchors if "href" in anchor}
            self.assertTrue({
                "#setup",
                "skills.html",
                "https://github.com/Sarthib7/agentsmith",
                "https://github.com/Sarthib7/agentsmith/blob/main/rules/omp-advisors.example.yml",
                "https://github.com/Sarthib7/agentsmith/blob/main/rules/agent-profiles.example.md",
            } <= hrefs)

    def test_architecture_references_resolve_under_project_prefix(self):
        with tempfile.TemporaryDirectory(dir=site.REPO.parent) as directory:
            root = Path(directory)
            make_site_fixture(root)
            with patch.object(site, "REPO", root):
                self.assertEqual(site.main(), 0)

            output = root / "_site"
            for name in (
                "index.html", "skills.html", "architecture.html", "rules.html",
                "workflows.html", "omp.html",
            ):
                self.assertTrue((output / name).is_file(), name)
            page = output / "architecture.html"
            references = References(page.read_text(encoding="utf-8")).references
            page_url = "https://example.test/agentsmith/architecture.html"
            resolved = {"href": set(), "src": set()}
            for _, attribute, reference in references:
                parts = urlsplit(reference)
                if parts.scheme or parts.netloc:
                    continue
                target_url = urljoin(page_url, reference)
                path = urlsplit(target_url).path
                self.assertTrue(path.startswith("/agentsmith/"), reference)
                resolved[attribute].add(path)
                local_path = output / path.removeprefix("/agentsmith/")
                if local_path.is_dir():
                    self.assertTrue((local_path / "index.html").is_file(), reference)
                else:
                    self.assertTrue(local_path.is_file(), reference)

            for relative in (
                "./", "rules.html", "workflows.html", "omp.html",
                "architecture.html", "skills.html",
            ):
                expected = urlsplit(urljoin(page_url, relative)).path
                self.assertIn(expected, resolved["href"])
            self.assertIn("/agentsmith/architecture-viewer.mjs", resolved["src"])
            for basename in DIAGRAM_BASENAMES:
                expected = f"/agentsmith/diagrams/{basename}.svg"
                self.assertIn(expected, resolved["src"])
                self.assertIn(expected, resolved["href"])

    def test_successful_build_removes_stale_generated_output(self):
        with tempfile.TemporaryDirectory(dir=site.REPO.parent) as directory:
            root = Path(directory)
            make_site_fixture(root)
            output = root / "_site"
            output.mkdir()
            stale = output / "obsolete.html"
            stale.write_text("obsolete generated page", encoding="utf-8")

            with patch.object(site, "REPO", root):
                self.assertEqual(site.main(), 0)

            self.assertFalse(stale.exists())
            self.assertEqual(
                {path.name for path in output.glob("*.html")},
                {
                    "index.html", "skills.html", "architecture.html",
                    "rules.html", "workflows.html", "omp.html",
                },
            )

    def test_missing_required_input_preserves_existing_output(self):
        cases = [
            (template, {"missing_page": template})
            for template in SITE_TEMPLATES
        ]
        cases.extend(
            (asset, {"missing_asset": asset})
            for asset in SITE_ASSETS
        )
        cases.extend(
            (f"docs/diagrams/{basename}.svg", {"missing_diagram": basename})
            for basename in DIAGRAM_BASENAMES
        )
        for missing_input, fixture_options in cases:
            with self.subTest(missing_input=missing_input):
                with tempfile.TemporaryDirectory(dir=site.REPO.parent) as directory:
                    root = Path(directory)
                    make_site_fixture(root, **fixture_options)
                    output = root / "_site"
                    output.mkdir()
                    (output / "index.html").write_text("previous homepage", encoding="utf-8")
                    (output / "skills.html").write_text("previous catalog", encoding="utf-8")
                    (output / "keep.txt").write_text("previous asset", encoding="utf-8")
                    before = {
                        path.relative_to(output).as_posix(): path.read_bytes()
                        for path in output.rglob("*") if path.is_file()
                    }
                    stderr = StringIO()
                    with patch.object(site, "REPO", root), redirect_stderr(stderr):
                        result = site.main()
                    self.assertEqual(result, 1)
                    after = {
                        path.relative_to(output).as_posix(): path.read_bytes()
                        for path in output.rglob("*") if path.is_file()
                    }
                    self.assertEqual(after, before)
                    self.assertFalse((output / "diagrams").exists())

if __name__ == "__main__":
    unittest.main()
