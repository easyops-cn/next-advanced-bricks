import { getTaskTree } from "./getTaskTree";
import type { Task, Job } from "./interfaces";

describe("getTaskTree", () => {
  it("should return empty array when given empty tasks array", () => {
    const result = getTaskTree([]);
    expect(result).toEqual([]);
  });

  it("should build task tree with single task and no jobs", () => {
    const task: Task = {
      id: "task1",
      state: "completed",
      jobs: [],
      startTime: Date.now(),
    };

    const result = getTaskTree([task]);

    expect(result).toEqual([
      {
        task,
        children: [],
      },
    ]);
  });

  it("should build task tree with task containing jobs", () => {
    const job1: Job = {
      id: "job1",
      state: "completed",
      startTime: Date.now(),
    };
    const job2: Job = {
      id: "job2",
      state: "completed",
      startTime: Date.now(),
    };
    const task: Task = {
      id: "task1",
      state: "completed",
      jobs: [job1, job2],
      startTime: Date.now(),
    };

    const result = getTaskTree([task]);

    expect(result).toEqual([
      {
        task,
        children: [{ job: job1 }, { job: job2 }],
      },
    ]);
  });

  it("should build nested task tree with subtasks", () => {
    const subJob: Job = {
      id: "subjob1",
      state: "completed",
      startTime: Date.now(),
    };
    const subTask: Task = {
      id: "subtask1",
      parent: "job1", // This links the subtask to the main job
      state: "completed",
      jobs: [subJob],
      startTime: Date.now(),
    };
    const mainJob: Job = {
      id: "job1",
      state: "completed",
      startTime: Date.now(),
    };
    const mainTask: Task = {
      id: "task1",
      state: "completed",
      jobs: [mainJob],
      startTime: Date.now(),
    };

    const result = getTaskTree([mainTask, subTask]);

    expect(result).toEqual([
      {
        task: mainTask,
        children: [
          {
            job: mainJob,
            subTask: {
              task: subTask,
              children: [{ job: subJob }],
            },
          },
        ],
      },
    ]);
  });

  it("should handle multiple root tasks", () => {
    const task1: Task = {
      id: "task1",
      state: "completed",
      jobs: [],
      startTime: Date.now(),
    };
    const task2: Task = {
      id: "task2",
      state: "completed",
      jobs: [],
      startTime: Date.now(),
    };

    const result = getTaskTree([task1, task2]);

    expect(result).toEqual([
      { task: task1, children: [] },
      { task: task2, children: [] },
    ]);
  });
});
