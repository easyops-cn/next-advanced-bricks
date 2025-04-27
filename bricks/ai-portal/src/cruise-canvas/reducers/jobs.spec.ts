import { jobs } from "./jobs";
import type { CruiseCanvasAction } from "./interfaces";
import type { Job, JobPatch, Message } from "../interfaces";

describe("jobs reducer", () => {
  it("should return the current state when action type is not matched", () => {
    const state: Job[] = [];
    const action = { type: "unknown" } as unknown as CruiseCanvasAction;
    expect(jobs(state, action)).toBe(state);
  });

  it("should handle reset action by returning empty array", () => {
    const state: Job[] = [
      { id: "1", messages: [] },
    ] as Partial<Job>[] as Partial<Job>[] as Job[];
    const action: CruiseCanvasAction = { type: "reset" };
    expect(jobs(state, action)).toEqual([]);
  });

  it("should handle sse action with initial flag", () => {
    const state: Job[] = [{ id: "1", messages: [] }] as Partial<Job>[] as Job[];
    const jobsPatch = [{ id: "2", messages: [] }];
    const action: CruiseCanvasAction = {
      type: "sse",
      payload: { jobs: jobsPatch },
      isInitial: true,
    };
    expect(jobs(state, action)).toEqual(jobsPatch);
  });

  it("should return current state if jobsPatch is empty", () => {
    const state: Job[] = [{ id: "1", messages: [] }] as Partial<Job>[] as Job[];
    const action: CruiseCanvasAction = {
      type: "sse",
      payload: { jobs: [] },
      isInitial: false,
    };
    expect(jobs(state, action)).toEqual(state);
  });

  it("should add new job if not found in current state", () => {
    const state: Job[] = [];
    const jobsPatch = [{ id: "1", messages: [] }];
    const action: CruiseCanvasAction = {
      type: "sse",
      payload: { jobs: jobsPatch },
      isInitial: false,
    };
    expect(jobs(state, action)).toEqual(jobsPatch);
  });

  it("should update existing job", () => {
    const state: Job[] = [
      { id: "1", messages: [], state: "unknown" },
    ] as Partial<Job>[] as Job[];
    const jobsPatch = [
      { id: "1", state: "working" },
    ] as unknown[] as JobPatch[];
    const action: CruiseCanvasAction = {
      type: "sse",
      payload: { jobs: jobsPatch },
      isInitial: false,
    };
    expect(jobs(state, action)).toEqual([
      { id: "1", messages: [], state: "working" },
    ]);
  });

  it("should handle blocked state by converting it to working", () => {
    const state: Job[] = [
      { id: "1", messages: [], state: "unknown" },
    ] as Partial<Job>[] as Job[];
    const jobsPatch = [
      { id: "1", state: "blocked" },
    ] as unknown[] as JobPatch[];
    const action: CruiseCanvasAction = {
      type: "sse",
      payload: { jobs: jobsPatch },
      isInitial: false,
    };
    expect(jobs(state, action)[0].state).toBe("working");
  });

  it("should parse toolCall arguments when they are provided as string", () => {
    const state: Job[] = [];
    const jobsPatch = [
      {
        id: "1",
        messages: [],
        toolCall: { arguments: '{"key":"value"}' },
      },
    ] as unknown[] as JobPatch[];
    const action: CruiseCanvasAction = {
      type: "sse",
      payload: { jobs: jobsPatch },
      isInitial: false,
    };
    const result = jobs(state, action);
    expect(result[0].toolCall!.arguments).toEqual({ key: "value" });
  });

  it("should handle toolCall arguments parsing failure", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const state: Job[] = [];
    const jobsPatch = [
      {
        id: "1",
        messages: [],
        toolCall: { arguments: '{"key":invalid}' },
      },
    ] as unknown[] as JobPatch[];
    const action: CruiseCanvasAction = {
      type: "sse",
      payload: { jobs: jobsPatch },
      isInitial: false,
    };
    const result = jobs(state, action);
    expect(result[0].toolCall!.arguments).toEqual({});
    expect(result[0].toolCall!.argumentsParseFailed).toBe(true);
    expect(result[0].toolCall!.argumentsParseError).toBeDefined();
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });

  it("should merge messages from the same role", () => {
    const state: Job[] = [];
    const messages: Message[] = [
      { role: "user", parts: [{ type: "text", text: "Hello" }] },
      { role: "user", parts: [{ type: "text", text: " World" }] },
      { role: "assistant", parts: [{ type: "text", text: "Hi" }] },
    ];
    const jobsPatch = [{ id: "1", messages }];
    const action: CruiseCanvasAction = {
      type: "sse",
      payload: { jobs: jobsPatch },
      isInitial: false,
    };

    const result = jobs(state, action);
    expect(result[0].messages!.length).toBe(2);
    expect(result[0].messages![0].parts[0]).toMatchObject({
      text: "Hello World",
    });
    expect(result[0].messages![1].parts[0]).toMatchObject({ text: "Hi" });
  });

  it("should merge message parts of the same type", () => {
    const state: Job[] = [];
    const messages: Message[] = [
      {
        role: "user",
        parts: [
          { type: "text", text: "Hello" },
          { type: "text", text: " World" },
          { type: "data", data: {} },
          { type: "text", text: "Again" },
        ],
      },
    ];
    const jobsPatch = [{ id: "1", messages }];
    const action: CruiseCanvasAction = {
      type: "sse",
      payload: { jobs: jobsPatch },
      isInitial: false,
    };

    const result = jobs(state, action);
    expect(result[0].messages![0].parts.length).toBe(3);
    expect(result[0].messages![0].parts[0]).toMatchObject({
      text: "Hello World",
    });
    expect(result[0].messages![0].parts[1].type).toBe("data");
    expect(result[0].messages![0].parts[2]).toMatchObject({ text: "Again" });
  });
});
