import type * as t from "@babel/types";
import type { ComponentChild, SourceFile } from "./modules/interfaces.js";

export interface ParseOptions {
  reward?: boolean;
  workspace?: string;
  withContexts?: string[];
  libs?: SourceFile[];
}

export interface ParseError {
  message: string;
  node: t.Node | null | undefined;
  severity: "notice" | "warning" | "error" | "fatal";
  filePath?: string;
}

export type { ComponentChild as Component };

export interface DataSource {
  name: string;
  api: string;
  http?: boolean;
  tool?: ToolInfo;
  objectId?: string;
  params?: string | Record<string, unknown> | unknown[];
  ambiguousParams?: unknown;
  transform?: string;
  rejectTransform?: string;
  scope?: "global" | "template";
  config?: DataSourceConfig;
  isRawProvider?: boolean;
}

export interface ToolInfo {
  conversationId: string;
  stepId: string;
}

export interface DataSourceConfig {
  enabled?: unknown;
  fallback?: unknown;
}

export interface Events {
  [key: string]: EventHandler | EventHandler[];
}

export type EventHandler =
  | TypeEventHandlerOfUpdateVariable
  | TypeEventHandlerOfRefreshDataSource
  | TypeEventHandlerOfCallRef
  | TypeEventHandlerOfCallSelector
  | TypeEventHandlerOfShowMessage
  | TypeEventHandlerOfHandleHttpError
  | TypeEventHandlerOfCallAPI
  | TypeEventHandlerOfDispatchEvent
  | TypeEventHandlerOfNavigate
  | TypeEventHandlerOfConditional;

export interface TypeEventHandlerOfUpdateVariable {
  action: "update_variable";
  payload: {
    name: string;
    value: any;
    scope?: "global" | "template";
  };
}

export interface TypeEventHandlerOfRefreshDataSource {
  action: "refresh_data_source";
  payload: {
    name: string;
    scope?: "global" | "template";
  };
}

export interface TypeEventHandlerOfCallRef {
  action: "call_ref";
  payload: {
    ref: string;
    method: string;
    args?: any[];
    scope?: "global" | "template";
  };
}

export interface TypeEventHandlerOfCallSelector {
  action: "call_selector";
  payload: {
    selector: string;
    method: string;
    args?: any[];
  };
}

export interface TypeEventHandlerOfShowMessage {
  action: "show_message";
  payload: {
    type: "info" | "success" | "warn" | "error";
    content: string;
  };
}

export interface TypeEventHandlerOfHandleHttpError {
  action: "handle_http_error";
  payload: unknown;
}

export interface TypeEventHandlerOfCallAPI {
  action: "call_api";
  payload: {
    api: string;
    http?: boolean;
    tool?: ToolInfo;
    params?: any;
    objectId?: string;
    isRawProvider?: boolean;
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

export interface TypeEventHandlerOfNavigate {
  action: "navigate";
  payload: {
    method: "push" | "replace" | "reload" | "pushQuery" | "replaceQuery";
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
  success?: EventHandler | EventHandler[] | null;
  error?: EventHandler | EventHandler[] | null;
  finally?: EventHandler | EventHandler[] | null;
}

export interface LifeCycle {
  onMount?: EventHandler | EventHandler[];
  onUnmount?: EventHandler | EventHandler[];
}

export interface RenderUseBrick {
  params: string[];
  children: ComponentChild[];
}

export type {
  ParsedApp,
  ParsedModule,
  ComponentChild,
  SourceFile,
  ComponentReference,
  ModulePart,
  ModulePartOfComponent,
  ModulePartOfFunction,
  ModulePartOfContext,
} from "./modules/interfaces.js";
