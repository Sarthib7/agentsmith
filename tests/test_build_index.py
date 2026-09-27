"""Exercise catalog generation in temporary repositories."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


BUILDER_PATH = Path(__file__).resolve().parents[1] / "scripts" / "build-index.py"


class CatalogTests(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location("build_index", BUILDER_PATH)
        self.builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.builder)
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.repo = Path(self.directory.name)
        (self.repo / "skills").mkdir()
        (self.repo / "my-skills").mkdir()
        self.write_skill("skills/alpha", "name: alpha\ndescription: Collected skill.")
        self.write_skill("my-skills/beta", "name: beta\ndescription: Authored skill.")
        self.groups = [("coding", "Review", "Review code.", ["alpha", "beta"])]
        settings = patch.multiple(
            self.builder,
            REPO=str(self.repo),
            SKILLS_DIR=str(self.repo / "skills"),
            MY_SKILLS_DIR=str(self.repo / "my-skills"),
            MY_SKILLS={"beta"},
            GROUPS=self.groups,
            FEATURED=("My skills", "Authored skills.", ["beta"]),
        )
        settings.start()
        self.addCleanup(settings.stop)
        self.outputs = {
            "SKILLS.md": "Previous index.\n",
            "skills.sh.json": '{"previous": true}\n',
            "README.md": "# Fixture\n<!-- counts:start -->\nold\n<!-- counts:end -->\n",
        }
        for path, content in self.outputs.items():
            (self.repo / path).write_text(content, encoding="utf-8")

    def write_skill(self, directory, metadata):
        path = self.repo / directory / "SKILL.md"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(f"---\n{metadata}\n---\n\n# Skill\n", encoding="utf-8")

    def run_builder(self):
        output, errors = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(errors):
            try:
                code = self.builder.main()
            except SystemExit as error:
                code = error.code
        return code or 0, output.getvalue(), errors.getvalue()

    def assert_rejected_without_writes(self, message):
        code, _, errors = self.run_builder()
        self.assertNotEqual(code, 0, "invalid catalog was accepted")
        self.assertIn(message, errors)
        for path, previous in self.outputs.items():
            self.assertEqual((self.repo / path).read_text(encoding="utf-8"), previous)

    def test_missing_or_empty_name_does_not_write_outputs(self):
        for field in ("", "name:", 'name: ""', "name: ' '"):
            with self.subTest(field=field):
                self.write_skill("skills/alpha", f"{field}\ndescription: Skill.")
                self.assert_rejected_without_writes("missing name")

    def test_missing_or_empty_description_does_not_write_outputs(self):
        for field in ("", "description:", 'description: ""', "description: |"):
            with self.subTest(field=field):
                self.write_skill("skills/alpha", f"name: alpha\n{field}")
                self.assert_rejected_without_writes("missing description")

    def test_duplicate_declared_name_across_roots_does_not_write_outputs(self):
        self.write_skill("my-skills/beta", "name: alpha\ndescription: Duplicate.")
        self.assert_rejected_without_writes("duplicate declared name")

    def test_plain_description_with_mapping_separator_does_not_write_outputs(self):
        self.write_skill("skills/alpha", "name: alpha\ndescription: Verify-before-pay: verify first.")
        self.assert_rejected_without_writes("invalid plain description")

    def test_quoted_and_block_descriptions_allow_colons(self):
        for value in ('"Verify-before-pay: verify first."', "'Verify-before-pay: verify first.'",
                      ">\n  Verify-before-pay: verify first."):
            with self.subTest(value=value):
                self.write_skill("skills/alpha", f"name: alpha\ndescription: {value}")
                self.assertEqual(self.builder.load_catalog()[0]["description"],
                                 "Verify-before-pay: verify first.")

    def test_unsafe_declared_names_do_not_write_outputs(self):
        for name in ("-flag", "Uppercase", "bad name", "$(id)", "bad;command"):
            with self.subTest(name=name):
                self.write_skill("skills/alpha", f"name: {name}\ndescription: Skill.")
                self.assert_rejected_without_writes("invalid name")

    def test_ungrouped_skill_does_not_write_outputs(self):
        self.write_skill("skills/gamma", "name: gamma\ndescription: Ungrouped.")
        self.assert_rejected_without_writes("ungrouped")

    def test_duplicate_group_member_does_not_write_outputs(self):
        self.groups[0][3].append("alpha")
        self.assert_rejected_without_writes("listed twice")

    def test_missing_group_member_does_not_write_outputs(self):
        self.groups[0][3].append("missing")
        self.assert_rejected_without_writes("not on disk")

    def test_unknown_section_does_not_write_outputs(self):
        self.groups[0] = ("unknown", *self.groups[0][1:])
        self.assert_rejected_without_writes("unknown sections")

    def test_wrong_ownership_root_does_not_write_outputs(self):
        (self.repo / "my-skills/beta").rename(self.repo / "skills/beta")
        self.assert_rejected_without_writes("wrong ownership root")

    def test_missing_skill_file_does_not_write_outputs(self):
        (self.repo / "skills/alpha/SKILL.md").unlink()
        self.assert_rejected_without_writes("missing SKILL.md")

    def test_shared_catalog_contains_full_metadata_and_ownership(self):
        self.write_skill("skills/alpha", "name: alpha\ndescription: First sentence. Second sentence.")
        self.assertEqual(self.builder.load_catalog(), [
            {
                "name": "alpha",
                "description": "First sentence. Second sentence.",
                "path": "skills/alpha/SKILL.md",
                "section": "coding",
                "group": "Review",
                "authored": False,
            },
            {
                "name": "beta",
                "description": "Authored skill.",
                "path": "my-skills/beta/SKILL.md",
                "section": "coding",
                "group": "Review",
                "authored": True,
            },
        ])

    def test_aliases_and_block_descriptions_generate_stable_catalogs(self):
        (self.repo / "skills/alpha").rename(self.repo / "skills/spec-build")
        (self.repo / "my-skills/beta").rename(self.repo / "my-skills/tempo-request")
        self.groups[0][3][:] = ["spec-build", "tempo-request"]
        self.builder.MY_SKILLS = {"tempo-request"}
        self.builder.FEATURED = ("My skills", "Authored skills.", ["tempo-request"])
        self.write_skill("skills/spec-build", "name: build\ndescription: |\n  Build a spec.\n  Keep context.")
        self.write_skill("my-skills/tempo-request", "name: tempo\ndescription: >-\n  Call an API.\n  Pay for it.")
        catalog = self.builder.load_catalog()
        self.assertEqual([skill["name"] for skill in catalog], ["build", "tempo"])
        self.assertEqual([skill["description"] for skill in catalog],
                         ["Build a spec. Keep context.", "Call an API. Pay for it."])
        code, output, errors = self.run_builder()
        self.assertEqual((code, errors), (0, ""))
        self.assertIn("OK 2 skills total; 1 verified as mine", output)
        manifest = json.loads((self.repo / "skills.sh.json").read_text())
        self.assertEqual(manifest["groupings"][1]["skills"], ["build", "tempo"])
        index = (self.repo / "SKILLS.md").read_text()
        self.assertIn("skills/spec-build/SKILL.md", index)
        self.assertIn("my-skills/tempo-request/SKILL.md", index)
        self.assertIn('<a id="coding"></a>', index)
        self.assertIn("--full-depth --skill <name>", index)
        first = {path: (self.repo / path).read_bytes() for path in self.outputs}
        self.assertEqual(self.run_builder()[0], 0)
        self.assertEqual({path: (self.repo / path).read_bytes() for path in self.outputs}, first)


if __name__ == "__main__":
    unittest.main()
