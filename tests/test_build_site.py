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


if __name__ == "__main__":
    unittest.main()
