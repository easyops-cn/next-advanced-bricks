import type { RequestStore } from "../shared/interfaces";
import {
  saveRequestStore,
  loadRequestStore,
  clearRequestStore,
} from "./request-store";

describe("request-store", () => {
  let mockRequestStore: RequestStore;

  beforeEach(() => {
    // Clean up before each test
    clearRequestStore();
    mockRequestStore = {
      conversationId: "chat",
      content: "test message",
    };
  });

  describe("saveRequestStore", () => {
    it("should save the request store", () => {
      saveRequestStore(mockRequestStore);
      expect(loadRequestStore()).toEqual(mockRequestStore);
    });
  });

  describe("loadRequestStore", () => {
    it("should return null if no store is saved", () => {
      expect(loadRequestStore()).toBeNull();
    });

    it("should return and clear the store", () => {
      saveRequestStore(mockRequestStore);

      // First load returns the store
      const result = loadRequestStore();
      expect(result).toEqual(mockRequestStore);

      // Second load returns null as it was cleared after first load
      expect(loadRequestStore()).toBeNull();
    });
  });

  describe("clearRequestStore", () => {
    it("should clear the stored request", () => {
      saveRequestStore(mockRequestStore);
      clearRequestStore();
      expect(loadRequestStore()).toBeNull();
    });
  });

  // Custom element definitions are not tested directly
  // as they are just registrations of the functions above
});
