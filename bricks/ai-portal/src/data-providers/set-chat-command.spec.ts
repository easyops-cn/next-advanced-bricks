import { describe, test, expect } from "@jest/globals";
import { getChatCommand, setChatCommand } from "./set-chat-command.js";

describe("setChatCommand", () => {
  test("should work", () => {
    setChatCommand({
      command: "start",
      payload: null!,
    });
    expect(getChatCommand()).toEqual({
      command: "start",
      payload: null,
    });

    setChatCommand(null);
    expect(getChatCommand()).toBeNull();
  });
});
