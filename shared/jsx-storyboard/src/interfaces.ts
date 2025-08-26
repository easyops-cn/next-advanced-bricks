import * as t from "@babel/types";

export interface Variable {
  name: string;
  value?: unknown;
}

export interface DataSource {
  name: string;
  api: string;
  objectId?: string;
  params?: string | Record<string, unknown>;
  ambiguousParams?: unknown;
  transform?: string;
}

export interface Component {
  name: string;
  componentId?: string;
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

export interface ParseError {
  message: string;
  node: t.Node | null;
  severity: "notice" | "warning" | "error" | "fatal";
}

export type ChildElement = ChildComponent | ChildText | ChildExpression | null;

export interface ChildComponent {
  type: "component";
  component: Component;
}

export interface ChildText {
  type: "text";
  text: string;
}

export interface ChildExpression {
  type: "expression";
  expression: t.Expression;
}

export type ChildMerged = {
  type: "merged";
  children: (ChildText | ChildExpression)[];
};

export interface ConstructJsValueOptions {
  allowExpression?: boolean;
  ambiguous?: boolean;
  modifier?: string;
  replacePatterns?: Map<string, string>;
}

export interface ConstructResult {
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

export interface ParseJsxOptions {
  reward?: boolean;
}

export interface ParseTsxOptions extends ParseJsxOptions {
  withContexts?: string[];
}

export interface ConstructedView extends ConstructResult {
  viewId: string;
  withContexts?: Record<string, unknown>;
}

export interface ConvertViewOptions {
  rootId: string;
  expanded?: boolean;
}
