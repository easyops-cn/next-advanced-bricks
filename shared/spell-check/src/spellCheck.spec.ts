import type {
  spellCheck as _spellCheck,
  SpellCheckRequest,
} from "./spellCheck";
import Typo from "typo-js";

jest.mock("typo-js");

describe("spellCheck", () => {
  let mockCheck: jest.Mock;
  let mockCheckExact: jest.Mock;
  let spellCheck: typeof _spellCheck;

  beforeEach(() => {
    // Setup mock for Typo.check method
    mockCheck = jest.fn();
    mockCheckExact = jest.fn();
    (Typo as jest.Mock).mockImplementation(() => ({
      check: mockCheck,
      checkExact: mockCheckExact,
    }));

    jest.isolateModules(() => {
      // Import the spellCheck function after mocking Typo
      spellCheck = require("./spellCheck").spellCheck;
    });
  });

  it("should return empty markers for empty source", () => {
    const request: SpellCheckRequest = { source: "" };
    const response = spellCheck(request);
    expect(response.markers).toEqual([]);
    expect(mockCheck).not.toHaveBeenCalled();
  });

  it("should ignore words less than 4 characters", () => {
    const request: SpellCheckRequest = { source: "cat dog" };
    const response = spellCheck(request);
    expect(response.markers).toEqual([]);
    expect(mockCheck).not.toHaveBeenCalled();
  });

  it("should check words with 4 or more characters", () => {
    mockCheck.mockReturnValue(true); // All words are correct
    const request: SpellCheckRequest = { source: "category flower" };
    const response = spellCheck(request);
    expect(mockCheck).toHaveBeenCalledWith("category");
    expect(mockCheck).toHaveBeenCalledWith("flower");
    expect(response.markers).toEqual([]);
  });

  it("should create markers for misspelled words", () => {
    // Mock check to return false for 'wrongg' and true for 'correct'
    mockCheck.mockImplementation((word: string) => word !== "wrongg");

    const request: SpellCheckRequest = { source: "correct wrongg another" };
    const response = spellCheck(request);

    expect(response.markers).toHaveLength(1);
    expect(response.markers[0]).toEqual({
      start: 8, // index where 'wrongg' starts
      end: 14, // index where 'wrongg' ends
      message: '"wrongg": Unknown word.',
      severity: "Info",
    });
  });

  it("should handle multiple misspelled words", () => {
    // Mock check to return false for specific words
    mockCheck.mockImplementation(
      (word: string) => !["misspelled", "wordd"].includes(word)
    );

    const request: SpellCheckRequest = {
      source: "this misspelled wordd should be marked",
    };
    const response = spellCheck(request);

    expect(response.markers).toHaveLength(2);
    expect(response.markers[0].message).toBe('"misspelled": Unknown word.');
    expect(response.markers[1].message).toBe('"wordd": Unknown word.');
  });

  it("should correctly determine word boundaries", () => {
    mockCheck.mockImplementation((word: string) => word !== "wrongg");

    const request: SpellCheckRequest = { source: "correct.wrongg;another" };
    const response = spellCheck(request);

    // The regex should only match 'correct', 'wrongg', and 'another'
    expect(mockCheck).toHaveBeenCalledWith("correct");
    expect(mockCheck).toHaveBeenCalledWith("wrongg");
    expect(mockCheck).toHaveBeenCalledWith("another");

    expect(response.markers).toHaveLength(1);
    expect(response.markers[0].message).toBe('"wrongg": Unknown word.');
  });

  it("should handle pascal case words", () => {
    mockCheck.mockImplementation((word: string) => word !== "PascalCase");

    const request: SpellCheckRequest = { source: "PascalCase is a style" };
    const response = spellCheck(request);

    expect(mockCheck).toHaveBeenCalledWith("Pascal");
    expect(mockCheck).toHaveBeenCalledWith("Case");
    expect(mockCheck).toHaveBeenCalledWith("style");
    expect(response.markers).toHaveLength(0);
  });

  it("should handle spell check", () => {
    const request: SpellCheckRequest = { source: "test", knownWords: ["test"] };
    const response = spellCheck(request);

    expect(response.markers).toHaveLength(0);
  });

  it("should handle capitalized words", () => {
    mockCheck.mockImplementation((word: string) => word === "Capitalized");
    mockCheckExact.mockImplementation((word: string) => word === "Capitalized");

    const request: SpellCheckRequest = { source: "capitalized" };
    const response = spellCheck(request);

    expect(mockCheck).toHaveBeenCalledWith("capitalized");
    expect(mockCheckExact).toHaveBeenCalledWith("Capitalized");
    expect(response.markers).toHaveLength(0);
  });

  it("should handle $nlike", () => {
    const request: SpellCheckRequest = { source: "$nlike" };
    const response = spellCheck(request);

    expect(mockCheck).toHaveBeenCalledWith("nlike");
    expect(response.markers).toHaveLength(0);
  });

  it("should handle doesn't", () => {
    const request: SpellCheckRequest = { source: "doesn't" };
    const response = spellCheck(request);

    expect(mockCheck).toHaveBeenCalledWith("doesn");
    expect(response.markers).toHaveLength(0);
  });

  it("should handle hasn't", () => {
    const request: SpellCheckRequest = { source: "hasn't hasn'top" };
    const response = spellCheck(request);

    expect(mockCheck).toHaveBeenCalledWith("hasn");
    expect(response.markers[0]).toEqual({
      start: 7,
      end: 11,
      message: '"hasn": Unknown word.',
      severity: "Info",
    });
  });

  it("should handle css hex colors", () => {
    const request: SpellCheckRequest = {
      source: "#FFEE00 #00AABB #CCDDEE #FFEEDDCC #FFEEDD00 #00FFEEDD asdf",
    };
    const response = spellCheck(request);

    expect(mockCheck).toHaveBeenCalledWith("asdf");
    expect(response.markers[0]).toEqual({
      start: 54,
      end: 58,
      message: '"asdf": Unknown word.',
      severity: "Info",
    });
  });
});
