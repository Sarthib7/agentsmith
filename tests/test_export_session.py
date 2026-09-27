"""Check transcript export with disposable session fixtures."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


EXPORT_SCRIPT = Path(__file__).resolve().parents[1] / "skills" / "apply-grant" / "export-session.sh"


class ExportSessionTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.project = self.root / "project"
        self.project.mkdir()
        self.fixture_home = self.root / "fixture-home"
        self.fixture_home.mkdir()
        self.claude_home = self.fixture_home / ".claude"
        self.codex_home = self.fixture_home / ".codex"
        self.environment = {
            "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
            "HOME": str(self.fixture_home),
            "CLAUDE_HOME": str(self.claude_home),
            "CODEX_HOME": str(self.codex_home),
        }
        self.selected = self.root / "selected session.jsonl"
        self.transcript = b'{"message":"selected conversation"}\n\x00\xff\r\n'
        self.selected.write_bytes(self.transcript)
        self.output = self.project / "reviewed transcript.jsonl"

    def export(self, *arguments):
        return subprocess.run(
            ["bash", str(EXPORT_SCRIPT), *(str(argument) for argument in arguments)],
            cwd=self.project,
            env=self.environment,
            capture_output=True,
            timeout=5,
        )

    def test_copies_selected_bytes_despite_newer_unrelated_sessions(self):
        claude_session = self.claude_home / "projects" / "other-project" / "newer.jsonl"
        codex_session = self.codex_home / "sessions" / "newer-unrelated.jsonl"
        for session in (claude_session, codex_session):
            session.parent.mkdir(parents=True, exist_ok=True)
            session.write_bytes(b"unrelated private conversation\n")
            os.utime(session, (2, 2))
        (self.codex_home / "history.jsonl").write_text('{"session_id":"unrelated"}\n')
        os.utime(self.selected, (1, 1))

        result = self.export(self.selected, self.output)

        self.assertEqual(result.returncode, 0, result.stderr.decode())
        self.assertEqual(self.output.read_bytes(), self.transcript)
        self.assertEqual(sorted(self.project.iterdir()), [self.output])

    def test_existing_export_is_not_overwritten(self):
        self.output.write_bytes(b"previous reviewed export\n")

        result = self.export(self.selected, self.output)

        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.output.read_bytes(), b"previous reviewed export\n")

    def test_requires_source_and_output_paths(self):
        for arguments in ((), (self.selected,), (self.selected, self.output, "extra")):
            with self.subTest(arguments=arguments):
                result = self.export(*arguments)
                self.assertNotEqual(result.returncode, 0)
                self.assertFalse(self.output.exists())

    def test_rejects_missing_and_non_file_sources(self):
        for source in (self.root / "missing.jsonl", self.project):
            with self.subTest(source=source):
                result = self.export(source, self.output)
                self.assertNotEqual(result.returncode, 0)
                self.assertFalse(self.output.exists())

    def test_rejects_unreadable_source(self):
        self.selected.chmod(0)
        self.addCleanup(self.selected.chmod, 0o600)
        if os.access(self.selected, os.R_OK):
            self.skipTest("Current user can read files without read permission")

        result = self.export(self.selected, self.output)

        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.output.exists())

    def test_rejects_dangling_destination_symlink(self):
        target = self.project / "must-not-be-created.jsonl"
        self.output.symlink_to(target)

        result = self.export(self.selected, self.output)

        self.assertNotEqual(result.returncode, 0)
        self.assertTrue(self.output.is_symlink())
        self.assertFalse(target.exists())


if __name__ == "__main__":
    unittest.main()
