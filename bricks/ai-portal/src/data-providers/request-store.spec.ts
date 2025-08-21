import { describe, test, expect } from "@jest/globals";
import { requestStore } from "./request-store.js";

describe("requestStore", () => {
  test("should work", async () => {
    expect(await requestStore()).toBe(undefined);
  });
});
