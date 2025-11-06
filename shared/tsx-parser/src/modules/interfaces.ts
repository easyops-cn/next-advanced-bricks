import * as t from "@babel/types";
import type { ContextConf, StoryboardFunction } from "@next-core/types";
import type {
  DataSource,
  Events,
  LifeCycle,
  ParseError,
} from "../interfaces.js";

export interface ParsedApp {
  appType: "app" | "view" | "template";
  entry?: ParsedModule;
  modules: Map<string, ParsedModule | null>;
  files: SourceFile[];
  constants: Map<string, unknown>;
  errors: ParseError[];
}

export interface SourceFile {
  filePath: string;
  content: string;
}

export interface ParseModuleOptions {
  withContexts?: string[];
  // reward?: boolean;
}

export interface ParsedModule {
  source: string;
  filePath: string;
  moduleType: ModuleType;
  defaultExport: ModulePart | null;
  namedExports: Map<string, ModulePart>;
  internals: ModulePart[];
  render?: ParsedRender;
  errors: ParseError[];
  contracts: Set<string>;
  usedHelpers: Set<string>;
}

export type ModuleType =
  | "entry"
  | "page"
  | "template"
  | "css"
  | "function"
  | "unknown";

export type ModulePart =
  | ModulePartOfComponent
  | ModulePartOfFunction
  | ModulePartOfContext;

export interface ModulePartOfComponent {
  type: "page" | "view" | "template";
  component: ParsedComponent;
  /** For views only */
  title?: string;
}

export interface ModulePartOfFunction {
  type: "function";
  function: StoryboardFunction;
}

export interface ModulePartOfContext {
  type: "context";
  context: string;
}

export interface ParsedRender {
  type: "render";
  children: ComponentChild[];
}

export type BindingMap = Map<t.Identifier, BindingInfo>;

export interface BindingInfo {
  id: t.Identifier;
  kind:
    | "state"
    | "setState"
    | "resource"
    | "refetch"
    | "ref"
    | "app"
    | "query"
    | "pathParams"
    | "auth"
    | "history"
    | "location"
    | "constant"
    | "param"
    | "eventHandler"
    | "component"
    | "context"
    | "function";

  /** For kind "state" | "constant" | "param" */
  initialValue?: unknown;

  /** For kind "resource" */
  resource?: DataSource;

  /** For kind "refetch" */
  resourceId?: t.Identifier;

  /** For kind "context" */
  contextProvider?: ContextReference;
  contextKey?: string;
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
  type: "template" | "view" | "page";
  children?: ComponentChild[];
  id?: t.Identifier | null;
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
  componentBindings?: Set<t.Identifier>;
  contextBindings?: Set<t.Identifier>;
  stateBindings?: string[];
  allowUseBrick?: boolean;
  ambiguous?: boolean;
  modifier?: string;
}

export interface ComponentChild {
  name: string;
  reference?: ComponentReference | null;
  properties: Record<string, unknown>;
  ambiguousProps?: Record<string, unknown>;
  events?: Events;
  lifeCycle?: LifeCycle;
  slot?: string;
  ref?: string;
  portal?: boolean;
  context?: ContextConf[];
  children?: ComponentChild[];
}

export interface ComponentReference {
  type: "imported" | "local";
  /**
   * For type "local", it's the local component name;
   * For type "imported", it's the imported name (can be undefined for default import).
   */
  name?: string;
  /**
   * Only for type "imported", the source module path.
   */
  importSource?: string;
}

export interface ContextReference {
  type: "imported" | "local";
  /**
   * For type "local", it's the local component name;
   * For type "imported", it's the imported name.
   */
  name: string;
  /**
   * Only for type "imported", the source module path.
   */
  importSource?: string;
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
