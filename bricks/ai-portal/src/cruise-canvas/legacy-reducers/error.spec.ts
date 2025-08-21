import { error } from "./error";

describe("error reducer", () => {
  it("should return the initial state if action type is not handled", () => {
    const initialState = null;
    const action = { type: "unknown" } as any;

    const result = error(initialState, action);

    expect(result).toBe(initialState);
  });

  it("should return the error message when action type is 'sse' and state is null", () => {
    const initialState = null;
    const errorMessage = "Test error message";
    const action = {
      type: "sse",
      payload: { error: errorMessage },
    };

    const result = error(initialState, action as any);

    expect(result).toBe(errorMessage);
  });

  it("should not update state when action type is 'sse', state is not null, and error is present", () => {
    const initialState = "Existing error";
    const errorMessage = "New error message";
    const action = {
      type: "sse",
      payload: { error: errorMessage },
    };

    const result = error(initialState, action as any);

    expect(result).toBe(initialState);
  });

  it("should not update state when action type is 'sse' and error is not a string", () => {
    const initialState = null;
    const action = {
      type: "sse",
      payload: { error: { message: "Error object" } },
    };

    const result = error(initialState, action as any);

    expect(result).toBe(initialState);
  });

  it("should reset error to null when action type is 'reset'", () => {
    const initialState = "Some error";
    const action = { type: "reset" as const };

    const result = error(initialState, action);

    expect(result).toBeNull();
  });
});
