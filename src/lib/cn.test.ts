import { describe, it, expect } from "bun:test";
import { cn } from "./cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false ? "hidden" : "", true ? "visible" : "")).toBe(
      "base visible",
    );
  });

  it("handles tailwind conflicts with twMerge", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });

  it("handles undefined and null args", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });
});
