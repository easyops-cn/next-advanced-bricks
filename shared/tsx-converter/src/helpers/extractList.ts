export function extractList<T = unknown>(data: T[] | { list: T[] }): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.list;
}
