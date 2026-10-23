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
        self.assertNotIn(str(sync.SOURCE), rendered)
        self.assertNotIn("~/.", rendered)

    def test_render_omits_profile_and_identity_but_keeps_commit_policy(self):
        source_text = "\n".join(old for old, _ in sync.REQUIRED)
        source_text += (
            "\n# About me\n\n"
            "PRIVATE_PROFILE_FIXTURE\n\n"
            "# Git commit rules\n\n"
            "- **Commit identity.** example / person@example.invalid\n"
            "- Keep feature commits scoped.\n"
        )
        with tempfile.TemporaryDirectory(dir=SYNC_PATH.parents[1]) as directory:
            source = Path(directory) / "AGENTS.md"
            source.write_text(source_text, encoding="utf-8")
            with patch.object(sync, "SOURCE", source):
                rendered = sync.render()

        self.assertNotIn("PRIVATE_PROFILE_FIXTURE", rendered)
        self.assertNotIn("person@example.invalid", rendered)
        self.assertIn("- Keep feature commits scoped.", rendered)

    def test_render_rejects_private_leftovers_without_echoing_them(self):
        private_inputs = (
            "~/.private-fixture/service-token",
            str(Path("/") / "Users" / "fixture-user" / "policy.md"),
            "person@example.invalid",
        )
        for private_input in private_inputs:
            with self.subTest(private_input=private_input):
                source_text = "\n".join(old for old, _ in sync.REQUIRED)
                source_text += "\nUnmapped input: " + private_input
                with tempfile.TemporaryDirectory(dir=SYNC_PATH.parents[1]) as directory:
                    source = Path(directory) / "AGENTS.md"
                    source.write_text(source_text, encoding="utf-8")
                    with patch.object(sync, "SOURCE", source):
                        with self.assertRaises(SystemExit) as failure:
                            sync.render()

                self.assertNotIn(private_input, str(failure.exception))


if __name__ == "__main__":
    unittest.main()
