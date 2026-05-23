import {
  CEFR_LEVELS,
  getLevelConfig,
  getTargetWordCount,
  type CEFRLevel,
} from "../config/levels";
import type { WordItem } from "../types";

export type ValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  counts: Record<CEFRLevel, number>;
  targets: Record<CEFRLevel, number>;
};

export type ValidateOptions = {
  strictCount?: boolean;
};

const requiredStringFields: (keyof WordItem)[] = [
  "id",
  "level",
  "english",
  "azeri",
  "category",
  "icon",
  "exampleEn",
  "exampleAz",
];

function hasEmptyString(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.some(hasEmptyString);
  }

  if (value && typeof value === "object") {
    return Object.values(value).some(hasEmptyString);
  }

  return false;
}

function expectedId(level: CEFRLevel, index: number): string {
  const prefix = getLevelConfig(level).fileKey;
  return `${prefix}_${String(index + 1).padStart(4, "0")}`;
}

export function validateWordsByLevel(
  files: Record<CEFRLevel, WordItem[]>,
  options: ValidateOptions = {},
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const globalIds = new Set<string>();
  const globalEnglish = new Map<string, CEFRLevel>();
  const counts = CEFR_LEVELS.reduce(
    (result, level) => ({ ...result, [level]: files[level]?.length ?? 0 }),
    {} as Record<CEFRLevel, number>,
  );
  const targets = CEFR_LEVELS.reduce(
    (result, level) => ({ ...result, [level]: getTargetWordCount(level) }),
    {} as Record<CEFRLevel, number>,
  );

  for (const level of CEFR_LEVELS) {
    const words = files[level] ?? [];
    const englishInLevel = new Set<string>();
    const prefix = getLevelConfig(level).fileKey;
    const idPattern = new RegExp(`^${prefix}_\\d{4}$`);

    words.forEach((word, index) => {
      const label = `${level}[${index}]`;
      const expected = expectedId(level, index);

      requiredStringFields.forEach((field) => {
        if (typeof word[field] !== "string" || String(word[field]).trim().length === 0) {
          errors.push(`${label}: missing or empty ${field}`);
        }
      });

      if (word.level !== level) {
        errors.push(`${label}: level field "${word.level}" does not match ${level}`);
      }

      if (!idPattern.test(word.id)) {
        errors.push(`${label}: invalid id "${word.id}" (expected pattern ${prefix}_####)`);
      }

      if (word.id !== expected) {
        warnings.push(`${label}: id "${word.id}" is not sequential (expected ${expected})`);
      }

      if (globalIds.has(word.id)) {
        errors.push(`${label}: duplicate id "${word.id}"`);
      }
      globalIds.add(word.id);

      const normalizedEnglish = word.english.trim().toLowerCase();
      if (englishInLevel.has(normalizedEnglish)) {
        errors.push(`${label}: duplicate English word "${word.english}" inside ${level}`);
      }
      englishInLevel.add(normalizedEnglish);

      const otherLevel = globalEnglish.get(normalizedEnglish);
      if (otherLevel && otherLevel !== level) {
        warnings.push(
          `${label}: English "${word.english}" also appears in ${otherLevel} (cross-level duplicate)`,
        );
      } else if (!otherLevel) {
        globalEnglish.set(normalizedEnglish, level);
      }

      if (!Array.isArray(word.acceptedAnswers)) {
        errors.push(`${label}: acceptedAnswers must be an array`);
      } else if (
        !word.acceptedAnswers.map((answer) => answer.trim().toLowerCase()).includes(normalizedEnglish)
      ) {
        errors.push(`${label}: acceptedAnswers must include "${word.english}"`);
      }

      if (!Array.isArray(word.synonyms)) {
        errors.push(`${label}: synonyms must be an array`);
      }

      if (hasEmptyString(word)) {
        errors.push(`${label}: empty strings are not allowed`);
      }
    });

    const target = targets[level];
    const count = counts[level];
    const missing = Math.max(0, target - count);

    if (options.strictCount && count !== target) {
      errors.push(`${level}: expected exactly ${target} words, found ${count} (missing ${missing})`);
    } else if (count < target) {
      warnings.push(`${level}: ${count} / ${target} words (${missing} remaining to target)`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    counts,
    targets,
  };
}
