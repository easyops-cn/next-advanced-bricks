import * as t from "@babel/types";
import type { StoryboardFunction } from "@next-core/types";
import type { DataSource, Events, ParseError } from "../interfaces.js";

export interface ParseModuleOptions {
  filename?: string;
  withContexts?: string[];
  // reward?: boolean;
}

export type ParseModuleState = {
  source: string;
  errors: ParseError[];
  contracts: Set<string>;
  usedHelpers: Set<string>;
};

export interface ParsedModule {
  source: string;
  filename?: string;
  defaultExport: ParsedComponent | null;
  internalComponents: ParsedComponent[];
  internalFunctions: StoryboardFunction[];
  errors: ParseError[];
  contracts: Set<string>;
  usedHelpers: Set<string>;
}

export type BindingMap = Map<t.Identifier, BindingInfo>;

export interface BindingInfo {
  id: t.Identifier;
  kind:
    | "state"
    | "setState"
    | "resource"
    | "ref"
    | "query"
    | "constant"
    | "param"
    | "eventHandler"
    | "component"
    | "function";
  /** For kind "state" | "constant" | "param" */
  initialValue?: unknown;
  /** For kind "resource" */
  resource?: DataSource;
}

export interface EventBindingInfo {
  id: t.Identifier;
  isCallback?: boolean;
}

export interface ForEachBindingInfo {
  item?: t.Identifier;
  index?: t.Identifier;
}

export interface DataBindingInfo {
  id: t.Identifier;
}

export interface ParsedComponent {
  bindingMap: BindingMap;
  type: "template" | "view";
  children?: ComponentChild[];
  /** For type "template" */
  id?: t.Identifier;
}

export interface ParsedFunction {
  name: string;
  node: t.FunctionDeclaration;
}

export interface ParseJsValueOptions {
  component?: ParsedComponent;
  eventBinding?: EventBindingInfo;
  forEachBinding?: ForEachBindingInfo;
  dataBinding?: DataBindingInfo;
  functionBindings?: Set<t.Identifier>;
  contextBindings?: string[];
  allowUseBrick?: boolean;
  ambiguous?: boolean;
  modifier?: string;
}

export interface ComponentChild {
  name: string;
  properties: Record<string, unknown>;
  ambiguousProps?: Record<string, unknown>;
  events?: Events;
  slot?: string;
  ref?: string;
  children?: ComponentChild[];
}

export type { Events };

export type {
  EventHandler,
  DataSource,
  DataSourceConfig,
  ToolInfo,
  TypeEventHandlerOfShowMessage,
  RenderUseBrick,
} from "../interfaces.js";
