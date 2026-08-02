import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { nextForkVersion } from "../scripts/next-fork-version.mjs";
import { normalizeVersionFields } from "../scripts/verify-version-only-divergence.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("nextForkVersion remains greater than both fork and upstream versions", () => {
  assert.equal(nextForkVersion("1.0.7", "1.0.6"), "1.0.8");
  assert.equal(nextForkVersion("1.0.7", "1.1.0"), "1.1.1");
  assert.equal(nextForkVersion("2.0.0", "1.99.9"), "2.0.1");
});

test("normalizeVersionFields ignores only approved version locations", () => {
  const left = normalizeVersionFields("package-lock.json", JSON.stringify({
    version: "1.0.6",
    packages: { "": { version: "1.0.6", dependencies: { alpha: "1.0.0" } } }
  }));
  const right = normalizeVersionFields("package-lock.json", JSON.stringify({
    version: "1.0.7",
    packages: { "": { version: "1.0.7", dependencies: { alpha: "1.0.0" } } }
  }));
  const changedDependency = normalizeVersionFields("package-lock.json", JSON.stringify({
    version: "1.0.7",
    packages: { "": { version: "1.0.7", dependencies: { alpha: "2.0.0" } } }
  }));

  assert.equal(left, right);
  assert.notEqual(left, changedDependency);
});

test("fork governance rejects restored structured review completion paths", () => {
  const retiredSchema = path.join(ROOT, "plugins/codex/schemas/review-output.schema.json");
  assert.equal(fs.existsSync(retiredSchema), false);

  const activeFiles = [
    "plugins/codex/scripts/codex-companion.mjs",
    "plugins/codex/scripts/lib/codex.mjs",
    "plugins/codex/scripts/lib/render.mjs",
    "plugins/codex/prompts/adversarial-review.md"
  ];
  const retiredTokens = [
    "review-output.schema",
    "renderReviewResult",
    "parseStructuredOutput",
    "readOutputSchema",
    "Return only valid JSON matching the provided schema"
  ];

  for (const relativePath of activeFiles) {
    const source = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
    for (const token of retiredTokens) {
      assert.equal(source.includes(token), false, `${relativePath} restored retired token: ${token}`);
    }
  }
});
