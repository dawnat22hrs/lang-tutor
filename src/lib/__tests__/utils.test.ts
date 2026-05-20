import { describe, it, expect } from "vitest";
import { levenshtein, spellCheckScore } from "../utils";

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("school", "school")).toBe(0);
  });

  it("counts single missing letter", () => {
    expect(levenshtein("schol", "school")).toBe(1);
  });

  it("counts phonetic misspelling", () => {
    expect(levenshtein("skul", "school")).toBeGreaterThan(1);
  });

  it("counts completely wrong word", () => {
    expect(levenshtein("gorton", "garden")).toBeGreaterThan(1);
  });

  it("handles empty strings", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });
});

describe("spellCheckScore", () => {
  it("matches exact word in single-word answer", () => {
    expect(spellCheckScore("school", "school")).toBe(0);
  });

  it("finds the correct word within a multi-word answer", () => {
    expect(spellCheckScore("the school", "school")).toBe(0);
  });

  it("detects phonetic misspelling", () => {
    expect(spellCheckScore("skul", "school")).toBeGreaterThan(1);
  });

  it("accepts single-letter typo", () => {
    expect(spellCheckScore("schol", "school")).toBe(1);
  });

  it("is case-insensitive", () => {
    expect(spellCheckScore("School", "school")).toBe(0);
  });
});
