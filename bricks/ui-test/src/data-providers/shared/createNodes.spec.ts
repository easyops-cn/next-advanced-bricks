import { describe, test, expect } from "@jest/globals";
import { StoryboardApi_addNode } from "@next-api-sdk/next-builder-sdk";
import { createNodes } from "./createNodes.js";
import { NodeType } from "../../interface.js";

jest.mock("@next-api-sdk/next-builder-sdk");

let counter = 1;
(StoryboardApi_addNode as jest.Mock).mockImplementation(() => ({
  instance: { instanceId: `n_${counter++}` },
}));

describe("createNodes", () => {
  test("should work", async () => {
    await createNodes(
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
      0,
      { appId: "test-app-id" }
    );
    expect(StoryboardApi_addNode).toHaveBeenCalledTimes(5);

    expect(StoryboardApi_addNode).toHaveBeenNthCalledWith(
      1,
      "test-app-id",
      expect.objectContaining({
        objectId: "UI_TEST_NODE@EASYOPS",
        instance: expect.objectContaining({
          name: "get",
          parent: "p_0",
          sort: 0,
        }),
      })
    );
    expect(StoryboardApi_addNode).toHaveBeenNthCalledWith(
      2,
      "test-app-id",
      expect.objectContaining({
        objectId: "UI_TEST_NODE@EASYOPS",
        instance: expect.objectContaining({
          name: "click",
          parent: "n_1",
          sort: 0,
        }),
      })
    );
    expect(StoryboardApi_addNode).toHaveBeenNthCalledWith(
      3,
      "test-app-id",
      expect.objectContaining({
        objectId: "UI_TEST_NODE@EASYOPS",
        instance: expect.objectContaining({
          name: "findByTestId",
          parent: "p_0",
          sort: 1,
        }),
      })
    );
    expect(StoryboardApi_addNode).toHaveBeenNthCalledWith(
      4,
      "test-app-id",
      expect.objectContaining({
        objectId: "UI_TEST_NODE@EASYOPS",
        instance: expect.objectContaining({
          name: "dblclick",
          parent: "n_3",
          sort: 0,
        }),
      })
    );
    expect(StoryboardApi_addNode).toHaveBeenNthCalledWith(
      5,
      "test-app-id",
      expect.objectContaining({
        objectId: "UI_TEST_NODE@EASYOPS",
        instance: expect.objectContaining({
          name: "type",
          parent: "n_3",
          sort: 1,
        }),
      })
    );
  });
});
