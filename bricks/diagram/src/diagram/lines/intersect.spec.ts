import { intersect } from "./intersect";

describe("intersect", () => {
  it("should return null if any line is of length 0", () => {
    expect(intersect([0, 0], [0, 0], [1, 1], [2, 2])).toBeNull();
    expect(intersect([1, 1], [2, 2], [3, 3], [3, 3])).toBeNull();
  });

  it("should return null if lines are parallel", () => {
    expect(intersect([0, 0], [1, 1], [2, 2], [3, 3])).toBeNull();
  });

  it("should return null if intersection is not along the segments", () => {
    expect(intersect([0, 0], [1, 1], [1, 0], [2, -1])).toBeNull();
  });

  it("should return the intersection point if lines intersect", () => {
    expect(intersect([0, 0], [2, 2], [0, 2], [2, 0])).toEqual([1, 1]);
    expect(intersect([0, 0], [4, 4], [0, 4], [4, 0])).toEqual([2, 2]);
  });

  it("should return the intersection point if lines intersect at the endpoints", () => {
    expect(intersect([0, 0], [2, 2], [2, 2], [4, 0])).toEqual([2, 2]);
  });
});
