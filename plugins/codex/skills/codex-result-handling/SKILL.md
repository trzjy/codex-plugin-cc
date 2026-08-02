---
name: codex-result-handling
description: Internal guidance for presenting Codex helper output back to the user
user-invocable: false
---

# Codex Result Handling

When the helper returns Codex output:
- Preserve the complete raw output from the reviewer. A JSON, Markdown, field, or schema mismatch is a mechanical presentation issue, not a business verdict and not a reason to rerun the review.
- For review output, read every substantive claim in the raw output. Present material findings first, trace each one to the reviewer's evidence and the controlling project or user authority, and keep uncertainty explicit.
- A native structured result may be shown as a recommended index to the same invocation, but it must not replace, filter, or overrule the raw output. Do not reconstruct a second structured result from prose and do not infer approval or blocking automatically from formatting.
- Use the file paths and line numbers exactly as the helper reports them.
- Preserve evidence boundaries. If Codex marked something as an inference, uncertainty, or follow-up question, keep that distinction.
- Preserve output sections when the prompt asked for them, such as observed facts, inferences, open questions, touched files, or next steps.
- Only report review transport as unavailable when the invocation failed to produce any reviewable business content. Nonconforming output that contains business review content must still be consumed.
- If there are no supported findings after authority-based review, say that explicitly and keep the residual-risk note brief.
- If Codex made edits, say so explicitly and list the touched files when the helper provides them.
- For `codex:codex-rescue`, do not turn a failed or incomplete Codex run into a Claude-side implementation attempt. Report the failure and stop.
- For `codex:codex-rescue`, if Codex was never successfully invoked, do not generate a substitute answer at all.
- CRITICAL: After presenting review findings, STOP. Do not make any code changes. Do not fix any issues. You MUST explicitly ask the user which issues, if any, they want fixed before touching a single file. Auto-applying fixes from a review is strictly forbidden, even if the fix is obvious.
- If the helper reports a failed Codex invocation with no reviewable content, include the most actionable stderr lines and stop there instead of guessing.
- If the helper reports that setup or authentication is required, direct the user to `/codex:setup` and do not improvise alternate auth flows.
