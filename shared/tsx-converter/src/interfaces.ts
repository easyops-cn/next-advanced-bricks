import type { BrickConf, ContextConf } from "@next-core/types";

export interface ConvertOptions {
  rootId: string;
  workspace?: string;
  expanded?: boolean;
  withContexts?: Record<string, unknown>;
}

export interface ConvertResult {
  brick: BrickConf;
  context?: ContextConf[];
}
