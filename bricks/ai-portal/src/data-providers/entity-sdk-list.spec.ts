import { describe, test, expect } from "@jest/globals";
import { entitySdkList } from "./entity-sdk-list.js";

describe("entitySdkList", () => {
  test("should work", async () => {
    expect(await entitySdkList()).toBe(undefined);
  });
});
