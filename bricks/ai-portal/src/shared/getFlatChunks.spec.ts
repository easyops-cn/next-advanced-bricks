import { getFlatChunks } from "./getFlatChunks";
import type {
  Task,
  Job,
  ServiceFlowRun,
  ActivityWithFlow,
  ConversationError,
  ActivityRun,
} from "../shared/interfaces";

describe("getFlatChunks", () => {
  // Helper function to create a valid ServiceFlowRun
  const createServiceFlowRun = (
    overrides: Partial<ServiceFlowRun> = {}
  ): ServiceFlowRun => ({
    taskId: "task1",
    flowInstanceId: "flow-instance-1",
    name: "Test Flow",
    spec: [],
    space: {
      instanceId: "space1",
      name: "Test Space",
    },
    ...overrides,
  });

  // Helper function to create a valid ActivityRun
  const createActivityRun = (
    overrides: Partial<ActivityRun> = {}
  ): ActivityRun => ({
    name: "Test Activity",
    ...overrides,
  });

  it("should return empty chunks and jobMap when given empty inputs", () => {
    const result = getFlatChunks([], []);

    expect(result).toEqual({
      chunks: [],
      jobMap: new Map(),
      activeAskUser: null,
    });
  });

  it("should create activity chunk when activityMap is provided", () => {
    const task: Task = {
      id: "task1",
      state: "completed",
      jobs: [],
      startTime: Date.now(),
    };

    const activity = createActivityRun({ name: "Test Activity" });
    const flow = createServiceFlowRun({ name: "Test Flow" });
    const activityWithFlow: ActivityWithFlow = { activity, flow };

    const activityMap = new Map([["task1", activityWithFlow]]);

    const result = getFlatChunks([task], [], { activityMap });

    expect(result.chunks).toEqual([
      {
        type: "activity",
        activity,
        flow,
        task,
      },
    ]);
  });

  it("should create flow chunk when job type is serviceFlow and flowMap exists", () => {
    const job: Job = {
      id: "job1",
      type: "serviceFlow",
      state: "completed",
      startTime: Date.now(),
    };

    const task: Task = {
      id: "task1",
      state: "completed",
      jobs: [job],
      startTime: Date.now(),
    };

    const flow = createServiceFlowRun({ name: "Test Flow" });

    const flowMap = new Map([["task1", flow]]);

    const result = getFlatChunks([task], [], { flowMap });

    expect(result.chunks).toContainEqual({
      type: "flow",
      flow,
      task,
    });
  });

  it("should create job chunk for regular jobs", () => {
    const job: Job = {
      id: "job1",
      type: "default",
      state: "completed",
      startTime: Date.now(),
    };

    const task: Task = {
      id: "task1",
      state: "completed",
      jobs: [job],
      startTime: Date.now(),
    };

    const result = getFlatChunks([task], []);

    expect(result.chunks).toContainEqual({
      type: "job",
      job,
      level: 0,
    });
    expect(result.jobMap.get("job1")).toBe(job);
  });

  it("should create error chunks for task-specific errors", () => {
    const task: Task = {
      id: "task1",
      state: "failed",
      jobs: [],
      startTime: Date.now(),
    };

    const error: ConversationError = {
      taskId: "task1",
      error: "Task failed",
    };

    const result = getFlatChunks([task], [error]);

    expect(result.chunks).toContainEqual({
      type: "error",
      error: "Task failed",
    });
  });

  it("should create error chunks for global errors without taskId", () => {
    const error: ConversationError = {
      error: "Global error",
    };

    const result = getFlatChunks([], [error]);

    expect(result.chunks).toContainEqual({
      type: "error",
      error: "Global error",
    });
  });

  it("should handle skipActivitySubTasks with completed jobs having user messages", () => {
    const job: Job = {
      id: "job1",
      state: "completed",
      messages: [
        {
          role: "user",
          parts: [{ type: "text", text: "Hello" }],
        },
        {
          role: "user",
          parts: [{ type: "text", text: "World" }],
        },
      ],
      startTime: Date.now(),
    };

    const task: Task = {
      id: "task1",
      state: "completed",
      jobs: [job],
      startTime: Date.now(),
    };

    const activityWithFlow: ActivityWithFlow = {
      activity: createActivityRun({ name: "Test Activity" }),
      flow: createServiceFlowRun({ name: "Test Flow" }),
    };

    const activityMap = new Map([["task1", activityWithFlow]]);

    const result = getFlatChunks([task], [], {
      activityMap,
      skipActivitySubTasks: true,
    });

    expect(result.chunks).toContainEqual({
      type: "activity",
      activity: activityWithFlow.activity,
      flow: activityWithFlow.flow,
      task,
    });

    expect(result.chunks).toContainEqual({
      type: "job",
      job,
      level: 0,
      fromSkippedSubTask: true,
    });
  });

  it("should handle skipActivitySubTasks with HIL jobs", () => {
    const job: Job = {
      id: "job1",
      state: "input-required",
      hil: {
        userInstanceId: "user1",
        username: "testuser",
      },
      startTime: Date.now(),
    };

    const task: Task = {
      id: "task1",
      state: "completed",
      jobs: [job],
      startTime: Date.now(),
    };

    const activityWithFlow: ActivityWithFlow = {
      activity: createActivityRun({ name: "Test Activity" }),
      flow: createServiceFlowRun({ name: "Test Flow" }),
    };

    const activityMap = new Map([["task1", activityWithFlow]]);

    const result = getFlatChunks([task], [], {
      activityMap,
      skipActivitySubTasks: true,
    });

    expect(result.chunks).toContainEqual({
      type: "job",
      job,
      level: 0,
      fromSkippedSubTask: true,
    });
  });

  it("should handle multiple jobs and create correct jobMap", () => {
    const job1: Job = {
      id: "job1",
      type: "default",
      state: "completed",
      startTime: Date.now(),
    };

    const job2: Job = {
      id: "job2",
      type: "default",
      state: "completed",
      startTime: Date.now(),
    };

    const task: Task = {
      id: "task1",
      state: "completed",
      jobs: [job1, job2],
      startTime: Date.now(),
    };

    const result = getFlatChunks([task], []);

    // Check that both jobs are in the jobMap
    expect(result.jobMap.get("job1")).toBe(job1);
    expect(result.jobMap.get("job2")).toBe(job2);

    // Check that job chunks are created
    expect(result.chunks).toContainEqual({
      type: "job",
      job: job1,
      level: 0,
    });

    expect(result.chunks).toContainEqual({
      type: "job",
      job: job2,
      level: 0,
    });
  });

  it("should skip errors without error property", () => {
    const task: Task = {
      id: "task1",
      state: "completed",
      jobs: [],
      startTime: Date.now(),
    };

    const errorWithoutMessage: ConversationError = {
      taskId: "task1",
    };

    const result = getFlatChunks([task], [errorWithoutMessage]);

    expect(result.chunks).not.toContainEqual(
      expect.objectContaining({ type: "error" })
    );
  });

  it("should handle complex scenario with multiple chunk types", () => {
    const job1: Job = {
      id: "job1",
      type: "serviceFlow",
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

    const flow = createServiceFlowRun({ name: "Test Flow" });

    const activityWithFlow: ActivityWithFlow = {
      activity: createActivityRun({ name: "Test Activity" }),
      flow: createServiceFlowRun({
        flowInstanceId: "flow-activity-1",
        name: "Activity Flow",
      }),
    };

    const error: ConversationError = {
      taskId: "task1",
      error: "Task error",
    };

    const globalError: ConversationError = {
      error: "Global error",
    };

    const flowMap = new Map([["task1", flow]]);
    const activityMap = new Map([["task1", activityWithFlow]]);

    const result = getFlatChunks([task], [error, globalError], {
      flowMap,
      activityMap,
    });

    expect(result.chunks).toContainEqual({
      type: "activity",
      activity: activityWithFlow.activity,
      flow: activityWithFlow.flow,
      task,
    });

    expect(result.chunks).toContainEqual({
      type: "flow",
      flow,
      task,
    });

    expect(result.chunks).toContainEqual({
      type: "job",
      job: job2,
      level: 0,
    });

    expect(result.chunks).toContainEqual({
      type: "error",
      error: "Task error",
    });

    expect(result.chunks).toContainEqual({
      type: "error",
      error: "Global error",
    });

    expect(result.jobMap.get("job1")).toBe(job1);
    expect(result.jobMap.get("job2")).toBe(job2);
  });
});
