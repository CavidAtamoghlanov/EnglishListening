import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  CEFR_LEVELS,
  getLevelConfig,
  getLevelFileKey,
  getTargetWordCount,
  type CEFRLevel,
} from "../src/features/words/config/levels";
import type { WordItem } from "../src/features/words/types";

const dataDir = path.join(process.cwd(), "src", "data", "words");

function readLevel(level: CEFRLevel): WordItem[] {
  const filePath = path.join(dataDir, `${getLevelFileKey(level)}.json`);
  if (!existsSync(filePath)) {
    return [];
  }
  return JSON.parse(readFileSync(filePath, "utf8")) as WordItem[];
}

function main() {
  console.log("Word bank statistics");
  console.log("====================");

  for (const level of CEFR_LEVELS) {
    const config = getLevelConfig(level);
    const words = readLevel(level);
    const target = getTargetWordCount(level);
    const missing = Math.max(0, target - words.length);

    console.log(`\n${level} (${config.fileKey}.json)`);
    console.log(`  Count: ${words.length}`);
    console.log(`  Target: ${target}`);
    console.log(`  Missing: ${missing}`);

    const englishSeen = new Map<string, number>();
    const duplicateEnglish: string[] = [];
    const invalidIds: string[] = [];
    const acceptedMissingMain: string[] = [];
    const sequentialIssues: string[] = [];
    const categories = new Map<string, number>();
    const idPattern = new RegExp(`^${config.fileKey}_\\d{4}$`);

    words.forEach((word, index) => {
      const key = word.english.trim().toLowerCase();
      const hits = (englishSeen.get(key) ?? 0) + 1;
      englishSeen.set(key, hits);
      if (hits === 2) {
        duplicateEnglish.push(word.english);
      }

      if (!idPattern.test(word.id)) {
        invalidIds.push(word.id);
      }

      const expected = `${config.fileKey}_${String(index + 1).padStart(4, "0")}`;
      if (word.id !== expected) {
        sequentialIssues.push(`${word.id} (expected ${expected})`);
      }

      const normalized = word.english.trim().toLowerCase();
      if (
        !Array.isArray(word.acceptedAnswers) ||
        !word.acceptedAnswers.map((a) => a.trim().toLowerCase()).includes(normalized)
      ) {
        acceptedMissingMain.push(word.id);
      }

      categories.set(word.category, (categories.get(word.category) ?? 0) + 1);
    });

    console.log(`  Duplicate English (in level): ${duplicateEnglish.length}`);
    if (duplicateEnglish.length > 0) {
      console.log(`    Examples: ${duplicateEnglish.slice(0, 5).join(", ")}`);
    }

    console.log(`  Invalid IDs: ${invalidIds.length}`);
    if (invalidIds.length > 0) {
      console.log(`    Examples: ${invalidIds.slice(0, 5).join(", ")}`);
    }

    console.log(`  Sequential ID issues: ${sequentialIssues.length}`);
    if (sequentialIssues.length > 0) {
      console.log(`    Examples: ${sequentialIssues.slice(0, 5).join("; ")}`);
    }

    console.log(`  acceptedAnswers missing main english: ${acceptedMissingMain.length}`);

    console.log("  Category distribution:");
    const sortedCategories = [...categories.entries()].sort((a, b) => b[1] - a[1]);
    for (const [category, count] of sortedCategories.slice(0, 15)) {
      console.log(`    ${category}: ${count}`);
    }
    if (sortedCategories.length > 15) {
      console.log(`    ... +${sortedCategories.length - 15} more categories`);
    }
  }
}

try {
  main();
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
