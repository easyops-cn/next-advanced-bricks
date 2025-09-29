export function groupMetricData(
  list: Record<string, any>[],
  groupField: string
) {
  if (!list || !Array.isArray(list) || list.length === 0) {
    return [];
  }
  const grouped = new Map<
    string,
    { group: string; list: Record<string, any>[] }
  >();
  for (const item of list) {
    const key = item[groupField];
    let groupedList = grouped.get(key);
    if (!groupedList) {
      grouped.set(key, (groupedList = { group: key, list: [] }));
    }
    groupedList.list.push(item);
  }
  return Array.from(grouped.values());
}
