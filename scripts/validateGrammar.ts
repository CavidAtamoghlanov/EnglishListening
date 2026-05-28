import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { GRAMMAR_LEVEL_IDS } from "../src/features/grammar/config/levels";
import { GRAMMAR_PRACTICE_MODES } from "../src/features/grammar/utils/grammarProgress";
import type {
  GrammarExercise,
  GrammarExerciseType,
  GrammarLevel,
  GrammarPracticeMode,
} from "../src/features/grammar/types";

const dataRoot = path.join(process.cwd(), "src", "data", "grammar");
const targetCount = 10;
const validTypes = new Set<GrammarExerciseType>([
  "translate",
  "fill_blank",
  "fix_sentence",
  "verb_form",
  "word_order",
  "preposition",
  "article",
  "tense",
]);

function readFile(mode: GrammarPracticeMode, level: GrammarLevel): GrammarExercise[] {
  const filePath = path.join(dataRoot, mode, `${level.toLowerCase()}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`${filePath}: root must be an array`);
  }
  return parsed as GrammarExercise[];
}

function expectedId(mode: GrammarPracticeMode, level: GrammarLevel, index: number): string {
  const modeKey = mode === "translate-write" ? "translate" : "fix";
  return `grammar_${modeKey}_${level.toLowerCase()}_${String(index + 1).padStart(4, "0")}`;
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function main() {
  const errors: string[] = [];
  const globalIds = new Set<string>();

  console.log("Grammar validation report");
  console.log("-------------------------");

  for (const mode of GRAMMAR_PRACTICE_MODES) {
    for (const level of GRAMMAR_LEVEL_IDS) {
      const items = readFile(mode, level);
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
          "topic",
          "category",
          "icon",
          "instruction",
          "prompt",
          "correctAnswer",
          "hint",
          "explanationAz",
        ] as const) {
          if (!hasText(item[field])) {
            errors.push(`${label}: empty ${field}`);
          }
        }

        for (const field of ["azeriPrompt", "englishPrompt", "exampleCorrect"] as const) {
          if (typeof item[field] === "string" && !item[field]?.trim()) {
            errors.push(`${label}: empty optional ${field}`);
          }
        }

        if (!Array.isArray(item.acceptedAnswers)) {
          errors.push(`${label}: acceptedAnswers must be an array`);
        } else {
          if (item.acceptedAnswers.some((answer) => !answer.trim())) {
            errors.push(`${label}: acceptedAnswers cannot contain empty strings`);
          }
          const normalizedAnswers = item.acceptedAnswers.map((answer) => answer.trim().toLowerCase());
          if (!normalizedAnswers.includes(item.correctAnswer.trim().toLowerCase())) {
            errors.push(`${label}: acceptedAnswers must include correctAnswer`);
          }
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

  console.log("\nAll grammar files passed validation.");
}

try {
  main();
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
