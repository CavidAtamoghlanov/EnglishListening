import { scoreSpeechAnswer, normalizeSpeechText } from "../src/features/speech/utils/speechAnswerScoring";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("exact match passes", () => {
  const result = scoreSpeechAnswer("Apple", "apple", ["apple", "an apple"]);
  assert(result.isAccepted, "Expected exact speech match to pass.");
  assert(result.reason === "exact", `Expected exact reason, got ${result.reason}.`);
});

test("case and punctuation are ignored", () => {
  const result = scoreSpeechAnswer("I write code!", "I write code.", ["I write code."]);
  assert(result.isAccepted, "Expected punctuation-insensitive match to pass.");
});

test("single word pronunciation tolerance accepts close words", () => {
  const result = scoreSpeechAnswer("aple", "apple", ["apple"]);
  assert(result.isAccepted, "Expected close single-word recognition to pass.");
  assert(result.score >= 0.65, `Expected score >= 65%, got ${result.score}.`);
});

test("very short wrong words are not accepted too easily", () => {
  const result = scoreSpeechAnswer("car", "cat", ["cat"]);
  assert(!result.isAccepted, "Expected short unrelated word to be rejected.");
});

test("sentence coverage accepts around 65 percent", () => {
  const result = scoreSpeechAnswer(
    "I write code today",
    "I write code every day",
    ["I write code every day"],
  );
  assert(result.isAccepted, `Expected close sentence to pass, score ${result.score}.`);
});

test("unrelated sentence is rejected", () => {
  const result = scoreSpeechAnswer(
    "The hotel is near the airport",
    "The API returns an error",
    ["The API returns an error"],
  );
  assert(!result.isAccepted, "Expected unrelated sentence to be rejected.");
});

test("technical terms are normalized", () => {
  assert(normalizeSpeechText("C sharp dot net API SQL") === "csharp dotnet api sql", "Expected technical term normalization.");
  const result = scoreSpeechAnswer("c sharp dot net", "C# .NET", ["C# .NET"]);
  assert(result.isAccepted, "Expected spoken technical terms to match symbol form.");
});

console.log("Speech scoring checks passed.");
