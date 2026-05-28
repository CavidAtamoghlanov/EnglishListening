import { GRAMMAR_DATA_BY_MODE } from "../../../data/grammar";
import { GRAMMAR_LEVEL_IDS } from "../config/levels";
import type { GrammarExercise, GrammarLevel, GrammarPracticeMode } from "../types";
import { GRAMMAR_PRACTICE_MODES } from "../utils/grammarProgress";

const exerciseById = new Map<string, GrammarExercise>();

for (const mode of GRAMMAR_PRACTICE_MODES) {
  for (const level of GRAMMAR_LEVEL_IDS) {
    GRAMMAR_DATA_BY_MODE[mode][level].forEach((exercise) => {
      exerciseById.set(exercise.id, exercise);
    });
  }
}

export const grammarDataService = {
  getExercisesByModeAndLevel(mode: GrammarPracticeMode, level: GrammarLevel): GrammarExercise[] {
    return GRAMMAR_DATA_BY_MODE[mode][level] ?? [];
  },

  getExerciseCount(mode: GrammarPracticeMode, level: GrammarLevel): number {
    return this.getExercisesByModeAndLevel(mode, level).length;
  },

  getExercisesByIds(ids: string[]): GrammarExercise[] {
    return ids
      .map((id) => exerciseById.get(id))
      .filter((exercise): exercise is GrammarExercise => Boolean(exercise));
  },

  getExerciseById(id: string): GrammarExercise | null {
    return exerciseById.get(id) ?? null;
  },
};

