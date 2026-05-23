import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  CEFR_LEVELS,
  getLevelConfig,
  getLevelFileKey,
  type CEFRLevel,
} from "../src/features/words/config/levels";
import type { WordItem } from "../src/features/words/types";
import { validateWordsByLevel } from "../src/features/words/utils/validateWords";

const dataDir = path.join(process.cwd(), "src", "data", "words");
const strictCount = process.argv.includes("--strict");

function readLevel(level: CEFRLevel): WordItem[] {
  const fileKey = getLevelFileKey(level);
  const filePath = path.join(dataDir, `${fileKey}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }

  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("root JSON value must be an array");
    }
    return parsed as WordItem[];
  } catch (error) {
    throw new Error(`${filePath}: ${(error as Error).message}`);
  }
}

function main() {
  for (const level of CEFR_LEVELS) {
    const fileKey = getLevelFileKey(level);
    const filePath = path.join(dataDir, `${fileKey}.json`);
    if (!existsSync(filePath)) {
      throw new Error(`Missing required file: ${filePath}`);
    }
  }

  const files = CEFR_LEVELS.reduce(
    (result, level) => ({ ...result, [level]: readLevel(level) }),
    {} as Record<CEFRLevel, WordItem[]>,
  );
  const report = validateWordsByLevel(files, { strictCount });

  console.log(strictCount ? "Word validation report (strict)" : "Word validation report");
  console.log("----------------------");
  for (const level of CEFR_LEVELS) {
    const target = report.targets[level];
    const count = report.counts[level];
    const missing = Math.max(0, target - count);
    console.log(`${level}: ${count} / ${target}${missing > 0 ? ` (${missing} remaining)` : ""}`);
  }

  if (report.warnings.length > 0) {
    console.log("\nWarnings:");
    report.warnings.slice(0, 50).forEach((warning) => console.log(`- ${warning}`));
    if (report.warnings.length > 50) {
      console.log(`- ... and ${report.warnings.length - 50} more warnings`);
    }
  }

  if (report.errors.length > 0) {
    console.log("\nErrors:");
    report.errors.slice(0, 50).forEach((error) => console.log(`- ${error}`));
    if (report.errors.length > 50) {
      console.log(`- ... and ${report.errors.length - 50} more errors`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("\nAll word files passed validation.");
}

try {
  main();
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
