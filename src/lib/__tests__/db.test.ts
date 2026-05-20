import { describe, it, expect } from "vitest";
import { computeStreak } from "../utils";

describe("computeStreak", () => {
  it("returns 0 for empty array", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("returns 1 when only today is present", () => {
    const today = new Date().toISOString();
    expect(computeStreak([today])).toBe(1);
  });

  it("returns 0 when the only date has a gap from today", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 864e5).toISOString();
    expect(computeStreak([twoDaysAgo])).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const today = new Date();
    const dates = [0, 1, 2].map((offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      return d.toISOString();
    });
    expect(computeStreak(dates)).toBe(3);
  });

  it("stops counting at the first gap", () => {
    const today = new Date();
    // today, yesterday, then skip a day → streak = 2
    const dates = [0, 1, 3].map((offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      return d.toISOString();
    });
    expect(computeStreak(dates)).toBe(2);
  });

  it("deduplicates multiple sessions on the same day", () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 864e5).toISOString();
    expect(computeStreak([today, today, yesterday, yesterday])).toBe(2);
  });
});
