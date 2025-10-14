import type {
  BrickConf,
  ContextConf,
  CustomTemplate,
  RouteConf,
  StoryboardFunction,
} from "@next-core/types";
import type { ParsedApp } from "@next-shared/tsx-parser";

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

export interface ConvertState {
  readonly usedHelpers: Set<string>;
  readonly app: ParsedApp;
}

export interface ConvertedApp {
  routes: RouteConf[];
  meta: {
    functions: StoryboardFunction[];
    templates: CustomTemplate[];
  };
}
