import { describe, test, expect } from "@jest/globals";
import { saveRecordedCommands } from "./save-recorded-commands.js";
import { createNodes } from "./shared/createNodes.js";
import { NodeType } from "../interface.js";

jest.mock("./shared/createNodes.js");

describe("saveRecordedCommands", () => {
  test("should work", async () => {
    await saveRecordedCommands({
      steps: [
        {
          event: "click",
          target: [
            {
              tag: "button",
              type: "id",
              value: "my-button",
            },
          ],
        },
        {
          event: "dblclick",
          target: [
            {
              tag: "input",
              type: "testid",
              value: "my-input",
            },
          ],
        },
        {
          event: "type",
          target: [
            {
              tag: "input",
              type: "testid",
              value: "my-input",
            },
          ],
          text: "ok{enter}",
        },
      ],
      parent: "p_0",
      initialSort: 1,
    });
    expect(createNodes).toHaveBeenCalledWith(
      [
        {
          type: NodeType.Command,
          name: "get",
          params: ["#my-button"],
          children: [
            {
              type: NodeType.Command,
              name: "click",
            },
          ],
        },
        {
          type: NodeType.Command,
          name: "findByTestId",
          params: ["my-input"],
          children: [
            {
              type: NodeType.Command,
              name: "dblclick",
            },
            {
              type: NodeType.Command,
              name: "type",
              params: ["ok{enter}"],
            },
          ],
        },
      ],
      "p_0",
      1
    );
  });

  test("should work with multiple command", async () => {
    await saveRecordedCommands({
      steps: [
        {
          event: "click",
          target: [
            {
              tag: "button-wrapper",
              type: "css-selector",
              value: ".wrapper",
            },
            {
              tag: "button",
              type: "id",
              value: "my-button",
            },
          ],
        },
        {
          event: "click",
          target: [
            {
              tag: "forms.general-radio",
              type: "testid",
              value: "my-radio",
            },
            {
              tag: "span",
              type: "css-selector",
              value: ".ant-radio-wrapper",
              eq: 1,
            },
          ],
        },
        {
          event: "click",
          target: [
            {
              tag: "div",
              type: "css-selector",
              value: ".ant-select-dropdown",
              isolate: true,
            },
            {
              tag: "div",
              type: "css-selector",
              value: ".ant-select-item",
              eq: 2,
            },
          ],
          text: "ok{enter}",
        },
      ],
      parent: "p_0",
      initialSort: 1,
    });

    expect(createNodes).toHaveBeenCalledWith(
      [
        {
          children: [
            { name: "find", params: ["my-button"], type: NodeType.Command },
            { name: "click", type: NodeType.Command },
          ],
          name: "get",
          params: [".wrapper"],
          type: NodeType.Command,
        },
        {
          children: [
            { name: "find", params: [".ant-radio-wrapper"], type: NodeType.Command },
            { name: "eq", params: [1], type: NodeType.Command },
            { name: "click", type: NodeType.Command },
          ],
          name: "findByTestId",
          params: ["my-radio"],
          type: NodeType.Command,
        },
        {
          children: [
            { name: "find", params: [".ant-select-item"], type: NodeType.Command },
            { name: "eq", params: [2], type: NodeType.Command },
            { name: "click", type: NodeType.Command },
          ],
          name: "get",
          params: [".ant-select-dropdown:visible"],
          type: NodeType.Command,
        },
      ],
      "p_0",
      1
    );
  });
});
