"""Check the boundary between skill metadata and generated HTML."""

from html.parser import HTMLParser
import importlib.util
from pathlib import Path
import unittest


spec = importlib.util.spec_from_file_location(
    "build_site", Path(__file__).resolve().parents[1] / "scripts/build-site.py",
)
site = importlib.util.module_from_spec(spec)
spec.loader.exec_module(site)


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
        self.assertEqual(site.main(), 0)
        markup = (site.REPO / "_site/index.html").read_text(encoding="utf-8")
        anchors = Anchors(markup).anchors
        by_label = {anchor["label"]: anchor for anchor in anchors}
        self.assertEqual(by_label["Sarthiii.me"]["href"], "https://sarthiii.me/")
        self.assertEqual(by_label["Book a call"]["href"], "https://cal.com/sarthi")
        # Visible text is the accessible name: no aria-label may override it.
        for label in ("Sarthiii.me", "Book a call"):
            self.assertNotIn("aria-label", by_label[label])
        # Existing navigation survives.
        hrefs = {anchor["href"] for anchor in anchors if "href" in anchor}
        self.assertTrue({
            "#setup",
            "skills.html",
            "https://github.com/Sarthib7/agentsmith",
            "https://github.com/Sarthib7/agentsmith/blob/main/rules/omp-advisors.example.yml",
            "https://github.com/Sarthib7/agentsmith/blob/main/rules/agent-profiles.example.md",
        } <= hrefs)
        advisor = next(anchor for anchor in anchors if anchor.get("href", "").endswith("omp-advisors.example.yml"))
        profiles = next(anchor for anchor in anchors if anchor.get("href", "").endswith("agent-profiles.example.md"))
        self.assertIn("Advisor roster", advisor["label"])
        self.assertIn("Custom agent profiles", profiles["label"])


if __name__ == "__main__":
    unittest.main()
