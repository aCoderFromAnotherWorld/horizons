import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import chapter1 from "@/lib/gameData/chapter1.js";
import chapter2 from "@/lib/gameData/chapter2.js";
import chapter3 from "@/lib/gameData/chapter3.js";
import chapter4 from "@/lib/gameData/chapter4.js";
import chapter5 from "@/lib/gameData/chapter5.js";
import chapter6 from "@/lib/gameData/chapter6.js";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const publicDir = path.join(repoRoot, "public");

const SENSORY_AUDIO = [
  "/assets/sounds/sensory/birds.mp3",
  "/assets/sounds/sensory/fountain.mp3",
  "/assets/sounds/sensory/laughter.mp3",
  "/assets/sounds/sensory/vacuum.mp3",
  "/assets/sounds/sensory/dog-bark.mp3",
  "/assets/sounds/sensory/thunder.mp3",
  "/assets/sounds/sensory/baby-cry.mp3",
  "/assets/sounds/sensory/traffic.mp3",
];

const AMBIENT_AUDIO = [
  "/assets/sounds/ambient/main-menu.mp3",
  "/assets/sounds/ambient/nature.mp3",
  "/assets/sounds/ambient/playground.mp3",
  "/assets/sounds/ambient/library.mp3",
  "/assets/sounds/ambient/celebration.mp3",
];

function collectAssetPaths(value, paths = new Set()) {
  if (!value) return paths;
  if (typeof value === "string") {
    if (value.startsWith("/assets/")) paths.add(value);
    return paths;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectAssetPaths(item, paths);
    return paths;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) collectAssetPaths(item, paths);
  }
  return paths;
}

function publicAssetPath(assetPath) {
  return path.join(publicDir, assetPath.replace(/^\//, ""));
}

describe("Phase 1-10 asset readiness", () => {
  test("all Chapter 1-6 game data asset paths exist", () => {
    const chapters = [chapter1, chapter2, chapter3, chapter4, chapter5, chapter6];
    const missing = [...collectAssetPaths(chapters)].filter(
      (assetPath) => !existsSync(publicAssetPath(assetPath)),
    );

    expect(missing).toEqual([]);
  });

  test("sensory audio files are no longer tiny placeholder effects", () => {
    for (const assetPath of SENSORY_AUDIO) {
      const size = statSync(publicAssetPath(assetPath)).size;
      expect(size).toBeGreaterThanOrEqual(20 * 1024);
    }
  });

  test("ambient audio files are no longer tiny placeholder effects", () => {
    for (const assetPath of AMBIENT_AUDIO) {
      const size = statSync(publicAssetPath(assetPath)).size;
      expect(size).toBeGreaterThanOrEqual(40 * 1024);
    }
  });

  test("remaining assets document has no Phase 1-10 replacement blocker", () => {
    const remainingAssets = readFileSync(
      path.join(repoRoot, "docs/markdowns/RemainingAssets.md"),
      "utf8",
    );

    expect(remainingAssets).not.toContain("Must Replace Before Final Use");
    expect(remainingAssets).toContain("Phases 1-10 now have the required MVP asset set");
  });
});
