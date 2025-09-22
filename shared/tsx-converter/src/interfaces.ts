import type {
  BrickConf,
  ContextConf,
  CustomTemplate,
  StoryboardFunction,
} from "@next-core/types";

export interface ConvertOptions {
  rootId: string;
  workspace?: string;
  expanded?: boolean;
  withContexts?: Record<string, unknown>;
}

export interface ConvertResult {
  title?: string;
  brick: BrickConf;
  context?: ContextConf[];
  functions?: StoryboardFunction[];
  templates?: CustomTemplate[];
}
