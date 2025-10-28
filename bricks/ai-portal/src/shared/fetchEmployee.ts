import {
  ElevoApi_listElevoAiEmployees,
  type ElevoApi_ListElevoAiEmployeesResponseItem,
} from "@next-api-sdk/llm-sdk";

const cache = new Map<
  string,
  Promise<ElevoApi_ListElevoAiEmployeesResponseItem | undefined>
>();

export function fetchEmployee(
  aiEmployeeId: string
): Promise<ElevoApi_ListElevoAiEmployeesResponseItem | undefined> {
  const cached = cache.get(aiEmployeeId);
  if (cached) {
    return cached;
  }
  const promise = doFetchEmployee(aiEmployeeId);
  cache.set(aiEmployeeId, promise);
  return promise;
}

async function doFetchEmployee(aiEmployeeId: string) {
  const response = await ElevoApi_listElevoAiEmployees({
    employeeId: aiEmployeeId,
  } as any);
  const employee = response.list?.[0];
  return employee?.employeeId === aiEmployeeId ? employee : undefined;
}

export function clearCache() {
  cache.clear();
}
