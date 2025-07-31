import * as t from "@babel/types";
import type z from "zod";
import type { OneOrMoreEventHandlers } from "./schemas.js";

export interface Variable {
  name: string;
  value?: unknown;
}

export interface DataSource {
  name: string;
  api: string;
  objectId?: string;
  params?: string | Record<string, unknown>;
  transform?: string;
}

export interface Component {
  name: string;
  componentId?: string;
  properties?: Record<string, unknown>;
  events?: Events;
  children?: Component[];
}

export interface Events {
  [key: string]: z.infer<typeof OneOrMoreEventHandlers>;
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
  modifier?: string;
}

export interface ConstructResult {
  source: string;
  title?: string;
  dataSources: DataSource[];
  variables: Variable[];
  components: Component[];
  componentsMap: Map<string, Component>;
  errors: ParseError[];
}
