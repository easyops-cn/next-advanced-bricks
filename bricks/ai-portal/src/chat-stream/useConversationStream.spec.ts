import { renderHook } from "@testing-library/react";
import { useConversationStream } from "./useConversationStream";

describe("useConversationStream", () => {
  it("should return empty messages when conversation is not available", () => {
    const { result } = renderHook(() =>
      useConversationStream(false, undefined, [], [])
    );

    expect(result.current.messages).toEqual([]);
    expect(result.current.lastDetail).toBe(null);
  });

  it("should work with empty tasks", () => {
    const { result } = renderHook(() =>
      useConversationStream(true, "working", [], [])
    );

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.lastDetail).toBe(null);
  });

  it("should process job chunks with completed state and user messages", () => {
    const mockTasks = [
      {
        id: "task-1",
        state: "completed" as const,
        startTime: Date.now(),
        jobs: [
          {
            id: "job-1",
            state: "completed" as const,
            messages: [
              {
                role: "user" as const,
                parts: [{ type: "text" as const, text: "Hello" }],
              },
            ],
            cmd: {
              type: "serviceFlowStarting" as const,
              serviceFlowStarting: {
                spaceInstanceId: "test-space",
              },
            },
            mentionedAiEmployeeId: "ai-1",
            startTime: Date.now(),
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useConversationStream(true, "working", mockTasks, [])
    );

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({
      role: "user",
      content: "Hello",
      cmd: {
        type: "serviceFlowStarting",
        serviceFlowStarting: {
          spaceInstanceId: "test-space",
        },
      },
      mentionedAiEmployeeId: "ai-1",
      fromSkippedSubTask: undefined,
      files: [],
    });
    expect(result.current.messages[1]).toEqual({
      role: "assistant",
      chunks: [],
    });
  });

  it("should handle job chunks with tool calls and set lastDetail", () => {
    const mockTasks = [
      {
        id: "task-1",
        state: "working" as const,
        startTime: Date.now(),
        jobs: [
          {
            id: "job-1",
            state: "working" as const,
            toolCall: {
              name: "test-tool",
              arguments: {},
            },
            ignoreDetails: false,
            startTime: Date.now(),
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useConversationStream(true, "working", mockTasks, [])
    );

    expect(result.current.lastDetail).toEqual({
      type: "job",
      id: "job-1",
    });
  });

  it("should handle human actions when showHumanActions is true", () => {
    const mockTasks = [
      {
        id: "task-1",
        state: "working" as const,
        startTime: Date.now(),
        jobs: [
          {
            id: "job-1",
            state: "working" as const,
            humanAction: "Human intervention required",
            startTime: Date.now(),
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useConversationStream(
        true,
        "working",
        mockTasks,
        [],
        undefined,
        undefined,
        {
          showHumanActions: true,
        }
      )
    );

    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[1]).toEqual({
      role: "user",
      content: "Human intervention required",
    });
  });

  it("should not show human actions when showHumanActions is false", () => {
    const mockTasks = [
      {
        id: "task-1",
        state: "working" as const,
        startTime: Date.now(),
        jobs: [
          {
            id: "job-1",
            state: "working" as const,
            humanAction: "Human intervention required",
            startTime: Date.now(),
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useConversationStream(
        true,
        "working",
        mockTasks,
        [],
        undefined,
        undefined,
        {
          showHumanActions: false,
        }
      )
    );

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe("assistant");
  });

  it("should handle non-job chunks", () => {
    const mockErrors = [
      {
        error: "Test error", // No taskId, so it gets processed as a global error
      },
    ];

    const { result } = renderHook(() =>
      useConversationStream(true, "working", [], mockErrors)
    );

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("assistant");
    const assistantMessage = result.current.messages[0];
    if (assistantMessage.role === "assistant") {
      expect(assistantMessage.chunks).toHaveLength(1);
      expect(assistantMessage.chunks[0].type).toBe("error");
    }
  });

  it("should handle file parts in messages", () => {
    const mockTasks = [
      {
        id: "task-1",
        state: "completed" as const,
        startTime: Date.now(),
        jobs: [
          {
            id: "job-1",
            state: "completed" as const,
            messages: [
              {
                role: "user" as const,
                parts: [
                  { type: "text" as const, text: "Hello" },
                  { type: "file" as const, file: { name: "test.txt" } },
                ],
              },
            ],
            startTime: Date.now(),
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useConversationStream(true, "working", mockTasks, [])
    );

    const userMessage = result.current.messages.find(
      (msg) => msg.role === "user"
    );
    if (userMessage && userMessage.role === "user") {
      expect(userMessage.files).toEqual([{ name: "test.txt" }]);
    }
  });
});
