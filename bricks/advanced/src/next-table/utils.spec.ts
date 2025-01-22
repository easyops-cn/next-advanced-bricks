import { getCellStatusStyle, naturalComparator } from "./utils";

describe("naturalComparator", () => {
  test("default order (ascend)", () => {
    const list: unknown[] = [1, null, 6, 23, undefined, "35", 12];
    list.sort(naturalComparator);
    expect(list).toEqual([1, 6, 12, 23, "35", null, undefined]);
  });

  test("descend", () => {
    const list: unknown[] = [1, null, 6, 23, undefined, "35", 12];
    list.sort((a, b) => naturalComparator(b, a, "descend"));
    expect(list).toEqual(["35", 23, 12, 6, 1, null, undefined]);
  });
});

describe("getCellStatusStyle", () => {
  const record = { status: "active" };
  const col = {
    dataIndex: "status",
    cellStatus: {
      dataIndex: "status",
      mapping: [
        { value: "active", leftBorderColor: "green" },
        { value: "inactive", leftBorderColor: "red" },
      ],
    },
  };

  test("should return correct style for matched value", () => {
    const style = getCellStatusStyle(record, col);
    expect(style).toEqual({
      boxShadow: "inset 4px 0 var(--theme-green-color)",
    });
  });

  test("should return null if no cellStatus", () => {
    const colWithoutCellStatus = { dataIndex: "status" };
    const style = getCellStatusStyle(record, colWithoutCellStatus);
    expect(style).toBeNull();
  });

  test("should return null if no match found", () => {
    const recordWithNoMatch = { status: "unknown" };
    const style = getCellStatusStyle(recordWithNoMatch, col);
    expect(style).toBeNull();
  });

  test("should return correct style for custom color", () => {
    const colWithCustomColor = {
      ...col,
      cellStatus: {
        mapping: [{ value: "active", leftBorderColor: "#123456" }],
      },
    };
    const style = getCellStatusStyle(record, colWithCustomColor);
    expect(style).toEqual({ boxShadow: "inset 4px 0 #123456" });
  });
});
