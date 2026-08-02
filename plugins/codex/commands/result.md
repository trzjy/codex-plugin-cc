---
description: Show the stored final output for a finished Codex job in this repository
argument-hint: '[job-id]'
disable-model-invocation: true
allowed-tools: Bash(node:*)
---

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" result "$ARGUMENTS"`

Present the full command output to the user. Do not summarize or condense it. Preserve all details including:
- Job ID and status
- The complete raw reviewer output, including every business claim, finding, evidence reference, uncertainty, artifact, and next step
- File paths and line numbers exactly as reported
- Any transport or execution errors
- Follow-up commands such as `/codex:status <id>` and `/codex:review`

Output-shape problems are local mechanical issues. Do not treat JSON, Markdown, field, or schema mismatches as approval, blocking, transport failure, or a reason to rerun the review. Do not reconstruct a second structured result from the raw output.
