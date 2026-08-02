import test from "node:test";
import assert from "node:assert/strict";

import { renderNativeReviewResult, renderStoredJobResult } from "../plugins/codex/scripts/lib/render.mjs";

test("renderNativeReviewResult preserves wrapped approval review output verbatim", () => {
  const rawOutput = [
    "Review notes before the payload.",
    "```json",
    '{"verdict":"approve","summary":"No material findings.","business_findings":[]}',
    "```"
  ].join("\n");
  const output = renderNativeReviewResult(
    { status: 0, stdout: rawOutput, stderr: "" },
    { reviewLabel: "Adversarial Review", targetLabel: "working tree diff" }
  );

  assert.match(output, /Review notes before the payload\./);
  assert.match(output, /```json/);
  assert.match(output, /"business_findings":\[\]/);
  assert.doesNotMatch(output, /unexpected review shape|Parse error|valid structured JSON/i);
});

test("renderNativeReviewResult preserves a business blocker inside nonconforming output", () => {
  const rawOutput = [
    "```json",
    '{"verdict":"needs-attention","summary":"Authentication bypass remains."}',
    "```",
    "Blocking finding: src/auth.js:14 accepts requests without authorization evidence."
  ].join("\n");
  const output = renderNativeReviewResult(
    { status: 0, stdout: rawOutput, stderr: "" },
    { reviewLabel: "Adversarial Review", targetLabel: "working tree diff" }
  );

  assert.match(output, /Authentication bypass remains/);
  assert.match(output, /Blocking finding: src\/auth\.js:14/);
  assert.doesNotMatch(output, /No material findings/);
});

test("renderStoredJobResult prefers complete raw review output over a stale rendered summary", () => {
  const rawOutput = "Findings:\n- [high] Missing empty-state guard (src/app.js:4-6)";
  const output = renderStoredJobResult(
    {
      id: "review-123",
      status: "completed",
      title: "Codex Adversarial Review",
      jobClass: "review",
      threadId: "thr_123"
    },
    {
      threadId: "thr_123",
      rendered: "Old normalized summary that must not replace the raw output.\n",
      result: { rawOutput }
    }
  );

  assert.match(output, /^Findings:/);
  assert.match(output, /Missing empty-state guard/);
  assert.doesNotMatch(output, /Old normalized summary/);
  assert.match(output, /Codex session ID: thr_123/);
  assert.match(output, /Resume in Codex: codex resume thr_123/);
});
