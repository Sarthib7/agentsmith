# Plugin workspace

This directory holds plugin packaging. Skill source stays in `skills/` and `my-skills/`.

```text
plugin/
├── agents/       specialist agent definitions
├── commands/     user-invoked commands
├── hooks/        lifecycle and activation hooks
└── manifests/    platform-specific plugin metadata
```

The split follows the capability layout used by the [Vercel plugin](https://github.com/vercel/vercel-plugin). No plugin manifest is published from this directory yet.
