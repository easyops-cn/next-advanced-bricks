import { describe, test, expect } from "@jest/globals";
import { entitySdkGet } from "./entity-sdk-get.js";

describe("entitySdkGet", () => {
  test("should work", async () => {
    expect(await entitySdkGet()).toBe(undefined);
  });
});
