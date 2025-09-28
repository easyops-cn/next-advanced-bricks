import type * as t from "@babel/types";
import type { StoryboardFunction } from "@next-core/types";

export interface ParseOptions {
  reward?: boolean;
  workspace?: string;
  withContexts?: string[];
}

export interface ParseResult {
  source: string;
  dataSources: DataSource[];
  variables: Variable[];
  components: Component[];
  componentsMap: Map<string, Component>;
  contracts: Set<string>;
  errors: ParseError[];
  contexts: string[];
  contextSetters: Map<string, string>;
  refs: string[];
  globals: Map<string, string>;
  functionNames: string[];
  functions: StoryboardFunction[];
  templates: Template[];
  templateCollection?: TemplateCollection;
}

export interface Template {
  name: string;
  variables: Variable[];
  dataSources: DataSource[];
  components: Component[];
}

export interface TemplateCollection {
  identifiers: string[];
  setters: Map<string, string>;
  dataSources: DataSource[];
  events: string[];
  refs: string[];
  globals: Map<string, string>;
}

export interface ParseError {
  message: string;
  node: t.Node | null | undefined;
  severity: "notice" | "warning" | "error" | "fatal";
}

export interface Variable {
  name: string;
  value?: unknown;
  expose?: boolean;
}

export interface DataSource {
  name: string;
  api: string;
  http?: boolean;
  tool?: ToolInfo;
  objectId?: string;
  params?: string | Record<string, unknown>;
  ambiguousParams?: unknown;
  transform?: string;
  rejectTransform?: string;
  scope?: "view" | "template";
  config?: DataSourceConfig;
}

export interface ToolInfo {
  conversationId: string;
  stepId: string;
}

export interface DataSourceConfig {
  enabled?: unknown;
  fallback?: unknown;
}

export interface Component {
  name: string;
  componentId?: string;
  ref?: string;
  slot?: string;
  properties: Record<string, unknown>;
  ambiguousProps?: Record<string, unknown>;
  events?: Events;
  children?: Component[];
}

export interface Events {
  [key: string]: EventHandler | EventHandler[];
}

export type EventHandler =
  | TypeEventHandlerOfUpdateVariable
  | TypeEventHandlerOfRefreshDataSource
  | TypeEventHandlerOfCallComponent
  | TypeEventHandlerOfCallRef
  | TypeEventHandlerOfShowMessage
  | TypeEventHandlerOfCallAPI
  | TypeEventHandlerOfDispatchEvent
  | TypeEventHandlerOfUpdateQuery
  | TypeEventHandlerOfConditional;

export interface TypeEventHandlerOfUpdateVariable {
  action: "update_variable";
  payload: {
    name: string;
    value: any;
    scope?: "view" | "template";
  };
}

export interface TypeEventHandlerOfRefreshDataSource {
  action: "refresh_data_source";
  payload: {
    name: string;
    scope?: "view" | "template";
  };
}

export interface TypeEventHandlerOfCallComponent {
  action: "call_component";
  payload: {
    componentId: string;
    method: string;
    args?: any[];
    scope?: "view" | "template";
  };
}

export interface TypeEventHandlerOfCallRef {
  action: "call_ref";
  payload: {
    ref: string;
    method: string;
    args?: any[];
    scope?: "view" | "template";
  };
}

export interface TypeEventHandlerOfShowMessage {
  action: "show_message";
  payload: {
    type: "info" | "success" | "warn" | "error";
    content: string;
  };
}

export interface TypeEventHandlerOfCallAPI {
  action: "call_api";
  payload: {
    api: string;
    http?: boolean;
    tool?: ToolInfo;
    params?: any;
    objectId?: string;
  };
  callback?: TypeEventHandlerCallback;
}

export interface TypeEventHandlerOfDispatchEvent {
  action: "dispatch_event";
  payload: {
    type: string;
    detail?: unknown;
  };
}

export interface TypeEventHandlerOfUpdateQuery {
  action: "update_query";
  payload: {
    method: "push" | "replace";
    args: unknown[];
  };
}

export interface TypeEventHandlerOfConditional {
  action: "conditional";
  payload: {
    test: string | boolean | undefined;
    consequent: EventHandler | EventHandler[] | null;
    alternate: EventHandler | EventHandler[] | null;
  };
}

export interface TypeEventHandlerCallback {
  success?: EventHandler | EventHandler[];
  error?: EventHandler | EventHandler[];
  finally?: EventHandler | EventHandler[];
}

export interface RenderUseBrick {
  params: string[];
  children: Component[];
}
