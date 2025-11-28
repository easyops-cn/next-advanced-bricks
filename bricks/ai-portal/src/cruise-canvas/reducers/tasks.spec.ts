import { tasks } from "./tasks";
import type { Task, Job, Message } from "../../shared/interfaces";
import type { CruiseCanvasAction } from "./interfaces";

jest.mock("../../shared/getAsyncConstructedView.js", () => ({
  getAsyncConstructedView() {
    return null;
  },
}));

describe("tasks reducer", () => {
  it("should return initial state for unknown action types", () => {
    const initialState: Task[] = [];
    const action = { type: "unknown" } as any;

    const result = tasks(initialState, action);

    expect(result).toBe(initialState);
  });

  it("should return empty array on reset action when state is empty", () => {
    const initialState: Task[] = [];
    const action: CruiseCanvasAction = { type: "reset" };

    const result = tasks(initialState, action);

    expect(result).toBe(initialState);
  });

  it("should clear tasks on reset action when state has tasks", () => {
    const initialState: Task[] = [
      { id: "task-1", state: "working", jobs: [] } as Partial<Task>,
    ] as Task[];
    const action: CruiseCanvasAction = { type: "reset" };

    const result = tasks(initialState, action);

    expect(result).toEqual([]);
  });

  it("should return state when sse action has empty tasks array", () => {
    const initialState: Task[] = [];
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: { tasks: [] },
      workspace: "",
    };

    const result = tasks(initialState, action);

    expect(result).toBe(initialState);
  });

  it("should return state when sse action has no tasks", () => {
    const initialState: Task[] = [];
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: {},
      workspace: "",
    };

    const result = tasks(initialState, action);

    expect(result).toBe(initialState);
  });

  it("should add new task on sse action", () => {
    const initialState: Task[] = [];
    const newTask = {
      id: "task-1",
      state: "working",
      jobs: [],
    } as Partial<Task> as Task;
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: { tasks: [newTask] },
      workspace: "",
    };

    const result = tasks(initialState, action);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(newTask);
  });

  it("should update existing task when properties change", () => {
    const existingTask: Task = {
      id: "task-1",
      state: "working",
      jobs: [],
    } as Partial<Task> as Task;
    const initialState: Task[] = [existingTask];
    const taskUpdate = {
      id: "task-1",
      state: "completed",
      endTime: 123,
    } as Partial<Task> as Task;
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: { tasks: [taskUpdate] },
      workspace: "",
    };

    const result = tasks(initialState, action);

    expect(result).toHaveLength(1);
    expect(result[0].state).toBe("completed");
    expect(result[0].endTime).toBe(123);
  });

  it("should not update task when no changes detected", () => {
    const existingTask: Task = {
      id: "task-1",
      state: "working",
      jobs: [],
    } as Partial<Task> as Task;
    const initialState: Task[] = [existingTask];
    const taskUpdate = {
      id: "task-1",
      state: "working",
    } as Partial<Task> as Task;
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: { tasks: [taskUpdate] },
      workspace: "",
    };

    const result = tasks(initialState, action);

    expect(result).toBe(initialState);
  });

  it("should merge jobs when updating task", () => {
    const existingJob: Job = {
      id: "job-1",
      state: "working",
      messages: [],
    } as Partial<Job> as Job;
    const existingTask: Task = {
      id: "task-1",
      state: "working",
      jobs: [existingJob],
    } as Partial<Task> as Task;
    const initialState: Task[] = [existingTask];

    const newJob = {
      id: "job-2",
      state: "working",
      messages: [],
    } as Partial<Job> as Job;
    const taskUpdate = {
      id: "task-1",
      jobs: [newJob],
    } as Partial<Task> as Task;
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: { tasks: [taskUpdate] },
      workspace: "",
    };

    const result = tasks(initialState, action);

    expect(result[0].jobs).toHaveLength(2);
    expect(result[0].jobs).toContainEqual(existingJob);
    expect(result[0].jobs).toContainEqual(newJob);
  });

  it("should parse toolCall arguments as JSON", () => {
    const initialState: Task[] = [];
    const jobWithToolCall = {
      id: "job-1",
      state: "working",
      toolCall: {
        name: "test_tool",
        arguments: '{"param": "value"}' as unknown as any,
      },
      messages: [{ role: "user", parts: [{ type: "text", text: "test" }] }],
    } as Partial<Job> as Job;
    const taskUpdate = {
      id: "task-1",
      jobs: [jobWithToolCall],
    } as Partial<Task> as Task;
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: { tasks: [taskUpdate] },
      workspace: "",
    };

    const result = tasks(initialState, action);

    const job = result[0].jobs[0];
    expect(job.toolCall?.originalArguments).toBe('{"param": "value"}');
    expect(job.toolCall?.arguments).toEqual({ param: "value" });
  });

  it("should handle toolCall arguments parse failure", () => {
    const initialState: Task[] = [];
    const jobWithInvalidToolCall = {
      id: "job-1",
      state: "working",
      toolCall: {
        name: "test_tool",
        arguments: "invalid json" as unknown as any,
      },
      messages: [{ role: "user", parts: [{ type: "text", text: "test" }] }],
    } as Partial<Job> as Job;
    const taskUpdate = {
      id: "task-1",
      jobs: [jobWithInvalidToolCall],
    } as Partial<Task> as Task;
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: { tasks: [taskUpdate] },
      workspace: "",
    };

    const result = tasks(initialState, action);

    const job = result[0].jobs[0];
    expect(job.toolCall?.argumentsParseFailed).toBe(true);
    expect(job.toolCall?.arguments).toEqual({});
    expect(job.toolCall?.argumentsParseError).toBeDefined();
  });

  it("should merge consecutive messages with same role", () => {
    const initialState: Task[] = [];
    const messages: Message[] = [
      {
        role: "assistant",
        parts: [{ type: "text", text: "Hello" }],
      },
      {
        role: "assistant",
        parts: [{ type: "text", text: " World" }],
      },
    ];
    const jobWithMessages = {
      id: "job-1",
      state: "working",
      messages,
    } as Partial<Job> as Job;
    const taskUpdate = {
      id: "task-1",
      jobs: [jobWithMessages],
    } as Partial<Task> as Task;
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: { tasks: [taskUpdate] },
      workspace: "",
    };

    const result = tasks(initialState, action);

    const job = result[0].jobs[0];
    expect(job.messages).toMatchInlineSnapshot(`
      [
        {
          "parts": [
            {
              "text": "Hello World",
              "type": "text",
            },
          ],
          "role": "assistant",
        },
      ]
    `);
  });

  it("should merge consecutive text parts", () => {
    const initialState: Task[] = [];
    const messages: Message[] = [
      {
        role: "user",
        parts: [
          { type: "text", text: "Hello" },
          { type: "text", text: " World" },
        ],
      },
    ];
    const jobWithMessages = {
      id: "job-1",
      state: "working",
      messages,
    } as Partial<Job> as Job;
    const taskUpdate = {
      id: "task-1",
      jobs: [jobWithMessages],
    } as Partial<Task> as Task;
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: { tasks: [taskUpdate] },
      workspace: "",
    };

    const result = tasks(initialState, action);

    const job = result[0].jobs[0];
    expect(job.messages![0].parts).toHaveLength(1);
    expect(job.messages![0].parts[0]).toEqual({
      type: "text",
      text: "Hello World",
    });
  });

  it("should merge consecutive stream data parts", () => {
    const initialState: Task[] = [];
    const messages: Message[] = [
      {
        role: "tool",
        parts: [
          { type: "data", data: { type: "stream", message: "Part 1" } },
          { type: "data", data: { type: "stream", message: " Part 2" } },
        ],
      },
    ];
    const jobWithMessages = {
      id: "job-1",
      state: "working",
      messages,
    } as Partial<Job> as Job;
    const taskUpdate = {
      id: "task-1",
      jobs: [jobWithMessages],
    } as Partial<Task> as Task;
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: { tasks: [taskUpdate] },
      workspace: "",
    };

    const result = tasks(initialState, action);

    const job = result[0].jobs[0];
    expect(job.messages![0].parts).toHaveLength(1);
    expect(job.messages![0].parts[0]).toEqual({
      type: "data",
      data: { type: "stream", message: "Part 1 Part 2" },
    });
  });

  it("should set generatedView for completed create_view jobs", () => {
    const initialState: Task[] = [];
    const messages: Message[] = [
      {
        role: "tool",
        parts: [
          {
            type: "text",
            text: '{"viewId": "test-view", "code": "<eo-view>test</eo-view>"}',
          },
        ],
      },
    ];
    const jobWithView = {
      id: "job-1",
      state: "completed",
      toolCall: { name: "create_view" },
      messages,
    } as Partial<Job> as Job;
    const taskUpdate = {
      id: "task-1",
      jobs: [jobWithView],
    } as Partial<Task> as Task;
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: { tasks: [taskUpdate] },
      workspace: "",
    };

    const result = tasks(initialState, action);

    const job = result[0].jobs[0];
    expect(job.generatedView).toBeDefined();
    expect(job.generatedView?.viewId).toBe("test-view");
  });

  it("should update existing jobs", () => {
    const initialState: Task[] = [
      {
        id: "task-1",
        state: "working",
        jobs: [
          {
            id: "job-1",
            state: "working",
            messages: [
              {
                role: "assistant",
                parts: [{ type: "text", text: "Hello," }],
              },
            ],
          } as Partial<Job> as Job,
        ],
      },
    ] as Task[];
    const messages: Message[] = [
      {
        role: "assistant",
        parts: [{ type: "text", text: " world" }],
      },
    ];
    const jobWithMessages = {
      id: "job-1",
      state: "completed",
      messages,
    } as Partial<Job> as Job;
    const taskUpdate = {
      id: "task-1",
      jobs: [jobWithMessages],
    } as Partial<Task> as Task;
    const action: CruiseCanvasAction = {
      type: "sse",
      mode: "new",
      payload: { tasks: [taskUpdate] },
      workspace: "",
    };

    const result = tasks(initialState, action);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "id": "task-1",
          "jobs": [
            {
              "id": "job-1",
              "messages": [
                {
                  "parts": [
                    {
                      "text": "Hello, world",
                      "type": "text",
                    },
                  ],
                  "role": "assistant",
                },
              ],
              "state": "completed",
            },
          ],
          "state": "working",
        },
      ]
    `);
  });
});
