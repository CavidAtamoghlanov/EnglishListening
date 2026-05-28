import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { SENTENCE_LEVEL_IDS } from "../src/features/sentences/config/levels";
import { SENTENCES_PER_LEVEL } from "../src/features/sentences/constants";
import type { SentenceItem, SentenceLevel, SentencePracticeMode } from "../src/features/sentences/types";

const dataRoot = path.join(process.cwd(), "src", "data", "sentences");
const modes: SentencePracticeMode[] = ["repeat", "translate"];
const strict = process.argv.includes("--strict");

function readFile(mode: SentencePracticeMode, level: SentenceLevel): SentenceItem[] {
  const filePath = path.join(dataRoot, mode, `${level.toLowerCase()}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`${filePath}: root must be an array`);
  }
  return parsed as SentenceItem[];
}

function expectedId(mode: SentencePracticeMode, level: SentenceLevel, index: number): string {
  return `${mode}_${level.toLowerCase()}_${String(index + 1).padStart(4, "0")}`;
}

function main() {
  const errors: string[] = [];
  const countWarnings: string[] = [];
  const globalIds = new Set<string>();

  console.log("Sentence validation report");
  console.log("-------------------------");
  console.log(`Mode: ${strict ? "strict target counts" : "schema + count report"}`);

  for (const mode of modes) {
    for (const level of SENTENCE_LEVEL_IDS) {
      const items = readFile(mode, level);
      console.log(`${mode}/${level}: ${items.length} / ${SENTENCES_PER_LEVEL}`);

      if (items.length !== SENTENCES_PER_LEVEL) {
        const message = `${mode}/${level}: expected ${SENTENCES_PER_LEVEL} items, found ${items.length}`;
        if (strict) {
          errors.push(message);
        } else {
          countWarnings.push(message);
        }
      }

      const englishInFile = new Set<string>();

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
        if (globalIds.has(item.id)) {
          errors.push(`${label}: duplicate id "${item.id}"`);
        }
        globalIds.add(item.id);

        for (const field of ["english", "azeri", "category", "icon"] as const) {
          if (!item[field]?.trim()) {
            errors.push(`${label}: empty ${field}`);
          }
        }

        const normalizedEnglish = item.english.trim().toLowerCase();
        if (englishInFile.has(normalizedEnglish)) {
          errors.push(`${label}: duplicate english "${item.english}" in file`);
        }
        englishInFile.add(normalizedEnglish);

        if (!Array.isArray(item.acceptedAnswers)) {
          errors.push(`${label}: acceptedAnswers must be an array`);
        } else if (
          !item.acceptedAnswers.map((a) => a.trim().toLowerCase()).includes(normalizedEnglish)
        ) {
          errors.push(`${label}: acceptedAnswers must include english sentence`);
        }

        if (!Array.isArray(item.words) || item.words.length === 0) {
          errors.push(`${label}: words array is required`);
        } else {
          item.words.forEach((word, wordIndex) => {
            if (!word.text?.trim() || !word.translation?.trim()) {
              errors.push(`${label}.words[${wordIndex}]: text and translation required`);
            }
          });
        }
      });
    }
  }

  if (countWarnings.length > 0) {
    console.log("\nCount warnings:");
    countWarnings.forEach((warning) => console.log(`- ${warning}`));
    console.log("Run npm run validate:sentences:strict to enforce target counts.");
  }

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((error) => console.log(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log("\nAll sentence files passed schema validation.");
}

try {
  main();
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
