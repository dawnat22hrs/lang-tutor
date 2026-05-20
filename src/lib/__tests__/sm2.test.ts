import { describe, it, expect } from "vitest";
import { sm2 } from "../sm2";

const DEFAULT_EF = 2.5;

describe("sm2", () => {
  describe("failed recall (rawScore < 7)", () => {
    it("resets interval to 1 and repetitions to 0", () => {
      const result = sm2(DEFAULT_EF, 10, 3, 6);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });

    it("decreases ease factor on failure", () => {
      const result = sm2(DEFAULT_EF, 10, 3, 6);
      expect(result.easeFactor).toBeCloseTo(DEFAULT_EF - 0.2);
    });

    it("never lets ease factor drop below 1.3 on failure", () => {
      const result = sm2(1.3, 10, 3, 0);
      expect(result.easeFactor).toBe(1.3);
    });

    it("treats score 0 as failed", () => {
      const result = sm2(DEFAULT_EF, 6, 2, 0);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });

    it("treats score 6 as failed", () => {
      const result = sm2(DEFAULT_EF, 10, 3, 6);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });
  });

  describe("first successful review (repetitions = 0)", () => {
    it("sets interval to 1 for score 7-8", () => {
      const result = sm2(DEFAULT_EF, 1, 0, 8);
      expect(result.interval).toBe(1);
    });

    it("sets interval to 1 for score 9-10", () => {
      const result = sm2(DEFAULT_EF, 1, 0, 10);
      expect(result.interval).toBe(1);
    });

    it("increments repetitions to 1", () => {
      const result = sm2(DEFAULT_EF, 1, 0, 8);
      expect(result.repetitions).toBe(1);
    });
  });

  describe("second successful review (repetitions = 1)", () => {
    it("sets interval to 3 days for score 7-8", () => {
      const result = sm2(DEFAULT_EF, 1, 1, 8);
      expect(result.interval).toBe(3);
    });

    it("sets interval to 7 days for score 9-10", () => {
      const result = sm2(DEFAULT_EF, 1, 1, 10);
      expect(result.interval).toBe(7);
    });

    it("increments repetitions to 2", () => {
      const result = sm2(DEFAULT_EF, 1, 1, 8);
      expect(result.repetitions).toBe(2);
    });
  });

  describe("subsequent reviews (repetitions > 1)", () => {
    it("caps interval at 7 days for score 7-8", () => {
      const result = sm2(2.5, 6, 2, 8);
      expect(result.interval).toBe(7);
    });

    it("caps interval at 30 days for score 9-10", () => {
      const result = sm2(2.5, 20, 5, 10);
      expect(result.interval).toBe(30);
    });

    it("increases ease factor on perfect score", () => {
      const result = sm2(DEFAULT_EF, 7, 2, 10);
      expect(result.easeFactor).toBeGreaterThan(DEFAULT_EF);
    });

    it("preserves ease factor on score 7-8 (q=4, delta=0)", () => {
      const result = sm2(DEFAULT_EF, 7, 2, 8);
      expect(result.easeFactor).toBeCloseTo(DEFAULT_EF, 5);
    });

    it("never lets ease factor drop below 1.3", () => {
      let ef = DEFAULT_EF;
      for (let i = 0; i < 20; i++) {
        const r = sm2(ef, 1, 2, 7);
        ef = r.easeFactor;
      }
      expect(ef).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe("score boundary (7 is the passing threshold)", () => {
    it("score 7 passes", () => {
      const result = sm2(DEFAULT_EF, 1, 0, 7);
      expect(result.repetitions).toBe(1);
    });

    it("score 6 fails", () => {
      const result = sm2(DEFAULT_EF, 1, 0, 6);
      expect(result.repetitions).toBe(0);
    });
  });
});
