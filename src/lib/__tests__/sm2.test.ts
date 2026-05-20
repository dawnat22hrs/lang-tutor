import { describe, it, expect } from "vitest";
import { sm2 } from "../sm2";

const DEFAULT_EF = 2.5;

describe("sm2", () => {
  describe("failed recall (rawScore < 8)", () => {
    it("resets interval to 1 and repetitions to 0", () => {
      const result = sm2(DEFAULT_EF, 10, 3, 6);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });

    it("decreases ease factor on failure", () => {
      const result = sm2(DEFAULT_EF, 10, 3, 6);
      expect(result.easeFactor).toBeCloseTo(DEFAULT_EF - 0.2);
    });

    it("never lets ease factor drop below 1.3", () => {
      const result = sm2(1.3, 10, 3, 0);
      expect(result.easeFactor).toBe(1.3);
    });

    it("treats score 7 as failed", () => {
      const result = sm2(DEFAULT_EF, 5, 2, 7);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it("treats score 6 as failed", () => {
      expect(sm2(DEFAULT_EF, 5, 2, 6).repetitions).toBe(0);
    });
  });

  describe("score 8 — daily review (minimum pass)", () => {
    it("sets interval to 1 regardless of repetitions", () => {
      expect(sm2(DEFAULT_EF, 1, 0, 8).interval).toBe(1);
      expect(sm2(DEFAULT_EF, 7, 3, 8).interval).toBe(1);
    });

    it("increments repetitions", () => {
      expect(sm2(DEFAULT_EF, 1, 0, 8).repetitions).toBe(1);
    });

    it("slightly increases ease factor", () => {
      expect(sm2(2.0, 1, 0, 8).easeFactor).toBeCloseTo(2.05);
    });
  });

  describe("score 9 — weekly review", () => {
    it("sets interval to 7 days", () => {
      expect(sm2(DEFAULT_EF, 1, 0, 9).interval).toBe(7);
      expect(sm2(DEFAULT_EF, 7, 3, 9).interval).toBe(7);
    });

    it("increases ease factor", () => {
      expect(sm2(2.0, 1, 0, 9).easeFactor).toBeCloseTo(2.1);
    });

    it("caps ease factor at 2.5", () => {
      expect(sm2(2.5, 1, 0, 9).easeFactor).toBe(2.5);
    });
  });

  describe("score 10 — growing toward monthly", () => {
    it("sets interval to 1 on first review", () => {
      expect(sm2(DEFAULT_EF, 1, 0, 10).interval).toBe(1);
    });

    it("sets interval to 7 on second review", () => {
      expect(sm2(DEFAULT_EF, 1, 1, 10).interval).toBe(7);
    });

    it("grows interval using ease factor on third+ review", () => {
      const result = sm2(2.5, 7, 2, 10);
      expect(result.interval).toBeGreaterThan(7);
    });

    it("caps interval at 30 days", () => {
      expect(sm2(2.5, 20, 5, 10).interval).toBe(30);
    });

    it("increases ease factor", () => {
      expect(sm2(2.0, 1, 0, 10).easeFactor).toBeCloseTo(2.15);
    });
  });

  describe("score boundary", () => {
    it("score 8 passes", () => {
      expect(sm2(DEFAULT_EF, 1, 0, 8).repetitions).toBe(1);
    });

    it("score 7 fails", () => {
      expect(sm2(DEFAULT_EF, 1, 0, 7).repetitions).toBe(0);
    });
  });
});
