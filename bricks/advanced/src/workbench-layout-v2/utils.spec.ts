import { defaultCardConfig, getLayoutDefaultCardConfig } from "./utils";

describe("getLayoutDefaultCardConfig", () => {
  it("should work", () => {
    expect(getLayoutDefaultCardConfig("test")).toEqual(defaultCardConfig);

    expect(getLayoutDefaultCardConfig("notice-card")).toEqual({
      ...defaultCardConfig,
      moreIconLink: "/announcement-management",
      showMoreIcon: true,
    });
  });
});
