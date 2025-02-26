import { getMemberAccessor } from "./getMemberAccessor";

describe("getMemberAccessor", () => {
  // Test valid identifiers - should use dot notation
  it("should return dot notation for valid identifiers", () => {
    expect(getMemberAccessor("foo")).toEqual(".foo");
    expect(getMemberAccessor("bar123")).toEqual(".bar123");
    expect(getMemberAccessor("_privateVar")).toEqual("._privateVar");
    expect(getMemberAccessor("$specialVar")).toEqual(".$specialVar");
    expect(getMemberAccessor("camelCase")).toEqual(".camelCase");
  });

  // Test invalid identifiers - should use bracket notation
  it("should return bracket notation for invalid identifiers", () => {
    expect(getMemberAccessor("foo-bar")).toEqual('["foo-bar"]');
    expect(getMemberAccessor("123abc")).toEqual('["123abc"]');
    expect(getMemberAccessor("foo bar")).toEqual('["foo bar"]');
    expect(getMemberAccessor("foo.bar")).toEqual('["foo.bar"]');
    expect(getMemberAccessor("test@example.com")).toEqual(
      '["test@example.com"]'
    );
    expect(getMemberAccessor("")).toEqual('[""]');
  });

  // Test non-string values
  it("should handle non-string values by converting to string", () => {
    expect(getMemberAccessor(123)).toEqual('["123"]');
    expect(getMemberAccessor(true)).toEqual(".true");
    expect(getMemberAccessor(false)).toEqual(".false");
    expect(getMemberAccessor(null)).toEqual(".null");
    expect(getMemberAccessor(undefined)).toEqual(".undefined");

    // Objects convert to [object Object]
    const obj = { a: 1 };
    expect(getMemberAccessor(obj)).toEqual('["[object Object]"]');

    // Arrays are joined with commas
    const arr = [1, 2, 3];
    expect(getMemberAccessor(arr)).toEqual('["1,2,3"]');
  });

  // Test characters from other languages (Unicode support)
  it("should handle Unicode characters appropriately", () => {
    expect(getMemberAccessor("变量")).toEqual(".变量");
    expect(getMemberAccessor("ñáéíóú")).toEqual(".ñáéíóú");
  });
});
