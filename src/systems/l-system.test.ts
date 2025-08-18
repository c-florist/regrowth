import { describe, expect, it } from "vitest";
import { LSystem } from "./l-system";

describe("LSystem", () => {
  it("should generate the correct sentence", () => {
    const rules = new Map([["A", "BA"]]);
    const lSystem = new LSystem("A", rules);
    lSystem.generate(2);
    expect(lSystem.sentence).toBe("BBA");
  });
});
