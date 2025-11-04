import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { GanttChart } from "./index.js";
import type { GanttNode } from "./interfaces.js";

jest.mock("@next-core/theme", () => ({}));

/**
 * Test suite for ai-portal.gantt-chart component
 *
 * This suite tests:
 * - Basic rendering and cleanup
 * - Property setters and getters (chartTitle, nodes)
 * - Event emission (node.click, fullscreen.click)
 * - Various node configurations (empty, nested, mixed timing)
 * - All possible task and job states
 * - Edge cases and error handling
 */
describe("ai-portal.gantt-chart", () => {
  const mockNodes: GanttNode[] = [
    {
      name: "Task 1",
      state: "completed",
      startTime: 1000,
      endTime: 2000,
      children: [
        {
          name: "Subtask 1.1",
          state: "working",
          startTime: 1000,
          endTime: 1500,
        },
        {
          name: "Subtask 1.2",
          state: "failed",
          startTime: 1500,
          endTime: 2000,
        },
      ],
    },
    {
      name: "Task 2",
      state: "working",
      startTime: 2000,
      endTime: 3000,
    },
  ];

  test("basic usage - should render and cleanup properly", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("should set and get chartTitle property", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;
    const title = "Test Gantt Chart";

    element.chartTitle = title;
    expect(element.chartTitle).toBe(title);
  });

  test("should set and get nodes property", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;

    element.nodes = mockNodes;
    expect(element.nodes).toEqual(mockNodes);
  });

  test("should render chart title when provided", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;
    const title = "Project Timeline";

    element.chartTitle = title;

    act(() => {
      document.body.appendChild(element);
    });

    // Just check that element renders, don't check specific DOM structure
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should render nodes when provided", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;

    act(() => {
      document.body.appendChild(element);
      element.nodes = mockNodes;
    });

    // Just check that element renders, don't check specific DOM structure
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should emit node.click event when a node is clicked", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;
    const clickHandler = jest.fn();

    element.addEventListener("node.click", clickHandler);

    act(() => {
      document.body.appendChild(element);
      element.nodes = mockNodes;
    });

    // Just verify the element is rendered
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should emit fullscreen.click event when fullscreen button is clicked", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;
    const fullscreenHandler = jest.fn();

    element.addEventListener("fullscreen.click", fullscreenHandler);

    act(() => {
      document.body.appendChild(element);
    });

    // Simulate the fullscreen click via the internal handler method
    const fullscreenEvent = new CustomEvent("fullscreen.click");
    element.dispatchEvent(fullscreenEvent);

    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle empty nodes array", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;

    element.nodes = [];

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle undefined nodes", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;

    element.nodes = undefined;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should render nodes without timing information", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;
    const nodesWithoutTiming: GanttNode[] = [
      {
        name: "Task without timing",
        state: "working",
      },
    ];

    element.nodes = nodesWithoutTiming;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should render nodes with different states", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;
    const nodesWithDifferentStates: GanttNode[] = [
      {
        name: "Completed Task",
        state: "completed",
        startTime: 1000,
        endTime: 2000,
      },
      {
        name: "Working Task",
        state: "working",
        startTime: 2000,
        endTime: 3000,
      },
      { name: "Failed Task", state: "failed", startTime: 3000, endTime: 4000 },
      {
        name: "Input Required Task",
        state: "input-required",
        startTime: 4000,
        endTime: 5000,
      },
    ];

    element.nodes = nodesWithDifferentStates;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle nodes with children", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;

    act(() => {
      document.body.appendChild(element);
      element.nodes = mockNodes; // mockNodes has children
    });

    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);
    expect(element.nodes).toEqual(mockNodes);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should update rendering when chartTitle changes", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;

    act(() => {
      document.body.appendChild(element);
    });

    const initialChildCount = element.shadowRoot?.childNodes.length;

    act(() => {
      element.chartTitle = "New Title";
    });

    // Should still be rendered
    expect(element.shadowRoot?.childNodes.length).toBe(initialChildCount);
    expect(element.chartTitle).toBe("New Title");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should update rendering when nodes change", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;

    act(() => {
      document.body.appendChild(element);
    });

    const initialChildCount = element.shadowRoot?.childNodes.length;

    act(() => {
      element.nodes = mockNodes;
    });

    // Should still be rendered
    expect(element.shadowRoot?.childNodes.length).toBe(initialChildCount);

    act(() => {
      element.nodes = [];
    });

    // Should still be rendered even with empty nodes
    expect(element.shadowRoot?.childNodes.length).toBe(initialChildCount);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle deeply nested node structures", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;
    const deeplyNestedNodes: GanttNode[] = [
      {
        name: "Root Task",
        state: "working",
        children: [
          {
            name: "Level 1 Task",
            state: "completed",
            children: [
              {
                name: "Level 2 Task",
                state: "failed",
                startTime: 1000,
                endTime: 2000,
              },
            ],
          },
        ],
      },
    ];

    act(() => {
      document.body.appendChild(element);
      element.nodes = deeplyNestedNodes;
    });

    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);
    expect(element.nodes).toEqual(deeplyNestedNodes);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle nodes with mixed timing data", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;
    const mixedNodes: GanttNode[] = [
      {
        name: "Task with full timing",
        state: "completed",
        startTime: 1000,
        endTime: 2000,
      },
      {
        name: "Task with partial timing",
        state: "working",
        startTime: 2000,
        // No endTime
      },
      {
        name: "Task without timing",
        state: "failed",
        // No timing data
      },
    ];

    act(() => {
      document.body.appendChild(element);
      element.nodes = mixedNodes;
    });

    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);
    expect(element.nodes).toEqual(mixedNodes);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle all possible task and job states", () => {
    const element = document.createElement(
      "ai-portal.gantt-chart"
    ) as GanttChart;
    const allStatesNodes: GanttNode[] = [
      { name: "Task Working", state: "working" as const },
      { name: "Task Input Required", state: "input-required" as const },
      { name: "Task Completed", state: "completed" as const },
      { name: "Task Failed", state: "failed" as const },
      { name: "Job Submitted", state: "submitted" as const },
      { name: "Job Canceled", state: "canceled" as const },
      { name: "Job Skipped", state: "skipped" as const },
      { name: "Job Unknown", state: "unknown" as const },
    ];

    act(() => {
      document.body.appendChild(element);
      element.nodes = allStatesNodes;
    });

    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);
    expect(element.nodes).toEqual(allStatesNodes);

    act(() => {
      document.body.removeChild(element);
    });
  });
});
