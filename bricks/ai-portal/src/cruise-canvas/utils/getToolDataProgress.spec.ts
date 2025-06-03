import { getToolDataProgress } from "./getToolDataProgress";
import type { Message } from "../interfaces";

describe("utils", () => {
  describe("getToolDataProgress", () => {
    it("should return last progress-type data part", () => {
      const toolCallMessages: Message[] = [
        {
          role: "tool",
          parts: [
            {
              type: "data",
              data: {
                type: "progress",
                progress: 10,
                total: 20,
              },
            },
            {
              type: "data",
              data: {
                type: "log",
                message: "log message",
              },
            },
            {
              type: "text",
              text: "some text",
            },
            {
              type: "data",
              data: {
                type: "progress",
                progress: 15,
                total: 20,
              },
            },
          ],
        },
      ];

      const result = getToolDataProgress(toolCallMessages);
      expect(result).toMatchInlineSnapshot(`
        {
          "data": {
            "progress": 15,
            "total": 20,
            "type": "progress",
          },
          "type": "data",
        }
      `);
    });

    it("should return undefined when input is empty", () => {
      const result = getToolDataProgress([]);
      expect(result).toEqual(undefined);
    });

    it("should return undefined if parts are undefined", () => {
      const toolCallMessages: Message[] = [
        {
          role: "tool",
          parts: undefined as unknown as any[],
        },
      ];
      const result = getToolDataProgress(toolCallMessages);
      expect(result).toEqual(undefined);
    });
  });
});
