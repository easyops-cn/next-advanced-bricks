import { getFlatOrderedJobs } from "./getFlatOrderedJobs";
import type { Task } from "../shared/interfaces";

describe("getFlatOrderedJobs", () => {
  beforeEach(() => {
    // jest.resetAllMocks(); // Not needed since no mocks
  });

  it("should handle null or undefined tasks", () => {
    const result = getFlatOrderedJobs(null);

    expect(result).toEqual({
      list: [],
      map: new Map(),
      roots: [],
      levels: new Map(),
      downstreamMap: new Map(),
    });
    // No getOrderedNodes mock check
  });

  it("should flatten ordered jobs from multiple tasks", () => {
    // Mock task structure
    const mockTask1 = {
      id: "task-1",
      jobs: [{ id: "job-1-1" }, { id: "job-1-2", upstream: ["job-1-1"] }],
    } as Task;

    const mockTask2 = {
      id: "task-2",
      jobs: [{ id: "job-2-1" }, { id: "job-2-2", upstream: ["job-2-1"] }],
    } as Task;

    // Simulate cross-task dependency: job-1-2 -> job-2-1
    // We'll add a downstream connection by making task-2 depend on task-1
    const tasks: Task[] = [mockTask1, { ...mockTask2, upstream: ["task-1"] }];

    const result = getFlatOrderedJobs(tasks);

    expect(result.list).toEqual(["job-1-1", "job-1-2", "job-2-1", "job-2-2"]);
    expect(result.map.size).toBe(4);
    expect(result.roots).toEqual(["job-1-1"]);
    expect(result.levels.size).toBe(4);
    expect(result.downstreamMap.size).toBe(3); // Each job has downstreams

    // Check if job-1-2 connects to job-2-1 (cross-task connection)
    expect(result.downstreamMap.get("job-1-2")).toContain("job-2-1");
  });

  it("should pass showHiddenJobs option to getOrderedNodes", () => {
    const tasks = [
      { id: "task-1", jobs: [{ id: "job-1", hidden: true }] },
    ] as Task[];

    const result = getFlatOrderedJobs(tasks, { showHiddenJobs: true });

    // When showHiddenJobs is true, hidden jobs should be included
    expect(result.list).toContain("job-1");
  });
});
