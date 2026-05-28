import type { GrammarExercise, GrammarLevel, GrammarPracticeMode } from "../../features/grammar/types";
import translateA1 from "./translate-write/a1.json";
import translateA2 from "./translate-write/a2.json";
import translateB1 from "./translate-write/b1.json";
import translateB2 from "./translate-write/b2.json";
import fixA1 from "./fix-complete/a1.json";
import fixA2 from "./fix-complete/a2.json";
import fixB1 from "./fix-complete/b1.json";
import fixB2 from "./fix-complete/b2.json";

const TRANSLATE_WRITE_BY_LEVEL: Record<GrammarLevel, GrammarExercise[]> = {
  A1: translateA1 as GrammarExercise[],
  A2: translateA2 as GrammarExercise[],
  B1: translateB1 as GrammarExercise[],
  B2: translateB2 as GrammarExercise[],
};

const FIX_COMPLETE_BY_LEVEL: Record<GrammarLevel, GrammarExercise[]> = {
  A1: fixA1 as GrammarExercise[],
  A2: fixA2 as GrammarExercise[],
  B1: fixB1 as GrammarExercise[],
  B2: fixB2 as GrammarExercise[],
};

export const GRAMMAR_DATA_BY_MODE: Record<
  GrammarPracticeMode,
  Record<GrammarLevel, GrammarExercise[]>
> = {
  "translate-write": TRANSLATE_WRITE_BY_LEVEL,
  "fix-complete": FIX_COMPLETE_BY_LEVEL,
};

