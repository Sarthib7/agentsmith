---
name: prove-it
description: Verify a change in both directions before claiming it works. Confirm it passes, then break it on purpose and confirm it fails. Use when a fix ships with a test, when touching anything that detects or gates (linter, secret scanner, CI check, validator, rate limiter, auth guard, allowlist), when resolving a merge conflict, or before reporting "tests pass", "the scan is clean", or "CI is green".
author: sarthib7
---

# Prove it, both directions

A green result proves nothing on its own. A working detector and a disabled
detector produce identical output. So does a passing test that cannot fail.

Every check has two directions, and most people run one:

1. **Positive.** It passes on real input.
2. **Negative.** Break it on purpose and watch it fail.

Direction 2 is the one that gets skipped, and it is the only one that tells you
the check is there at all.

## Checklist

Run the negative direction before reporting anything.

- [ ] **Fix plus test?** Revert only the production line, keep the test, run it.
      It must go red, and the failure must name the thing you fixed. Red for an
      incidental reason is not a pin. Put the change back.
- [ ] **Did the runner load the test?** Existing and passing is not the same as
      running. Where the suite selects files through a manifest, a glob or a tag,
      confirm yours is in the selected set, not merely on disk.
- [ ] **Detector, scanner, gate, validator?** Plant what it is meant to catch,
      in every place an exemption touches, not just the happy path.
- [ ] **Allowlist or exemption?** Show it silences the noise *and* still catches
      a real one in the same location. If it cannot tell them apart, it is not
      an allowlist, it is an off switch.
- [ ] **Config gate** (branch protection, required check, feature flag, env var)?
      Read the live config, not the file that is supposed to produce it. Names
      are matched exactly and nothing warns you when they stop lining up.
- [ ] **Merge conflict?** Diff the result against *both* parents. This is the one
      place content vanishes without a deletion showing in any diff.
- [ ] **Called something shipped?** Confirm the commit is an ancestor of the
      branch that deploys, or grep that branch for a symbol the change added.
      Merged is a status, not a destination.
- [ ] Report the command you ran and the number it actually printed.

## Running the negative direction

Reproduce with the exact version and command the real gate uses. A different
version, a different subcommand, or a different working directory answers a
different question. Check what CI invokes before you invoke anything.

Construct your own adversarial cases. Re-running the author's examples confirms
the author's belief, not the behaviour. For each exemption ask: what input, in
what path, in what syntax, does this still let through? Then plant exactly that.

Tightening a rule can also break it. When you narrow a pattern to kill a false
positive, check the true positives the old one caught and the new one misses.
That regression is invisible to a green run, because a rule that matches nothing
and a rule that matches correctly both come back clean.

## Three worked shapes

**A test that could not fail.** A fix reorders how candidates are selected. The
suite is green. Reverting the one production line leaves it green too, because
the fixture has no case where the two orders differ. The test pinned nothing.
The fix is only real once a fixture exists that goes red without it.

**A test the runner never selected.** A gate ships with a unit test that pins it.
Reverting the gate leaves the whole suite green anyway. The file is real and goes
red the moment you invoke it directly, but the runner builds its file list from a
manifest the new file was never added to. On disk, passing, and never executed
look identical from a summary line.

**A scanner that was switched off.** A secret-scanning config reports zero
findings across full history, and the header says so proudly. It reports zero
because one exemption was written without a rule scope and disarmed every rule
in the file. Planting a live-shaped credential in the exempted path scans clean.
Zero findings and no scanner look the same from the outside.

## What does not count as proof

- "The suite passes." Passes with the change reverted too?
- "There is a test for it." In the runner's selected set, or only on disk?
- "The scan is clean." Clean because nothing is there, or because nothing runs?
- "CI is green." Green on the check the gate actually requires, under the name
  the gate requires?
- "The config says so." The live config, or the file you hope produced it?
- "I did not change that path." Did you diff it against both parents?

## Reporting

State the negative result out loud, not just the positive one: "reverting the
sort turns the new test red" says more than "15 passed". If you could not run
the negative direction, say which one you skipped and why. An unverified claim
labelled as unverified is useful. An unverified claim stated plainly is not.
