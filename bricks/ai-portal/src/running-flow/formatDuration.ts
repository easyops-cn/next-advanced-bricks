/**
 * Format duration as "00:12"
 *
 * @param duration in seconds
 */
export function formatDuration(duration: number): string {
  const ceilDuration = Math.ceil(duration);
  const minutes = Math.floor(ceilDuration / 60);
  const seconds = ceilDuration % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
