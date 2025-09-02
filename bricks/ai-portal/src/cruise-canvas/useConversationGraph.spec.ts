import { renderHook } from "@testing-library/react";
import { useConversationGraph } from "./useConversationGraph";
import { LOADING_NODE_ID } from "./constants";
import type { ConversationBaseDetail, Job, Task } from "../shared/interfaces";
import type { ConstructedView } from "@next-shared/jsx-storyboard";

describe("useConversationGraph", () => {
  it("should return null when conversation is null", () => {
    const { result } = renderHook(() => useConversationGraph(null, []));
    expect(result.current).toBeNull();
  });

  it("should return null when conversation is undefined", () => {
    const { result } = renderHook(() => useConversationGraph(undefined, []));
    expect(result.current).toBeNull();
  });

  it("should create loading node when no tasks provided", () => {
    const conversation = { id: "conv-1" } as ConversationBaseDetail;
    const { result } = renderHook(() => useConversationGraph(conversation, []));

    expect(result.current).toEqual({
      nodes: [
        {
          type: "loading",
          id: LOADING_NODE_ID,
        },
      ],
      edges: [],
      nav: [],
      views: [],
      jobMap: new Map(),
      jobLevels: new Map(),
    });
  });

  it("should create requirement node for root job with user input", () => {
    const conversation = { id: "conv-1" } as ConversationBaseDetail;
    const tasks: Task[] = [
      {
        id: "task-1",
        jobs: [
          {
            id: "job-1",
            state: "working",
            messages: [
              {
                role: "user",
                parts: [{ type: "text", text: "Create a component" }],
              },
            ],
          },
        ],
      },
    ] as Task[];

    const { result } = renderHook(() =>
      useConversationGraph(conversation, tasks)
    );

    expect(result.current?.nodes).toContainEqual({
      type: "requirement",
      id: "requirement:job-1",
      content: "Create a component",
    });
  });

  it("should create instruction node when job has instruction", () => {
    const conversation = { id: "conv-1" } as ConversationBaseDetail;
    const tasks: Task[] = [
      {
        id: "task-1",
        jobs: [
          {
            id: "job-1",
            state: "working",
            instruction: "Build the UI",
            messages: [],
          } as Partial<Job>,
        ],
      },
    ] as Task[];

    const { result } = renderHook(() =>
      useConversationGraph(conversation, tasks)
    );

    expect(result.current?.nodes).toContainEqual({
      type: "instruction",
      id: "instruction:job-1",
      job: expect.objectContaining({ id: "job-1" }),
      state: "working",
    });
  });

  it("should create job node when job has messages or no instruction", () => {
    const conversation = { id: "conv-1" } as ConversationBaseDetail;
    const tasks: Task[] = [
      {
        id: "task-1",
        jobs: [
          {
            id: "job-1",
            state: "completed",
            messages: [
              {
                role: "assistant",
                parts: [{ type: "text", text: "Response" }],
              },
            ],
          },
        ],
      },
    ] as Task[];

    const { result } = renderHook(() =>
      useConversationGraph(conversation, tasks)
    );

    expect(result.current?.nodes).toContainEqual({
      type: "job",
      id: "job:job-1",
      job: expect.objectContaining({ id: "job-1" }),
      state: "completed",
    });
  });

  it("should create view node when job has generatedView", () => {
    const conversation = { id: "conv-1" } as ConversationBaseDetail;
    const tasks: Task[] = [
      {
        id: "task-1",
        jobs: [
          {
            id: "job-1",
            state: "completed",
            generatedView: { viewId: "view-1" } as ConstructedView,
            messages: [],
          } as Partial<Job>,
        ],
      },
    ] as Task[];

    const { result } = renderHook(() =>
      useConversationGraph(conversation, tasks)
    );

    expect(result.current?.nodes).toContainEqual({
      type: "view",
      id: "view:job-1",
      job: expect.objectContaining({ id: "job-1" }),
    });

    expect(result.current?.views).toContainEqual({
      id: "job-1",
      view: { viewId: "view-1" },
    });
  });

  it("should create nav items for jobs with instruction", () => {
    const conversation = { id: "conv-1" } as ConversationBaseDetail;
    const tasks: Task[] = [
      {
        id: "task-1",
        jobs: [
          {
            id: "job-1",
            state: "working",
            instruction: "Build component",
            messages: [],
          } as Partial<Job>,
        ],
      },
    ] as Task[];

    const { result } = renderHook(() =>
      useConversationGraph(conversation, tasks)
    );

    expect(result.current?.nav).toContainEqual({
      id: "job-1",
      title: "Build component",
      state: "working",
      level: 0,
    });
  });

  it("should create nav items for jobs with toolCall annotations", () => {
    const conversation = { id: "conv-1" } as ConversationBaseDetail;
    const tasks: Task[] = [
      {
        id: "task-1",
        jobs: [
          {
            id: "job-1",
            state: "completed",
            toolCall: {
              name: "my-toool",
              annotations: { title: "Tool Call Title" },
            },
            messages: [],
          } as Partial<Job>,
        ],
      },
    ] as Task[];

    const { result } = renderHook(() =>
      useConversationGraph(conversation, tasks)
    );

    expect(result.current?.nav).toContainEqual({
      id: "job-1",
      title: "Tool Call Title",
      state: "completed",
      level: 0,
    });
  });

  it("should create edges between sequential nodes in a job", () => {
    const conversation = { id: "conv-1" } as ConversationBaseDetail;
    const tasks: Task[] = [
      {
        id: "task-1",
        jobs: [
          {
            id: "job-1",
            state: "completed",
            instruction: "Build component",
            generatedView: { viewId: "view-2" } as ConstructedView,
            messages: [
              {
                role: "assistant",
                parts: [{ type: "text", text: "Response" }],
              },
            ],
          } as Partial<Job>,
        ],
      },
    ] as Task[];

    const { result } = renderHook(() =>
      useConversationGraph(conversation, tasks)
    );

    expect(result.current?.edges).toContainEqual({
      source: "instruction:job-1",
      target: "job:job-1",
    });

    expect(result.current?.edges).toContainEqual({
      source: "job:job-1",
      target: "view:job-1",
    });
  });

  it("should create edges between dependent jobs", () => {
    const conversation = { id: "conv-1" } as ConversationBaseDetail;
    const tasks: Task[] = [
      {
        id: "task-1",
        jobs: [
          {
            id: "job-1",
            state: "completed",
            instruction: "First job",
            messages: [],
          },
          {
            id: "job-2",
            state: "working",
            instruction: "Second job",
            upstream: ["job-1"],
            messages: [],
          },
        ] as Partial<Job>[],
      },
    ] as Task[];

    const { result } = renderHook(() =>
      useConversationGraph(conversation, tasks)
    );

    expect(result.current?.edges).toContainEqual({
      source: "instruction:job-1",
      target: "instruction:job-2",
    });
  });

  it("should create loading nodes for user input nodes without downstream connections", () => {
    const conversation = { id: "conv-1" } as ConversationBaseDetail;
    const tasks: Task[] = [
      {
        id: "task-1",
        jobs: [
          {
            id: "job-1",
            state: "completed",
            messages: [
              {
                role: "user",
                parts: [{ type: "text", text: "User input" }],
              },
            ],
          } as Partial<Job>,
        ],
      },
    ] as Task[];

    const { result } = renderHook(() =>
      useConversationGraph(conversation, tasks)
    );

    expect(result.current?.nodes).toContainEqual({
      type: "requirement",
      id: "requirement:job-1",
      content: "User input",
    });

    expect(result.current?.nodes).toContainEqual({
      type: "loading",
      id: `${LOADING_NODE_ID}:0`,
    });

    expect(result.current?.edges).toContainEqual({
      source: "requirement:job-1",
      target: `${LOADING_NODE_ID}:0`,
    });
  });

  it("should pass showHiddenJobs option to getFlatOrderedJobs", () => {
    const conversation = { id: "conv-1" } as ConversationBaseDetail;
    const tasks: Task[] = [
      {
        id: "task-1",
        jobs: [
          {
            id: "job-1",
            state: "completed",
            hidden: true,
            instruction: "Hidden job",
            messages: [],
          } as Partial<Job>,
        ],
      },
    ] as Task[];

    const { result } = renderHook(() =>
      useConversationGraph(conversation, tasks, { showHiddenJobs: true })
    );

    expect(result.current?.nodes).toContainEqual({
      type: "instruction",
      id: "instruction:job-1",
      job: expect.objectContaining({ id: "job-1", hidden: true }),
      state: "completed",
    });
  });

  it("should memoize results based on conversation and tasks", () => {
    const conversation = { id: "conv-1" } as ConversationBaseDetail;
    const tasks: Task[] = [
      {
        id: "task-1",
        jobs: [
          {
            id: "job-1",
            state: "working",
            instruction: "Test job",
            messages: [],
          } as Partial<Job>,
        ],
      },
    ] as Task[];

    const { result, rerender } = renderHook(
      ({ conv, taskList }) => useConversationGraph(conv, taskList),
      { initialProps: { conv: conversation, taskList: tasks } }
    );

    const firstResult = result.current;

    // Rerender with same props
    rerender({ conv: conversation, taskList: tasks });
    expect(result.current).toBe(firstResult);

    // Rerender with different conversation
    const newConversation = { id: "conv-2" } as ConversationBaseDetail;
    rerender({ conv: newConversation, taskList: tasks });
    expect(result.current).not.toBe(firstResult);
  });
});
