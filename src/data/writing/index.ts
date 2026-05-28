import type { WritingItem, WritingLevel, WritingPracticeMode } from "../../features/writing/types";
import azA1 from "./az-to-en/a1.json";
import azA2 from "./az-to-en/a2.json";
import azB1 from "./az-to-en/b1.json";
import azB2 from "./az-to-en/b2.json";
import fixA1 from "./fix-english/a1.json";
import fixA2 from "./fix-english/a2.json";
import fixB1 from "./fix-english/b1.json";
import fixB2 from "./fix-english/b2.json";
import listenA1 from "./listen-write/a1.json";
import listenA2 from "./listen-write/a2.json";
import listenB1 from "./listen-write/b1.json";
import listenB2 from "./listen-write/b2.json";

const AZ_TO_EN_BY_LEVEL: Record<WritingLevel, WritingItem[]> = {
  A1: azA1 as WritingItem[],
  A2: azA2 as WritingItem[],
  B1: azB1 as WritingItem[],
  B2: azB2 as WritingItem[],
};

const FIX_ENGLISH_BY_LEVEL: Record<WritingLevel, WritingItem[]> = {
  A1: fixA1 as WritingItem[],
  A2: fixA2 as WritingItem[],
  B1: fixB1 as WritingItem[],
  B2: fixB2 as WritingItem[],
};

const LISTEN_WRITE_BY_LEVEL: Record<WritingLevel, WritingItem[]> = {
  A1: listenA1 as WritingItem[],
  A2: listenA2 as WritingItem[],
  B1: listenB1 as WritingItem[],
  B2: listenB2 as WritingItem[],
};

export const WRITING_DATA_BY_MODE: Record<
  WritingPracticeMode,
  Record<WritingLevel, WritingItem[]>
> = {
  "az-to-en": AZ_TO_EN_BY_LEVEL,
  "fix-english": FIX_ENGLISH_BY_LEVEL,
  "listen-write": LISTEN_WRITE_BY_LEVEL,
};
