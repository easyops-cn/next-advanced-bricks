// istanbul ignore file
import { createProviderClass } from "@next-core/utils/general";
import promptOfPercent from "./prompts/raw-metric-percent.md";
import promptOfOthers from "./prompts/raw-metric-others.md";

export function getRawMetricSystemPrompts(): Record<string, string> {
  return {
    percent: promptOfPercent,
    others: promptOfOthers,
  };
}

customElements.define(
  "visual-builder.get-raw-metric-system-prompts",
  createProviderClass(getRawMetricSystemPrompts)
);
