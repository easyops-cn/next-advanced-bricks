import type * as t from "@babel/types";

export interface ParseOptions {
  reward?: boolean;
  workspace?: string;
  withContexts?: string[];
}

export interface ParseResult {
  source: string;
  title?: string;
  dataSources: DataSource[];
  variables: Variable[];
  components: Component[];
  componentsMap: Map<string, Component>;
  contracts: Set<string>;
  errors: ParseError[];
  contexts: string[];
}

export interface ParseError {
  message: string;
  node: t.Node | null;
  severity: "notice" | "warning" | "error" | "fatal";
}

export interface Variable {
  name: string;
  value?: unknown;
}

export interface DataSource {
  name: string;
  api: string;
  http?: boolean;
  entity?: string;
  objectId?: string;
  params?: string | Record<string, unknown>;
  ambiguousParams?: unknown;
  transform?: string;
  rejectTransform?: string;
}

export interface Component {
  name: string;
  componentId?: string;
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
  | TypeEventHandlerOfShowMessage
  | TypeEventHandlerOfCallAPI;

export interface TypeEventHandlerOfUpdateVariable {
  action: "update_variable";
  payload: {
    name: string;
    value: any;
  };
}

export interface TypeEventHandlerOfRefreshDataSource {
  action: "refresh_data_source";
  payload: {
    name: string;
  };
}

export interface TypeEventHandlerOfCallComponent {
  action: "call_component";
  payload: {
    componentId: string;
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

export interface TypeEventHandlerOfCallAPI {
  action: "call_api";
  payload: {
    api: string;
    http?: boolean;
    entity?: string;
    params?: any;
    objectId?: string;
  };
  callback?: TypeEventHandlerCallback;
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
