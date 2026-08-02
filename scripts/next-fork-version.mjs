#!/usr/bin/env node

import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function parseVersion(version) {
  const match = SEMVER_PATTERN.exec(version);
  if (!match) {
    throw new Error(`Expected a semver-like version, got: ${version}`);
  }
  return match.slice(1, 4).map(Number);
}

function compareVersion(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return 0;
}

export function nextForkVersion(currentVersion, upstreamVersion) {
  const current = parseVersion(currentVersion);
  const upstream = parseVersion(upstreamVersion);
  const base = compareVersion(current, upstream) >= 0 ? current : upstream;
  return `${base[0]}.${base[1]}.${base[2] + 1}`;
}

function main() {
  const [currentVersion, upstreamVersion, ...extra] = process.argv.slice(2);
  if (!currentVersion || !upstreamVersion || extra.length > 0) {
    throw new Error("Usage: node scripts/next-fork-version.mjs <current-version> <upstream-version>");
  }
  process.stdout.write(`${nextForkVersion(currentVersion, upstreamVersion)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
