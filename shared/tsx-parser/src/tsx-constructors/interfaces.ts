import * as t from "@babel/types";
import type { Component } from "../interfaces.js";

export interface ConstructJsValueOptions {
  allowExpression?: boolean;
  allowUseBrick?: boolean;
  ambiguous?: boolean;
  modifier?: string;
  replacePatterns?: Map<string, string>;
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
