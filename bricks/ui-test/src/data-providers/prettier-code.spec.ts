import { describe, test, expect } from "@jest/globals";
import { prettierCode } from "./prettier-code.js";

describe("prettierCode", () => {
  test("should work", async () => {
    const code =
      'describe("new", () => {beforeEach(() => {cy.setLanguage("en");cy.login();});it("test", () => {cy.get("test").should("be.empty").contains("test"); cy.get("test");});});';
    expect(await prettierCode(code)).toMatchSnapshot();
  });
});
