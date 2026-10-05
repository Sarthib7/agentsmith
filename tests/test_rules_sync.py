"""Check that global rules render as a portable repository snapshot."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


SYNC_PATH = Path(__file__).resolve().parents[1] / "rules" / "sync.py"
spec = importlib.util.spec_from_file_location("rules_sync", SYNC_PATH)
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class RulesSyncTests(unittest.TestCase):
    def test_render_rewrites_personal_paths_to_repo_sources(self):
        source_text = "\n".join(old for old, _ in sync.REQUIRED)
        source_text += "\nExtra skill: ~/.agents/skills/example/SKILL.md"
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "AGENTS.md"
            source.write_text(source_text, encoding="utf-8")
            with patch.object(sync, "SOURCE", source):
                rendered = sync.render()

        for expected in (
            "Canonical source: ~/AGENTS.md",
            "[SKILLS.md](../SKILLS.md)",
            "[agentic-engineering.md](../workflows/agentic-engineering.md)",
            "[omp-config.example.yml](omp-config.example.yml)",
            "[settings.example.json](settings.example.json)",
            "skills/example/SKILL.md",
        ):
            with self.subTest(expected=expected):
                self.assertIn(expected, rendered)

        self.assertNotIn("/Users/sarthiborkar/", rendered)
        self.assertNotIn("~/.", rendered)


if __name__ == "__main__":
    unittest.main()
