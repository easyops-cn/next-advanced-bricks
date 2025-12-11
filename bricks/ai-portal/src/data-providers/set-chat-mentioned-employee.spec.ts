import { describe, test, expect } from "@jest/globals";
import {
  getChatMentionedEmployee,
  setChatMentionedEmployee,
} from "./set-chat-mentioned-employee.js";

describe("setChatCommand", () => {
  test("should work", () => {
    setChatMentionedEmployee({
      employeeId: "AI_MANAGEMENT",
      name: "AI管理员",
    });
    expect(getChatMentionedEmployee()).toEqual({
      employeeId: "AI_MANAGEMENT",
      name: "AI管理员",
    });

    setChatMentionedEmployee(null);
    expect(getChatMentionedEmployee()).toBeNull();
  });
});
