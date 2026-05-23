import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CEFR_LEVELS, getLevelFileKey, type CEFRLevel } from "../src/features/words/config/levels";
import type { WordItem } from "../src/features/words/types";
import { mergeSeeds } from "./wordBank/utils";
import { A1_EXTRA_SEEDS } from "./wordBank/seeds/a1Extra";
import { A2_EXTRA_SEEDS } from "./wordBank/seeds/a2Extra";
import { B1_EXTRA_SEEDS } from "./wordBank/seeds/b1Extra";
import { B2_SEEDS } from "./wordBank/seeds/b2";

const dataDir = path.join(process.cwd(), "src", "data", "words");

const EXTRA_SEEDS: Partial<Record<CEFRLevel, typeof A1_EXTRA_SEEDS>> = {
  A1: A1_EXTRA_SEEDS,
  A2: A2_EXTRA_SEEDS,
  B1: B1_EXTRA_SEEDS,
  B2: B2_SEEDS,
};

function readExisting(level: CEFRLevel): WordItem[] {
  const filePath = path.join(dataDir, `${getLevelFileKey(level)}.json`);
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as WordItem[];
  } catch {
    return [];
  }
}

function writeLevel(level: CEFRLevel, words: WordItem[]) {
  const filePath = path.join(dataDir, `${getLevelFileKey(level)}.json`);
  writeFileSync(filePath, `${JSON.stringify(words, null, 2)}\n`, "utf8");
}

function main() {
  mkdirSync(dataDir, { recursive: true });

  for (const level of CEFR_LEVELS) {
    const existing = readExisting(level);
    const seeds = EXTRA_SEEDS[level] ?? [];
    const merged = mergeSeeds(level, existing, seeds);
    writeLevel(level, merged);
    console.log(`${level}: ${existing.length} -> ${merged.length} words`);
  }
}

main();
