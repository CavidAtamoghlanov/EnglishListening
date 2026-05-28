import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { WRITING_LEVEL_IDS } from "../src/features/writing/config/levels";
import { WRITING_PRACTICE_MODES } from "../src/features/writing/utils/writingProgress";
import type {
  WritingHint,
  WritingItem,
  WritingItemType,
  WritingLevel,
  WritingPracticeMode,
} from "../src/features/writing/types";

const dataRoot = path.join(process.cwd(), "src", "data", "writing");
const targetCount = 10;
const validTypes = new Set<WritingItemType>(["word", "phrase", "sentence"]);

function readFile(mode: WritingPracticeMode, level: WritingLevel): WritingItem[] {
  const filePath = path.join(dataRoot, mode, `${level.toLowerCase()}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }

  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`${filePath}: root must be an array`);
  }

  return parsed as WritingItem[];
}

function expectedId(mode: WritingPracticeMode, level: WritingLevel, index: number): string {
  const modeKey =
    mode === "az-to-en" ? "az" : mode === "fix-english" ? "fix" : "listen";
  return `writing_${modeKey}_${level.toLowerCase()}_${String(index + 1).padStart(4, "0")}`;
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateHint(hint: WritingHint, label: string, errors: string[]) {
  if (!hasText(hint.text)) {
    errors.push(`${label}: hint text is required`);
  }

  for (const field of ["translation", "correction", "note"] as const) {
    if (typeof hint[field] === "string" && !hint[field]?.trim()) {
      errors.push(`${label}: empty optional hint ${field}`);
    }
  }
}

function main() {
  const errors: string[] = [];
  const globalIds = new Set<string>();

  console.log("Writing validation report");
  console.log("-------------------------");

  for (const mode of WRITING_PRACTICE_MODES) {
    for (const level of WRITING_LEVEL_IDS) {
      let items: WritingItem[];
      try {
        items = readFile(mode, level);
      } catch (error) {
        errors.push((error as Error).message);
        continue;
      }

      console.log(`${mode}/${level}: ${items.length} / ${targetCount}`);

      if (items.length !== targetCount) {
        errors.push(`${mode}/${level}: expected ${targetCount} items, found ${items.length}`);
      }

      items.forEach((item, index) => {
        const label = `${mode}/${level}[${index}]`;
        const expected = expectedId(mode, level, index);

        if (item.id !== expected) {
          errors.push(`${label}: id "${item.id}" expected "${expected}"`);
        }
        if (item.level !== level) {
          errors.push(`${label}: level "${item.level}" does not match ${level}`);
        }
        if (item.mode !== mode) {
          errors.push(`${label}: mode "${item.mode}" does not match ${mode}`);
        }
        if (!validTypes.has(item.type)) {
          errors.push(`${label}: invalid type "${item.type}"`);
        }
        if (globalIds.has(item.id)) {
          errors.push(`${label}: duplicate id "${item.id}"`);
        }
        globalIds.add(item.id);

        for (const field of [
          "id",
          "category",
          "icon",
          "prompt",
          "english",
          "correctAnswer",
          "explanationAz",
        ] as const) {
          if (!hasText(item[field])) {
            errors.push(`${label}: empty ${field}`);
          }
        }

        for (const field of ["azeri", "wrongEnglish"] as const) {
          if (typeof item[field] === "string" && !item[field]?.trim()) {
            errors.push(`${label}: empty optional ${field}`);
          }
        }

        if (mode === "az-to-en" && !hasText(item.azeri)) {
          errors.push(`${label}: az-to-en items require azeri`);
        }
        if (mode === "fix-english" && !hasText(item.wrongEnglish)) {
          errors.push(`${label}: fix-english items require wrongEnglish`);
        }

        if (!Array.isArray(item.acceptedAnswers)) {
          errors.push(`${label}: acceptedAnswers must be an array`);
        } else {
          const invalidAnswers = item.acceptedAnswers.filter(
            (answer) => typeof answer !== "string" || !answer.trim(),
          );
          if (invalidAnswers.length > 0) {
            errors.push(`${label}: acceptedAnswers must contain non-empty strings`);
          }
          const normalizedAnswers = item.acceptedAnswers
            .filter((answer): answer is string => typeof answer === "string")
            .map((answer) => answer.trim().toLowerCase());
          if (
            hasText(item.correctAnswer) &&
            !normalizedAnswers.includes(item.correctAnswer.trim().toLowerCase())
          ) {
            errors.push(`${label}: acceptedAnswers must include correctAnswer`);
          }
        }

        if (!Array.isArray(item.hints)) {
          errors.push(`${label}: hints must be an array`);
        } else {
          if (item.hints.length === 0) {
            errors.push(`${label}: hints must contain at least one hint`);
          }
          item.hints.forEach((hint, hintIndex) =>
            validateHint(hint, `${label}.hints[${hintIndex}]`, errors),
          );
        }
      });
    }
  }

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((error) => console.log(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log("\nAll writing files passed validation.");
}

try {
  main();
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
