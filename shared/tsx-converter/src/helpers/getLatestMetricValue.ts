import { pipes as PIPES } from "@easyops-cn/brick-next-pipes";

export function getLatestMetricValue(
  list: Record<string, any>[] | undefined,
  {
    metric,
    precision,
  }: { metric: { id: string; unit: string }; precision?: number }
) {
  const value = list?.findLast?.((item) => item[metric.id] != null)?.[
    metric.id
  ];
  const unit = metric.unit === "load" ? "" : metric.unit;
  return PIPES.unitFormat(value, unit, precision).join("");
}
