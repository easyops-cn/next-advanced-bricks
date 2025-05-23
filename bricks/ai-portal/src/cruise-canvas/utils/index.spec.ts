import { getlastProgress, getToolDataProgress } from "./index";

import { Message, DataPart } from "../interfaces";

describe("utils", () => {
  describe("getToolDataProgress", () => {
    it("should extract only progress-type data parts", () => {
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
          ],
        },
      ];

      const result = getToolDataProgress(toolCallMessages);
      expect(result.length).toBe(1);
      expect(result[0].data.type).toBe("progress");
      expect(result[0].data.progress).toBe(10);
    });

    it("should return empty array when input is empty", () => {
      const result = getToolDataProgress([]);
      expect(result).toEqual([]);
    });

    it("should return empty array if parts are undefined", () => {
      const toolCallMessages: Message[] = [
        {
          role: "tool",
          parts: undefined as unknown as any[],
        },
      ];
      const result = getToolDataProgress(toolCallMessages);
      expect(result).toEqual([]);
    });
  });
  describe("getlastProgress", () => {
    it("should return the last progress data part", () => {
      const dataParts: DataPart[] = [
        {
          type: "data",
          data: { type: "progress", progress: 1, total: 10 },
        },
        {
          type: "data",
          data: { type: "progress", progress: 2, total: 10 },
        },
      ];

      const result = getlastProgress(dataParts);
      expect(result?.data.progress).toBe(2);
      expect(result?.data.total).toBe(10);
    });

    it("should return undefined if dataParts is empty", () => {
      const result = getlastProgress([]);
      expect(result).toBeUndefined();
    });
  });
});
