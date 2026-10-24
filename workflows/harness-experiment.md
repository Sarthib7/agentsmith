# Harness experiment

This opt-in, instruction-only workflow compares one proposed instruction variant with the unchanged baseline on one public or synthetic task. Start only on an explicit user request; a repeated failure may prompt a suggestion, not a run.

The single canonical procedure is the packaged [harness-experiment workflow](../skills/harness-experiment/references/workflow.md), invoked through the [harness-experiment skill](../skills/harness-experiment/SKILL.md). The skill carries that reference inside its own package.

The parent inspects artifacts and reruns the declared checks before reporting `KEEP_BASE`, task-local `USE_CANDIDATE`, or `INCONCLUSIVE`. `KEEP_BASE` and `INCONCLUSIVE` preserve the baseline. Evidence remains private and uncommitted. This is process guidance: it adds no runtime enforcement, permissions, tools, retries, or authority to make external changes.

For source provenance and authorship limits, see [Attribution](../ATTRIBUTION.md).