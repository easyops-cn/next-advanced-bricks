import { task } from "./task";
import type { TaskBaseDetail, TaskPatch } from "../interfaces";
import type { CruiseCanvasAction } from "./interfaces";

describe("task reducer", () => {
  it("should return the initial state", () => {
    const initialState: TaskBaseDetail | null = null;
    const action = { type: "unknown" } as unknown as CruiseCanvasAction;
    expect(task(initialState, action)).toBe(initialState);
  });

  it("should handle sse action with isInitial=true", () => {
    const initialState: TaskBaseDetail | null = null;
    const payload = {
      id: "task-123",
      requirement: "Build a feature",
      state: "ready",
      startTime: 1672531200,
      endTime: 1672617600,
      plan: [{ id: "job-1", instruction: "Job 1" }],
      extraField: "should be ignored",
    } as unknown as TaskPatch;
    const action = {
      type: "sse",
      payload,
      isInitial: true,
    } as CruiseCanvasAction;

    const expectedState = {
      id: "task-123",
      requirement: "Build a feature",
      state: "ready",
      startTime: 1672531200,
      endTime: 1672617600,
      plan: [{ id: "job-1", instruction: "Job 1" }],
    };

    expect(task(initialState, action)).toEqual(expectedState);
  });

  it("should handle sse action with isInitial=false and update state", () => {
    const initialState: TaskBaseDetail = {
      id: "task-123",
      title: "Build something",
      requirement: "Build a feature",
      state: "working",
      startTime: 1672531200,
      endTime: 1672617600,
      plan: [{ id: "job-1", instruction: "Job 1" }],
    };

    const payload = {
      id: "task-123",
      state: "working",
      extraField: "should be ignored",
    };

    const action = {
      type: "sse",
      payload,
      isInitial: false,
    } as CruiseCanvasAction;

    const expectedState = {
      id: "task-123",
      title: "Build something",
      requirement: "Build a feature",
      state: "working",
      startTime: 1672531200,
      endTime: 1672617600,
      plan: [{ id: "job-1", instruction: "Job 1" }],
    };

    expect(task(initialState, action)).toEqual(expectedState);
  });

  it("should transform 'blocked' state to 'working'", () => {
    const initialState: TaskBaseDetail | null = null;
    const payload = {
      id: "task-123",
      state: "blocked",
    };

    const action = {
      type: "sse",
      payload,
      isInitial: true,
    } as CruiseCanvasAction;

    const result = task(initialState, action) as TaskBaseDetail;
    expect(result.state).toBe("working");
  });

  it("should not update state if patch matches current state", () => {
    const initialState: TaskBaseDetail = {
      id: "task-123",
      title: "Build something",
      requirement: "Build a feature",
      state: "working",
      startTime: 1672531200,
      endTime: 1672617600,
      plan: [{ id: "job-1", instruction: "Job 1" }],
    };

    const payload = {
      id: "task-123",
      state: "working",
    };

    const action = {
      type: "sse",
      payload,
      isInitial: false,
    } as CruiseCanvasAction;

    expect(task(initialState, action)).toBe(initialState);
  });

  it("should handle reset action", () => {
    const initialState: TaskBaseDetail = {
      id: "task-123",
      title: "Build something",
      requirement: "Build a feature",
      state: "working",
      startTime: 1672531200,
      endTime: 1672617600,
      plan: [{ id: "job-1", instruction: "Job 1" }],
    };

    const action = { type: "reset" } as CruiseCanvasAction;

    expect(task(initialState, action)).toBeNull();
  });
});
