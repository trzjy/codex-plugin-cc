#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const VERSION_FILES = [
  "package.json",
  "package-lock.json",
  "plugins/codex/.claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json"
];

export function normalizeVersionFields(file, source) {
  const json = JSON.parse(source);
  if (file === "package.json") {
    json.version = "<version>";
  } else if (file === "package-lock.json") {
    json.version = "<version>";
    json.packages[""].version = "<version>";
  } else if (file === "plugins/codex/.claude-plugin/plugin.json") {
    json.version = "<version>";
  } else if (file === ".claude-plugin/marketplace.json") {
    json.metadata.version = "<version>";
    const plugin = json.plugins.find((entry) => entry.name === "codex");
    if (!plugin) {
      throw new Error("Marketplace does not contain the codex plugin entry.");
    }
    plugin.version = "<version>";
  } else {
    throw new Error(`Unsupported version file: ${file}`);
  }
  return JSON.stringify(json);
}

function readAtRef(ref, file) {
  return execFileSync("git", ["show", `${ref}:${file}`], { encoding: "utf8" });
}

export function verifyVersionOnlyDivergence(baseRef, forkRef) {
  const unexpected = [];
  for (const file of VERSION_FILES) {
    const base = normalizeVersionFields(file, readAtRef(baseRef, file));
    const fork = normalizeVersionFields(file, readAtRef(forkRef, file));
    if (base !== fork) {
      unexpected.push(file);
    }
  }
  if (unexpected.length > 0) {
    throw new Error(
      `Fork changes beyond version fields prevent automatic conflict resolution: ${unexpected.join(", ")}`
    );
  }
}

function main() {
  const [baseRef, forkRef, ...extra] = process.argv.slice(2);
  if (!baseRef || !forkRef || extra.length > 0) {
    throw new Error(
      "Usage: node scripts/verify-version-only-divergence.mjs <shared-base-ref> <fork-ref>"
    );
  }
  verifyVersionOnlyDivergence(baseRef, forkRef);
  process.stdout.write(`Version-file divergence is limited to approved version fields (${baseRef}..${forkRef}).\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
