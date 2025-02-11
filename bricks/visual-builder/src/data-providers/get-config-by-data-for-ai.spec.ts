import { describe, test, expect } from "@jest/globals";
import { getConfigByDataForAi } from "./get-config-by-data-for-ai.js";

describe("getConfigByDataForAi", () => {
  test("should work", async () => {
    expect(await getConfigByDataForAi()).toBe(undefined);
  });
});
