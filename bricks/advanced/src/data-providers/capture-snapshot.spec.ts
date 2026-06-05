import { describe, test } from "@jest/globals";
import { captureSnapshot } from "./capture-snapshot.js";
jest.mock("modern-screenshot", () => ({
  domToCanvas: jest.fn().mockResolvedValue({
    toDataURL: jest.fn().mockReturnValue("data:image/png;base64,"),
    toBlob: jest.fn((cb: (blob: Blob) => void) => cb(new Blob())),
    width: 100,
    height: 100,
  }),
}));
describe("captureSnapshot", () => {
  test("fileType is image", async () => {
    await captureSnapshot({
      fileType: "image",
      name: "image",
    });
  });
});
