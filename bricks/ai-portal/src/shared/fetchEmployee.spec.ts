import { fetchEmployee, clearCache } from "./fetchEmployee";
import { ElevoApi_listElevoAiEmployees } from "@next-api-sdk/llm-sdk";

jest.mock("@next-api-sdk/llm-sdk");

const mockElevoApi_listElevoAiEmployees =
  ElevoApi_listElevoAiEmployees as jest.MockedFunction<
    typeof ElevoApi_listElevoAiEmployees
  >;

describe("fetchEmployee", () => {
  beforeEach(() => {
    // Clear the cache by accessing the module's cache
    clearCache();
  });

  it("should fetch employee successfully", async () => {
    const mockEmployee = {
      employeeId: "emp-123",
      name: "John Doe",
    };
    mockElevoApi_listElevoAiEmployees.mockResolvedValue({
      list: [mockEmployee],
    } as any);

    const result = await fetchEmployee("emp-123");

    expect(result).toEqual(mockEmployee);
    expect(mockElevoApi_listElevoAiEmployees).toHaveBeenCalledWith({
      employeeId: "emp-123",
    });
  });

  it("should return undefined when employee is not found", async () => {
    mockElevoApi_listElevoAiEmployees.mockResolvedValue({
      list: [],
    } as any);

    const result = await fetchEmployee("emp-123");

    expect(result).toBeUndefined();
  });

  it("should return undefined when employee ID does not match", async () => {
    const mockEmployee = {
      employeeId: "emp-456",
      name: "Jane Doe",
    };
    mockElevoApi_listElevoAiEmployees.mockResolvedValue({
      list: [mockEmployee],
    } as any);

    const result = await fetchEmployee("emp-123");

    expect(result).toBeUndefined();
  });

  it("should use cache for subsequent calls with same ID", async () => {
    const mockEmployee = {
      employeeId: "emp-123",
      name: "John Doe",
    };
    mockElevoApi_listElevoAiEmployees.mockResolvedValue({
      list: [mockEmployee],
    } as any);

    const result1 = await fetchEmployee("emp-123");
    const result2 = await fetchEmployee("emp-123");

    expect(result1).toEqual(mockEmployee);
    expect(result2).toEqual(mockEmployee);
    expect(mockElevoApi_listElevoAiEmployees).toHaveBeenCalledTimes(1);
  });

  it("should handle API errors", async () => {
    const mockError = new Error("API Error");
    mockElevoApi_listElevoAiEmployees.mockRejectedValue(mockError);

    await expect(fetchEmployee("emp-123")).rejects.toThrow("API Error");
  });
});
