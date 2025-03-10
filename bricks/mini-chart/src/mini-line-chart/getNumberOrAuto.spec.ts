import { getNumberOrAuto } from "./getNumberOrAuto";

describe("getNumberOrAuto", () => {
  it("should return 'auto' when value is 'auto'", () => {
    expect(getNumberOrAuto("auto", 100)).toBe("auto");
  });

  it("should return defaultValue when value is null", () => {
    expect(getNumberOrAuto(null, 100)).toBe(100);
    expect(getNumberOrAuto(null, "auto")).toBe("auto");
  });

  it("should return defaultValue when value is undefined", () => {
    expect(getNumberOrAuto(undefined, 100)).toBe(100);
    expect(getNumberOrAuto(undefined, "auto")).toBe("auto");
  });

  it("should convert string numeric value to number", () => {
    expect(getNumberOrAuto("123", 100)).toBe(123);
  });

  it("should handle px suffix", () => {
    expect(getNumberOrAuto("456px", 100)).toBe(456);
  });

  it("should return 'auto' for invalid number and log warning", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    expect(getNumberOrAuto("not-a-number", 100)).toBe("auto");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Invalid number: %s, fallback to 'auto'",
      "not-a-number"
    );
    consoleSpy.mockRestore();
  });
});
