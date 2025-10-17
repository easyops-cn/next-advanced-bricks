import { describe, test, expect } from "@jest/globals";
import { setChatCommand } from "./set-chat-command.js";

describe("setChatCommand", () => {
  test("should work", async () => {
    expect(await setChatCommand()).toBe(undefined);
  });
});
