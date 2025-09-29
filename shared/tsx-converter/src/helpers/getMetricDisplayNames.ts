export function getMetricDisplayNames(
  displayNameList:
    | { metric_name: string; metric_display_name: string }[]
    | undefined,
  metricNames: string[]
): string[] {
  return metricNames.map(
    (metricName) =>
      displayNameList?.find((item) => item.metric_name === metricName)
        ?.metric_display_name ?? metricName
  );
}
