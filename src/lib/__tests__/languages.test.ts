import { describe, it, expect } from "vitest";
import { isValidLanguage } from "../languages";

describe("isValidLanguage", () => {
  describe("Russian names", () => {
    it("accepts common Russian language names", () => {
      expect(isValidLanguage("немецкий")).toBe(true);
      expect(isValidLanguage("английский")).toBe(true);
      expect(isValidLanguage("французский")).toBe(true);
      expect(isValidLanguage("японский")).toBe(true);
      expect(isValidLanguage("китайский")).toBe(true);
    });
  });

  describe("English names", () => {
    it("accepts English language names", () => {
      expect(isValidLanguage("german")).toBe(true);
      expect(isValidLanguage("english")).toBe(true);
      expect(isValidLanguage("french")).toBe(true);
      expect(isValidLanguage("japanese")).toBe(true);
      expect(isValidLanguage("arabic")).toBe(true);
    });
  });

  describe("Native / alternative names", () => {
    it("accepts native script names", () => {
      expect(isValidLanguage("deutsch")).toBe(true);
      expect(isValidLanguage("español")).toBe(true);
      expect(isValidLanguage("français")).toBe(true);
    });
  });

  describe("case insensitivity", () => {
    it("accepts uppercase input", () => {
      expect(isValidLanguage("ENGLISH")).toBe(true);
      expect(isValidLanguage("GERMAN")).toBe(true);
    });

    it("accepts mixed case input", () => {
      expect(isValidLanguage("English")).toBe(true);
      expect(isValidLanguage("German")).toBe(true);
      expect(isValidLanguage("Японский")).toBe(true);
    });
  });

  describe("whitespace trimming", () => {
    it("accepts input with leading/trailing spaces", () => {
      expect(isValidLanguage("  english  ")).toBe(true);
      expect(isValidLanguage(" немецкий ")).toBe(true);
    });
  });

  describe("invalid input", () => {
    it("rejects nonsense words", () => {
      expect(isValidLanguage("blabla")).toBe(false);
      expect(isValidLanguage("xyz123")).toBe(false);
      expect(isValidLanguage("ляляля")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isValidLanguage("")).toBe(false);
      expect(isValidLanguage("   ")).toBe(false);
    });

    it("rejects partial matches", () => {
      expect(isValidLanguage("engl")).toBe(false);
      expect(isValidLanguage("nem")).toBe(false);
    });
  });
});
