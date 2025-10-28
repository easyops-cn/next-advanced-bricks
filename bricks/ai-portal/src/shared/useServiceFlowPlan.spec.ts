import { renderHook } from "@testing-library/react";
import { useServiceFlowPlan } from "./useServiceFlowPlan";
import type { ServiceFlowRun, Task } from "./interfaces";

describe("useServiceFlowPlan", () => {
  it("should return empty array when no service flows provided", () => {
    const { result } = renderHook(() => useServiceFlowPlan([], []));
    expect(result.current).toEqual([]);
  });

  it("should process activities with taskId and matching task", () => {
    const serviceFlows = [
      {
        spec: [
          {
            serviceFlowActivities: [
              { name: "Activity 1", taskId: "task1" },
              { name: "Activity 2", taskId: "task2" },
            ],
          },
        ],
      },
    ] as ServiceFlowRun[];

    const tasks = [
      { id: "task1", state: "completed" },
      { id: "task2", state: "running" },
    ] as Task[];

    const { result } = renderHook(() =>
      useServiceFlowPlan(serviceFlows, tasks)
    );

    expect(result.current).toEqual([
      { name: "Activity 1", taskId: "task1", state: "completed" },
      { name: "Activity 2", taskId: "task2", state: "running" },
    ]);
  });

  it("should process activities with taskId but no matching task", () => {
    const serviceFlows = [
      {
        spec: [
          {
            serviceFlowActivities: [
              { name: "Activity 1", taskId: "nonexistent" },
            ],
          },
        ],
      },
    ] as ServiceFlowRun[];

    const tasks: Task[] = [];

    const { result } = renderHook(() =>
      useServiceFlowPlan(serviceFlows, tasks)
    );

    expect(result.current).toEqual([
      { name: "Activity 1", taskId: "nonexistent", state: undefined },
    ]);
  });

  it("should process activities without taskId", () => {
    const serviceFlows = [
      {
        spec: [
          {
            serviceFlowActivities: [
              { name: "Activity 1" },
              { name: "Activity 2" },
            ],
          },
        ],
      },
    ] as ServiceFlowRun[];

    const tasks: Task[] = [];

    const { result } = renderHook(() =>
      useServiceFlowPlan(serviceFlows, tasks)
    );

    expect(result.current).toEqual([
      { name: "Activity 1" },
      { name: "Activity 2" },
    ]);
  });

  it("should process multiple service flows with multiple stages", () => {
    const serviceFlows = [
      {
        spec: [
          {
            serviceFlowActivities: [
              { name: "Flow1 Stage1 Activity1", taskId: "task1" },
            ],
          },
          {
            serviceFlowActivities: [{ name: "Flow1 Stage2 Activity1" }],
          },
        ],
      },
      {
        spec: [
          {
            serviceFlowActivities: [
              { name: "Flow2 Stage1 Activity1", taskId: "task2" },
            ],
          },
        ],
      },
    ] as ServiceFlowRun[];

    const tasks = [
      { id: "task1", state: "pending" },
      { id: "task2", state: "failed" },
    ] as Task[];

    const { result } = renderHook(() =>
      useServiceFlowPlan(serviceFlows, tasks)
    );

    expect(result.current).toEqual([
      { name: "Flow1 Stage1 Activity1", taskId: "task1", state: "pending" },
      { name: "Flow1 Stage2 Activity1" },
      { name: "Flow2 Stage1 Activity1", taskId: "task2", state: "failed" },
    ]);
  });

  it("should memoize results when dependencies do not change", () => {
    const serviceFlows = [
      {
        spec: [
          {
            serviceFlowActivities: [{ name: "Activity 1", taskId: "task1" }],
          },
        ],
      },
    ] as ServiceFlowRun[];

    const tasks = [{ id: "task1", state: "completed" }] as Task[];

    const { result, rerender } = renderHook(
      ({ flows, taskList }) => useServiceFlowPlan(flows, taskList),
      { initialProps: { flows: serviceFlows, taskList: tasks } }
    );

    const firstResult = result.current;

    rerender({ flows: serviceFlows, taskList: tasks });

    expect(result.current).toBe(firstResult);
  });

  it("should update results when dependencies change", () => {
    const initialServiceFlows = [
      {
        spec: [
          {
            serviceFlowActivities: [{ name: "Activity 1", taskId: "task1" }],
          },
        ],
      },
    ] as ServiceFlowRun[];

    const updatedServiceFlows = [
      {
        spec: [
          {
            serviceFlowActivities: [{ name: "Activity 2", taskId: "task2" }],
          },
        ],
      },
    ] as ServiceFlowRun[];

    const tasks = [
      { id: "task1", state: "completed" },
      { id: "task2", state: "running" },
    ] as Task[];

    const { result, rerender } = renderHook(
      ({ flows, taskList }) => useServiceFlowPlan(flows, taskList),
      { initialProps: { flows: initialServiceFlows, taskList: tasks } }
    );

    const firstResult = result.current;

    rerender({ flows: updatedServiceFlows, taskList: tasks });

    expect(result.current).not.toBe(firstResult);
    expect(result.current).toEqual([
      { name: "Activity 2", taskId: "task2", state: "running" },
    ]);
  });
});
